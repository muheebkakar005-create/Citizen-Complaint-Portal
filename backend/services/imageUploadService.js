const streamifier = require('streamifier');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * Uploads an in-memory file buffer (from multer) to Cloudinary and resolves
 * with the resulting secure URL. Returns null if Cloudinary isn't configured
 * so callers can gracefully skip the image instead of failing the request.
 */
function uploadBufferToCloudinary(buffer, folder = 'citizen-complaint-portal') {
  if (!isCloudinaryConfigured()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

module.exports = { uploadBufferToCloudinary };
