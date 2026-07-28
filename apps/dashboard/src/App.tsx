import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Providers } from './pages/Providers';
import { Jobs } from './pages/Jobs';
import { Billing } from './pages/Billing';
import { Settings } from './pages/Settings';
import { Keys }     from './pages/Keys';
import { getStoredApiKey } from './lib/api';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1">
          <Routes>
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

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        
        <footer className="border-t border-slate-800/60 py-6 text-center text-xs font-mono text-slate-600">
          LiteDaemon · OpenRouter for AI Agents & Tools · Zero Markup Infrastructure
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
