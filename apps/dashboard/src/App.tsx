import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Providers } from './pages/Providers';
import { Jobs } from './pages/Jobs';
import { Billing } from './pages/Billing';
import { Settings } from './pages/Settings';
import { Keys }        from './pages/Keys';
import { Landing }     from './pages/Landing';
import { Playground }  from './pages/Playground';
import { getStoredApiKey } from './lib/api';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

// Hide the global Navbar on the landing page (it has its own)
const ConditionalNavbar: React.FC = () => {
  const location = useLocation();
  if (location.pathname === '/') return null;
  return <Navbar />;
};

const ConditionalFooter: React.FC = () => {
  const location = useLocation();
  if (location.pathname === '/') return null;
  return (
    <footer className="border-t border-slate-800/60 py-6 text-center text-xs font-mono text-slate-600">
      LiteDaemon · OpenRouter for AI Agents &amp; Tools · Pure BYOK Tool Gateway
    </footer>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
        <ConditionalNavbar />
        <main className="flex-1">
          <Routes>
            {/* Public landing page — has its own navbar */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Login />} />
            <Route path="/providers" element={<Providers />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/keys"
              element={
                <ProtectedRoute>
                  <Keys />
                </ProtectedRoute>
              }
            />
            <Route
              path="/playground"
              element={
                <ProtectedRoute>
                  <Playground />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <ConditionalFooter />
      </div>
    </BrowserRouter>
  );
};

export default App;
