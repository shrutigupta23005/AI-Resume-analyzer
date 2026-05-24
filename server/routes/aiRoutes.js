const router = require('express').Router();
const { getImprovements, rewriteBullets, generateSummary, getJobSuggestions } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.use(aiLimiter);

router.post('/:resumeId/improve', getImprovements);
router.post('/rewrite-bullets', rewriteBullets);
router.post('/:resumeId/summary', generateSummary);
router.post('/:resumeId/job-suggestions', getJobSuggestions);

module.exports = router;
