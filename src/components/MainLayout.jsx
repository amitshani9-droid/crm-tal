import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import SetupWizard from './SetupWizard';
import OnboardingWizard from './OnboardingWizard';
import { useAuth } from '../contexts/AuthContext';
import { useClientsContext } from '../contexts/ClientsContext';

export default function MainLayout({ activeTab, setActiveTab }) {
  const { session, profile, businessName, fetchProfile } = useAuth();
  const { clients, stages, isLoading } = useClientsContext();
  const [showNotifications, setShowNotifications] = useState(false);
  const [suppressWizard, setSuppressWizard] = useState(!!sessionStorage.getItem('wizard_skipped'));

  const isMasterAdmin = session?.user?.email?.toLowerCase() === 'amitshani9@gmail.com';

  const handleLogout = async () => {
    localStorage.removeItem('crm_business_name');
    await supabase.auth.signOut();
  };

  // Notifications Logic
  const dormancyDays = profile?.settings?.dormancy_days ?? 3;
  const isNotificationOn = profile?.settings?.notification_on ?? true;
  
  const dormantClients = isNotificationOn ? clients.filter(c => {
    // Basic logic for dormant clients
    const lastIter = new Date(c.last_interaction || c.created_at || new Date());
    const daysSince = Math.floor((new Date() - lastIter) / (1000 * 60 * 60 * 24));
    return daysSince >= dormancyDays;
  }) : [];

  const vipDormantClients = dormantClients.filter(c => c.is_vip);

  if (!profile?.slug && !isMasterAdmin) {
    return <SetupWizard session={session} onComplete={() => fetchProfile(session.user.id)} />;
  }

  const hasBusinessDesc = !!profile?.settings?.business_description;
  const showOnboarding = !hasBusinessDesc && !isMasterAdmin && !suppressWizard;

  return (
    <div className="app-layout" dir="rtl">
      {showOnboarding && (
        <OnboardingWizard 
          profile={profile} 
          session={session} 
          onComplete={() => { setSuppressWizard(true); fetchProfile(session.user.id); }} 
          onSkip={() => { sessionStorage.setItem('wizard_skipped', 'true'); setSuppressWizard(true); }}
        />
      )}
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} session={session} />
      
      <main className="main-content">
        <header className="top-header">
          <div className="header-glass glass-card">
            <div className="header-title-box">
              {profile?.settings?.logo_url && (
                <div className="header-logo-container">
                  <img src={profile.settings.logo_url} alt="Logo" className="header-logo-img" />
                </div>
              )}
              <div className="header-text-group">
                <h1>{businessName}</h1>
                <span className="header-subtitle">ניהול חכם של לקוחות</span>
              </div>
            </div>
            <div className="header-actions-right">
              {isNotificationOn && (
                <div className="notification-bell-wrapper" onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell size={24} />
                  {vipDormantClients.length > 0 && <span className="notification-badge">{vipDormantClients.length}</span>}
                  {showNotifications && (
                    <div className="notifications-dropdown glass-card">
                      <h4>התראות VIP ({vipDormantClients.length})</h4>
                      {vipDormantClients.length === 0 ? <p>אין לידי VIP רדומים!</p> : (
                        <div className="notifications-list">
                          {vipDormantClients.map(c => (
                            <div key={c.id} className="notification-item">
                                {c.contact}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="user-info">
                 <div className="user-avatar-small">
                    {profile?.settings?.logo_url ? <img src={profile.settings.logo_url} alt="User" /> : businessName?.charAt(0)}
                 </div>
                 <button onClick={handleLogout} className="btn-logout">התנתק</button>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
