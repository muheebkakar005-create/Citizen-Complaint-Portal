const mongoose = require('mongoose');
const { login } = require('../../backend/controllers/authController');

module.exports = async (req, res) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      const uri = (process.env.MONGODB_URI || '').trim().replace(/^["']|["']$/g, '');
      if (!uri) {
        return res.status(500).json({ success: false, message: 'MONGODB_URI is missing' });
      }
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, socketTimeoutMS: 30000 });
    }

    if (typeof req.body === 'string' && req.body) {
      try {
        req.body = JSON.parse(req.body);
      } catch {}
    }

    return login(req, res, (err) => {
      if (err) {
        const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
        return res.status(statusCode).json({ success: false, message: err.message });
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
