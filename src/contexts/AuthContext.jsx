import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { profilesService } from '../services/profilesService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState(localStorage.getItem('crm_business_name') || "AS-CRM");

  const fetchProfile = useCallback(async (userId) => {
    try {
      const data = await profilesService.fetchProfile(userId);
      
      if (data) {
        setProfile(data);
        if (data.business_name) {
          setBusinessName(data.business_name);
          localStorage.setItem('crm_business_name', data.business_name);
        }
        // Set CSS Variables
        document.documentElement.style.setProperty('--clr-primary', data.settings?.brand_color || '#1e40af');
        document.documentElement.style.setProperty('--clr-primary-glow', `${data.settings?.brand_color || '#1e40af'}33`);
      } else {
        setProfile({ id: userId });
        // Default CSS Variables
        document.documentElement.style.setProperty('--clr-primary', '#1e40af');
        document.documentElement.style.setProperty('--clr-primary-glow', 'rgba(30, 64, 175, 0.2)');
      }
    } catch (err) {
      console.error("Error fetching profile:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession) fetchProfile(currentSession.user.id);
      else setLoading(false);
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) fetchProfile(currentSession.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ session, profile, loading, businessName, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
