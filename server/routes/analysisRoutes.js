const router = require('express').Router();
const { analyzeResume, getAnalysis, getAnalyses, matchJob, getJobMatch, getJobMatches, getDashboardStats, downloadAnalysisReport, downloadJobMatchReport } = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');
const { validateJobDescription } = require('../middleware/validate');

router.use(protect);

router.get('/dashboard/stats', getDashboardStats);
router.get('/matches', getJobMatches);
router.get('/match/:id', getJobMatch);
router.get('/match/:id/report', downloadJobMatchReport);
router.post('/:resumeId', analyzeResume);
router.post('/:resumeId/match', validateJobDescription, matchJob);
router.get('/', getAnalyses);
router.get('/:id', getAnalysis);
router.get('/:id/report', downloadAnalysisReport);

module.exports = router;
