import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import './App.css';

const SHEETDB_URL = "https://sheetdb.io/api/v1/y933qp6w0yxj9";

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchClients().then(() => setLoading(false));
  }, []);

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
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
