import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { HiOutlineSparkles, HiOutlineArrowLeft, HiOutlineClipboardCopy, HiOutlineRefresh, HiOutlineDocumentText, HiOutlinePencilAlt, HiOutlineAcademicCap } from 'react-icons/hi';

const tabs = [
  { id: 'overview', label: 'Overview', icon: HiOutlineDocumentText },
  { id: 'bullets', label: 'Bullets', icon: HiOutlinePencilAlt },
  { id: 'skills', label: 'Skills', icon: HiOutlineAcademicCap },
];

export default function AIImprovementsPage() {
  const { id: resumeId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const fetchImprovements = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/ai/${resumeId}/improve`);
      setData(res.data.data.improvements);
      toast.success('AI suggestions generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI service unavailable. Check your API key.');
    } finally { setLoading(false); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800">
          <HiOutlineArrowLeft className="w-5 h-5 dark:text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold dark:text-white">AI-Powered Improvements</h1>
          <p className="text-surface-500 text-sm">Get intelligent suggestions to enhance your resume</p>
        </div>
      </div>

      {!data ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card text-center !py-16">
          <HiOutlineSparkles className="w-16 h-16 mx-auto text-accent-500 mb-4" />
          <h2 className="text-xl font-bold dark:text-white mb-2">Generate AI Suggestions</h2>
          <p className="text-surface-500 text-sm max-w-md mx-auto mb-8">
            Our AI will analyze your resume and provide personalized improvements including better bullet points, summary rewrites, and skill suggestions.
          </p>
          <button onClick={fetchImprovements} disabled={loading} className="btn-primary text-lg !px-10 !py-4 flex items-center gap-3 mx-auto disabled:opacity-50" id="generate-ai-btn">
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
            ) : (
              <><HiOutlineSparkles className="w-5 h-5" /> Generate Suggestions</>
            )}
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Tab navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-primary-500 text-white' : 'glass text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
            <button onClick={fetchImprovements} disabled={loading} className="ml-auto flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20">
              <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Regenerate
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Summary Rewrite */}
              {data.summaryRewrite && (
                <div className="glass-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold dark:text-white">Improved Summary</h3>
                    <button onClick={() => copyToClipboard(data.summaryRewrite)} className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
                      <HiOutlineClipboardCopy className="w-4 h-4" /> Copy
                    </button>
                  </div>
                  <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed bg-primary-50 dark:bg-primary-900/10 p-4 rounded-xl">{data.summaryRewrite}</p>
                </div>
              )}
              {/* Overall Tips */}
              {data.overallTips?.length > 0 && (
                <div className="glass-card">
                  <h3 className="font-semibold mb-3 dark:text-white">Top Tips</h3>
                  {data.overallTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 mb-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 text-sm text-surface-700 dark:text-surface-300">
                      <span className="text-amber-500 font-bold text-lg">💡</span>{tip}
                    </div>
                  ))}
                </div>
              )}
              {/* Grammar Fixes */}
              {data.grammarFixes?.length > 0 && (
                <div className="glass-card">
                  <h3 className="font-semibold mb-3 dark:text-white">Grammar Fixes</h3>
                  {data.grammarFixes.map((fix, i) => (
                    <div key={i} className="p-3 mb-2 rounded-lg bg-surface-50 dark:bg-surface-800/50 text-sm">
                      <p className="text-red-500 line-through">{fix.issue}</p>
                      <p className="text-emerald-600 dark:text-emerald-400 mt-1">✓ {fix.fix}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bullets Tab */}
          {activeTab === 'bullets' && (
            <div className="space-y-3">
              {data.bulletImprovements?.map((bullet, i) => (
                <div key={i} className="glass-card">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-surface-500 mb-1">Original</p>
                      <p className="text-sm text-surface-600 dark:text-surface-300">{bullet.original}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Improved</p>
                        <button onClick={() => copyToClipboard(bullet.improved)} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">Copy</button>
                      </div>
                      <p className="text-sm text-surface-700 dark:text-surface-200 bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg">{bullet.improved}</p>
                    </div>
                  </div>
                </div>
              )) || <p className="text-surface-500 text-center py-8">No bullet improvements available</p>}
              {/* Action Verb Suggestions */}
              {data.actionVerbSuggestions?.length > 0 && (
                <div className="glass-card">
                  <h3 className="font-semibold mb-3 dark:text-white">Suggested Action Verbs</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.actionVerbSuggestions.map((v, i) => (
                      <span key={i} className="px-3 py-1.5 text-sm rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                        onClick={() => copyToClipboard(v)}>{v}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="glass-card">
              <h3 className="font-semibold mb-4 dark:text-white">Recommended Skills to Add</h3>
              {data.missingSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.missingSkills.map((skill, i) => (
                    <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                      className="px-4 py-2 text-sm rounded-xl bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 cursor-pointer hover:bg-accent-200 dark:hover:bg-accent-900/50 transition-colors"
                      onClick={() => copyToClipboard(skill)}>
                      + {skill}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <p className="text-surface-500">No additional skills suggested</p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
