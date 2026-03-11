import { Phone, MessageCircle, User, MoreHorizontal, Calendar } from 'lucide-react';
import { openWhatsApp } from '../../utils/whatsappUtils';

export function KanbanCard({ client, onOpenProfile }) {
  const handleCall = (e) => {
    e.stopPropagation();
    window.open(`tel:${client.phone}`, '_self');
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    openWhatsApp(client.phone);
  };

  const onDragStart = (e) => {
    e.dataTransfer.setData('clientId', client.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      className="kanban-card glass-card"
      draggable
      onDragStart={onDragStart}
      onClick={() => onOpenProfile(client)}
      style={{ 
        padding: '12px', 
        marginBottom: '10px', 
        cursor: 'grab',
        background: 'var(--clr-glass-bg)',
        border: '1px solid var(--clr-glass-border)',
        borderRadius: '12px',
        transition: 'transform 0.2s, background 0.2s',
        position: 'relative'
      }}
    >
      <div style={{ marginBottom: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{client.contact}</h4>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{client.company}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
         <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
           <Phone size={12} /> {client.phone}
         </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button className="icon-btn-mini" onClick={handleCall} title="התקשר"><Phone size={14} /></button>
          <button className="icon-btn-mini" onClick={handleWhatsApp} title="וואטסאפ"><MessageCircle size={14} /></button>
        </div>
        <button className="icon-btn-mini" onClick={() => onOpenProfile(client)}><MoreHorizontal size={14} /></button>
      </div>
    </div>
  );
}
