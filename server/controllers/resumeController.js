// =============================================================
// Resume Controller - Upload, list, delete, preview resumes
// =============================================================
const Resume = require('../models/Resume');
const { extractTextFromPDF, detectSections, cleanText } = require('../services/pdfParser');
const fs = require('fs');
const path = require('path');

// @desc    Upload a resume PDF
// @route   POST /api/resumes/upload
exports.uploadResume = async (req, res, next) => {
  try {
    const file = req.file;
    // Extract text from PDF
    const { text, numPages } = await extractTextFromPDF(file.path);
    const cleanedText = cleanText(text);
    const sections = detectSections(cleanedText);

    // Save resume to database
    const resume = await Resume.create({
      userId: req.user.id,
      filename: file.filename,
      originalName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      mimeType: file.mimetype,
      extractedText: cleanedText,
      sections,
      status: cleanedText.length > 50 ? 'parsed' : 'error',
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      data: { resume: { id: resume._id, originalName: resume.originalName, fileSize: resume.fileSize, status: resume.status, createdAt: resume.createdAt, wordCount: cleanedText.split(/\s+/).length, pages: numPages } },
    });
  } catch (error) { next(error); }
};

// @desc    Get all resumes for current user
// @route   GET /api/resumes
exports.getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).select('-extractedText -sections').sort('-createdAt');
    res.json({ success: true, count: resumes.length, data: { resumes } });
  } catch (error) { next(error); }
};

// @desc    Get single resume by ID
// @route   GET /api/resumes/:id
exports.getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    res.json({ success: true, data: { resume } });
  } catch (error) { next(error); }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    // Delete file from disk
    if (fs.existsSync(resume.filePath)) fs.unlinkSync(resume.filePath);
    await Resume.deleteOne({ _id: resume._id });
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) { next(error); }
};

// @desc    Download/preview resume PDF
// @route   GET /api/resumes/:id/download
exports.downloadResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    if (!fs.existsSync(resume.filePath)) return res.status(404).json({ success: false, message: 'File not found on server' });
    res.download(resume.filePath, resume.originalName);
  } catch (error) { next(error); }
};
