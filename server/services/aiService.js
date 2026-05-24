// =============================================================
// AI Service - Google Gemini Integration
// Provides AI-powered resume improvements
// =============================================================
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

let genAI = null;
let model = null;

// Initialize Gemini (lazy)
const getModel = () => {
  if (!model) {
    if (!env.GEMINI_API_KEY) throw new Error('Gemini API key not configured');
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
  return model;
};

/**
 * Get AI-powered resume improvements
 */
const getResumeImprovements = async (resumeText, sections) => {
  const m = getModel();
  const prompt = `You are an expert resume coach. Analyze this resume and provide improvements in JSON format.

Resume Text:
${resumeText.slice(0, 4000)}

Return a JSON object with these keys:
{
  "summaryRewrite": "An improved professional summary (2-3 sentences)",
  "bulletImprovements": [{"original": "...", "improved": "..."}, ...] (up to 5 bullets),
  "grammarFixes": [{"issue": "...", "fix": "..."}, ...] (up to 5),
  "actionVerbSuggestions": ["verb1", "verb2", ...] (10 strong action verbs),
  "missingSkills": ["skill1", "skill2", ...] (5-10 skills to consider adding),
  "overallTips": ["tip1", "tip2", "tip3"] (3 high-impact tips)
}

Return ONLY valid JSON, no markdown formatting.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  // Parse JSON from response (handle possible markdown wrapping)
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
};

/**
 * Rewrite bullet points to be stronger
 */
const rewriteBullets = async (bullets) => {
  const m = getModel();
  const prompt = `Rewrite these resume bullet points to be more impactful. Use strong action verbs, quantify achievements where possible, and follow the STAR format.

Original bullets:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Return a JSON array of objects: [{"original": "...", "improved": "..."}, ...]
Return ONLY valid JSON.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
};

/**
 * Generate a professional summary
 */
const generateSummary = async (resumeText) => {
  const m = getModel();
  const prompt = `Based on this resume, write a compelling professional summary (2-3 sentences) that highlights key strengths and experience.

Resume:
${resumeText.slice(0, 3000)}

Return a JSON object: {"summary": "..."}
Return ONLY valid JSON.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
};

/**
 * Get job-specific resume suggestions
 */
const getJobSpecificSuggestions = async (resumeText, jobDescription) => {
  const m = getModel();
  const prompt = `Compare this resume against the job description. Provide specific suggestions to tailor the resume.

Resume:
${resumeText.slice(0, 3000)}

Job Description:
${jobDescription.slice(0, 2000)}

Return JSON:
{
  "tailoredSummary": "A summary rewritten for this specific job",
  "keywordSuggestions": ["keyword1", "keyword2", ...],
  "experienceTips": ["tip1", "tip2", "tip3"],
  "skillsToHighlight": ["skill1", "skill2", ...],
  "overallAdvice": "One paragraph of advice"
}
Return ONLY valid JSON.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
};

module.exports = { getResumeImprovements, rewriteBullets, generateSummary, getJobSpecificSuggestions };
