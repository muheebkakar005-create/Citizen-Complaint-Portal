const app = require('../backend/app');

module.exports = (req, res) => {
  if (!req.url || req.url === '/') {
    req.url = '/api/complaints';
  } else if (!req.url.startsWith('/api/complaints')) {
    req.url = '/api/complaints' + req.url;
  }
  return app(req, res);
};
