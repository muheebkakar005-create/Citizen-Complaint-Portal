const cloudinary = require('cloudinary').v2;

/**
 * Cloudinary configuration.
 * Supports both CLOUDINARY_URL or individual credentials.
 * isCloudinaryConfigured() checks at runtime.
 */
const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET)
  );

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL.trim(),
  });
  console.log('[Cloudinary] Configured via CLOUDINARY_URL.');
} else if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  });
  console.log('[Cloudinary] Configured via individual credentials.');
} else {
  console.warn('[Cloudinary] Not configured. Complaint image upload will be skipped gracefully.');
}

module.exports = { cloudinary, isCloudinaryConfigured };
