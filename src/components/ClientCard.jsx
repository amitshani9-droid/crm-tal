import React from 'react';

function ClientCard({ client, onClick }) {
    // Determine avatar to use, fallback to un-generated local paths or generic colors
    const avatarPath = `/avatar-${client.avatarIndex}.png`;

    // Format date helper
    const formatNextCall = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' }) + ' ' +
            date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="client-card glass-card" onClick={onClick}>
            <div className="card-header">
                <div className="avatar">
                    <img src={avatarPath} alt={client.contactPerson} onError={(e) => {
                        e.target.onerror = null;
                        // Fallback generated CSS gradient if image missing
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add(`gradient-${client.avatarIndex}`);
                    }} />
                </div>
                <div className="client-titles">
                    <h3 className="client-name">{client.contactPerson || "לקוח חדש"}</h3>
                    <p className="client-company">{client.companyName || "ללא חברה"}</p>
                </div>
            </div>

            <div className="card-body">
                <div className="info-row">
                    <span className="icon">📞</span>
                    <span className="text">{client.phone || "אין טלפון"}</span>
                </div>
                <div className="info-row">
                    <span className="icon">💼</span>
                    <span className="text">{client.role || "ללא תפקיד"}</span>
                </div>
            </div>

            {client.nextCallDate && (
                <div className="card-footer">
                    <div className="next-call-badge">
                        <span className="icon">🗓️</span>
                        <span>שיחה הבאה: {formatNextCall(client.nextCallDate)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClientCard;
