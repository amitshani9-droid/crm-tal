import { supabase } from '../lib/supabase';

export const filesService = {
  async fetchClientFiles(clientId) {
    const { data, error } = await supabase
      .from('client_files')
      .select('*')
      .eq('client_id', String(clientId))
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async uploadFile(clientId, file, bucketName = 'client_attachments') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${clientId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const newRecord = {
      client_id: String(clientId),
      file_name: file.name,
      file_url: publicUrl,
      created_at: new Date().toISOString()
    };

    const { data, error: dbError } = await supabase
      .from('client_files')
      .insert([newRecord])
      .select()
      .single();

    if (dbError) throw dbError;
    return data;
  },

  async deleteFile(fileId, fileUrl, bucketName = 'client_attachments') {
    const { error: dbError } = await supabase
      .from('client_files')
      .delete()
      .eq('id', fileId);
    
    if (dbError) throw dbError;

    const urlParts = fileUrl.split('/');
    const filePath = urlParts[urlParts.length - 1];
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
      if (storageError) console.error("Failed to remove from storage:", storageError);
    }
    return true;
  }
};
