const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/complaintController');
const { getDashboardStats } = require('../controllers/aiController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { officerOnly, citizenOnly } = require('../middleware/officerMiddleware');
const { uploadComplaintImage } = require('../middleware/uploadMiddleware');
const Complaint = require('../models/Complaint');

const router = express.Router();

const complaintValidation = [
  body('title').trim().isLength({ min: 5, max: 150 }).withMessage('Title must be 5-150 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be 10-2000 characters'),
  body('category')
    .isIn(Complaint.CATEGORIES)
    .withMessage(`Category must be one of: ${Complaint.CATEGORIES.join(', ')}`),
  body('area').trim().notEmpty().withMessage('Area / locality is required'),
];

const statusValidation = [
  body('status')
    .optional()
    .isIn(Complaint.STATUSES)
    .withMessage(`Status must be one of: ${Complaint.STATUSES.join(', ')}`),
  body('officerRemark')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Remark is too long'),
];

const feedbackValidation = [
  body('feedbackRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Feedback rating must be an integer between 1 and 5'),
  body('feedbackComment')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Feedback comment is too long'),
];

// --- Order matters: specific static paths before the /:id dynamic route ---

// GET /api/complaints/mine - citizen's own complaints
router.get('/mine', protect, getMyComplaints);

// GET /api/complaints/duplicates - pre-submission duplicate check (public)
router.get('/duplicates', optionalAuth, checkDuplicates);

// GET /api/complaints/export - officer-only CSV export
router.get('/export', protect, officerOnly, exportComplaints);

// GET /api/complaints/stats/dashboard - officer-only aggregated stats
router.get('/stats/dashboard', protect, officerOnly, getDashboardStats);

// GET /api/complaints/stats/satisfaction - officer-only satisfaction analytics
router.get('/stats/satisfaction', protect, officerOnly, getSatisfactionStats);

// POST /api/complaints - citizen creates a complaint (optional image upload)
router.post('/', protect, citizenOnly, uploadComplaintImage, complaintValidation, createComplaint);

// GET /api/complaints - public feed
router.get('/', optionalAuth, getComplaints);

// GET /api/complaints/:id - public complaint detail
router.get('/:id', optionalAuth, getComplaintById);

// PATCH /api/complaints/:id/upvote - citizen upvotes
router.patch('/:id/upvote', protect, citizenOnly, upvoteComplaint);

// PATCH /api/complaints/:id/status - officer updates status/remark
router.patch('/:id/status', protect, officerOnly, statusValidation, updateComplaintStatus);

// PATCH /api/complaints/:id/feedback - citizen (owner) submits feedback
router.patch('/:id/feedback', protect, citizenOnly, feedbackValidation, submitFeedback);

// DELETE /api/complaints/:id - owner (citizen) or any officer
router.delete('/:id', protect, deleteComplaint);

module.exports = router;
