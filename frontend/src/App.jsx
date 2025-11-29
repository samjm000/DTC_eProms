import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClinicianDashboard from './pages/ClinicianDashboard';
import PatientDashboard from './pages/PatientDashboard';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import ReportSideEffect from './pages/ReportSideEffect';
import Layout from './components/Layout';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nhs-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nhs-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              {user?.role === 'patient' ? <PatientDashboard /> : <ClinicianDashboard />}
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/patients"
        element={
          <PrivateRoute allowedRoles={['clinician', 'admin']}>
            <Layout>
              <PatientList />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/patients/:id"
        element={
          <PrivateRoute>
            <Layout>
              <PatientDetail />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/report-side-effect"
        element={
          <PrivateRoute allowedRoles={['patient']}>
            <Layout>
              <ReportSideEffect />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
