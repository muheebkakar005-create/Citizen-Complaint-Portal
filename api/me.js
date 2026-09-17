const mongoose = require('mongoose');
const { getMe } = require('../backend/controllers/authController');
const { protect } = require('../middleware/authMiddleware');

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

    const next = (err) => {
      if (err) {
        const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
        return res.status(statusCode).json({ success: false, message: err.message });
      }
    };

    return protect(req, res, () => getMe(req, res, next));
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
