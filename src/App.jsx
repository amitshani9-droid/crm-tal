import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
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
  const [businessName, setBusinessName] = useState(localStorage.getItem('crm_business_name') || "Tali's Events");

  // Check storage on load
  useEffect(() => {
    const authStatus = localStorage.getItem('crm_auth_token');
    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
    }

    // Listener for settings changes (like business name)
    const handleStorageChange = () => {
      setBusinessName(localStorage.getItem('crm_business_name') || "Tali's Events");
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch clients from SheetDB
  const fetchClients = async () => {
    try {
      const res = await fetch(SHEETDB_URL);
      const data = await res.json();
      
      const now = Date.now();
      // Use for...of to allow async/await inside the loop for sequential patching if needed
      const sanitizedData = [];
      
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        // If ID is missing or is an old placeholder, fix it permanently
        if (!item.id || String(item.id).startsWith('row-')) {
          const newId = String(now + i);
          
          // Sync back to SheetDB using contact as identifier (if available)
          if (item.contact) {
            fetch(`${SHEETDB_URL}/contact/${encodeURIComponent(item.contact)}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: { id: newId } })
            }).catch(err => console.error("ID sync failed", err));
          }
          item = { ...item, id: newId };
        }
        sanitizedData.push(item);
      }
      
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
