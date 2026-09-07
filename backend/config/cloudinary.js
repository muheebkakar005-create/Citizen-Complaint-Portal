const cloudinary = require('cloudinary').v2;

/**
 * Cloudinary is entirely optional. The app must keep working without it.
 * isCloudinaryConfigured() lets the rest of the app decide, at request time,
 * whether image upload is actually available.
 */
const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[Cloudinary] Configured and ready for image uploads.');
} else {
  console.warn('[Cloudinary] Not configured. Complaint image upload will be skipped gracefully.');
}

module.exports = { cloudinary, isCloudinaryConfigured };
