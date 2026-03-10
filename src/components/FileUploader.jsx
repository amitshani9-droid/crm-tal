import React, { useState, useEffect, useRef } from 'react';

function FileUploader({ documents, onChange }) {
    const [isDragging, setIsDragging] = useState(false);
    // Track all blob URLs we create so we can revoke them on removal or unmount
    const createdUrlsRef = useRef([]);

    // Revoke all tracked object URLs when the component unmounts
    useEffect(() => {
        return () => {
            createdUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newDocs = Array.from(e.dataTransfer.files).map(file => {
                const url = URL.createObjectURL(file);
                createdUrlsRef.current.push(url); // track for cleanup
                return {
                    name: file.name,
                    url,
                    type: file.name.endsWith('.pdf') ? 'pdf' : 'doc'
                };
            });

            onChange([...(documents || []), ...newDocs]);
        }
    };

    const removeDoc = (index) => {
        const newDocs = [...documents];
        const removed = newDocs.splice(index, 1)[0];
        // Revoke the blob URL immediately when removing a file
        if (removed?.url && removed.url.startsWith('blob:')) {
            URL.revokeObjectURL(removed.url);
            createdUrlsRef.current = createdUrlsRef.current.filter(u => u !== removed.url);
        }
        onChange(newDocs);
    };

    return (
        <div className="form-section file-uploader">
            <h3><span className="icon">📄</span> מקום לשים מסמכים</h3>

            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="drop-content">
                    <span className="drop-icon">📁</span>
                    <p>גרור מסמכים ושחרר כאן (הצעות מחיר, PDF, וכו׳)</p>
                    <span className="drop-subtext">או לחץ לבחירת קבצים מתיקייה</span>
                </div>
                {/* Hidden input for click-to-upload logic if needed */}
            </div>

            {documents && documents.length > 0 && (
                <ul className="document-list">
                    {documents.map((doc, idx) => (
                        <li key={idx} className="document-item glass-card">
                            <span className="doc-icon">{doc.name.endsWith('.pdf') ? '📕' : '📘'}</span>
                            <span className="doc-name">{doc.name}</span>
                            <button className="remove-doc" onClick={() => removeDoc(idx)}>✕</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default FileUploader;
