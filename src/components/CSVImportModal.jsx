import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, CheckCircle, AlertCircle, Loader2, Table } from 'lucide-react';

const CSVImportModal = ({ isOpen, onClose, sessionId, onImportComplete, brandColor }) => {
    const [file, setFile] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [mapping, setMapping] = useState({ contact: '', phone: '', email: '', company: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
            setError('אנא בחר קובץ CSV תקין');
            return;
        }

        setFile(selectedFile);
        setError(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                setError('הקובץ ריק או שאין בו מספיק נתונים');
                return;
            }

            // Simple CSV parsing (handling basic quotes)
            const parseCSVLine = (line) => {
                const result = [];
                let current = '';
                let inQuotes = false;
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') inQuotes = !inQuotes;
                    else if (char === ',' && !inQuotes) {
                        result.push(current.trim());
                        current = '';
                    } else current += char;
                }
                result.push(current.trim());
                return result;
            };

            const firstLineHeaders = parseCSVLine(lines[0]);
            setHeaders(firstLineHeaders);
            
            // Preview 5 rows (currently disabled as previewData state was removed)
            // const rows = lines.slice(1, 6).map(line => {
            //     const values = parseCSVLine(line);
            //     const obj = {};
            //     firstLineHeaders.forEach((h, i) => {
            //         obj[h] = values[i] || '';
            //     });
            //     return obj;
            // });
            // setPreviewData(rows);

            // Auto-mapping logic
            const newMapping = { ...mapping };
            firstLineHeaders.forEach(h => {
                const lowerH = h.toLowerCase();
                if (lowerH.includes('שם') || lowerH.includes('name') || lowerH.includes('contact')) newMapping.contact = h;
                if (lowerH.includes('טלפון') || lowerH.includes('phone') || lowerH.includes('mobile')) newMapping.phone = h;
                if (lowerH.includes('מייל') || lowerH.includes('email')) newMapping.email = h;
                if (lowerH.includes('חברה') || lowerH.includes('company') || lowerH.includes('עסק')) newMapping.company = h;
            });
            setMapping(newMapping);
        };
        reader.readAsText(selectedFile);
    };

    const handleImport = async () => {
        if (!mapping.contact || !mapping.phone) {
            setError('חובה למפות לפחות את שדות השם והטלפון');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setProgress(0);

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const text = event.target.result;
                const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                const dataLines = lines.slice(1);
                
                const parseCSVLine = (line) => {
                    const result = [];
                    let current = '';
                    let inQuotes = false;
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (char === '"') inQuotes = !inQuotes;
                        else if (char === ',' && !inQuotes) {
                            result.push(current.trim());
                            current = '';
                        } else current += char;
                    }
                    result.push(current.trim());
                    return result;
                };

                // Fetch existing phones for duplicate check
                const { data: existingClients } = await supabase
                    .from('clients')
                    .select('phone')
                    .eq('user_id', sessionId);
                
                const existingPhones = new Set(existingClients?.map(c => c.phone?.replace(/[^\d+]/g, '')) || []);

                const toInsert = [];
                const duplicates = [];

                dataLines.forEach((line) => {
                    const values = parseCSVLine(line);
                    const row = {};
                    headers.forEach((h, i) => {
                        row[h] = values[i] || '';
                    });

                    const phone = row[mapping.phone]?.replace(/[^\d+]/g, '');
                    const contact = row[mapping.contact];

                    if (!contact || !phone) return;

                    if (existingPhones.has(phone)) {
                        duplicates.push(phone);
                        return;
                    }

                    toInsert.push({
                        user_id: sessionId,
                        contact: contact,
                        phone: phone,
                        email: mapping.email ? row[mapping.email] : null,
                        company: mapping.company ? row[mapping.company] : 'ייבוא מרשימה',
                        status: 'חדש', // Will be flagged as needing attention
                        history: '[Imported] לקוח יובא מרשימת CSV חיצונית בתהליך הקמה',
                        last_interaction: new Date().toISOString()
                    });
                });

                if (toInsert.length === 0) {
                    setError('לא נמצאו לקוחות חדשים לייבוא (או שכולם כפולים)');
                    setIsProcessing(false);
                    return;
                }

                // Batch insert (Supabase handles this well)
                const { error: insertError } = await supabase.from('clients').insert(toInsert);
                
                if (insertError) throw insertError;

                setProgress(100);
                setTimeout(() => {
                    onImportComplete(`ייבוא הושלם! ${toInsert.length} לקוחות חדשים נוספו.${duplicates.length > 0 ? ` (${duplicates.length} כפולים סוננו)` : ''}`);
                    onClose();
                    // Reset state
                    setFile(null);
                    setHeaders([]);
                    // setPreviewData([]);
                    setMapping({ contact: '', phone: '', email: '', company: '' });
                }, 1000);
            };
            reader.readAsText(file);
        } catch (err) {
            console.error(err);
            setError('שגיאה במהלך הייבוא: ' + err.message);
            setIsProcessing(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
            <div className="modal-card glass-card" style={{ maxWidth: '700px', width: '90%', padding: '0', overflow: 'hidden' }}>
                <div className="modal-header" style={{ padding: '20px 30px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Table size={24} color={brandColor} />
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>ייבוא לקוחות חכם</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ padding: '30px' }}>
                    {!file ? (
                        <div 
                            className="upload-area" 
                            onClick={() => fileInputRef.current.click()}
                            style={{ 
                                border: `2px dashed ${error ? '#ef4444' : brandColor + '44'}`, 
                                borderRadius: '20px', 
                                padding: '60px 20px', 
                                textAlign: 'center', 
                                cursor: 'pointer',
                                backgroundColor: brandColor + '05',
                                transition: '0.2s'
                            }}
                        >
                            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                            <Upload size={48} color={error ? '#ef4444' : brandColor} style={{ marginBottom: '15px', opacity: 0.7 }} />
                            <h3 style={{ margin: '0 0 10px 0' }}>לחץ להעלאת קובץ CSV</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>הגרור קובץ או לחץ כדי לבחור מהמחשב</p>
                            {error && <p style={{ color: '#ef4444', fontWeight: 700, marginTop: '15px' }}>{error}</p>}
                        </div>
                    ) : (
                        <div className="mapping-area">
                            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '25px', fontSize: '0.9rem', color: '#475569' }}>
                                <p style={{ margin: 0 }}>נמצאו <b>{headers.length}</b> עמודות בקובץ. אנא בחר איזה עמודה מתאימה לכל שדה ב-CRM.</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>שם לקוח / איש קשר *</label>
                                    <select 
                                        value={mapping.contact} 
                                        onChange={(e) => setMapping({...mapping, contact: e.target.value})}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="">— בחר עמודה —</option>
                                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>מספר טלפון *</label>
                                    <select 
                                        value={mapping.phone} 
                                        onChange={(e) => setMapping({...mapping, phone: e.target.value})}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="">— בחר עמודה —</option>
                                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>דוא"ל</label>
                                    <select 
                                        value={mapping.email} 
                                        onChange={(e) => setMapping({...mapping, email: e.target.value})}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="">— בחר עמודה —</option>
                                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px' }}>שם החברה</label>
                                    <select 
                                        value={mapping.company} 
                                        onChange={(e) => setMapping({...mapping, company: e.target.value})}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    >
                                        <option value="">— בחר עמודה —</option>
                                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            </div>

                            <button 
                                className="btn-primary" 
                                onClick={handleImport} 
                                disabled={isProcessing}
                                style={{ width: '100%', backgroundColor: brandColor, borderRadius: '12px', padding: '15px', fontSize: '1.1rem' }}
                            >
                                {isProcessing ? (
                                    <><Loader2 size={18} className="spin" /> מייבא נתונים... {progress > 0 && `${progress}%`}</>
                                ) : (
                                    'ייבא לקוחות לענן'
                                )}
                            </button>
                            
                            <button 
                                onClick={() => setFile(null)} 
                                style={{ width: '100%', background: 'none', border: 'none', color: '#64748b', marginTop: '15px', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                בטל ובחר קובץ אחר
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CSVImportModal;
