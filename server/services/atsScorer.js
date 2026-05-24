// =============================================================
// ATS Scoring Engine
// Evaluates resumes across 10 weighted categories
// =============================================================

// Common action verbs that ATS systems look for
const ACTION_VERBS = [
  'achieved','administered','analyzed','built','collaborated','completed','conducted',
  'coordinated','created','decreased','delivered','designed','developed','directed',
  'eliminated','established','evaluated','executed','expanded','generated','identified',
  'implemented','improved','increased','initiated','introduced','launched','led',
  'managed','mentored','negotiated','optimized','organized','oversaw','performed',
  'planned','prepared','presented','produced','promoted','provided','published',
  'reduced','reorganized','researched','resolved','reviewed','simplified','spearheaded',
  'streamlined','strengthened','supervised','supported','trained','transformed','upgraded'
];

// Common technical skills by category
const TECH_SKILLS = [
  'javascript','typescript','python','java','c++','c#','ruby','go','rust','swift','kotlin',
  'react','angular','vue','node','express','django','flask','spring','rails',
  'html','css','sass','tailwind','bootstrap',
  'sql','mysql','postgresql','mongodb','redis','firebase','dynamodb',
  'aws','azure','gcp','docker','kubernetes','jenkins','ci/cd','git','github',
  'rest','graphql','api','microservices','agile','scrum','jira',
  'machine learning','deep learning','tensorflow','pytorch','nlp','data science',
  'figma','photoshop','ui/ux','responsive design',
  'linux','windows','macos','bash','powershell'
];

const SOFT_SKILLS = [
  'leadership','communication','teamwork','problem-solving','critical thinking',
  'time management','adaptability','creativity','collaboration','analytical',
  'detail-oriented','self-motivated','project management','presentation',
  'negotiation','decision-making','strategic planning','mentoring'
];

const REQUIRED_SECTIONS = ['contact', 'summary', 'experience', 'education', 'skills'];

/**
 * Main ATS scoring function
 * @param {string} text - Full resume text
 * @param {Object} sections - Detected sections
 * @returns {Object} Complete analysis results
 */
const analyzeResume = (text, sections) => {
  const textLower = text.toLowerCase();
  const words = textLower.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const lines = text.split('\n').filter(l => l.trim().length > 0);

  // Score each category
  const categories = [
    scoreFormatting(text, lines),
    scoreSectionCompleteness(sections),
    scoreKeywordOptimization(textLower, words),
    scoreActionVerbs(textLower, lines),
    scoreReadability(text, words, lines),
    scoreSkills(textLower),
    scoreExperienceQuality(textLower, sections),
    scoreGrammar(text, lines),
    scoreLengthOptimization(wordCount),
    scoreProfessionalism(text, textLower),
  ];

  // Calculate weighted overall score
  const overallScore = Math.round(
    categories.reduce((sum, cat) => sum + (cat.score * cat.weight) / 100, 0)
  );

  // Collect strengths and weaknesses
  const strengths = categories.filter(c => c.score >= 70).map(c => `${c.name}: ${c.feedback}`);
  const weaknesses = categories.filter(c => c.score < 50).map(c => `${c.name}: ${c.feedback}`);
  const recommendations = categories.flatMap(c => c.details.filter(d => d.startsWith('→')));

  return {
    overallScore,
    categoryScores: categories,
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    recommendations: recommendations.slice(0, 10),
    resumeWordCount: wordCount,
    estimatedPages: Math.ceil(wordCount / 500),
  };
};

// --- Category Scoring Functions ---

function scoreFormatting(text, lines) {
  let score = 70; // Base
  const details = [];
  // Check for consistent line lengths (not too short or too long)
  const avgLineLen = lines.reduce((s, l) => s + l.length, 0) / lines.length;
  if (avgLineLen > 20 && avgLineLen < 120) { score += 10; }
  else { details.push('→ Keep line lengths between 20-120 characters for readability'); }
  // Check for bullet points
  const bulletLines = lines.filter(l => /^\s*[\•\-\*\►\▪\●]/.test(l)).length;
  if (bulletLines > 3) { score += 10; details.push('Good use of bullet points'); }
  else { score -= 10; details.push('→ Use bullet points to list achievements and responsibilities'); }
  // Check for no special characters that break ATS
  if (/[\u2018\u2019\u201C\u201D]/.test(text)) { score -= 5; details.push('→ Replace smart quotes with straight quotes for ATS compatibility'); }
  // Check for tables/columns (problematic for ATS)
  if (/\t{2,}/.test(text) || /\|/.test(text)) { score -= 10; details.push('→ Avoid tables and columns - use simple formatting'); }
  else { score += 5; }
  return { name: 'Formatting', score: Math.min(100, Math.max(0, score)), weight: 15, feedback: score >= 70 ? 'Good formatting structure' : 'Formatting needs improvement', details };
}

