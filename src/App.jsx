import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LeadForm from './components/LeadForm';
import PublicLeadForm from './components/PublicLeadForm';
import LoginPage from './components/LoginPage';
import './App.css';

const SHEETDB_URL = "https://sheetdb.io/api/v1/y933qp6w0yxj9";

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check storage on load
  useEffect(() => {
    const authStatus = localStorage.getItem('crm_auth_token');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  // Check for public standalone routes before any authentication or CRM rendering
  const path = window.location.pathname;
  if (path === '/join' || path === '/contact' || path === '/lead-form') {
    return <PublicLeadForm />;
  }

  // Fetch clients from SheetDB
  const fetchClients = async () => {
    try {
      const res = await fetch(SHEETDB_URL);
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Failed to fetch clients from SheetDB", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients().then(() => setLoading(false));
    }
  }, [isAuthenticated]);

  // If not authenticated, show login page exclusively
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <header className="top-header">
          <div className="header-glass glass-card">
            <h1>מערכת ניהול לקוחות</h1>
            <div className="user-profile">
              <span className="user-name">טל שני</span>
              <div className="user-avatar-small"></div>
              {/* Optional: Add logout logic here */}
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
              {activeTab === 'settings' && <div className="placeholder-view">הגדרות המערכת יעודכנו בקרוב...</div>}
              {activeTab === 'leadform' && <LeadForm SHEETDB_URL={SHEETDB_URL} onBack={() => setActiveTab('dashboard')} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
