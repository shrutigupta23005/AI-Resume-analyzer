// =============================================================
// Analysis Model
// Stores ATS analysis results with category breakdowns
// =============================================================
const mongoose = require('mongoose');

const categoryScoreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    weight: { type: Number, required: true },
    maxScore: { type: Number, default: 100 },
    feedback: { type: String, default: '' },
    details: [{ type: String }], // Specific findings for this category
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
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
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    categoryScores: [categoryScoreSchema],
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }],
    resumeWordCount: { type: Number, default: 0 },
    estimatedPages: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Analysis', analysisSchema);
