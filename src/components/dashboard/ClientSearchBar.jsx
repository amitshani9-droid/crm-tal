import React, { useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function ClientSearchBar({ onSelectClient }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .or(`contact.ilike.%${val}%,phone.ilike.%${val}%,company.ilike.%${val}%`)
        .limit(5);
      
      if (!error && data) {
        setResults(data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-bar-wrapper" style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
      <div className="search-input-container" style={{ position: 'relative' }}>
        <Search size={18} className="search-icon-left" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input 
          type="text"
          className="glass-input"
          placeholder="חיפוש מהיר של ליד..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ paddingLeft: '40px', width: '100%' }}
        />
        {loading && <Loader2 size={16} className="spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />}
      </div>

      {isOpen && (results.length > 0 || !loading) && (
        <div className="search-dropdown glass-card" style={{ 
          position: 'absolute', 
          top: '110%', 
          left: 0, 
          right: 0, 
          zIndex: 100, 
          maxHeight: '300px', 
          overflowY: 'auto' 
        }}>
          {results.length === 0 ? (
            <div style={{ padding: '15px', textAlign: 'center', color: '#64748b' }}>לא נמצאו תוצאות...</div>
          ) : (
            results.map(client => (
              <div 
                key={client.id} 
                className="search-result-item" 
                onClick={() => {
                  onSelectClient(client);
                  setIsOpen(false);
                  setQuery('');
                }}
                style={{ 
                  padding: '12px 15px', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{client.contact}</p>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{client.company}</span>
                </div>
                <div style={{ textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>
                  {client.phone}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
