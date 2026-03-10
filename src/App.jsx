import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PublicLeadForm from './components/PublicLeadForm';
import LoginPage from './components/LoginPage';
import Settings from './components/Settings';
import './App.css';

const SHEETDB_URL = import.meta.env.VITE_SHEETDB_URL;

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [businessName, setBusinessName] = useState(localStorage.getItem('crm_business_name') || "Tali's Events");

  // Check storage on load
  useEffect(() => {
    const authToken = localStorage.getItem('crm_auth_token');
    const authExpiry = parseInt(localStorage.getItem('crm_auth_expiry') || '0', 10);
    if (authToken && Date.now() < authExpiry) {
      setIsAuthenticated(true);
    } else {
      // Token missing or expired — clear stale data
      localStorage.removeItem('crm_auth_token');
      localStorage.removeItem('crm_auth_expiry');
    }

    // Listener for settings changes (like business name)
    const handleStorageChange = () => {
      setBusinessName(localStorage.getItem('crm_business_name') || "Tali's Events");
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch clients from SheetDB — wrapped in useCallback to maintain a stable
  // reference and allow safe inclusion in useEffect dependency arrays.
  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch(SHEETDB_URL);
      const data = await res.json();
      
        const now = Date.now();
      const sanitizedData = data.map((item, i) => {
        // If ID is missing or is an old placeholder, assign a new local ID.
        // Do NOT patch back to the sheet — a contact-name match could corrupt
        // rows with duplicate names. The new ID is persisted on the next real save.
        if (!item.id || String(item.id).startsWith('row-')) {
          return { ...item, id: String(now + i) };
        }
        return item;
      });
      
      setClients(sanitizedData);
    } catch (err) {
      console.error("Failed to fetch clients from SheetDB", err);
    }
  }, [SHEETDB_URL]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients().then(() => setLoading(false));
    }
  }, [isAuthenticated, fetchClients]);

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
                  <div className="header-title-box">
                    <h1>{businessName}</h1>
                    <span className="header-subtitle">ניהול לקוחות ומשימות</span>
                  </div>
                  <div className="user-profile">
                    <span className="user-name">טל שני</span>
                    <div className="user-avatar-small"></div>
                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        localStorage.removeItem('crm_auth_token');
                        localStorage.removeItem('crm_auth_expiry');
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
