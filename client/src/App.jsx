import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import AnalysisPage from './pages/AnalysisPage';
import JobMatchPage from './pages/JobMatchPage';
import AIImprovementsPage from './pages/AIImprovementsPage';
import HistoryPage from './pages/HistoryPage';
import DashboardLayout from './components/layout/DashboardLayout';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="analysis/:id" element={<AnalysisPage />} />
        <Route path="job-match/:id" element={<JobMatchPage />} />
        <Route path="ai/:id" element={<AIImprovementsPage />} />
        <Route path="history" element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
