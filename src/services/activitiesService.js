import { supabase } from '../lib/supabase';

export const activitiesService = {
  async fetchRecentActivities(limit = 20) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        clients (
          contact
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async logActivity({ clientId, action, data = {} }) {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return null;

    const { error } = await supabase
      .from('activity_logs')
      .insert([{
        user_id: userId,
        client_id: clientId,
        action,
        data
      }]);
    
    if (error) console.error("Failed to log activity:", error);
  }
};
