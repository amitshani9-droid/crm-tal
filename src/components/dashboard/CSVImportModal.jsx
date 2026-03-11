import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, X, Table, Loader2 } from 'lucide-react';

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
                setError('הקובץ ריק');
                return;
            }
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

                const toInsert = [];
                dataLines.forEach((line) => {
                    const values = parseCSVLine(line);
                    const row = {};
                    headers.forEach((h, i) => { row[h] = values[i] || ''; });
                    const phone = row[mapping.phone]?.replace(/[^\d+]/g, '');
                    const contact = row[mapping.contact];
                    if (!contact || !phone) return;
                    toInsert.push({
                        user_id: sessionId,
                        contact,
                        phone,
                        email: mapping.email ? row[mapping.email] : null,
                        company: mapping.company ? row[mapping.company] : 'ייבוא',
                        status: 'חדש',
                        last_interaction: new Date().toISOString()
                    });
                });
                if (toInsert.length === 0) {
                    setError('לא נמצאו נתונים לייבוא');
                    setIsProcessing(false);
                    return;
                }
                const { error: insertError } = await supabase.from('clients').insert(toInsert);
                if (insertError) throw insertError;
                onImportComplete(`ייבוא הושלם! ${toInsert.length} לקוחות נוספו.`);
                onClose();
            };
            reader.readAsText(file);
        } catch (err) {
            setError('שגיאה: ' + err.message);
            setIsProcessing(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 10001 }}>
            <div className="modal-card glass-card" style={{ maxWidth: '700px', width: '90%', padding: '0', overflow: 'hidden' }}>
                <div className="modal-header" style={{ padding: '20px 30px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Table size={24} color={brandColor} />
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>ייבוא לקוחות</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}><X size={24} /></button>
                </div>
                <div className="modal-body" style={{ padding: '30px' }}>
                    {!file ? (
                        <div className="upload-area" onClick={() => fileInputRef.current.click()} style={{ border: `2px dashed ${brandColor}44`, borderRadius: '20px', padding: '60px 20px', textAlign: 'center', cursor: 'pointer' }}>
                            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
                            <Upload size={48} color={brandColor} style={{ marginBottom: '15px' }} />
                            <h3>לחץ להעלאת קובץ CSV</h3>
                            {error && <p style={{ color: '#ef4444' }}>{error}</p>}
                        </div>
                    ) : (
                        <div className="mapping-area">
                            <button className="btn-primary" onClick={handleImport} disabled={isProcessing} style={{ width: '100%', backgroundColor: brandColor }}>
                                {isProcessing ? 'מייבא...' : 'ייבא לקוחות לענן'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CSVImportModal;
