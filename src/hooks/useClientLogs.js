import { useState, useEffect } from 'react';
import { logsService } from '../services/logsService';

export function useClientLogs(clientId, userId) {
  const [logs, setLogs] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (clientId) {
      fetchData();
    }
  }, [clientId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsData, activityData] = await Promise.all([
        logsService.fetchClientLogs(clientId),
        logsService.fetchActivityLogs(userId, clientId)
      ]);
      setLogs(logsData);
      setActivity(activityData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (content) => {
    try {
      const newNote = await logsService.addLog(clientId, content, userId);
      setLogs(prev => [newNote, ...prev]);
      
      // Also log activity
      await logsService.addActivity(userId, clientId, 'added_note', { preview: content.substring(0, 50) });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    logs,
    activity,
    loading,
    error,
    addNote,
    refreshLogs: fetchData
  };
}
