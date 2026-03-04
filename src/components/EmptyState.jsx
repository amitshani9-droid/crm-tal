import React from 'react';

function EmptyState() {
    return (
        <div className="empty-state">
            <div className="empty-illustration">
                <img
                    src="/empty_state.png"
                    alt="אין לקוחות"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                    }}
                />
                {/* Fallback CSS shapes if image isn't loaded */}
                <div className="fallback-shapes"></div>
            </div>
            <h2>רשימת הלקוחות ריקה</h2>
            <p>לחץ על ״לקוח חדש״ כדי להתחיל לנהל את העסק שלך בצורה חכמה ויפהפייה.</p>
        </div>
    );
}

export default EmptyState;
