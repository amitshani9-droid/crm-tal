import React from 'react';
import { KanbanColumn } from './KanbanColumn';

export function KanbanBoard({ stages, clients, onDropClient, onOpenProfile }) {
  if (!stages || stages.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        טרם הוגדרו שלבים ב-Pipeline. ניתן להגדיר אותם בדף ההגדרות.
      </div>
    );
  }

  return (
    <div className="kanban-wrapper" style={{ 
      display: 'flex', 
      gap: '20px', 
      overflowX: 'auto', 
      paddingBottom: '20px',
      minHeight: '600px',
      alignItems: 'stretch'
    }}>
      {stages.sort((a, b) => a.position - b.position).map(stage => {
        const stageClients = clients.filter(c => c.stage_id === stage.id);
        return (
          <KanbanColumn 
            key={stage.id} 
            stage={stage} 
            clients={stageClients} 
            onDropClient={onDropClient}
            onOpenProfile={onOpenProfile}
          />
        );
      })}
    </div>
  );
}
