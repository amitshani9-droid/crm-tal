import React from 'react';

export function ClientDetails({ 
  phone, email, stageId, status, stages, 
  onPhoneChange, onEmailChange, onStageChange 
}) {
  return (
    <div className="info-grid">
      <div className="info-group">
        <label>סטטוס אפיון</label>
        <select
          className="glass-input"
          value={stageId || status || 'חדש'}
          onChange={e => onStageChange(e.target.value)}
        >
          {stages.length > 0 ? (
            stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
          ) : (
            <>
              <option value="חדש">🔵 חדש</option>
              <option value="בטיפול">🟠 בטיפול</option>
              <option value="סגור">🟢 סגור</option>
            </>
          )}
        </select>
      </div>
      <div className="info-group">
        <label>טלפון</label>
        <input
          type="tel"
          value={phone || ''}
          onChange={e => onPhoneChange(e.target.value)}
        />
      </div>
      <div className="info-group">
        <label>מייל</label>
        <input
          type="email"
          value={email || ''}
          onChange={e => onEmailChange(e.target.value)}
        />
      </div>
    </div>
  );
}
