// =============================================================
// PDF Report Generator Service
// Creates downloadable PDF analysis reports using PDFKit
// =============================================================
const PDFDocument = require('pdfkit');

/**
 * Generate a professional PDF report from analysis data
 * @param {Object} analysis - Analysis document from DB
 * @param {string} resumeName - Original resume filename
 * @returns {PDFDocument} PDF document stream
 */
const generateAnalysisReport = (analysis, resumeName = 'Resume') => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `ATS Analysis Report - ${resumeName}`,
      Author: 'ResumeAI Pro',
      Subject: 'Resume ATS Compatibility Analysis',
    },
  });

  const pageWidth = doc.page.width - 100; // Account for margins

  // --- Header ---
  doc
    .fontSize(28)
    .fillColor('#6366f1')
    .text('ResumeAI Pro', { align: 'center' })
    .fontSize(10)
    .fillColor('#64748b')
    .text('AI-Powered Resume Analyzer', { align: 'center' })
    .moveDown(0.5);

  // Divider
  drawDivider(doc, pageWidth);
  doc.moveDown(0.5);

  // Report title
  doc
    .fontSize(20)
    .fillColor('#0f172a')
    .text('ATS Compatibility Report', { align: 'center' })
    .fontSize(11)
    .fillColor('#64748b')
    .text(`Resume: ${resumeName}`, { align: 'center' })
    .text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' })
    .moveDown(1.5);

  // --- Overall Score ---
  const score = analysis.overallScore || 0;
  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  const scoreLabel = score >= 70 ? 'Great' : score >= 40 ? 'Average' : 'Needs Improvement';

  doc
    .fontSize(14)
    .fillColor('#0f172a')
    .text('Overall ATS Score', { align: 'center' })
    .fontSize(52)
    .fillColor(scoreColor)
    .text(`${score}/100`, { align: 'center' })
    .fontSize(14)
    .text(scoreLabel, { align: 'center' })
    .moveDown(0.3);

  doc
    .fontSize(9)
    .fillColor('#94a3b8')
    .text(`${analysis.resumeWordCount || 0} words · ${analysis.estimatedPages || 1} page(s)`, { align: 'center' })
    .moveDown(1.5);

  drawDivider(doc, pageWidth);
  doc.moveDown(1);

  // --- Category Scores ---
  doc
    .fontSize(16)
    .fillColor('#0f172a')
    .text('Category Breakdown', { underline: true })
    .moveDown(0.8);

  if (analysis.categoryScores && analysis.categoryScores.length > 0) {
    analysis.categoryScores.forEach((cat) => {
      const catColor = cat.score >= 70 ? '#10b981' : cat.score >= 40 ? '#f59e0b' : '#ef4444';

      // Category name and score on same line
      doc
        .fontSize(11)
        .fillColor('#0f172a')
        .text(`${cat.name}`, { continued: true })
        .fillColor(catColor)
        .text(`  ${cat.score}/100`, { continued: true })
        .fillColor('#94a3b8')
        .text(`  (weight: ${cat.weight}%)`);

      // Progress bar
      const barY = doc.y + 3;
      const barWidth = pageWidth;
      const barHeight = 8;
      // Background
      doc.save()
        .roundedRect(50, barY, barWidth, barHeight, 4)
        .fill('#e2e8f0');
      // Fill
      const fillWidth = Math.max(0, (cat.score / 100) * barWidth);
      if (fillWidth > 0) {
        doc.roundedRect(50, barY, fillWidth, barHeight, 4)
          .fill(catColor);
      }
      doc.restore();

      doc.y = barY + barHeight + 4;

      // Feedback
      if (cat.feedback) {
        doc.fontSize(9).fillColor('#64748b').text(`  ${cat.feedback}`);
      }

      doc.moveDown(0.5);
    });
  }

  doc.moveDown(0.5);

  // --- Strengths ---
  if (analysis.strengths && analysis.strengths.length > 0) {
    checkPageBreak(doc);
    drawDivider(doc, pageWidth);
    doc.moveDown(0.8);

    doc
      .fontSize(16)
      .fillColor('#10b981')
      .text('✓ Strengths', { underline: true })
      .moveDown(0.5);

    analysis.strengths.forEach((s) => {
      doc.fontSize(10).fillColor('#334155').text(`  • ${s}`);
      doc.moveDown(0.3);
    });
    doc.moveDown(0.5);
  }

  // --- Weaknesses ---
  if (analysis.weaknesses && analysis.weaknesses.length > 0) {
    checkPageBreak(doc);
    doc
      .fontSize(16)
      .fillColor('#ef4444')
      .text('✗ Areas to Improve', { underline: true })
      .moveDown(0.5);

    analysis.weaknesses.forEach((w) => {
      doc.fontSize(10).fillColor('#334155').text(`  • ${w}`);
      doc.moveDown(0.3);
    });
    doc.moveDown(0.5);
  }

  // --- Recommendations ---
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    checkPageBreak(doc);
    drawDivider(doc, pageWidth);
    doc.moveDown(0.8);

    doc
      .fontSize(16)
      .fillColor('#f59e0b')
      .text('💡 Recommendations', { underline: true })
      .moveDown(0.5);

    analysis.recommendations.forEach((r, i) => {
      const text = r.replace(/^→\s*/, '');
      doc.fontSize(10).fillColor('#334155').text(`  ${i + 1}. ${text}`);
      doc.moveDown(0.3);
    });
  }

  // --- Footer ---
  doc.moveDown(2);
  drawDivider(doc, pageWidth);
  doc.moveDown(0.5);
  doc
    .fontSize(8)
    .fillColor('#94a3b8')
    .text('This report was generated by ResumeAI Pro — AI-Powered Resume Analyzer.', { align: 'center' })
    .text('Scores are based on common ATS parsing patterns and may vary across different systems.', { align: 'center' })
    .text(`Report ID: ${analysis._id || 'N/A'}`, { align: 'center' });

  return doc;
};

