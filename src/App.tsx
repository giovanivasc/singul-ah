import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Privacidade from './pages/Privacidade';
import TermoConsentimento from './pages/TermoConsentimento';
import Assentimento from './pages/Assentimento';
import Encarregado from './pages/Encarregado';
import Dashboard from './pages/Dashboard';
import StudentsList from './pages/StudentsList';
import StudentHub from './pages/StudentHub';
import CaseStudy from './pages/CaseStudy';
import ConvergenceEditor from './pages/ConvergenceEditor';
import PEIBuilder from './pages/PEIBuilder';
import FamilyCollection from './pages/FamilyCollection';
import TeacherCollection from './pages/TeacherCollection';
import StudentInterview from './pages/StudentInterview';
import StudentNILS from './pages/StudentNILS';
import StudentPortal from './pages/StudentPortal';
import DailyCheckin from './pages/DailyCheckin';
import MeusDados from './pages/MeusDados';
import SupervisaoParental from './pages/SupervisaoParental';
import ResponsavelConfirmar from './pages/ResponsavelConfirmar';
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
          {/* Public Landing */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Legal / Privacy Pages (public) */}
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/termo-consentimento" element={<TermoConsentimento />} />
          <Route path="/assentimento" element={<Assentimento />} />
          <Route path="/encarregado" element={<Encarregado />} />

          {/* External Public Routes */}
          <Route path="/coleta/if-sahs/:token" element={<FamilyCollection />} />
          <Route path="/responsavel/confirmar/:token" element={<ResponsavelConfirmar />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<StudentsList />} />
            <Route path="/students/" element={<StudentsList />} />
            <Route path="/student-portal" element={<StudentPortal />} />
            <Route path="/daily-checkin" element={<DailyCheckin />} />
            <Route path="/meus-dados" element={<MeusDados />} />
            <Route path="/supervisao-parental" element={<SupervisaoParental />} />
            
            {/* Student Contextual Routes */}
            <Route path="/students/:studentId" element={<StudentHub />} />
            <Route path="/students/:studentId/case-study" element={<CaseStudy />} />
            <Route path="/students/:studentId/ip-sahs" element={<TeacherCollection />} />
            <Route path="/students/:studentId/interview" element={<StudentInterview />} />
            <Route path="/students/:studentId/n-ils" element={<StudentNILS />} />
            <Route path="/students/:studentId/convergence" element={<ConvergenceEditor />} />
            <Route path="/students/:studentId/builder" element={<PEIBuilder />} />
            <Route path="/students/:studentId/evaluation" element={<StudentHub />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
