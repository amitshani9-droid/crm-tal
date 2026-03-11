import { useMemo } from 'react';

export function useDashboardStats(clients, stages) {
  const stats = useMemo(() => {
    if (!clients || clients.length === 0) {
      return { total: 0, new: 0, active: 0, closed: 0, todoToday: 0 };
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const todayStr = new Date().toISOString().split('T')[0];

    const total = clients.length;
    
    const newLeads = clients.filter(c => {
      const createdDate = new Date(c.created_at);
      return createdDate >= sevenDaysAgo;
    }).length;

    // Use stage_id and stages naming convention
    const activePipeline = clients.filter(c => {
      if (!c.stage_id) return true; // Default to active if stage not set? 
      const stage = stages.find(s => s.id === c.stage_id);
      return stage && stage.name !== 'סגור';
    }).length;

    const closedDeals = clients.filter(c => {
      const stage = stages.find(s => s.id === c.stage_id);
      return stage && stage.name === 'סגור';
    }).length;

    // todoToday logic can also check client_tasks if we want more accuracy, 
    // but for now keeping it simple with nextCall if it exists
    const todoToday = clients.filter(c => c.nextCall && c.nextCall.split('T')[0] === todayStr).length;

    return {
      total,
      new: newLeads,
      active: activePipeline,
      closed: closedDeals,
      todoToday
    };
  }, [clients, stages]);

  return stats;
}
