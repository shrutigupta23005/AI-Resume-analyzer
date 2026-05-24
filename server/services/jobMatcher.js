// =============================================================
// Job Matcher Service
// Compares resume against job description to find match %
// =============================================================
const { TECH_SKILLS, SOFT_SKILLS } = require('./atsScorer');

/**
 * Compare resume text against a job description
 * @param {string} resumeText - Extracted resume text
 * @param {string} jobDescription - Job description text
 * @returns {Object} Match results with percentage and details
 */
const matchResumeToJob = (resumeText, jobDescription) => {
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jobDescription.toLowerCase();

  // Extract keywords from job description
  const jdKeywords = extractKeywords(jdLower);
  const resumeKeywords = extractKeywords(resumeLower);

  // Find matched and missing keywords
  const matchedKeywords = jdKeywords.filter(kw => resumeLower.includes(kw));
  const missingKeywords = jdKeywords.filter(kw => !resumeLower.includes(kw));
  const additionalKeywords = resumeKeywords.filter(kw => !jdLower.includes(kw));

  // Skills analysis
  const jdTechSkills = TECH_SKILLS.filter(s => jdLower.includes(s));
  const resumeTechSkills = TECH_SKILLS.filter(s => resumeLower.includes(s));
  const matchedSkills = jdTechSkills.filter(s => resumeLower.includes(s));
  const missingSkills = jdTechSkills.filter(s => !resumeLower.includes(s));
  const additionalSkills = resumeTechSkills.filter(s => !jdLower.includes(s));

  // Calculate match percentage (weighted)
  const keywordScore = jdKeywords.length > 0 ? (matchedKeywords.length / jdKeywords.length) * 60 : 30;
  const skillScore = jdTechSkills.length > 0 ? (matchedSkills.length / jdTechSkills.length) * 30 : 15;
  // Bonus for having relevant additional skills
  const bonusScore = Math.min(10, additionalSkills.length * 2);
  const matchPercentage = Math.min(100, Math.round(keywordScore + skillScore + bonusScore));

  // Generate suggestions
  const suggestions = generateSuggestions(missingKeywords, missingSkills, matchPercentage);

  // Try to detect job title from JD
  const jobTitle = detectJobTitle(jobDescription);

  return {
    matchPercentage,
    matchedKeywords: [...new Set(matchedKeywords)].slice(0, 20),
    missingKeywords: [...new Set(missingKeywords)].slice(0, 20),
    suggestions,
    jobTitle,
    skillsAnalysis: {
      matched: matchedSkills,
      missing: missingSkills,
      additional: additionalSkills.slice(0, 10),
    },
    experienceMatch: analyzeExperienceMatch(resumeLower, jdLower),
  };
};

function extractKeywords(text) {
  // Remove common stop words and extract meaningful words/phrases
  const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','shall','should','may','might','can','could','must','need','this','that','these','those','it','its','we','our','you','your','they','their','not','no','all','each','every','any','some','such','than','too','very','just','about','also','into','from','up','out','if','then','so','as','more','most','other','which','who','whom','what','when','where','how','why']);

  const words = text.match(/\b[a-z][a-z+#.-]{2,}\b/g) || [];
  const filtered = words.filter(w => !stopWords.has(w) && w.length > 2);
  // Count frequency and return top keywords
  const freq = {};
  filtered.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word]) => word);
}

function generateSuggestions(missingKeywords, missingSkills, matchPct) {
  const suggestions = [];
  if (matchPct < 50) suggestions.push('Your resume needs significant tailoring for this role. Consider rewriting your summary and experience sections.');
  else if (matchPct < 70) suggestions.push('Good foundation! Add more targeted keywords to improve your match.');
  else suggestions.push('Strong match! Fine-tune a few areas to maximize your chances.');

  if (missingSkills.length > 0) suggestions.push(`Add these skills if you have them: ${missingSkills.slice(0, 5).join(', ')}`);
  if (missingKeywords.length > 3) suggestions.push(`Incorporate these keywords naturally: ${missingKeywords.slice(0, 5).join(', ')}`);
  suggestions.push('Tailor your professional summary to match the job requirements');
  suggestions.push('Use similar language and terminology as the job description');
  return suggestions;
}

function detectJobTitle(jd) {
  const lines = jd.split('\n').filter(l => l.trim().length > 0);
  if (lines.length > 0 && lines[0].length < 100) return lines[0].trim();
  const titleMatch = jd.match(/(?:job\s*title|position|role)\s*[:\-]\s*(.+)/i);
  if (titleMatch) return titleMatch[1].trim().slice(0, 80);
  return 'Job Position';
}

function analyzeExperienceMatch(resumeLower, jdLower) {
  const expMatch = jdLower.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
  if (expMatch) {
    const required = parseInt(expMatch[1]);
    const resumeExp = resumeLower.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
    if (resumeExp) {
      const has = parseInt(resumeExp[1]);
      if (has >= required) return `Meets experience requirement (${required}+ years)`;
      return `Job requires ${required}+ years; your resume shows ${has} years`;
    }
    return `Job requires ${required}+ years of experience - ensure this is highlighted`;
  }
  return 'Experience requirement not specified in job description';
}

module.exports = { matchResumeToJob };
