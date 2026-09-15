const mongoose = require('mongoose');

const CATEGORIES = ['Road', 'Garbage', 'Water', 'Electricity', 'Other'];
const STATUSES = ['pending', 'in-progress', 'resolved'];

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [150, 'Title is too long'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description is too long'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: CATEGORIES,
      message: '{VALUE} is not a valid category',
    },
  },
  area: {
    type: String,
    required: [true, 'Area / locality is required'],
    trim: true,
    maxlength: [150, 'Area is too long'],
  },
  status: {
    type: String,
    enum: {
      values: STATUSES,
      message: '{VALUE} is not a valid status',
    },
    default: 'pending',
  },
  upvotes: {
    type: Number,
    default: 0,
    min: 0,
  },
  upvotedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  imageUrl: {
    type: String,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Denormalized at creation time so the API can return a flat complaint
  // object (createdBy as a plain string id) without a populate() round trip -
  // this is the exact shape the frontend's api.ts / types.ts expect.
  creatorName: {
    type: String,
    default: '',
  },
  creatorEmail: {
    type: String,
    default: '',
  },
  officerRemark: {
    type: String,
    default: '',
    maxlength: [1000, 'Remark is too long'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  feedbackRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  feedbackComment: {
    type: String,
    default: '',
    maxlength: [1000, 'Feedback comment is too long'],
  },
  feedbackGiven: {
    type: Boolean,
    default: false,
  },
  feedbackPending: {
    type: Boolean,
    default: false,
  },
});

// Helpful compound index for duplicate-detection lookups
// (same category + area + status in {pending, in-progress}).
complaintSchema.index({ category: 1, area: 1, status: 1 });

// Text index to support keyword search across title/description/area.
complaintSchema.index({ title: 'text', description: 'text', area: 'text' });

complaintSchema.statics.CATEGORIES = CATEGORIES;
complaintSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Complaint', complaintSchema);
