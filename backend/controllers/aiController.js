const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');
const { withPriority } = require('../utils/priorityCalculator');
const { generateOfficerBriefing } = require('../services/geminiService');

/**
 * Aggregates the raw statistics needed for both the officer dashboard cards
 * and the Gemini briefing prompt. Kept in one place so both stay consistent.
 */
async function aggregateStats() {
  const complaints = await Complaint.find().lean();
  const withPriorities = complaints.map(withPriority);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const totalComplaints = withPriorities.length;
  const newToday = withPriorities.filter((c) => new Date(c.createdAt) >= startOfToday).length;
  const pending = withPriorities.filter((c) => c.status === 'pending').length;
  const inProgress = withPriorities.filter((c) => c.status === 'in-progress').length;
  const resolved = withPriorities.filter((c) => c.status === 'resolved').length;
  const resolvedThisWeek = withPriorities.filter(
    (c) => c.status === 'resolved' && new Date(c.updatedAt) >= startOfWeek
  ).length;
  const critical = withPriorities.filter((c) => c.priority === 'CRITICAL').length;
  // "Overdue" = still open (not resolved) and more than 7 days old.
  const overdue = withPriorities.filter(
    (c) => c.status !== 'resolved' && c.daysSinceCreated > 7
  ).length;

  const categoryCounts = {};
  const areaCounts = {};
  withPriorities.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    areaCounts[c.area] = (areaCounts[c.area] || 0) + 1;
  });

  const topCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const hotspotAreas = Object.entries(areaCounts)
    .map(([area, count]) => ({ area, count }))
    .filter((a) => a.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const mostUpvoted = [...withPriorities]
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 3)
    .map((c) => ({ title: c.title, upvotes: c.upvotes, priority: c.priority, area: c.area }));

  // Satisfaction statistics, computed from resolved complaints with feedback.
  const withFeedback = withPriorities.filter((c) => c.feedbackGiven);
  const totalFeedbackResponses = withFeedback.length;
  const averageSatisfaction = totalFeedbackResponses
    ? Number(
        (withFeedback.reduce((sum, c) => sum + (c.feedbackRating || 0), 0) / totalFeedbackResponses).toFixed(2)
      )
    : null;
  const positiveFeedback = withFeedback.filter((c) => c.feedbackRating >= 4).length;
  const negativeFeedback = withFeedback.filter((c) => c.feedbackRating <= 2).length;
  const lowRatedComplaints = withFeedback
    .filter((c) => c.feedbackRating <= 2)
    .map((c) => ({ id: c._id, title: c.title, rating: c.feedbackRating, comment: c.feedbackComment }));

  return {
    totalComplaints,
    newToday,
    pending,
    inProgress,
    resolved,
    resolvedThisWeek,
    critical,
    overdue,
    topCategories,
    hotspotAreas,
    mostUpvoted,
    satisfaction: {
      averageSatisfaction,
      totalFeedbackResponses,
      positiveFeedback,
      negativeFeedback,
      lowRatedComplaints,
    },
  };
}

/**
 * @route   GET /api/complaints/stats/dashboard
 * @desc    Officer dashboard statistics (no AI call - fast, always available).
 * @access  Private (officer)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await aggregateStats();
  res.status(200).json({ success: true, stats });
});

/**
 * @route   POST /api/ai/officer-summary
 * @desc    Generates the AI Daily Briefing using Gemini, with a guaranteed
 *          local fallback so the dashboard never breaks.
 * @access  Private (officer)
 */
const getOfficerSummary = asyncHandler(async (req, res) => {
  const stats = await aggregateStats();
  const { summary, source } = await generateOfficerBriefing(stats);

  res.status(200).json({
    success: true,
    summary,
    isAiGenerated: source === 'gemini',
    generatedAt: new Date().toISOString(),
    stats,
  });
});

module.exports = { getOfficerSummary, getDashboardStats, aggregateStats };
