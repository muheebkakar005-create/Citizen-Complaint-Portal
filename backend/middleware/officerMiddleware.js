const ApiError = require('../utils/ApiError');

/**
 * officerOnly: must run AFTER `protect`. Verifies req.user.role is 'officer'
 * or 'admin' - admins have full officer-level access to complaint operations
 * plus their own admin-only console. Citizens are given a 403, never given
 * access, even if they guess the route.
 */
const officerOnly = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized.');
  }
  if (req.user.role !== 'officer' && req.user.role !== 'admin') {
    throw new ApiError(403, 'Access denied. Officer or Admin role required.');
  }
  next();
};

/**
 * adminOnly: must run AFTER `protect`. Restricts an action strictly to
 * Admin accounts (e.g. managing officer accounts). Officers are NOT
 * admins, even though admins are treated as officers by `officerOnly`.
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized.');
  }
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Access denied. Admin role required.');
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

module.exports = { officerOnly, adminOnly, citizenOnly };
