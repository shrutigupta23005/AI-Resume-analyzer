// =============================================================
// Resume Model
// Stores uploaded resume metadata and extracted text
// =============================================================
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    extractedText: {
      type: String,
      default: '',
    },
    sections: {
      contact: { type: String, default: '' },
      summary: { type: String, default: '' },
      experience: { type: String, default: '' },
      education: { type: String, default: '' },
      skills: { type: String, default: '' },
      projects: { type: String, default: '' },
      certifications: { type: String, default: '' },
      other: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['uploaded', 'parsed', 'analyzed', 'error'],
      default: 'uploaded',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', resumeSchema);
