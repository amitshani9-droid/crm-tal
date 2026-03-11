import { supabase } from '../lib/supabase';

export const aiService = {
  /**
   * Generates a summary of client logs using a Supabase Edge Function
   */
  async generateClientSummary(clientId, logs) {
    if (!logs || logs.length === 0) return "אין מספיק מידע ליצירת סיכום.";

    const logText = logs.map(l => `${new Date(l.created_at).toLocaleDateString()}: ${l.note_content}`).join('\n');

    try {
      // Calling the Edge Function 'generate-summary'
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { clientId, text: logText }
      });

      if (error) throw error;
      return data.summary;
    } catch (err) {
      console.error("AI Summary Error:", err);
      // Fallback: If edge function fails, try to return a local mock or re-throw
      return "נכשל ביצירת סיכום AI. וודא ש-Edge Functions מוגדרות ב-Supabase.";
    }
  }
};
