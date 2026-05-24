import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { HiOutlineHome, HiOutlineUpload, HiOutlineClock, HiOutlineLogout, HiOutlineMenu, HiOutlineX, HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';

const navItems = [
  { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard', end: true },
  { to: '/dashboard/upload', icon: HiOutlineUpload, label: 'Upload Resume' },
  { to: '/dashboard/history', icon: HiOutlineClock, label: 'History' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col glass border-r border-surface-200 dark:border-surface-800">
          {/* Logo */}
          <div className="p-6 border-b border-surface-200 dark:border-surface-800">
            <h1 className="text-xl font-bold gradient-text">ResumeAI Pro</h1>
            <p className="text-xs text-surface-500 mt-1">AI-Powered Analyzer</p>
          </div>
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map(item => (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'}`}>
                <item.icon className="w-5 h-5" />{item.label}
              </NavLink>
            ))}
          </nav>
          {/* User section */}
          <div className="p-4 border-t border-surface-200 dark:border-surface-800">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">{user?.name?.[0] || 'U'}</div>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate dark:text-white">{user?.name}</p><p className="text-xs text-surface-500 truncate">{user?.email}</p></div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <HiOutlineLogout className="w-4 h-4" />Logout
            </button>
          </div>
        </div>
      </aside>
      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 px-4 lg:px-8 py-4 glass border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
            <HiOutlineMenu className="w-5 h-5 dark:text-white" />
          </button>
          <div className="flex-1" />
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" id="theme-toggle">
            {darkMode ? <HiOutlineSun className="w-5 h-5 text-yellow-400" /> : <HiOutlineMoon className="w-5 h-5 text-surface-600" />}
          </button>
        </header>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
