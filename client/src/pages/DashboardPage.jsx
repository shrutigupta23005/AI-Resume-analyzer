import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineDocumentText, HiOutlineChartBar, HiOutlineBriefcase, HiOutlineTrendingUp, HiOutlineUpload } from 'react-icons/hi';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, resumesRes] = await Promise.all([
          api.get('/analysis/dashboard/stats'),
          api.get('/resumes'),
        ]);
        setStats(statsRes.data.data.stats);
        setResumes(resumesRes.data.data.resumes);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSkeleton />;

  const statCards = [
    { icon: HiOutlineDocumentText, label: 'Total Resumes', value: stats?.totalResumes || 0, color: 'from-blue-500 to-cyan-500' },
    { icon: HiOutlineChartBar, label: 'Analyses Done', value: stats?.totalAnalyses || 0, color: 'from-primary-500 to-accent-500' },
    { icon: HiOutlineTrendingUp, label: 'Average Score', value: stats?.averageScore || 0, color: 'from-emerald-500 to-teal-500' },
    { icon: HiOutlineBriefcase, label: 'Job Matches', value: stats?.totalMatches || 0, color: 'from-orange-500 to-rose-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Dashboard</h1>
        <p className="text-surface-500 mt-1">Overview of your resume analysis activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card !p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold dark:text-white">{card.value}</p>
                <p className="text-xs text-surface-500">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Resumes */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold dark:text-white">Recent Resumes</h2>
          <Link to="/dashboard/upload" className="btn-primary text-sm !px-4 !py-2 flex items-center gap-2">
            <HiOutlineUpload className="w-4 h-4" /> Upload New
          </Link>
        </div>
        {resumes.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineDocumentText className="w-16 h-16 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
            <p className="text-surface-500 mb-4">No resumes uploaded yet</p>
            <Link to="/dashboard/upload" className="btn-primary text-sm">Upload Your First Resume</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.slice(0, 5).map((r) => (
              <div key={r._id} className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <HiOutlineDocumentText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium dark:text-white">{r.originalName}</p>
                    <p className="text-xs text-surface-500">{new Date(r.createdAt).toLocaleDateString()} · {(r.fileSize / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${r.status === 'analyzed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : r.status === 'parsed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300'}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Score Trend */}
      {stats?.recentScores?.length > 0 && (
        <div className="glass-card">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Score Trend</h2>
          <div className="flex items-end gap-2 h-40">
            {stats.recentScores.map((s, i) => (
              <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${s.score}%` }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`flex-1 rounded-t-lg ${s.score >= 70 ? 'bg-emerald-500' : s.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                title={`Score: ${s.score}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div><div className="h-8 w-48 bg-surface-200 dark:bg-surface-800 rounded-lg" /><div className="h-4 w-72 bg-surface-200 dark:bg-surface-800 rounded mt-2" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-surface-200 dark:bg-surface-800 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-surface-200 dark:bg-surface-800 rounded-2xl" />
    </div>
  );
}
