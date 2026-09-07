const multer = require('multer');
const ApiError = require('../utils/ApiError');

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

// Store the file in memory as a Buffer; we stream it straight to Cloudinary
// (or discard it gracefully if Cloudinary isn't configured) without ever
// writing it to disk.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new ApiError(400, 'Invalid file type. Only JPEG, PNG, and WEBP images are allowed.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

// Wrap multer's single-file middleware so multer errors (e.g. file too
// large) are converted into our standard ApiError/JSON error shape instead
// of leaking multer's raw error format.
const uploadComplaintImage = (req, res, next) => {
  const handler = upload.single('image');
  handler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, `Image too large. Max size is ${MAX_FILE_SIZE_MB}MB.`));
      }
      return next(new ApiError(400, err.message));
    }
    if (err) return next(err);
    next();
  });
};

module.exports = { uploadComplaintImage };
