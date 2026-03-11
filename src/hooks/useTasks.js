import { useState, useCallback } from 'react';
import { tasksService } from '../services/tasksService';
import { activitiesService } from '../services/activitiesService';

export function useTasks(clientId) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!clientId || String(clientId).startsWith('temp_')) return;
    setIsLoading(true);
    try {
      const data = await tasksService.fetchTasks(clientId);
      setTasks(data);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  const addTask = async (title) => {
    const { data: { session } } = await (await import('../lib/supabase')).supabase.auth.getSession();
    const userId = session?.user?.id;

    const newTask = {
      client_id: String(clientId),
      user_id: userId,
      title: title.trim(),
      completed: false,
      created_at: new Date().toISOString()
    };
    const result = await tasksService.createTask(newTask);
    setTasks(prev => [result, ...prev]);

    // Log Activity
    activitiesService.logActivity({
      clientId,
      action: 'TASK_CREATED',
      data: { title }
    });

    return result;
  };

  const toggleTask = async (task) => {
    const updated = await tasksService.updateTask(task.id, { completed: !task.completed });
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
  };

  const deleteTask = async (taskId) => {
    await tasksService.deleteTask(taskId);
    setClients(prev => prev.filter(t => t.id !== taskId));
  };

  return {
    tasks,
    isLoading,
    fetchTasks,
    addTask,
    toggleTask,
    deleteTask
  };
}
