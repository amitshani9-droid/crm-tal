import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PublicLeadForm from './components/PublicLeadForm';
import LoginPage from './components/LoginPage';
import Settings from './components/Settings';
import LandingPage from './components/LandingPage';
import SetupWizard from './components/SetupWizard';
import OnboardingWizard from './components/OnboardingWizard';
import AdminDashboard from './components/AdminDashboard';
import { Bell } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [businessName, setBusinessName] = useState(localStorage.getItem('crm_business_name') || "AS-CRM");
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasPushed, setHasPushed] = useState(false);
  const [suppressWizard, setSuppressWizard] = useState(!!sessionStorage.getItem('wizard_skipped'));

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        if (data.business_name) {
          setBusinessName(data.business_name);
          localStorage.setItem('crm_business_name', data.business_name);
        }
      } else {
        setProfile({ id: userId }); // Signal that profile needs setup
      }
    } catch (err) {
      console.error("Error fetching profile:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setSession(null);
        setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setClients([]);
        setProfile(null);
        setLoading(false);
      }
    });

    const handleStorageChange = () => {
      setBusinessName(localStorage.getItem('crm_business_name') || "AS-CRM");
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchProfile]);

  useEffect(() => {
    if (profile?.settings?.brand_color) {
      document.documentElement.style.setProperty('--clr-primary', profile.settings.brand_color);
      document.documentElement.style.setProperty('--clr-primary-glow', `${profile.settings.brand_color}33`);
    } else {
      document.documentElement.style.setProperty('--clr-primary', '#1e40af');
      document.documentElement.style.setProperty('--clr-primary-glow', 'rgba(30, 64, 175, 0.2)');
    }
  }, [profile]);

  const fetchClients = useCallback(async () => {
    if (!session?.user?.id) return;
    
    // Hardened check: prevent data fetching for unapproved users
    const isMasterAdmin = session.user.email?.toLowerCase() === 'amitshani9@gmail.com';
    if (profile && profile.is_approved === false && !isMasterAdmin) {
        setClients([]);
        return;
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error("Failed to fetch clients:", err.message);
    }
  }, [session, profile]);

  useEffect(() => {
    if (session && profile?.slug) {
      fetchClients();
    }
  }, [session, profile, fetchClients]);

  const handleLogout = async () => {
    localStorage.removeItem('crm_business_name');
    await supabase.auth.signOut();
  };

  const dormancyDays = profile?.settings?.dormancy_days ?? 3;
  const isNotificationOn = profile?.settings?.notification_on ?? true;
  const isNotificationInApp = profile?.settings?.notification_in_app ?? true;
  const isNotificationPush = profile?.settings?.notification_push ?? false;
  
  const customStatuses = profile?.settings?.custom_statuses || ["חדש", "בטיפול", "נשלחה הצעת מחיר", "סגור"];
  const isClosedStatus = (status) => status === customStatuses[customStatuses.length - 1];

  const dormantClients = isNotificationOn ? clients.filter(c => {
    if (isClosedStatus(c.status || customStatuses[0])) return false;
    const lastIter = new Date(c.last_interaction || c.created_at || new Date());
    const daysSince = Math.floor((new Date() - lastIter) / (1000 * 60 * 60 * 24));
    return daysSince >= dormancyDays;
  }) : [];

  const vipDormantClients = dormantClients.filter(c => c.is_vip);
  const isDailyDigest = profile?.settings?.daily_digest === true;

  useEffect(() => {
    // Push notifications only for VIPs, and ONLY if daily digest is OFF
    if (isNotificationOn && isNotificationPush && !isDailyDigest && vipDormantClients.length > 0 && !hasPushed && Notification.permission !== "denied") {
      const runPush = async () => {
        let perm = Notification.permission;
        if (perm !== "granted") {
            perm = await Notification.requestPermission();
        }
        if (perm === "granted") {
            new Notification("AS-CRM: התראת VIP!", { body: `שים לב! יש לך ${vipDormantClients.length} לידי VIP מחכים לטיפול.` });
            setHasPushed(true);
        }
      };
      runPush();
    }
  }, [vipDormantClients.length, isNotificationOn, isNotificationPush, hasPushed, isDailyDigest]);

  if (loading) return <div className="placeholder-view">טוען את החוויה שלכם...</div>;

  return (
    <>
    <Routes>
      <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/טופס/:slug" element={<PublicLeadForm />} />
      <Route path="/טופס" element={<PublicLeadForm />} />
      <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <LoginPage initialIsSignUp={false} />} />
      <Route path="/signup" element={session ? <Navigate to="/dashboard" replace /> : <LoginPage initialIsSignUp={true} />} />
      
      <Route path="/dashboard/*" element={
        !session ? <Navigate to="/login" replace /> : (
          (() => {
            const isMasterAdmin = session?.user?.email?.toLowerCase() === 'amitshani9@gmail.com';
            
            if (!profile?.slug && !isMasterAdmin) {
              return <SetupWizard session={session} onComplete={() => fetchProfile(session.user.id)} />;
            }

            return (
              <div className="app-layout" dir="rtl">
                {(() => {
                  const hasBusinessDesc = !!profile?.settings?.business_description;
                  const showOnboarding = !hasBusinessDesc && !isMasterAdmin && !suppressWizard;
                  return showOnboarding ? (
                    <OnboardingWizard 
                      profile={profile} 
                      session={session} 
                      onComplete={() => {
                        setSuppressWizard(true);
                        fetchProfile(session.user.id);
                      }} 
                      onSkip={() => {
                        sessionStorage.setItem('wizard_skipped', 'true');
                        setSuppressWizard(true);
                      }}
                    />
                  ) : null;
                })()}
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} session={session} />
                <main className="main-content">
                <header className="top-header">
                  <div className="header-glass glass-card">
                    <div className="header-title-box">
                      <h1>{businessName}</h1>
                      <span className="header-subtitle">ניהול חכם של לקוחות</span>
                    </div>
                    <div className="user-profile" style={{ position: 'relative' }}>
                      {session && isNotificationOn && isNotificationInApp && !isDailyDigest && (
                        <div style={{ position: 'relative', cursor: 'pointer', marginLeft: '15px', color: '#64748b', display: 'flex', alignItems: 'center' }} onClick={() => setShowNotifications(!showNotifications)}>
                          <Bell size={24} />
                          {vipDormantClients.length > 0 && (
                            <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)' }}>
                              {vipDormantClients.length}
                            </span>
                          )}
                          {showNotifications && (
                            <div className="glass-card" style={{ position: 'absolute', top: '40px', left: '-50px', width: '300px', padding: '15px', zIndex: 100, borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                              <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>התראות VIP ({vipDormantClients.length})</h4>
                              {vipDormantClients.length === 0 ? (
                                <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-secondary)', textAlign: 'center', margin: '15px 0' }}>אין לידי VIP רדומים! 🎉</p>
                              ) : (
                                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {vipDormantClients.map(c => {
                                     const lastIter = new Date(c.last_interaction || c.created_at || new Date());
                                     const daysSince = Math.floor((new Date() - lastIter) / (1000 * 60 * 60 * 24));
                                     return (
                                       <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', transition: '0.2s', cursor: 'pointer' }} onClick={() => { setShowNotifications(false); setActiveTab('dashboard'); window.dispatchEvent(new CustomEvent('open-client-profile', { detail: c })); }}>
                                         <div style={{ backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '24px', height: '24px', minWidth: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>⭐</div>
                                         <div style={{ textAlign: 'right', flex: 1, overflow: 'hidden' }}>
                                           <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.contact || 'ללא שם'}</p>
                                           <p style={{ margin: 0, fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>VIP עוכב {daysSince} ימים</p>
                                         </div>
                                       </div>
                                     )
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      <span className="user-name">{session.user.email?.split('@')[0]}</span>
                      <div className="user-avatar-small" style={{ backgroundColor: profile?.settings?.brand_color || '#1e40af' }}>
                        {session.user.email?.charAt(0).toUpperCase()}
                      </div>
                      <button onClick={handleLogout} className="btn-logout">התנתק</button>
                    </div>
                  </div>
                </header>

                <div className="content-area">
                  {activeTab === 'dashboard' && <Dashboard clients={clients} setClients={setClients} fetchClients={fetchClients} session={session} profile={profile} setProfile={setProfile} />}
                  {activeTab === 'settings' && <Settings clients={clients} session={session} profile={profile} setProfile={setProfile} />}
                </div>
              </main>
            </div>
          );
        })()
      )} />
      <Route path="/admin" element={
        !session ? <Navigate to="/login" replace /> :
        (session.user.email?.toLowerCase() === 'amitshani9@gmail.com' ? 
          <AdminDashboard session={session} /> : 
          <Navigate to="/dashboard" replace />
        )
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
