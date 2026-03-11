import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useDormantLeads() {
  const [dormantLeads, setDormantLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDormantLeads = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .or(`last_contact_at.lt.${sevenDaysAgo.toISOString()},last_contact_at.is.null`)
      .neq('status', 'סגור') // אל תציג לקוחות שנסגרו כרדומים
      .order('last_contact_at', { ascending: true });

    if (!error && data) {
      setDormantLeads(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDormantLeads();
  }, []);

  return { dormantLeads, loading, refresh: fetchDormantLeads };
}
