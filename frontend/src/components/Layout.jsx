import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Activity, User, LogOut, Users, AlertCircle } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, isClinician } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-nhs-blue text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Activity className="h-8 w-8" />
                <div>
                  <h1 className="text-xl font-bold">NHS EPROMS</h1>
                  <p className="text-xs text-blue-100">Patient Outcome Measures</p>
                </div>
              </Link>

              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-nhs-dark-blue transition-colors"
                >
                  Dashboard
                </Link>

                {isClinician && (
                  <Link
                    to="/patients"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-nhs-dark-blue transition-colors flex items-center space-x-1"
                  >
                    <Users className="h-4 w-4" />
                    <span>Patients</span>
                  </Link>
                )}

                {!isClinician && (
                  <Link
                    to="/report-side-effect"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-nhs-dark-blue transition-colors flex items-center space-x-1"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>Report Side Effect</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-right">
                <p className="font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-blue-100 capitalize">{user?.role}</p>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-md hover:bg-nhs-dark-blue transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 opacity-60">
              <img src="/dtc-logo.png" alt="Doctors That Code" className="h-6 w-auto" />
              <span className="text-xs text-gray-500">Powered by Doctors That Code Ltd</span>
            </div>
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">
                NHS EPROMS System - Electronic Patient Recorded Outcome Measures
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Confidential patient information - Handle in accordance with NHS data security guidelines
              </p>
            </div>
            <div className="w-48"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
