import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success('Account created! Welcome aboard.');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message 
        || (err.code === 'ERR_NETWORK' ? 'Server is unavailable. Please try again later.' : 'Signup failed');
      toast.error(message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 px-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-40 w-80 h-80 bg-primary-500/15 rounded-full blur-3xl" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md glass-card !p-8">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold gradient-text">ResumeAI Pro</Link>
          <h2 className="text-2xl font-bold mt-4 dark:text-white">Create Account</h2>
          <p className="text-surface-500 text-sm mt-1">Start analyzing your resumes for free</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-surface-300">Full Name</label>
            <div className="relative">
              <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-field !pl-10" placeholder="John Doe" id="signup-name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-surface-300">Email</label>
            <div className="relative">
              <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field !pl-10" placeholder="you@example.com" id="signup-email" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-surface-300">Password</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="input-field !pl-10 !pr-10" placeholder="Min. 6 characters" id="signup-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 disabled:opacity-50 flex items-center justify-center gap-2" id="signup-submit">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-surface-500 mt-6">
          Already have an account? <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
