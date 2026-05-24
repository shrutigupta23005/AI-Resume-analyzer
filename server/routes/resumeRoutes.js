const router = require('express').Router();
const { uploadResume, getResumes, getResume, deleteResume, downloadResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const { uploadResume: uploadMiddleware } = require('../middleware/upload');

// All routes require authentication
router.use(protect);

router.post('/upload', uploadMiddleware, uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);
router.get('/:id/download', downloadResume);

module.exports = router;
