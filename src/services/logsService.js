import { supabase } from '../lib/supabase';

export const logsService = {
  async fetchClientLogs(clientId) {
    const { data, error } = await supabase
      .from('client_logs')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addLog(clientId, noteContent, userId) {
    const { data, error } = await supabase
      .from('client_logs')
      .insert([{
        client_id: clientId,
        note_content: noteContent,
        user_id: userId,
        created_by: userId
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async fetchActivityLogs(userId, clientId = null) {
    let query = supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async addActivity(userId, clientId, action, data = {}) {
    const { error } = await supabase
      .from('activity_logs')
      .insert([{
        user_id: userId,
        client_id: clientId,
        action: action,
        data: data
      }]);
    
    if (error) {
       console.error("Failed to log activity:", error);
       // We don't necessarily want to throw here and block the UI if audit logging fails
    }
  }
};
