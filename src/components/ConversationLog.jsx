import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Send, FileText, Loader2 } from 'lucide-react';

function ConversationLog({ clientId }) {
    const [logs, setLogs] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (clientId) {
            fetchLogs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientId]);

    const fetchLogs = async () => {
        setIsFetching(true);
        try {
            const { data, error } = await supabase
                .from('client_logs')
                .select('*')
                .eq('client_id', String(clientId))
                .order('created_at', { ascending: false });

            if (!error && data) {
                setLogs(data);
            }
        } catch (e) {
            console.error("Failed to fetch logs:", e);
        } finally {
            setIsFetching(false);
        }
    };

    const handleAddLog = async () => {
        if (!newNote.trim()) return;
        setIsLoading(true);

        const newLog = {
            client_id: String(clientId),
            note_content: newNote.trim(),
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('client_logs')
            .insert([newLog])
            .select('*');

        if (!error && data) {
            setLogs([data[0], ...logs]);
            setNewNote('');
        } else {
            console.error('Failed to add log:', error);
            alert("שגיאה בהוספת הערה (יכול להיות שהטבלה עדיין לא נוצרה).");
        }
        setIsLoading(false);
    };

    return (
        <div className="form-section conversation-log" style={{ marginTop: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <span className="icon">⏱️</span> יומן פעילות
            </h3>
            
            <div className="log-input-area" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <textarea
                    className="glass-input rich-textarea"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="הוסף מעקב, סיכום שיחה או הודעה..."
                    dir="rtl"
                    style={{ minHeight: '60px', flex: 1, resize: 'vertical', borderRadius: '12px' }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            handleAddLog();
                        }
                    }}
                />
                <button 
                    onClick={handleAddLog} 
                    disabled={isLoading || !newNote.trim()}
                    style={{ 
                        background: 'linear-gradient(135deg, #d97706, #ca8a04)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        padding: '0 20px', 
                        cursor: (isLoading || !newNote.trim()) ? 'not-allowed' : 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        opacity: (isLoading || !newNote.trim()) ? 0.6 : 1,
                        boxShadow: '0 4px 15px rgba(217, 119, 6, 0.3)'
                    }}
                    title="שלח (Ctrl + Enter)"
                >
                    {isLoading ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
                </button>
            </div>

            <div className="timeline" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '10px' }}>
                {isFetching ? (
                     <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>טוען יומן פעילות...</div>
                ) : (
                    <AnimatePresence>
                        {logs.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic', margin: '20px 0' }}>אין פעילויות מתועדות עדיין...</p>
                        ) : (
                            logs.map(log => (
                                <motion.div 
                                    key={log.id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="timeline-item glass-card"
                                    style={{ 
                                        marginBottom: '15px', 
                                        padding: '15px 20px', 
                                        position: 'relative', 
                                        borderRight: '4px solid #ca8a04',
                                        background: 'var(--clr-glass-bg)',
                                        borderRadius: '8px 12px 12px 8px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706' }}>
                                            <FileText size={16} />
                                            הערה / תיעוד
                                        </span>
                                        <span>{new Date(log.created_at).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                    </div>
                                    <div style={{ whiteSpace: 'pre-wrap', color: '#1e293b', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                        {log.note_content}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

export default ConversationLog;
