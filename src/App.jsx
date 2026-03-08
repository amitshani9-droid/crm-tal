import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LeadForm from './components/LeadForm';
import PublicLeadForm from './components/PublicLeadForm';
import LoginPage from './components/LoginPage';
import Settings from './components/Settings';
import './App.css';

const SHEETDB_URL = "https://sheetdb.io/api/v1/y933qp6w0yxj9";

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [businessName, setBusinessName] = useState(localStorage.getItem('crm_business_name') || 'טל שני - הפקת אירועים');

  // Check storage on load
  useEffect(() => {
    const authStatus = localStorage.getItem('crm_auth_token');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
    }

    // Listener for settings changes (like business name)
    const handleStorageChange = () => {
      setBusinessName(localStorage.getItem('crm_business_name') || 'טל שני - הפקת אירועים');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch clients from SheetDB
  const fetchClients = async () => {
    try {
      const res = await fetch(SHEETDB_URL);
      const data = await res.json();
      
      // Critical Fix: Ensure every row has a unique ID
      const sanitizedData = data.map((item, index) => ({
        ...item,
        id: item.id || `row-${index}` // Use existing ID or fallback to index
      }));
      
      setClients(sanitizedData);
    } catch (err) {
      console.error("Failed to fetch clients from SheetDB", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients().then(() => setLoading(false));
    }
  }, [isAuthenticated]);

  return (
    <Routes>
      <Route path="/join" element={<PublicLeadForm />} />
      <Route path="*" element={
        !isAuthenticated ? (
          <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
        ) : (
          <div className="app-layout">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="main-content">
              <header className="top-header">
                <div className="header-glass glass-card">
                  <h1>{businessName}</h1>
                  <div className="user-profile">
                    <span className="user-name">טל שני</span>
                    <div className="user-avatar-small"></div>
                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        localStorage.removeItem('crm_auth_token');
                        setIsAuthenticated(false);
                      }}
                      style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--clr-text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                      התנתק
                    </button>
                  </div>
                </div>
              </header>

              <div className="content-area">
                {loading ? (
                  <div className="placeholder-view">טוען נתונים מהענן...</div>
                ) : (
                  <>
                    {activeTab === 'dashboard' && <Dashboard clients={clients} setClients={setClients} SHEETDB_URL={SHEETDB_URL} fetchClients={fetchClients} />}
                    {activeTab === 'settings' && <Settings clients={clients} />}
                    {activeTab === 'leadform' && <LeadForm SHEETDB_URL={SHEETDB_URL} onBack={() => setActiveTab('dashboard')} />}
                  </>
                )}
              </div>
            </main>
          </div>
        )
      } />
    </Routes>
  );
}

export default App;
