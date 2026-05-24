// =============================================================
// Job Match Model
// Stores job description comparison results
// =============================================================
const mongoose = require('mongoose');

const jobMatchSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobDescription: {
      type: String,
      required: [true, 'Job description is required'],
    },
    jobTitle: {
      type: String,
      default: '',
    },
    matchPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    matchedKeywords: [{ type: String }],
    missingKeywords: [{ type: String }],
    suggestions: [{ type: String }],
    skillsAnalysis: {
      matched: [{ type: String }],
      missing: [{ type: String }],
      additional: [{ type: String }], // Skills in resume but not in JD
    },
    experienceMatch: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('JobMatch', jobMatchSchema);
