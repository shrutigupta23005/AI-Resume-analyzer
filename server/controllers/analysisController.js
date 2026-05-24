// =============================================================
// Analysis Controller - ATS scoring and job matching
// =============================================================
const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const JobMatch = require('../models/JobMatch');
const { analyzeResume } = require('../services/atsScorer');
const { matchResumeToJob } = require('../services/jobMatcher');
const { generateAnalysisReport, generateJobMatchReport } = require('../services/reportGenerator');

// @desc    Analyze a resume for ATS compatibility
// @route   POST /api/analysis/:resumeId
exports.analyzeResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.resumeId, userId: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    if (!resume.extractedText || resume.extractedText.length < 50) {
      return res.status(400).json({ success: false, message: 'Resume text could not be extracted. Please upload a text-based PDF.' });
    }
    // Run ATS analysis
    const results = analyzeResume(resume.extractedText, resume.sections);
    // Save analysis
    const analysis = await Analysis.create({ resumeId: resume._id, userId: req.user.id, ...results });
    // Update resume status
    resume.status = 'analyzed';
    await resume.save();
    res.status(201).json({ success: true, message: 'Analysis complete', data: { analysis } });
  } catch (error) { next(error); }
};

// @desc    Get analysis results
// @route   GET /api/analysis/:id
exports.getAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user.id }).populate('resumeId', 'originalName');
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
    res.json({ success: true, data: { analysis } });
  } catch (error) { next(error); }
};

// @desc    Get all analyses for current user
// @route   GET /api/analysis
exports.getAnalyses = async (req, res, next) => {
  try {
    const analyses = await Analysis.find({ userId: req.user.id }).populate('resumeId', 'originalName').sort('-createdAt');
    res.json({ success: true, count: analyses.length, data: { analyses } });
  } catch (error) { next(error); }
};

// @desc    Match resume against job description
// @route   POST /api/analysis/:resumeId/match
exports.matchJob = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;
    const resume = await Resume.findOne({ _id: req.params.resumeId, userId: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    // Run job matching
    const results = matchResumeToJob(resume.extractedText, jobDescription);
    // Save match results
    const jobMatch = await JobMatch.create({ resumeId: resume._id, userId: req.user.id, jobDescription, ...results });
    res.status(201).json({ success: true, message: 'Job matching complete', data: { jobMatch } });
  } catch (error) { next(error); }
};

// @desc    Get job match results
// @route   GET /api/analysis/match/:id
exports.getJobMatch = async (req, res, next) => {
  try {
    const jobMatch = await JobMatch.findOne({ _id: req.params.id, userId: req.user.id }).populate('resumeId', 'originalName');
    if (!jobMatch) return res.status(404).json({ success: false, message: 'Job match not found' });
    res.json({ success: true, data: { jobMatch } });
  } catch (error) { next(error); }
};

// @desc    Get all job matches for user
// @route   GET /api/analysis/matches
exports.getJobMatches = async (req, res, next) => {
  try {
    const matches = await JobMatch.find({ userId: req.user.id }).populate('resumeId', 'originalName').sort('-createdAt');
    res.json({ success: true, count: matches.length, data: { matches } });
  } catch (error) { next(error); }
};

// @desc    Get dashboard stats
// @route   GET /api/analysis/dashboard/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [resumeCount, analyses, matches] = await Promise.all([
      Resume.countDocuments({ userId: req.user.id }),
      Analysis.find({ userId: req.user.id }).sort('-createdAt').limit(10),
      JobMatch.countDocuments({ userId: req.user.id }),
    ]);
    const avgScore = analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.overallScore, 0) / analyses.length) : 0;
    const recentScores = analyses.map(a => ({ score: a.overallScore, date: a.createdAt }));
    res.json({
      success: true,
      data: { stats: { totalResumes: resumeCount, totalAnalyses: analyses.length, totalMatches: matches, averageScore: avgScore, recentScores } },
    });
  } catch (error) { next(error); }
};

// @desc    Download analysis as PDF report
// @route   GET /api/analysis/:id/report
exports.downloadAnalysisReport = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user.id }).populate('resumeId', 'originalName');
    if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });

    const resumeName = analysis.resumeId?.originalName || 'Resume';
    const doc = generateAnalysisReport(analysis.toObject(), resumeName);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ATS-Report-${resumeName.replace(/\.pdf$/i, '')}.pdf"`);

    doc.pipe(res);
    doc.end();
  } catch (error) { next(error); }
};

// @desc    Download job match as PDF report
// @route   GET /api/analysis/match/:id/report
exports.downloadJobMatchReport = async (req, res, next) => {
  try {
    const jobMatch = await JobMatch.findOne({ _id: req.params.id, userId: req.user.id }).populate('resumeId', 'originalName');
    if (!jobMatch) return res.status(404).json({ success: false, message: 'Job match not found' });

    const resumeName = jobMatch.resumeId?.originalName || 'Resume';
    const doc = generateJobMatchReport(jobMatch.toObject(), resumeName);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="JobMatch-Report-${resumeName.replace(/\.pdf$/i, '')}.pdf"`);

    doc.pipe(res);
    doc.end();
  } catch (error) { next(error); }
};
