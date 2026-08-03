import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';
import { Login }         from './pages/Login';
import { Dashboard }     from './pages/Dashboard';
import { Providers }     from './pages/Providers';
import { Jobs }          from './pages/Jobs';
import { Billing }       from './pages/Billing';
import { Settings }      from './pages/Settings';
import { Keys }          from './pages/Keys';
import { Landing }       from './pages/Landing';
import { Playground }    from './pages/Playground';
import { Docs }          from './pages/Docs';
import { Privacy }       from './pages/Privacy';
import { Terms }         from './pages/Terms';
import { AuthCallback }  from './pages/AuthCallback';
import { ToolDetailPage } from './pages/ToolDetailPage';
import { ComparePage }   from './pages/ComparePage';
import { Rankings }      from './pages/Rankings';
import { Pricing }       from './pages/Pricing';
import { ContactSales }  from './pages/ContactSales';
import { getStoredApiKey } from './lib/api';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiKey = getStoredApiKey();
  if (!apiKey) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div
          className="min-h-screen flex flex-col transition-colors duration-200"
          style={{ backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}
        >
          <Navbar />
          <main className="flex-1 page-enter">
            <Routes>
              {/* ── Public ─────────────────────────────────────── */}
              <Route path="/"          element={<Landing />} />
              <Route path="/auth"      element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/signup"    element={<Login initialMode="signup" />} />
              <Route path="/login"     element={<Login initialMode="login" />} />
              <Route path="/providers" element={<Providers />} />
              <Route path="/tools/*"   element={<ToolDetailPage />} />
              <Route path="/tool/*"    element={<ToolDetailPage />} />
              <Route path="/compare/*" element={<ComparePage />} />
              <Route path="/rankings"  element={<Rankings />} />
              <Route path="/pricing"   element={<Pricing />} />
              <Route path="/contact-sales" element={<ContactSales />} />
              <Route path="/contact"   element={<ContactSales />} />
              <Route path="/docs"      element={<Docs />} />
              <Route path="/docs/*"    element={<Docs />} />
              <Route path="/privacy"   element={<Privacy />} />
              <Route path="/terms"     element={<Terms />} />

              {/* ── Protected ───────────────────────────────────── */}
              <Route path="/overview"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/jobs"       element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
              <Route path="/logs"       element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
              <Route path="/billing"    element={<ProtectedRoute><Billing /></ProtectedRoute>} />
              <Route path="/settings"   element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/keys"       element={<ProtectedRoute><Keys /></ProtectedRoute>} />
              <Route path="/vault"      element={<ProtectedRoute><Keys /></ProtectedRoute>} />
              <Route path="/workspaces" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/playground" element={<ProtectedRoute><Playground /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
