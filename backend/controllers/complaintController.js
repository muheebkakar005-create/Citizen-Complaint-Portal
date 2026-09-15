const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const ApiError = require('../utils/ApiError');
const { withPriority } = require('../utils/priorityCalculator');
const { uploadBufferToCloudinary } = require('../services/imageUploadService');
const { complaintsToCsv, exportFilename } = require('../services/csvService');

const ACTIVE_STATUSES = ['pending', 'in-progress'];

/**
 * Flattens a lean/plain Complaint document into the exact shape the
 * frontend expects: createdBy as a plain string id (never a populated
 * object), upvotedBy as an array of plain string ids, priority fields
 * attached, and hasUpvoted/isOwner computed relative to the requesting user.
 */
function serializeComplaint(complaintDoc, currentUserId) {
  const enriched = withPriority(complaintDoc);

  enriched.createdBy = enriched.createdBy ? String(enriched.createdBy) : enriched.createdBy;
  enriched.upvotedBy = (enriched.upvotedBy || []).map((id) => String(id));

  if (currentUserId) {
    const uid = String(currentUserId);
    enriched.hasUpvoted = enriched.upvotedBy.includes(uid);
    enriched.isOwner = enriched.createdBy === uid;
  }

  return enriched;
}

/**
 * Builds a Mongo filter object from shared query params used by both the
 * public feed and the officer CSV export: search, category, area, status.
 * Priority is NOT included here because it's computed dynamically - it's
 * applied as a post-fetch, in-memory filter instead.
 */
function buildMongoFilter(query) {
  const filter = {};

  if (query.category && query.category !== 'All') {
    filter.category = query.category;
  }

  if (query.area && query.area !== 'All') {
    filter.area = { $regex: query.area, $options: 'i' };
  }

  if (query.status && query.status !== 'All') {
    const statuses = String(query.status)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (statuses.length) filter.status = { $in: statuses };
  }

  if (query.search) {
    const regex = { $regex: query.search, $options: 'i' };
    filter.$or = [{ title: regex }, { description: regex }, { area: regex }];
  }

  return filter;
}

function applyPriorityFilterAndSort(complaintsWithPriority, query) {
  let results = complaintsWithPriority;

  if (query.priority && query.priority !== 'All') {
    const wanted = String(query.priority)
      .split(',')
      .map((p) => p.trim().toUpperCase())
      .filter(Boolean);
    if (wanted.length) {
      results = results.filter((c) => wanted.includes(c.priority));
    }
  }

  const sortBy = query.sort || 'newest';
  if (sortBy === 'upvotes') {
    results = results.sort((a, b) => b.upvotes - a.upvotes);
  } else if (sortBy === 'priority') {
    results = results.sort((a, b) => b.priorityScore - a.priorityScore);
  } else {
    // 'newest' (default)
    results = results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return results;
}

/**
 * @route   POST /api/complaints
 * @desc    Citizen files a new complaint. createdBy comes ONLY from the
 *          verified JWT (req.user), never from the request body. Accepts
 *          either a multipart image (uploaded to Cloudinary if configured)
 *          OR a plain imageUrl string in the JSON body (the frontend sends
 *          a base64 data URL from a local FileReader, or a pasted URL).
 * @access  Private (citizen)
 */
const createComplaint = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const { title, description, category, area } = req.body;

  let imageUrl = null;
  if (req.file) {
    try {
      imageUrl = await uploadBufferToCloudinary(req.file.buffer);
    } catch (err) {
      // Image upload failing must never block complaint submission.
      console.error('[ImageUpload] Failed, continuing without image:', err.message);
      imageUrl = null;
    }
  } else if (typeof req.body.imageUrl === 'string' && req.body.imageUrl.trim()) {
    // No file was uploaded via multipart - accept a client-supplied image
    // URL / data URL directly (this is how the current frontend submits images).
    imageUrl = req.body.imageUrl.trim();
  }

  const complaint = await Complaint.create({
    title,
    description,
    category,
    area,
    imageUrl,
    createdBy: req.user._id, // trusted source: verified JWT user
    creatorName: req.user.name,
    creatorEmail: req.user.email,
    status: 'pending',
    upvotes: 0,
    upvotedBy: [],
    feedbackPending: false,
    feedbackGiven: false,
  });

  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully.',
    complaint: serializeComplaint(complaint, req.user._id),
  });
});

