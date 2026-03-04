import React, { useRef, useEffect } from 'react';

function ConversationLog({ history, onChange }) {
    const textareaRef = useRef(null);

    // Auto-resize textarea logic
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [history]);

    return (
        <div className="form-section conversation-log">
            <h3><span className="icon">💬</span> היסטורית שיחה</h3>
            <textarea
                ref={textareaRef}
                className="glass-input rich-textarea"
                value={history}
                onChange={(e) => onChange(e.target.value)}
                placeholder="הדבק או הקלד סיכום שיחה כאן... (התיבה תגדל אוטומטית)"
                dir="rtl"
            />
        </div>
    );
}

export default ConversationLog;
