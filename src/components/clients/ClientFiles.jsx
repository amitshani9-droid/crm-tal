import React, { useRef } from 'react';
import { Upload, FileText, X, Download, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useClientFiles } from '../../hooks/useClientFiles';

export function ClientFiles({ clientId }) {
    const { files, isUploading, error, uploadFiles, deleteFile } = useClientFiles(clientId);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            uploadFiles(e.target.files);
        }
    };

    return (
        <div className="form-section file-uploader" style={{ marginTop: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <span className="icon">📁</span> קבצי לקוח
            </h3>

            {error && <div className="error-msg">⚠️ {error}</div>}

            <div
                className="drop-zone"
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '16px',
                    padding: '30px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.5)',
                    marginBottom: '20px'
                }}
            >
                {isUploading ? (
                    <Loader2 className="spin" size={32} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <Upload size={28} color="#d97706" />
                        <p style={{ margin: 0, fontWeight: 600 }}>לחץ להעלאת קבצים</p>
                    </div>
                )}
                <input type="file" multiple ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />
            </div>

            <div className="files-list">
                {files.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b' }}>אין קבצים.</p>
                ) : (
                    files.map(file => (
                        <div key={file.id} className="file-item glass-card" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', marginBottom: '10px' }}>
                            <span>{file.file_name}</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <a href={file.file_url} target="_blank" rel="noreferrer" className="btn-secondary"><Download size={16} /></a>
                                <button onClick={() => deleteFile(file.id, file.file_url)} className="btn-delete-row"><X size={16} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ClientFiles;
