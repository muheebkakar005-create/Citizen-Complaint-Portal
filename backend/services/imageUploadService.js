const streamifier = require('streamifier');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

/**
 * Uploads an in-memory file buffer (from multer) OR a base64 data URI string
 * to Cloudinary and resolves with the resulting secure URL.
 * Returns null if Cloudinary isn't configured or if upload fails.
 */
async function uploadImageToCloudinary(imageSource, folder = 'citizen-complaint-portal') {
  if (!isCloudinaryConfigured() || !imageSource) {
    return null;
  }

  try {
    // If it's a buffer (e.g. from multer)
    if (Buffer.isBuffer(imageSource)) {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'image' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(imageSource).pipe(uploadStream);
      });
    }

    // If it's a base64 data URL string or web URL
    if (typeof imageSource === 'string' && imageSource.trim()) {
      const trimmed = imageSource.trim();
      // If already a Cloudinary or remote HTTPS URL, return as is
      if (trimmed.startsWith('https://res.cloudinary.com')) {
        return trimmed;
      }
      if (trimmed.startsWith('data:image/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const result = await cloudinary.uploader.upload(trimmed, {
          folder,
          resource_type: 'image',
        });
        return result.secure_url;
      }
    }
  } catch (err) {
    console.error('[Cloudinary] Upload failed, falling back:', err.message);
    return null;
  }

  return null;
}

function uploadBufferToCloudinary(buffer, folder = 'citizen-complaint-portal') {
  return uploadImageToCloudinary(buffer, folder);
}

module.exports = { uploadImageToCloudinary, uploadBufferToCloudinary };
