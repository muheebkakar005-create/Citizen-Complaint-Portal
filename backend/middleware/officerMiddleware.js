const ApiError = require('../utils/ApiError');

/**
<<<<<<< HEAD
 * officerOnly: must run AFTER `protect`. Verifies req.user.role is 'officer'
 * or 'admin' - admins have full officer-level access to complaint operations
 * plus their own admin-only console. Citizens are given a 403, never given
 * access, even if they guess the route.
=======
 * officerOnly: must run AFTER `protect`. Verifies req.user.role === 'officer'.
 * Citizens are given a 403, never given access, even if they guess the route.
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
 */
const officerOnly = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized.');
  }
<<<<<<< HEAD
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
=======
  if (req.user.role !== 'officer') {
    throw new ApiError(403, 'Access denied. Officer role required.');
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
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

<<<<<<< HEAD
module.exports = { officerOnly, adminOnly, citizenOnly };
=======
module.exports = { officerOnly, citizenOnly };
>>>>>>> d31d5d8e01b81c4ae82f7b3fa58cbf901e2d1d32
