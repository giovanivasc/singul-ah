import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentsList from './pages/StudentsList';
import StudentHub from './pages/StudentHub';
import CaseStudy from './pages/CaseStudy';
import ConvergenceEditor from './pages/ConvergenceEditor';
import PEIBuilder from './pages/PEIBuilder';
import FamilyCollection from './pages/FamilyCollection';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* External Public Routes */}
          <Route path="/coleta/if-sahs/:token" element={<FamilyCollection />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<StudentsList />} />
            
            {/* Student Contextual Routes */}
            <Route path="/students/:studentId" element={<StudentHub />} />
            <Route path="/students/:studentId/case-study" element={<CaseStudy />} />
            <Route path="/students/:studentId/mapping" element={<ConvergenceEditor />} />
            <Route path="/students/:studentId/builder" element={<PEIBuilder />} />
            <Route path="/students/:studentId/evaluation" element={<StudentHub />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
