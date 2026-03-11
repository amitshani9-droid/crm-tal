import React, { useState } from 'react';

export function ClientNotes({ logs, onAddNote, loading }) {
  const [newNote, setNewNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(newNote);
    setNewNote('');
  };

  return (
    <div className="client-notes-section">
      <h3>📋 הערות וסיכומי שיחה</h3>
      <form onSubmit={handleSubmit} className="note-form">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="כתוב הערה חדשה..."
          disabled={loading}
        />
        <button type="submit" className="btn-primary" disabled={loading || !newNote.trim()}>
          {loading ? 'מוסיף...' : 'הוסף הערה'}
        </button>
      </form>

      <div className="notes-list">
        {logs.map(log => (
          <div key={log.id} className="note-item">
            <div className="note-header">
              <span className="note-date">{new Date(log.created_at).toLocaleString('he-IL')}</span>
            </div>
            <p className="note-content">{log.note_content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
