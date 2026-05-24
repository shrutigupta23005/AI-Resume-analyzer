import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { HiOutlineChartBar, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineLightBulb, HiOutlineArrowLeft, HiOutlineDownload } from 'react-icons/hi';

// Animated circular gauge component
function ScoreGauge({ score, size = 180 }) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  const label = score >= 70 ? 'Great' : score >= 40 ? 'Average' : 'Needs Work';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth="10" fill="none" className="text-surface-200 dark:text-surface-800" />
        <motion.circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 1.5, ease: 'easeOut' }} />
      </svg>
      <div className="absolute text-center">
        <motion.span className="text-4xl font-bold dark:text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          {score}
        </motion.span>
        <p className="text-xs font-medium" style={{ color }}>{label}</p>
      </div>
    </div>
  );
}

// Animated progress bar
function ProgressBar({ label, score, weight, feedback, details, delay = 0 }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
      className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
      onClick={() => setExpanded(!expanded)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium dark:text-white">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500">Weight: {weight}%</span>
          <span className="text-sm font-bold dark:text-white">{score}</span>
        </div>
      </div>
      <div className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }}
          animate={{ width: `${score}%` }} transition={{ duration: 1, delay: delay + 0.3 }} />
      </div>
      {feedback && <p className="text-xs text-surface-500 mt-2">{feedback}</p>}
      {/* Expandable details */}
      {expanded && details && details.length > 0 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 pt-3 border-t border-surface-200 dark:border-surface-700">
          {details.map((d, i) => (
            <p key={i} className={`text-xs mb-1 ${d.startsWith('→') ? 'text-amber-600 dark:text-amber-400' : 'text-surface-500'}`}>
              {d}
            </p>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function AnalysisPage() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/analysis/${id}`);
        setAnalysis(res.data.data.analysis);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  // Download PDF report
  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/analysis/${id}/report`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ATS-Report-${analysis.resumeId?.originalName || 'Resume'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    } finally { setDownloading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!analysis) return <div className="text-center py-20"><p className="text-surface-500">Analysis not found</p></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
            <HiOutlineArrowLeft className="w-5 h-5 dark:text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">ATS Analysis Report</h1>
            <p className="text-surface-500 text-sm">{analysis.resumeId?.originalName || 'Resume'} · {new Date(analysis.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <button onClick={handleDownloadReport} disabled={downloading}
          className="btn-primary text-sm !px-5 !py-2.5 flex items-center gap-2 disabled:opacity-50" id="download-report-btn">
          {downloading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
          ) : (
            <><HiOutlineDownload className="w-4 h-4" /> Download PDF Report</>
          )}
        </button>
      </div>

      {/* Score + Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card flex flex-col items-center justify-center !py-8">
          <ScoreGauge score={analysis.overallScore} />
          <p className="text-sm text-surface-500 mt-3">ATS Compatibility Score</p>
          <p className="text-xs text-surface-400 mt-1">{analysis.resumeWordCount} words · {analysis.estimatedPages} page(s)</p>
        </div>
        <div className="md:col-span-2 space-y-4">
          {/* Strengths */}
          {analysis.strengths?.length > 0 && (
            <div className="glass-card !p-5">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                <HiOutlineCheckCircle className="w-5 h-5" /> Strengths
              </h3>
              <ul className="space-y-2">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-surface-600 dark:text-surface-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Weaknesses */}
          {analysis.weaknesses?.length > 0 && (
            <div className="glass-card !p-5">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-red-500">
                <HiOutlineExclamationCircle className="w-5 h-5" /> Areas to Improve
              </h3>
              <ul className="space-y-2">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-surface-600 dark:text-surface-300 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">!</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="glass-card">
        <h2 className="text-lg font-semibold mb-2 dark:text-white flex items-center gap-2">
          <HiOutlineChartBar className="w-5 h-5 text-primary-500" /> Category Breakdown
        </h2>
        <p className="text-xs text-surface-500 mb-4">Click any category to see detailed findings</p>
        <div className="space-y-3">
          {analysis.categoryScores?.map((cat, i) => (
            <ProgressBar key={i} label={cat.name} score={cat.score} weight={cat.weight} feedback={cat.feedback} details={cat.details} delay={i * 0.08} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations?.length > 0 && (
        <div className="glass-card">
          <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
            <HiOutlineLightBulb className="w-5 h-5 text-amber-500" /> Recommendations
          </h2>
          <div className="space-y-2">
            {analysis.recommendations.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 text-sm text-surface-700 dark:text-surface-300">
                <span className="text-amber-500 font-bold">→</span>
                <span>{r.replace(/^→\s*/, '')}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