function scoreSectionCompleteness(sections) {
  let score = 0;
  const details = [];
  const found = [];
  const missing = [];
  for (const sec of REQUIRED_SECTIONS) {
    if (sections[sec] && sections[sec].trim().length > 10) {
      score += 20;
      found.push(sec);
    } else {
      missing.push(sec);
    }
  }
  if (sections.projects && sections.projects.trim().length > 10) { score += 5; found.push('projects'); }
  if (sections.certifications && sections.certifications.trim().length > 5) { score += 5; found.push('certifications'); }
  if (missing.length > 0) details.push(`→ Add missing sections: ${missing.join(', ')}`);
  if (found.length > 0) details.push(`Found sections: ${found.join(', ')}`);
  return { name: 'Section Completeness', score: Math.min(100, score), weight: 15, feedback: missing.length === 0 ? 'All key sections present' : `Missing: ${missing.join(', ')}`, details };
}

function scoreKeywordOptimization(textLower, words) {
  let score = 40;
  const details = [];
  const foundTech = TECH_SKILLS.filter(s => textLower.includes(s));
  const foundSoft = SOFT_SKILLS.filter(s => textLower.includes(s));
  score += Math.min(30, foundTech.length * 3);
  score += Math.min(20, foundSoft.length * 4);
  if (foundTech.length < 5) details.push('→ Add more technical skills/keywords relevant to your target role');
  if (foundSoft.length < 2) details.push('→ Include soft skills like leadership, communication, teamwork');
  if (foundTech.length >= 5) details.push(`Found ${foundTech.length} technical keywords`);
  // Check keyword density
  const uniqueWords = new Set(words);
  const diversity = uniqueWords.size / words.length;
  if (diversity > 0.4) score += 10;
  else details.push('→ Use more varied vocabulary to improve keyword diversity');
  return { name: 'Keyword Optimization', score: Math.min(100, score), weight: 15, feedback: foundTech.length >= 5 ? 'Good keyword usage' : 'Needs more industry keywords', details };
}

function scoreActionVerbs(textLower, lines) {
  let score = 30;
  const details = [];
  const foundVerbs = ACTION_VERBS.filter(v => textLower.includes(v));
  score += Math.min(50, foundVerbs.length * 5);
  // Check if bullet points start with action verbs
  const bulletStarts = lines.filter(l => {
    const clean = l.replace(/^\s*[\•\-\*\►\▪\●]\s*/, '').toLowerCase();
    return ACTION_VERBS.some(v => clean.startsWith(v));
  }).length;
  if (bulletStarts >= 3) { score += 20; details.push(`${bulletStarts} bullet points start with action verbs`); }
  else { details.push('→ Start bullet points with strong action verbs (e.g., Developed, Managed, Increased)'); }
  if (foundVerbs.length < 5) details.push('→ Use more action verbs throughout your resume');
  return { name: 'Action Verbs', score: Math.min(100, score), weight: 10, feedback: foundVerbs.length >= 8 ? 'Strong use of action verbs' : 'Add more action verbs', details };
}

function scoreReadability(text, words, lines) {
  let score = 60;
  const details = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const avgSentLen = sentences.length > 0 ? words.length / sentences.length : 0;
  if (avgSentLen >= 8 && avgSentLen <= 25) { score += 20; }
  else if (avgSentLen > 25) { score -= 10; details.push('→ Shorten sentences for better readability (aim for 8-25 words)'); }
  // Check paragraph density
  if (lines.length > 15) { score += 10; }
  else { details.push('→ Add more detail to your resume sections'); }
  // Short paragraphs are better
  const longLines = lines.filter(l => l.length > 150).length;
  if (longLines > 5) { score -= 10; details.push('→ Break long paragraphs into shorter bullet points'); }
  else { score += 10; }
  return { name: 'Readability', score: Math.min(100, Math.max(0, score)), weight: 10, feedback: score >= 70 ? 'Good readability' : 'Improve readability', details };
}

function scoreSkills(textLower) {
  let score = 30;
  const details = [];
  const tech = TECH_SKILLS.filter(s => textLower.includes(s));
  const soft = SOFT_SKILLS.filter(s => textLower.includes(s));
  score += Math.min(40, tech.length * 4);
  score += Math.min(20, soft.length * 5);
  if (tech.length > 0) details.push(`Technical skills found: ${tech.slice(0, 10).join(', ')}`);
  if (soft.length > 0) details.push(`Soft skills found: ${soft.slice(0, 5).join(', ')}`);
  if (tech.length < 3) details.push('→ Add more technical skills relevant to your field');
  if (soft.length < 2) details.push('→ Include relevant soft skills');
  return { name: 'Skills Section', score: Math.min(100, score), weight: 10, feedback: tech.length >= 5 ? 'Strong skills section' : 'Enhance skills section', details };
}