/**
 * @route   GET /api/complaints
 * @desc    Public complaint feed with search/filter/sort.
 * @access  Public (optionalAuth attaches req.user if logged in, so the
 *          response can flag which complaints the viewer already upvoted)
 */
const getComplaints = asyncHandler(async (req, res) => {
  const filter = buildMongoFilter(req.query);

  const complaints = await Complaint.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  let withPriorities = complaints.map((c) => serializeComplaint(c, req.user && req.user._id));
  withPriorities = applyPriorityFilterAndSort(withPriorities, req.query);

  res.status(200).json({
    success: true,
    count: withPriorities.length,
    complaints: withPriorities,
  });
});

/**
 * @route   GET /api/complaints/duplicates?category=&area=
 * @desc    Pre-submission duplicate check: finds open (pending/in-progress)
 *          complaints in the same category whose area loosely matches
 *          (substring match, either direction, case-insensitive).
 * @access  Public
 */
const checkDuplicates = asyncHandler(async (req, res) => {
  const { category, area } = req.query;

  if (!category || !area) {
    throw new ApiError(400, 'Category and area are required for duplicate check.');
  }

  const cleanArea = String(area).trim().toLowerCase();

  const candidates = await Complaint.find({
    category: String(category).trim(),
    status: { $in: ACTIVE_STATUSES },
  }).lean();

  const duplicates = candidates
    .filter((c) => {
      const candidateArea = c.area.toLowerCase();
      return candidateArea.includes(cleanArea) || cleanArea.includes(candidateArea);
    })
    .map((c) => serializeComplaint(c, req.user && req.user._id));

  res.status(200).json({
    success: true,
    hasDuplicates: duplicates.length > 0,
    duplicates,
  });
});

/**
 * @route   GET /api/complaints/mine
 * @desc    Complaints filed by the logged-in citizen only.
 * @access  Private
 */
const getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ createdBy: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  const withPriorities = complaints.map((c) => serializeComplaint(c, req.user._id));

  res.status(200).json({
    success: true,
    count: withPriorities.length,
    complaints: withPriorities,
  });
});

/**
 * @route   GET /api/complaints/export
 * @desc    Officer-only CSV export, honoring the same filters as the feed.
 * @access  Private (officer)
 */
const exportComplaints = asyncHandler(async (req, res) => {
  const filter = buildMongoFilter(req.query);

  const complaints = await Complaint.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  let withPriorities = complaints.map((c) => serializeComplaint(c));
  withPriorities = applyPriorityFilterAndSort(withPriorities, req.query);

  const csv = complaintsToCsv(withPriorities);
  const filename = exportFilename();

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(csv);
});

/**
 * @route   GET /api/complaints/stats/satisfaction
 * @desc    Officer-only satisfaction analytics computed from resolved
 *          complaints that have received citizen feedback.
 * @access  Private (officer)
 */
const getSatisfactionStats = asyncHandler(async (req, res) => {
  const resolvedWithFeedback = await Complaint.find({
    status: 'resolved',
    feedbackGiven: true,
  }).lean();

  const totalResponses = resolvedWithFeedback.length;
  let averageSatisfaction = 0;
  let positiveFeedback = 0; // rating >= 4
  let negativeFeedback = 0; // rating <= 2
  let neutralFeedback = 0; // rating === 3

  if (totalResponses > 0) {
    const sum = resolvedWithFeedback.reduce((acc, c) => acc + (c.feedbackRating || 0), 0);
    averageSatisfaction = Number((sum / totalResponses).toFixed(1));
    positiveFeedback = resolvedWithFeedback.filter((c) => (c.feedbackRating || 0) >= 4).length;
    negativeFeedback = resolvedWithFeedback.filter((c) => (c.feedbackRating || 0) <= 2).length;
    neutralFeedback = resolvedWithFeedback.filter((c) => (c.feedbackRating || 0) === 3).length;
  }

  const lowRatedComplaints = resolvedWithFeedback
    .filter((c) => (c.feedbackRating || 0) <= 2)
    .map((c) => ({
      _id: String(c._id),
      title: c.title,
      area: c.area,
      rating: c.feedbackRating,
      comment: c.feedbackComment,
      officerRemark: c.officerRemark,
    }));

  res.status(200).json({
    success: true,
    averageSatisfaction,
    totalResponses,
    positiveFeedback,
    negativeFeedback,
    neutralFeedback,
    lowRatedComplaints,
  });
});

