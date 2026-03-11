import React from 'react';

export function ClientActivity({ activities }) {
  const getActionLabel = (action) => {
    switch (action) {
      case 'added_note': return 'הוסיף הערה';
      case 'status_change': return 'שינה סטטוס';
      case 'file_upload': return 'העלה קובץ';
      case 'task_complete': return 'סימן משימה כבוצעה';
      default: return action;
    }
  };

  return (
    <div className="client-activity-section">
      <h3>⌛ פעילות אחרונה</h3>
      <div className="activity-timeline">
        {activities.map(act => (
          <div key={act.id} className="activity-item">
            <span className="activity-dot"></span>
            <div className="activity-info">
              <p className="activity-text">
                <strong>{getActionLabel(act.action)}</strong>
                {act.data?.preview && <span className="activity-preview">: {act.data.preview}</span>}
              </p>
              <span className="activity-time">{new Date(act.created_at).toLocaleString('he-IL')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
