import React, { useState } from 'react';
import { KanbanCard } from './KanbanCard';

export function KanbanColumn({ stage, clients, onDropClient, onOpenProfile }) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const clientId = e.dataTransfer.getData('clientId');
    if (clientId) {
      onDropClient(clientId, stage.id);
    }
  };

  return (
    <div 
      className={`kanban-column ${isOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ 
        flex: 1, 
        minWidth: '280px', 
        backgroundColor: isOver ? 'rgba(255,255,255,0.05)' : 'transparent',
        borderRadius: '16px',
        padding: '10px',
        transition: 'background 0.2s',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '10px 15px',
        marginBottom: '15px',
        borderBottom: `3px solid ${stage.color || '#3b82f6'}`
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
          {stage.name}
        </h3>
        <span style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '2px 8px', 
          borderRadius: '10px',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          {clients.length}
        </span>
      </div>

      <div className="kanban-cards-container" style={{ flex: 1, overflowY: 'auto' }}>
        {clients.map(client => (
          <KanbanCard key={client.id} client={client} onOpenProfile={onOpenProfile} />
        ))}
      </div>
    </div>
  );
}
