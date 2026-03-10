import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, FileText, X, Download, Loader2 } from 'lucide-react';

function FileUploader({ clientId }) {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (clientId) {
            fetchFiles();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientId]);

    const fetchFiles = async () => {
        try {
            const { data, error } = await supabase
                .from('client_files')
                .select('*')
                .eq('client_id', String(clientId))
                .order('created_at', { ascending: false });

            if (!error && data) {
                setFiles(data);
            }
        } catch (e) {
            console.error("Failed to fetch files:", e);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const [errorMsg, setErrorMsg] = useState('');

    const uploadToSupabase = async (selectedFiles) => {
        if (!selectedFiles || selectedFiles.length === 0) return;
        setErrorMsg(''); // Reset error
        
        const uploadedRecords = [];
        const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

        // Check for file sizes first
        for (let i = 0; i < selectedFiles.length; i++) {
            if (selectedFiles[i].size > MAX_SIZE_BYTES) {
                setErrorMsg(`הקובץ "${selectedFiles[i].name}" חורג מהגודל המותר (מקסימום 5MB).`);
                return; // Block upload completely
            }
        }

        setIsUploading(true);

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${clientId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            try {
                // Upload to storage using upsert
                const { error: uploadError } = await supabase.storage
                    .from('client_attachments')
                    .upload(filePath, file, { upsert: true });

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('client_attachments')
                    .getPublicUrl(filePath);

                // Insert into DB
                const newRecord = {
                    client_id: String(clientId),
                    file_name: file.name,
                    file_url: publicUrl,
                    created_at: new Date().toISOString()
                };

                const { data: dbData, error: dbError } = await supabase
                    .from('client_files')
                    .insert([newRecord])
                    .select('*');

                if (dbError) throw dbError;
                if (dbData) uploadedRecords.push(dbData[0]);

            } catch (err) {
                console.error("שגיאה בהעלאת קובץ:", file.name, err);
                alert(`נכשל בהעלאת הקובץ: ${file.name}. ודא שהאחסון וטבלת client_files הוגדרו.`);
            }
        }

        if (uploadedRecords.length > 0) {
            setFiles(prev => [...uploadedRecords, ...prev]);
        }
        
        setIsUploading(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            uploadToSupabase(e.dataTransfer.files);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            uploadToSupabase(e.target.files);
        }
    };

    const deleteFile = async (fileId, fileUrl) => {
        if (!window.confirm("האם אתה בטוח שברצונך למחוק קובץ זה?")) return;
        
        try {
            // Delete from DB
            const { error: dbError } = await supabase
                .from('client_files')
                .delete()
                .eq('id', fileId);
                
            if (dbError) throw dbError;
            
            // Delete from storage Bucket
            const urlParts = fileUrl.split('/');
            const filePath = urlParts[urlParts.length - 1];
            
            if (filePath) {
                await supabase.storage.from('client_attachments').remove([filePath]);
            }

            setFiles(files.filter(f => f.id !== fileId));
        } catch (err) {
            console.error("Failed to delete file:", err);
            alert("שגיאה במחיקת הקובץ.");
        }
    };

    return (
        <div className="form-section file-uploader" style={{ marginTop: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <span className="icon">📁</span> קבצי לקוח
            </h3>

            <AnimatePresence>
                {errorMsg && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRight: '4px solid #ef4444',
                            color: '#991b1b',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            marginBottom: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}
                    >
                        <span>⚠️ {errorMsg}</span>
                        <button 
                            onClick={() => setErrorMsg('')} 
                            style={{ background: 'transparent', border: 'none', color: '#991b1b', cursor: 'pointer', opacity: 0.7 }}
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: isDragging ? '2px dashed #ca8a04' : '2px dashed #cbd5e1',
                    borderRadius: '16px',
                    padding: '30px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isDragging ? 'rgba(202, 138, 4, 0.05)' : 'rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.3s ease',
                    marginBottom: '20px'
                }}
            >
                {isUploading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#ca8a04' }}>
                        <Loader2 className="spin" size={32} />
                        <p style={{ margin: 0, fontWeight: 600 }}>מעלה נתונים לענן...</p>
                    </div>
                ) : (
                    <div className="drop-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '50%', color: '#d97706' }}>
                            <Upload size={28} />
                        </div>
                        <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>גרור מסמכים לכאן או לחץ לבחירה</p>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>קבצים נתמכים: כל סוגי המסמכים (PDF, תמונות ועוד)</span>
                    </div>
                )}
                <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileSelect} 
                />
            </div>

            <div className="files-list">
                <AnimatePresence>
                    {files.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic', margin: '20px 0' }}>אין קבצים מצורפים עדיין...</p>
                    ) : (
                        files.map((file, idx) => (
                            <motion.div 
                                key={file.id || idx} 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="file-item glass-card"
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between', 
                                    padding: '12px 15px', 
                                    marginBottom: '10px',
                                    border: '1px solid rgba(226, 232, 240, 0.5)',
                                    background: 'var(--clr-glass-bg)',
                                    borderRadius: '12px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                    <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '10px', color: '#3b82f6', flexShrink: 0 }}>
                                        <FileText size={20} />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <p style={{ margin: 0, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }} title={file.file_name}>
                                            {file.file_name}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                                            {file.created_at ? new Date(file.created_at).toLocaleDateString('he-IL') : 'הועלה כעת'}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                    <a 
                                        href={file.file_url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}
                                        title="הורד/צפה"
                                    >
                                        <Download size={16} />
                                    </a>
                                    <button 
                                        onClick={() => deleteFile(file.id, file.file_url)}
                                        style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}
                                        title="מחק קובץ"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default FileUploader;
