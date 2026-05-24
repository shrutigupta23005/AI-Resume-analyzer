// =============================================================
// AI Controller - AI-powered resume improvements
// =============================================================
const Resume = require('../models/Resume');
const aiService = require('../services/aiService');

// @desc    Get AI improvements for a resume
// @route   POST /api/ai/:resumeId/improve
exports.getImprovements = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, userId: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    const improvements = await aiService.getResumeImprovements(resume.extractedText, resume.sections);
    res.json({ success: true, data: { improvements } });
  } catch (error) {
    if (error.message.includes('API key')) return res.status(503).json({ success: false, message: 'AI service not configured. Please add a Gemini API key.' });
    next(error);
  }
};

// @desc    Rewrite bullet points
// @route   POST /api/ai/rewrite-bullets
exports.rewriteBullets = async (req, res, next) => {
  try {
    const { bullets } = req.body;
    if (!bullets || !Array.isArray(bullets) || bullets.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of bullet points' });
    }
    const results = await aiService.rewriteBullets(bullets.slice(0, 10));
    res.json({ success: true, data: { results } });
  } catch (error) { next(error); }
};

// @desc    Generate professional summary
// @route   POST /api/ai/:resumeId/summary
exports.generateSummary = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, userId: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    const result = await aiService.generateSummary(resume.extractedText);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

// @desc    Get job-specific suggestions
// @route   POST /api/ai/:resumeId/job-suggestions
exports.getJobSuggestions = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) return res.status(400).json({ success: false, message: 'Job description required' });
    const resume = await Resume.findOne({ _id: req.params.resumeId, userId: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    const suggestions = await aiService.getJobSpecificSuggestions(resume.extractedText, jobDescription);
    res.json({ success: true, data: { suggestions } });
  } catch (error) { next(error); }
};
