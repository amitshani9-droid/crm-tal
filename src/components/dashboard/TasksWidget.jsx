import React from 'react';
import { useDashboardTasks } from '../../hooks/useDashboardTasks';
import { CheckCircle, Circle, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TasksWidget() {
  const { tasks, loading, toggleTask } = useDashboardTasks();

  return (
    <div className="glass-card widget tasks-widget" style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CheckCircle size={20} color="#10b981" /> משימות להיום
      </h3>
      
      {loading ? (
        <div className="skeleton" style={{ height: '100px' }}></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <AnimatePresence>
            {tasks.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>אין משימות דחופות להיום...</p>
            ) : (
              tasks.map(task => (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="task-item-mini"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleTask(task.id, task.completed)}
                >
                  <Circle size={18} color="#94a3b8" />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{task.title}</p>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={12} /> {task.clients?.contact}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
