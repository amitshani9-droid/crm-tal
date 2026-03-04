import React from 'react';

function MondayTable({ clients, onClientClick }) {
    if (!clients || clients.length === 0) {
        return <div className="placeholder-view">אין לקוחות להצגה בתצוגה זו.</div>;
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'חדש':
                return <span className="status-badge new">חדש</span>;
            case 'בטיפול':
                return <span className="status-badge in-progress">בטיפול</span>;
            case 'סגור':
                return <span className="status-badge closed">סגור</span>;
            default:
                return <span className="status-badge new">חדש</span>;
        }
    };

    const formatNextCall = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div className="monday-table-wrapper glass-card">
            <table className="monday-table">
                <thead>
                    <tr>
                        <th>שם הנציג</th>
                        <th>שם החברה</th>
                        <th>טלפון</th>
                        <th>תפקיד</th>
                        <th>שיחה הבאה</th>
                        <th>סטטוס אפיון</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map(client => (
                        <tr key={client.id} onClick={() => onClientClick(client)} className="monday-table-row">
                            <td className="contact-cell">
                                <div className="avatar-mini">
                                    <img src={`/avatar-${client.avatarIndex}.png`} alt={client.contact} onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.classList.add(`gradient-${client.avatarIndex || 1}`);
                                    }} />
                                </div>
                                <span>{client.contact || "לקוח חדש"}</span>
                            </td>
                            <td>{client.company || "-"}</td>
                            <td>{client.phone || "-"}</td>
                            <td>{client.role || "-"}</td>
                            <td>{formatNextCall(client.nextCall)}</td>
                            <td className="status-cell">{getStatusBadge(client.status)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default MondayTable;
