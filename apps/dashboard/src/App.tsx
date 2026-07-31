import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Providers } from './pages/Providers';
import { Jobs } from './pages/Jobs';
import { Billing } from './pages/Billing';
import { Settings } from './pages/Settings';
import { Keys }        from './pages/Keys';
import { Landing }     from './pages/Landing';
import { Playground }  from './pages/Playground';
import { Docs }        from './pages/Docs';
import { Privacy }     from './pages/Privacy';
import { Terms }       from './pages/Terms';
import { ToolDetailPage } from './pages/ToolDetailPage';
import { getStoredApiKey } from './lib/api';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

const ConditionalNavbar: React.FC = () => {
  return <Navbar />;
};

const ConditionalFooter: React.FC = () => {
  return <Footer />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
        <ConditionalNavbar />
        <main className="flex-1">
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Login />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/docs/*" element={<Docs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/tools/*" element={<ToolDetailPage />} />
            <Route path="/tool/*" element={<ToolDetailPage />} />

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
