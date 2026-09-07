import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { NewComplaintPage } from './pages/NewComplaintPage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { PublicFeedPage } from './pages/PublicFeedPage';
import { ComplaintDetailsPage } from './pages/ComplaintDetailsPage';
import { OfficerDashboard } from './pages/OfficerDashboard';
import { OfficerReviewPage } from './pages/OfficerReviewPage';
import { ShieldAlert } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');

  // Sync state on popstate (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center animate-bounce shadow-lg">
          <ShieldAlert size={28} className="text-slate-950" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Loading Citizen Complaint Portal...</p>
      </div>
    );
  }

  // Routing resolution
  const renderRoute = () => {
    // 1. Landing Page
    if (currentPath === '/' || currentPath === '') {
      return <LandingPage navigate={navigate} />;
    }

    // 2. Auth routes
    if (currentPath === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (currentPath === '/signup') {
      return <SignupPage navigate={navigate} />;
    }

    // 3. Public Complaints Feed
    if (currentPath === '/complaints') {
      return <PublicFeedPage navigate={navigate} />;
    }

    // 4. Citizen Dashboard
    if (currentPath === '/dashboard') {
      if (!user) {
        return <LoginPage navigate={navigate} />;
      }
      if (user.role === 'officer') {
        return <OfficerDashboard navigate={navigate} />;
      }
      return <CitizenDashboard navigate={navigate} />;
    }

    // 5. New Complaint
    if (currentPath === '/complaints/new') {
      if (!user) {
        return <LoginPage navigate={navigate} />;
      }
      return <NewComplaintPage navigate={navigate} />;
    }

    // 6. My Complaints
    if (currentPath === '/complaints/mine') {
      if (!user) {
        return <LoginPage navigate={navigate} />;
      }
      return <MyComplaintsPage navigate={navigate} />;
    }

    // 7. Officer Dashboard
    if (currentPath === '/officer/dashboard' || currentPath === '/officer') {
      if (!user) {
        return <LoginPage navigate={navigate} />;
      }
      if (user.role !== 'officer') {
        return (
          <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-600">
              Officer privileges are required to view the operational dashboard. You are signed in as a Citizen.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
            >
              Return to Citizen Dashboard
            </button>
          </div>
        );
      }
      return <OfficerDashboard navigate={navigate} />;
    }

    // 8. Officer Review Single Complaint (/officer/complaints/:id)
    if (currentPath.startsWith('/officer/complaints/')) {
      const complaintId = currentPath.replace('/officer/complaints/', '').trim();
      if (!user) {
        return <LoginPage navigate={navigate} />;
      }
      if (user.role !== 'officer') {
        return (
          <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow">
            <ShieldAlert size={32} className="mx-auto text-rose-600" />
            <h2 className="text-lg font-bold text-slate-900">Officer Authorization Required</h2>
            <button
              onClick={() => navigate('/complaints')}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
            >
              Back to Public Feed
            </button>
          </div>
        );
      }
      return <OfficerReviewPage id={complaintId} navigate={navigate} />;
    }

    // 9. Single Complaint Details (/complaints/:id)
    if (currentPath.startsWith('/complaints/')) {
      const complaintId = currentPath.replace('/complaints/', '').trim();
      return <ComplaintDetailsPage id={complaintId} navigate={navigate} />;
    }

    // Default Fallback: Landing Page
    return <LandingPage navigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-light text-brand-dark font-sans antialiased selection:bg-brand-cyan selection:text-brand-dark">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full"
          >
            {renderRoute()}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
