import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ClientsProvider } from './contexts/ClientsContext';
import MainLayout from './components/MainLayout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import PublicLeadForm from './components/PublicLeadForm';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import './App.css';

function AppRoutes() {
  const { session, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) return <div className="placeholder-view">טוען את החוויה שלכם...</div>;

  return (
    <Routes>
      <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/טופס/:slug" element={<PublicLeadForm />} />
      <Route path="/טופס" element={<PublicLeadForm />} />
      <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <LoginPage initialIsSignUp={false} />} />
      <Route path="/signup" element={session ? <Navigate to="/dashboard" replace /> : <LoginPage initialIsSignUp={true} />} />
      
      {/* Protected Routes inside the Layout */}
      <Route element={session ? (
        <ClientsProvider>
          <MainLayout activeTab={activeTab} setActiveTab={setActiveTab} />
        </ClientsProvider>
      ) : <Navigate to="/login" replace />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/admin" element={
        session?.user?.email?.toLowerCase() === 'amitshani9@gmail.com' 
          ? (
            <ClientsProvider>
              <AdminDashboard session={session} />
            </ClientsProvider>
          ) 
          : <Navigate to="/dashboard" replace />
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
