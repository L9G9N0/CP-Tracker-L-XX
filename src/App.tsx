import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react'; // CLERK ADDED
import { GlobalProvider, useGlobal } from './contexts/GlobalContext';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CurriculumPage from './pages/CurriculumPage';
import PracticePage from './pages/PracticePage';
import ContestsPage from './pages/ContestsPage';
import CommunityPage from './pages/CommunityPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { isLoaded, isSignedIn } = useAuth(); // CLERK SE CHECK KAREGA
  const { user } = useGlobal();

  if (!isLoaded) {
    return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white/50">Loading Secure App...</div>;
  }

  if (!isSignedIn) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function RootRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="min-h-screen bg-[#0a0a0c]"></div>;
  return <Navigate to={isSignedIn ? '/dashboard' : '/login'} replace />;
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans flex">
      <Sidebar />
      <div className="ml-56 flex-1 flex min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <GlobalProvider>
          <Routes>
            <Route path="/login/*" element={<LoginPage />} />
            <Route path="/signup/*" element={<SignupPage />} />

            <Route element={<AppLayout />}>
              <Route path="/" element={<RootRedirect />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/curriculum" element={<CurriculumPage />} />
                <Route path="/practice" element={<PracticePage />} />
                <Route path="/contests" element={<ContestsPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </GlobalProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}