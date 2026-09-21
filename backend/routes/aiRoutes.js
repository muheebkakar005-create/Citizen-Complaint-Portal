const express = require('express');
const { getOfficerSummary, getComplaintSummary } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { officerOnly } = require('../middleware/officerMiddleware');

const router = express.Router();

// POST /api/ai/officer-summary - officer/admin AI daily briefing
router.post('/officer-summary', protect, officerOnly, getOfficerSummary);
router.all('/briefing', protect, officerOnly, getOfficerSummary);

// GET /api/ai/complaints/:id/summary - officer/admin AI single-complaint summarizer
router.get('/complaints/:id/summary', protect, officerOnly, getComplaintSummary);
router.all('/summary', protect, officerOnly, getComplaintSummary);

module.exports = router;