/**
 * Generate a PDF report for job match results
 */
const generateJobMatchReport = (jobMatch, resumeName = 'Resume') => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `Job Match Report - ${resumeName}`,
      Author: 'ResumeAI Pro',
    },
  });

  const pageWidth = doc.page.width - 100;

  // Header
  doc
    .fontSize(28)
    .fillColor('#6366f1')
    .text('ResumeAI Pro', { align: 'center' })
    .fontSize(10)
    .fillColor('#64748b')
    .text('Job Description Match Report', { align: 'center' })
    .moveDown(0.5);

  drawDivider(doc, pageWidth);
  doc.moveDown(1);

  // Match percentage
  const pct = jobMatch.matchPercentage || 0;
  const pctColor = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';

  doc
    .fontSize(14)
    .fillColor('#0f172a')
    .text('Match Percentage', { align: 'center' })
    .fontSize(52)
    .fillColor(pctColor)
    .text(`${pct}%`, { align: 'center' })
    .moveDown(0.3);

  if (jobMatch.jobTitle) {
    doc.fontSize(12).fillColor('#64748b').text(`Position: ${jobMatch.jobTitle}`, { align: 'center' });
  }
  if (jobMatch.experienceMatch) {
    doc.fontSize(10).fillColor('#94a3b8').text(jobMatch.experienceMatch, { align: 'center' });
  }
  doc.moveDown(1.5);

  drawDivider(doc, pageWidth);
  doc.moveDown(0.8);

  // Matched Keywords
  if (jobMatch.matchedKeywords && jobMatch.matchedKeywords.length > 0) {
    doc
      .fontSize(14)
      .fillColor('#10b981')
      .text(`✓ Matched Keywords (${jobMatch.matchedKeywords.length})`, { underline: true })
      .moveDown(0.5);
    doc.fontSize(10).fillColor('#334155').text(jobMatch.matchedKeywords.join(', '));
    doc.moveDown(1);
  }

  // Missing Keywords
  if (jobMatch.missingKeywords && jobMatch.missingKeywords.length > 0) {
    doc
      .fontSize(14)
      .fillColor('#ef4444')
      .text(`✗ Missing Keywords (${jobMatch.missingKeywords.length})`, { underline: true })
      .moveDown(0.5);
    doc.fontSize(10).fillColor('#334155').text(jobMatch.missingKeywords.join(', '));
    doc.moveDown(1);
  }

  // Skills Analysis
  if (jobMatch.skillsAnalysis) {
    checkPageBreak(doc);
    drawDivider(doc, pageWidth);
    doc.moveDown(0.8);

    doc.fontSize(16).fillColor('#0f172a').text('Skills Analysis', { underline: true }).moveDown(0.5);

    if (jobMatch.skillsAnalysis.matched?.length > 0) {
      doc.fontSize(11).fillColor('#10b981').text('Matched Skills:');
      doc.fontSize(10).fillColor('#334155').text(jobMatch.skillsAnalysis.matched.join(', '));
      doc.moveDown(0.5);
    }
    if (jobMatch.skillsAnalysis.missing?.length > 0) {
      doc.fontSize(11).fillColor('#ef4444').text('Missing Skills:');
      doc.fontSize(10).fillColor('#334155').text(jobMatch.skillsAnalysis.missing.join(', '));
      doc.moveDown(0.5);
    }
    if (jobMatch.skillsAnalysis.additional?.length > 0) {
      doc.fontSize(11).fillColor('#3b82f6').text('Your Extra Skills:');
      doc.fontSize(10).fillColor('#334155').text(jobMatch.skillsAnalysis.additional.join(', '));
      doc.moveDown(0.5);
    }
  }

  // Suggestions
  if (jobMatch.suggestions && jobMatch.suggestions.length > 0) {
    checkPageBreak(doc);
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#f59e0b').text('💡 Suggestions', { underline: true }).moveDown(0.5);
    jobMatch.suggestions.forEach((s, i) => {
      doc.fontSize(10).fillColor('#334155').text(`  ${i + 1}. ${s}`);
      doc.moveDown(0.3);
    });
  }

  // Footer
  doc.moveDown(2);
  drawDivider(doc, pageWidth);
  doc.moveDown(0.5);
  doc.fontSize(8).fillColor('#94a3b8')
    .text('Generated by ResumeAI Pro', { align: 'center' })
    .text(`Report ID: ${jobMatch._id || 'N/A'} · ${new Date().toLocaleDateString()}`, { align: 'center' });

  return doc;
};

// --- Helper Functions ---

function drawDivider(doc, width) {
  const y = doc.y;
  doc.save()
    .moveTo(50, y)
    .lineTo(50 + width, y)
    .lineWidth(1)
    .strokeColor('#e2e8f0')
    .stroke()
    .restore();
  doc.y = y + 2;
}

function checkPageBreak(doc) {
  if (doc.y > doc.page.height - 120) {
    doc.addPage();
  }
}

module.exports = { generateAnalysisReport, generateJobMatchReport };
