import { supabase } from '../lib/supabase';

export const pipelineService = {
  async fetchStages(userId) {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async upsertStages(stages) {
    const { data, error } = await supabase
      .from('pipeline_stages')
      .upsert(stages)
      .select();
    
    if (error) throw error;
    return data;
  },

  async deleteStage(stageId) {
    const { error } = await supabase
      .from('pipeline_stages')
      .delete()
      .eq('id', stageId);
    
    if (error) throw error;
    return true;
  }
};
