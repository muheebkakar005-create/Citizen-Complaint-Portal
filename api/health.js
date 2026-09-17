const app = require('../backend/app');

module.exports = (req, res) => {
  req.url = '/api/health';
  return app(req, res);
};
