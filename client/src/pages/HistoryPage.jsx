import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { HiOutlineClock, HiOutlineChartBar, HiOutlineTrash, HiOutlineDocumentText, HiOutlineBriefcase, HiOutlineDownload } from 'react-icons/hi';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [matches, setMatches] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [activeTab, setActiveTab] = useState('resumes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, mRes, rRes] = await Promise.all([
          api.get('/analysis'),
          api.get('/analysis/matches'),
          api.get('/resumes'),
        ]);
        setAnalyses(aRes.data.data.analyses || []);
        setMatches(mRes.data.data.matches || []);
        setResumes(rRes.data.data.resumes || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const scoreColor = (s) => s >= 70 ? 'text-emerald-500' : s >= 40 ? 'text-amber-500' : 'text-red-500';
  const scoreBg = (s) => s >= 70 ? 'bg-emerald-100 dark:bg-emerald-900/30' : s >= 40 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30';

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Delete this resume and all associated analyses?')) return;
    try {
      await api.delete(`/resumes/${resumeId}`);
      setResumes(prev => prev.filter(r => r._id !== resumeId));
      toast.success('Resume deleted');
    } catch (err) {
      toast.error('Failed to delete resume');
    }
  };

  const handleDownloadReport = async (analysisId, name) => {
    try {
      const res = await api.get(`/analysis/${analysisId}/report`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ATS-Report-${name || 'Resume'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded!');
    } catch (err) {
      toast.error('Failed to download report');
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-surface-200 dark:bg-surface-800 rounded-lg" />
      {[1,2,3].map(i => <div key={i} className="h-20 bg-surface-200 dark:bg-surface-800 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><HiOutlineClock className="w-6 h-6 text-primary-500" /> History</h1>
        <p className="text-surface-500 text-sm mt-1">View all your resumes, analyses, and job matches</p>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setActiveTab('resumes')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'resumes' ? 'bg-primary-500 text-white' : 'glass text-surface-600 dark:text-surface-400'}`}>
          <HiOutlineDocumentText className="inline w-4 h-4 mr-1" /> Resumes ({resumes.length})
        </button>
        <button onClick={() => setActiveTab('analyses')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'analyses' ? 'bg-primary-500 text-white' : 'glass text-surface-600 dark:text-surface-400'}`}>
          <HiOutlineChartBar className="inline w-4 h-4 mr-1" /> ATS Analyses ({analyses.length})
        </button>
        <button onClick={() => setActiveTab('matches')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'matches' ? 'bg-primary-500 text-white' : 'glass text-surface-600 dark:text-surface-400'}`}>
          <HiOutlineBriefcase className="inline w-4 h-4 mr-1" /> Job Matches ({matches.length})
        </button>
      </div>

      {/* Resumes List */}
      {activeTab === 'resumes' && (
        <div className="space-y-3">
          {resumes.length === 0 ? (
            <div className="glass-card text-center !py-12">
              <HiOutlineDocumentText className="w-12 h-12 mx-auto text-surface-300 dark:text-surface-600 mb-3" />
              <p className="text-surface-500">No resumes uploaded yet</p>
              <Link to="/dashboard/upload" className="btn-primary text-sm mt-4 inline-block">Upload Resume</Link>
            </div>
          ) : resumes.map((r, i) => (
            <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="glass-card !p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <HiOutlineDocumentText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-white">{r.originalName}</p>
                    <p className="text-xs text-surface-500">{new Date(r.createdAt).toLocaleDateString()} · {(r.fileSize / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    r.status === 'analyzed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    r.status === 'parsed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300'
                  }`}>{r.status}</span>
                  <button onClick={() => handleDeleteResume(r._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-500 transition-colors" title="Delete resume">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Analyses List */}
      {activeTab === 'analyses' && (
        <div className="space-y-3">
          {analyses.length === 0 ? (
            <div className="glass-card text-center !py-12">
              <HiOutlineChartBar className="w-12 h-12 mx-auto text-surface-300 dark:text-surface-600 mb-3" />
              <p className="text-surface-500">No analyses yet</p>
              <Link to="/dashboard/upload" className="btn-primary text-sm mt-4 inline-block">Upload Resume</Link>
            </div>
          ) : analyses.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="glass-card !p-4 flex items-center justify-between">
                <Link to={`/dashboard/analysis/${a._id}`} className="flex items-center gap-4 flex-1 group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${scoreBg(a.overallScore)}`}>
                    <span className={`text-lg font-bold ${scoreColor(a.overallScore)}`}>{a.overallScore}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {a.resumeId?.originalName || 'Resume'}
                    </p>
                    <p className="text-xs text-surface-500">{new Date(a.createdAt).toLocaleDateString()} · {a.resumeWordCount} words</p>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDownloadReport(a._id, a.resumeId?.originalName)}
                    className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-500 transition-colors" title="Download PDF Report">
                    <HiOutlineDownload className="w-4 h-4" />
                  </button>
                  <Link to={`/dashboard/analysis/${a._id}`} className="text-xs text-surface-400 hover:text-primary-500 transition-colors px-2">View →</Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Job Matches List */}
      {activeTab === 'matches' && (
        <div className="space-y-3">
          {matches.length === 0 ? (
            <div className="glass-card text-center !py-12">
              <HiOutlineBriefcase className="w-12 h-12 mx-auto text-surface-300 dark:text-surface-600 mb-3" />
              <p className="text-surface-500">No job matches yet</p>
            </div>
          ) : matches.map((m, i) => (
            <motion.div key={m._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/dashboard/job-match/${m.resumeId?._id || m.resumeId}`}
                className="glass-card !p-4 flex items-center justify-between group cursor-pointer block">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${scoreBg(m.matchPercentage)}`}>
                    <span className={`text-lg font-bold ${scoreColor(m.matchPercentage)}`}>{m.matchPercentage}%</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-white">{m.jobTitle || 'Job Match'}</p>
                    <p className="text-xs text-surface-500">{m.resumeId?.originalName || 'Resume'} · {new Date(m.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-surface-400">{m.matchedKeywords?.length || 0} matched</p>
                  <p className="text-xs text-red-400">{m.missingKeywords?.length || 0} missing</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
