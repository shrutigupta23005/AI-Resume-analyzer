// =============================================================
// PDF Parser Service
// Extracts text from PDF resumes and detects sections
// =============================================================
const pdfParse = require('pdf-parse');
const fs = require('fs');

const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return { text: data.text || '', numPages: data.numpages || 1, info: data.info || {} };
  } catch (error) {
    throw new Error('Failed to parse PDF file.');
  }
};

const detectSections = (text) => {
  const sections = { contact: '', summary: '', experience: '', education: '', skills: '', projects: '', certifications: '', other: '' };
  const patterns = {
    summary: /(?:^|\n)\s*(?:summary|objective|profile|about\s*me|professional\s*summary|career\s*objective)\s*[:\-]?\s*\n/i,
    experience: /(?:^|\n)\s*(?:experience|work\s*experience|employment|professional\s*experience)\s*[:\-]?\s*\n/i,
    education: /(?:^|\n)\s*(?:education|academic|qualifications)\s*[:\-]?\s*\n/i,
    skills: /(?:^|\n)\s*(?:skills|technical\s*skills|core\s*competencies|key\s*skills)\s*[:\-]?\s*\n/i,
    projects: /(?:^|\n)\s*(?:projects|personal\s*projects|key\s*projects)\s*[:\-]?\s*\n/i,
    certifications: /(?:^|\n)\s*(?:certifications|certificates|licenses|awards)\s*[:\-]?\s*\n/i,
  };
  const lines = text.split('\n');
  sections.contact = lines.slice(0, 8).join('\n').trim();
  const positions = [];
  for (const [name, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) positions.push({ name, index: match.index, length: match[0].length });
  }
  positions.sort((a, b) => a.index - b.index);
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].index + positions[i].length;
    const end = i + 1 < positions.length ? positions[i + 1].index : text.length;
    sections[positions[i].name] = text.substring(start, end).trim();
  }
  return sections;
};

const cleanText = (text) => text.replace(/\r\n/g, '\n').replace(/\t/g, ' ').replace(/ {2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

module.exports = { extractTextFromPDF, detectSections, cleanText };
