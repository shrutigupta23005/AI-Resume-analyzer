import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { HiOutlineSparkles, HiOutlineChartBar, HiOutlineLightningBolt, HiOutlineShieldCheck, HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';

const features = [
  { icon: HiOutlineChartBar, title: 'ATS Score Analysis', desc: 'Get a detailed ATS compatibility score across 10 categories with actionable recommendations.' },
  { icon: HiOutlineLightningBolt, title: 'Job Description Matching', desc: 'Compare your resume against any job posting and find missing keywords instantly.' },
  { icon: HiOutlineSparkles, title: 'AI-Powered Improvements', desc: 'Get AI-generated bullet points, summaries, and skill suggestions powered by Google Gemini.' },
  { icon: HiOutlineShieldCheck, title: 'Professional Reports', desc: 'Download detailed PDF reports with scores, breakdowns, and improvement suggestions.' },
];

const stats = [
  { value: '10+', label: 'Scoring Categories' },
  { value: '95%', label: 'ATS Accuracy' },
  { value: 'AI', label: 'Powered Analysis' },
  { value: '∞', label: 'Improvements' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 overflow-hidden">
      {/* Floating background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl animate-float animation-delay-200" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl animate-float animation-delay-400" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5">
        <h1 className="text-2xl font-bold gradient-text">ResumeAI Pro</h1>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
            {darkMode ? <HiOutlineSun className="w-5 h-5 text-yellow-400" /> : <HiOutlineMoon className="w-5 h-5 text-surface-600" />}
          </button>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary text-sm">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-primary-600 transition-colors">Log In</Link>
              <Link to="/signup" className="btn-primary text-sm">Get Started Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 mb-6">
            ✨ AI-Powered Resume Analysis
          </span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            Land Your Dream Job with{' '}
            <span className="gradient-text">AI-Optimized</span>{' '}
            Resumes
          </h2>
          <p className="text-lg md:text-xl text-surface-600 dark:text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your resume, get an instant ATS score, match it against job descriptions, and receive AI-powered improvements — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn-primary text-lg px-10 py-4">Analyze Your Resume</Link>
            <Link to="/login" className="btn-secondary text-lg px-10 py-4">Log In</Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card text-center !p-5">
              <p className="text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-sm text-surface-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-4 dark:text-white">Everything You Need</h3>
        <p className="text-surface-500 text-center mb-14 max-w-xl mx-auto">Comprehensive resume analysis tools powered by cutting-edge AI technology.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card flex gap-5">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2 dark:text-white">{f.title}</h4>
                <p className="text-surface-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="rounded-3xl p-10 md:p-16 text-center gradient-bg relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Optimize Your Resume?</h3>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">Join thousands of job seekers who have improved their resumes with AI-powered analysis.</p>
            <Link to="/signup" className="inline-block px-10 py-4 bg-white text-primary-600 font-bold rounded-xl hover:bg-surface-50 transition-colors text-lg">
              Start Free Analysis →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-surface-200 dark:border-surface-800 py-8 text-center">
        <p className="text-sm text-surface-500">© 2025 ResumeAI Pro. Built with React, Node.js, and AI.</p>
      </footer>
    </div>
  );
}
