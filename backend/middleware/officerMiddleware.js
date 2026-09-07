const ApiError = require('../utils/ApiError');

/**
 * officerOnly: must run AFTER `protect`. Verifies req.user.role === 'officer'.
 * Citizens are given a 403, never given access, even if they guess the route.
 */
const officerOnly = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized.');
  }
  if (req.user.role !== 'officer') {
    throw new ApiError(403, 'Access denied. Officer role required.');
  }
  next();
};

/**
 * citizenOnly: must run AFTER `protect`. Restricts an action (e.g. upvoting,
 * filing a complaint, giving feedback) to citizen accounts.
 */
const citizenOnly = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized.');
  }
  if (req.user.role !== 'citizen') {
    throw new ApiError(403, 'Access denied. Citizen role required.');
  }
  next();
};

module.exports = { officerOnly, citizenOnly };