function scoreExperienceQuality(textLower, sections) {
  let score = 40;
  const details = [];
  const exp = sections.experience || '';
  // Check for quantified achievements (numbers, percentages, dollar amounts)
  const numbers = exp.match(/\d+%|\$\d+|\d+\+?\s*(years?|months?|users?|clients?|projects?|team)/gi) || [];
  if (numbers.length >= 3) { score += 30; details.push(`Found ${numbers.length} quantified achievements`); }
  else if (numbers.length > 0) { score += 15; details.push('→ Add more quantified achievements (numbers, percentages, dollar amounts)'); }
  else { details.push('→ Quantify your achievements (e.g., "Increased revenue by 25%")'); }
  // Check for company names and dates
  const datePattern = /\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|current/gi;
  const dates = textLower.match(datePattern) || [];
  if (dates.length >= 2) { score += 15; }
  else { details.push('→ Include dates for each work experience'); }
  // Check experience section length
  if (exp.length > 200) { score += 15; }
  else { details.push('→ Expand your experience section with more details'); }
  return { name: 'Experience Quality', score: Math.min(100, score), weight: 10, feedback: score >= 70 ? 'Strong experience section' : 'Improve experience descriptions', details };
}

function scoreGrammar(text, lines) {
  let score = 80;
  const details = [];
  // Basic checks (not a full grammar engine)
  const doubleSpaces = (text.match(/  +/g) || []).length;
  if (doubleSpaces > 5) { score -= 10; details.push('→ Remove extra spaces in your resume'); }
  // Check for common mistakes
  if (/\bi\b/.test(text) && !/\bI\b/.test(text)) { score -= 5; details.push('→ Capitalize "I" when referring to yourself'); }
  // Check for consistent punctuation at end of bullets
  const bullets = lines.filter(l => /^\s*[\•\-\*]/.test(l));
  if (bullets.length > 3) {
    const withPeriod = bullets.filter(l => l.trim().endsWith('.')).length;
    const ratio = withPeriod / bullets.length;
    if (ratio > 0.2 && ratio < 0.8) { score -= 10; details.push('→ Be consistent with punctuation at the end of bullet points'); }
  }
  // Check for all caps (except acronyms)
  const allCapsWords = text.match(/\b[A-Z]{4,}\b/g) || [];
  if (allCapsWords.length > 5) { score -= 5; details.push('→ Avoid excessive use of ALL CAPS'); }
  return { name: 'Grammar & Spelling', score: Math.min(100, Math.max(0, score)), weight: 5, feedback: score >= 75 ? 'Good grammar' : 'Review grammar and formatting', details };
}

function scoreLengthOptimization(wordCount) {
  let score = 0;
  const details = [];
  if (wordCount >= 300 && wordCount <= 800) {
    score = 100;
    details.push('Resume length is optimal for a 1-page resume');
  } else if (wordCount > 800 && wordCount <= 1200) {
    score = 85;
    details.push('Resume length is appropriate for a 2-page resume');
  } else if (wordCount < 300) {
    score = 40;
    details.push('→ Resume is too short. Add more details about experience and skills');
  } else {
    score = 50;
    details.push('→ Resume is too long. Aim for 1-2 pages maximum');
  }
  details.push(`Word count: ${wordCount}`);
  return { name: 'Length Optimization', score, weight: 5, feedback: `${wordCount} words (${Math.ceil(wordCount / 500)} pages)`, details };
}

function scoreProfessionalism(text, textLower) {
  let score = 70;
  const details = [];
  // Check for professional email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) {
    const email = emailMatch[0].toLowerCase();
    if (email.includes('gmail') || email.includes('outlook') || email.includes('yahoo') || email.includes('hotmail')) {
      score += 10;
    }
    if (/\d{4,}/.test(email.split('@')[0])) { score -= 5; details.push('→ Use a more professional email address'); }
    else { score += 5; }
  } else {
    score -= 15;
    details.push('→ Include a professional email address');
  }
  // Check for LinkedIn or portfolio
  if (textLower.includes('linkedin') || textLower.includes('github') || textLower.includes('portfolio')) {
    score += 10;
    details.push('Professional links found (LinkedIn/GitHub/Portfolio)');
  } else {
    details.push('→ Add your LinkedIn profile or portfolio link');
  }
  // Check for phone number
  if (/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)) {
    score += 5;
  } else {
    details.push('→ Include your phone number');
  }
  return { name: 'Professionalism', score: Math.min(100, Math.max(0, score)), weight: 5, feedback: score >= 70 ? 'Professional presentation' : 'Improve professional elements', details };
}

module.exports = { analyzeResume, ACTION_VERBS, TECH_SKILLS, SOFT_SKILLS };
