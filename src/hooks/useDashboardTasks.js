import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useDashboardTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayTasks = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('client_tasks')
      .select(`
        *,
        clients (
          contact,
          company
        )
      `)
      .eq('completed', false)
      .lte('due_date', today + 'T23:59:59')
      .order('due_date', { ascending: true });

    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTodayTasks();
  }, []);

  const toggleTask = async (taskId, currentCompleted) => {
    const { error } = await supabase
      .from('client_tasks')
      .update({ completed: !currentCompleted })
      .eq('id', taskId);
    
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  return { tasks, loading, toggleTask, refreshTasks: fetchTodayTasks };
}
