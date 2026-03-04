import React from 'react';

function NextCallReminder({ date, onChange }) {
    return (
        <div className="form-section next-call-reminder">
            <h3><span className="icon">⏰</span> תזכורת לשיחה הבאה</h3>
            <div className="datetime-wrapper">
                <input
                    type="datetime-local"
                    className="glass-input premium-datepicker"
                    value={date || ''}
                    onChange={(e) => onChange(e.target.value)}
                    dir="rtl"
                />
                {!date && <span className="placeholder-text">בחר תאריך ושעה לשיחת פולו-אפ...</span>}
            </div>
        </div>
    );
}

export default NextCallReminder;
