import React from 'react';
import { useActivities } from '../../hooks/useActivities';
import { History, UserPlus, FileText, CheckSquare, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const getIcon = (action) => {
  switch (action) {
    case 'CLIENT_CREATED': return <UserPlus size={16} color="#3b82f6" />;
    case 'NOTE_ADDED': return <FileText size={16} color="#d97706" />;
    case 'STATUS_CHANGED': return <ArrowRightLeft size={16} color="#8b5cf6" />;
    case 'TASK_CREATED': return <CheckSquare size={16} color="#10b981" />;
    default: return <History size={16} color="#64748b" />;
  }
};

const getActionText = (activity) => {
  const name = activity.clients?.contact || 'לקוח';
  switch (activity.action) {
    case 'CLIENT_CREATED': return `נוסף ליד חדש: ${name}`;
    case 'NOTE_ADDED': return `נוספה הערה ל-${name}`;
    case 'STATUS_CHANGED': return `שינוי סטטוס ל-${name}`;
    case 'TASK_CREATED': return `נוצרה משימה עבור ${name}`;
    default: return activity.action;
  }
};

export function ActivityWidget() {
  const { activities, loading } = useActivities();

  return (
    <div className="glass-card widget activity-widget" style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <History size={20} color="#6366f1" /> פעילות אחרונה
      </h3>
      
      {loading ? (
        <div className="skeleton" style={{ height: '200px' }}></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {activities.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>טרם תועדה פעילות...</p>
          ) : (
            activities.map(act => (
              <div key={act.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ marginTop: '4px' }}>{getIcon(act.action)}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500 }}>{getActionText(act)}</p>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {new Date(act.created_at).toLocaleString('he-IL', { timeStyle: 'short', dateStyle: 'short' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
