const app = require('../../backend/app');

module.exports = (req, res) => {
  req.url = '/api/auth/login';
  return app(req, res);
};
