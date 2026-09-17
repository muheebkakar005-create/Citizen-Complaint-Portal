const app = require('../../backend/app');

module.exports = (req, res) => {
  req.url = '/api/auth/me';
  return app(req, res);
};
