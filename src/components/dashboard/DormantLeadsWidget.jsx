import React from 'react';
import { useDormantLeads } from '../../hooks/useDormantLeads';
import { Moon, AlertCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export function DormantLeadsWidget({ onOpenProfile }) {
  const { dormantLeads, loading } = useDormantLeads();

  return (
    <div className="glass-card widget dormant-widget" style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
        <Moon size={20} /> לידים רדומים
      </h3>
      
      {loading ? (
        <div className="skeleton" style={{ height: '100px' }}></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {dormantLeads.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>כל הלידים פעילים! כל הכבוד 🎯</p>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#ef4444', marginBottom: '10px' }}>
                 <AlertCircle size={16} />
                 <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{dormantLeads.length} לידים מחכים ליחס...</span>
              </div>
              
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dormantLeads.slice(0, 5).map(lead => (
                  <div 
                    key={lead.id}
                    className="dormant-item"
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'rgba(245, 158, 11, 0.05)',
                      borderRadius: '8px',
                      border: '1px solid rgba(245, 158, 11, 0.1)'
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem' }}>{lead.contact}</p>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {lead.last_contact_at ? `קשר אחרון: ${new Date(lead.last_contact_at).toLocaleDateString()}` : 'טרםנוצר קשר'}
                      </span>
                    </div>
                    <button 
                      className="icon-btn-mini" 
                      onClick={() => onOpenProfile(lead)}
                      style={{ background: '#f59e0b', color: 'white' }}
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
