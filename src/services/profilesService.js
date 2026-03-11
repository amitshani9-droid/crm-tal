import { supabase } from '../lib/supabase';

export const profilesService = {
  async fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateProfile(profileData) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
