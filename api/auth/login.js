const app = require('../../backend/app');

module.exports = (req, res) => {
  if (!req.url || req.url === '/' || !req.url.startsWith('/api')) {
    const query = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    req.url = '/api/auth/login' + query;
  }
  return app(req, res);
};
