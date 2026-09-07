const express = require('express');
const { getOfficerSummary } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { officerOnly } = require('../middleware/officerMiddleware');

const router = express.Router();

// POST /api/ai/officer-summary - officer-only AI daily briefing
router.post('/officer-summary', protect, officerOnly, getOfficerSummary);

module.exports = router;
