const express = require('express');
<<<<<<< HEAD
const { getOfficerSummary, getComplaintSummary } = require('../controllers/aiController');
=======
const { getOfficerSummary } = require('../controllers/aiController');
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
const { protect } = require('../middleware/authMiddleware');
const { officerOnly } = require('../middleware/officerMiddleware');

const router = express.Router();

<<<<<<< HEAD
// POST /api/ai/officer-summary - officer/admin AI daily briefing
router.post('/officer-summary', protect, officerOnly, getOfficerSummary);

// GET /api/ai/complaints/:id/summary - officer/admin AI single-complaint summarizer
router.get('/complaints/:id/summary', protect, officerOnly, getComplaintSummary);

=======
// POST /api/ai/officer-summary - officer-only AI daily briefing
router.post('/officer-summary', protect, officerOnly, getOfficerSummary);

>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
module.exports = router;
