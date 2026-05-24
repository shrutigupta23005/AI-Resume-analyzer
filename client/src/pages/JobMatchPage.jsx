import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { HiOutlineBriefcase, HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineLightBulb, HiOutlineDownload } from 'react-icons/hi';

export default function JobMatchPage() {
  const { id: resumeId } = useParams();
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const handleMatch = async () => {
    if (jobDescription.trim().length < 50) { toast.error('Job description must be at least 50 characters'); return; }
    setLoading(true);
    try {
      const res = await api.post(`/analysis/${resumeId}/match`, { jobDescription });
      setResult(res.data.data.jobMatch);
      toast.success('Match analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Matching failed');
    } finally { setLoading(false); }
  };

  const handleDownloadReport = async () => {
    if (!result?._id) return;
    setDownloading(true);
    try {
      const res = await api.get(`/analysis/match/${result._id}/report`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `JobMatch-Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download report');
    } finally { setDownloading(false); }
  };

  const pctColor = (pct) => pct >= 70 ? 'text-emerald-500' : pct >= 40 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800"><HiOutlineArrowLeft className="w-5 h-5 dark:text-white" /></Link>
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Job Description Match</h1>
          <p className="text-surface-500 text-sm">Compare your resume against a job posting</p>
        </div>
      </div>

      {!result ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
          <h2 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
            <HiOutlineBriefcase className="w-5 h-5 text-primary-500" /> Paste Job Description
          </h2>
          <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={10}
            className="input-field !rounded-xl resize-none mb-4" placeholder="Paste the full job description here..." id="job-description-input" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-surface-500">{jobDescription.length} characters (min 50)</span>
            <button onClick={handleMatch} disabled={loading || jobDescription.length < 50}
              className="btn-primary flex items-center gap-2 disabled:opacity-50" id="match-btn">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</> : 'Analyze Match'}
            </button>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Match Percentage */}
            <div className="glass-card text-center !py-8">
              <p className="text-sm text-surface-500 mb-2">Match Percentage</p>
              <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                className={`text-6xl font-bold ${pctColor(result.matchPercentage)}`}>
                {result.matchPercentage}%
              </motion.p>
              <p className="text-sm text-surface-500 mt-2">{result.jobTitle || 'Job Position'}</p>
              {result.experienceMatch && <p className="text-xs text-surface-400 mt-1">{result.experienceMatch}</p>}
              {/* Download Report Button */}
              <button onClick={handleDownloadReport} disabled={downloading}
                className="btn-primary text-sm !px-5 !py-2.5 mt-6 inline-flex items-center gap-2 disabled:opacity-50" id="download-match-report-btn">
                {downloading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                ) : (
                  <><HiOutlineDownload className="w-4 h-4" /> Download Report</>
                )}
              </button>
            </div>

            {/* Keywords */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-card !p-5">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
                  <HiOutlineCheckCircle className="w-5 h-5" /> Matched Keywords ({result.matchedKeywords?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.matchedKeywords?.map((kw, i) => (
                    <span key={i} className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{kw}</span>
                  ))}
                  {(!result.matchedKeywords || result.matchedKeywords.length === 0) && <p className="text-sm text-surface-500">None found</p>}
                </div>
              </div>
              <div className="glass-card !p-5">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-red-500">
                  <HiOutlineXCircle className="w-5 h-5" /> Missing Keywords ({result.missingKeywords?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords?.map((kw, i) => (
                    <span key={i} className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{kw}</span>
                  ))}
                  {(!result.missingKeywords || result.missingKeywords.length === 0) && <p className="text-sm text-surface-500">None — great match!</p>}
                </div>
              </div>
            </div>

            {/* Skills Analysis */}
            {result.skillsAnalysis && (
              <div className="glass-card">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Skills Analysis</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">Matched Skills</p>
                    {result.skillsAnalysis.matched?.map((s, i) => (
                      <span key={i} className="inline-block mr-2 mb-2 px-2 py-0.5 text-xs rounded bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">{s}</span>
                    ))}
                    {(!result.skillsAnalysis.matched || result.skillsAnalysis.matched.length === 0) && <p className="text-xs text-surface-500">None</p>}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-500 mb-2">Missing Skills</p>
                    {result.skillsAnalysis.missing?.map((s, i) => (
                      <span key={i} className="inline-block mr-2 mb-2 px-2 py-0.5 text-xs rounded bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">{s}</span>
                    ))}
                    {(!result.skillsAnalysis.missing || result.skillsAnalysis.missing.length === 0) && <p className="text-xs text-surface-500">None</p>}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-500 mb-2">Your Extra Skills</p>
                    {result.skillsAnalysis.additional?.map((s, i) => (
                      <span key={i} className="inline-block mr-2 mb-2 px-2 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">{s}</span>
                    ))}
                    {(!result.skillsAnalysis.additional || result.skillsAnalysis.additional.length === 0) && <p className="text-xs text-surface-500">None</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div className="glass-card">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 dark:text-white">
                  <HiOutlineLightBulb className="w-5 h-5 text-amber-500" /> Suggestions
                </h3>
                <ul className="space-y-2">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-surface-600 dark:text-surface-300 flex items-start gap-2">
                      <span className="text-amber-500">→</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button onClick={() => setResult(null)} className="btn-secondary w-full">Try Another Job Description</button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