/**
 * @route   GET /api/complaints/:id
 * @desc    Full complaint detail.
 * @access  Public
 */
const getComplaintById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, 'Complaint not found.');
  }

  const complaint = await Complaint.findById(req.params.id).lean();

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found.');
  }

  res.status(200).json({
    success: true,
    complaint: serializeComplaint(complaint, req.user && req.user._id),
  });
});

/**
 * @route   PATCH /api/complaints/:id/upvote
 * @desc    Citizen upvotes a complaint. One vote per user, enforced
 *          server-side via the upvotedBy array.
 * @access  Private (citizen)
 */
const upvoteComplaint = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, 'Complaint not found.');
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found.');
  }

  const alreadyVoted = complaint.upvotedBy.some(
    (id) => id.toString() === req.user._id.toString()
  );

  if (alreadyVoted) {
    throw new ApiError(409, 'You have already upvoted this complaint.');
  }

  complaint.upvotedBy.push(req.user._id);
  complaint.upvotes += 1;
  await complaint.save();

  res.status(200).json({
    success: true,
    message: 'Upvote recorded.',
    complaint: serializeComplaint(complaint, req.user._id),
  });
});

/**
 * @route   PATCH /api/complaints/:id/status
 * @desc    Officer updates status and/or adds a remark.
 * @access  Private (officer)
 */
const updateComplaintStatus = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, 'Complaint not found.');
  }

  const { status, officerRemark } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found.');
  }

  if (status) {
    complaint.status = status;
    if (status === 'resolved') {
      complaint.feedbackPending = true;
    } else {
      // Reopening/reverting a complaint clears any pending feedback prompt
      // that no longer applies.
      complaint.feedbackPending = false;
    }
  }

  if (typeof officerRemark === 'string') {
    complaint.officerRemark = officerRemark;
  }

  complaint.updatedAt = new Date();
  await complaint.save();

  res.status(200).json({
    success: true,
    message: 'Complaint updated successfully.',
    complaint: serializeComplaint(complaint, req.user._id),
  });
});

/**
 * @route   PATCH /api/complaints/:id/feedback
 * @desc    Citizen (must be the complaint owner) submits 1-5 star feedback
 *          after resolution. Cannot be submitted twice or by another user.
 * @access  Private (citizen, owner only)
 */
const submitFeedback = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, 'Complaint not found.');
  }

  const { feedbackRating, feedbackComment } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found.');
  }

  if (complaint.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the complaint owner can submit feedback.');
  }

  if (complaint.status !== 'resolved') {
    throw new ApiError(400, 'Feedback can only be given once the complaint is resolved.');
  }

  if (complaint.feedbackGiven) {
    throw new ApiError(409, 'Feedback has already been submitted for this complaint.');
  }

  complaint.feedbackRating = feedbackRating;
  complaint.feedbackComment = feedbackComment || '';
  complaint.feedbackGiven = true;
  complaint.feedbackPending = false;
  complaint.updatedAt = new Date();
  await complaint.save();

  res.status(200).json({
    success: true,
    message: 'Feedback submitted successfully.',
    complaint: serializeComplaint(complaint, req.user._id),
  });
});

/**
 * @route   DELETE /api/complaints/:id
 * @desc    Deletes a complaint. Allowed for the citizen who owns it, or
 *          any officer.
 * @access  Private (owner or officer)
 */
const deleteComplaint = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, 'Complaint not found.');
  }

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found.');
  }

  const isOfficer = req.user.role === 'officer';
  const isOwner = complaint.createdBy.toString() === req.user._id.toString();

  if (!isOfficer && !isOwner) {
    throw new ApiError(403, 'You are not authorized to delete this complaint.');
  }

  await Complaint.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Complaint deleted successfully.',
  });
});

module.exports = {
  createComplaint,
  getComplaints,
  checkDuplicates,
  getMyComplaints,
  exportComplaints,
  getSatisfactionStats,
  getComplaintById,
  upvoteComplaint,
  updateComplaintStatus,
  submitFeedback,
  deleteComplaint,
  serializeComplaint,
  ACTIVE_STATUSES,
};
