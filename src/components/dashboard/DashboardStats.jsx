import React from 'react';
import { Users, UserPlus, Target, CheckCircle } from 'lucide-react';

export function DashboardStats({ stats }) {
  const cards = [
    { label: 'סה"כ לקוחות', value: stats.total, icon: <Users size={24} />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
    { label: 'לידים חדשים', value: stats.new, icon: <UserPlus size={24} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'בטיפול', value: stats.active, icon: <Target size={24} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'עסקאות שנסגרו', value: stats.closed, icon: <CheckCircle size={24} />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
  ];

  return (
    <div className="stats-grid" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '20px',
      marginBottom: '30px'
    }}>
      {cards.map((card, i) => (
        <div key={i} className="glass-card stat-card" style={{ 
          padding: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px' 
        }}>
          <div style={{ 
            background: card.bg, 
            color: card.color, 
            padding: '12px', 
            borderRadius: '12px' 
          }}>
            {card.icon}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>{card.label}</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
