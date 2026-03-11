import { supabase } from '../lib/supabase';

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * 
 * @param {File} file - The file to upload
 * @param {string} bucketName - The storage bucket name (default: 'logos')
 * @param {string} userId - ID to prefix the filename (default: 'public')
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadFileToStorage = async (file, bucketName = 'logos', userId = 'public') => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    // Create a unique filename using userId and random string
    const fileName = `${userId}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

    return publicUrl;
};
