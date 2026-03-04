import React, { useState } from 'react';

function FileUploader({ documents, onChange }) {
    const [isDragging, setIsDragging] = useState(false);

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
            const newDocs = Array.from(e.dataTransfer.files).map(file => ({
                name: file.name,
                url: URL.createObjectURL(file), // create temporary preview URL
                type: file.name.endsWith('.pdf') ? 'pdf' : 'doc'
            }));

            onChange([...(documents || []), ...newDocs]);
        }
    };

    const removeDoc = (index) => {
        const newDocs = [...documents];
        newDocs.splice(index, 1);
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
