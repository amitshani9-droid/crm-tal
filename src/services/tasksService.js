import { supabase } from '../lib/supabase';

export const tasksService = {
  async fetchTasks(clientId) {
    if (!clientId) return [];
    const { data, error } = await supabase
      .from('client_tasks')
      .select('*')
      .eq('client_id', String(clientId))
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createTask(taskData) {
    const { data, error } = await supabase
      .from('client_tasks')
      .insert([taskData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateTask(taskId, updateData) {
    const { data, error } = await supabase
      .from('client_tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteTask(taskId) {
    const { error } = await supabase
      .from('client_tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) throw error;
    return true;
  }
};
