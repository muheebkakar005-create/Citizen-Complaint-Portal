const app = require('../../backend/app');

module.exports = (req, res) => {
  req.url = '/api/auth/signup';
  return app(req, res);
};
