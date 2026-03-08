import React from 'react';

/**
 * MondayTable Component
 * Displays a list of clients in a Monday.com style table with isolated row actions.
 */
function MondayTable({ clients, onClientClick, onStatusChange, onDeleteClient }) {
    if (!clients || clients.length === 0) {
        return <div className="placeholder-view">אין לקוחות להצגה בתצוגה זו.</div>;
    }

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
                        <th style={{ width: '80px', textAlign: 'center' }}>פעולות</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map(client => (
                        <tr 
                            key={`client-${client.id}`} 
                            onClick={() => onClientClick(client)} 
                            className="monday-table-row"
                        >
                            <td className="contact-cell">
                                <div className="avatar-mini">
                                    <img 
                                        src={`/avatar-${client.avatarIndex}.png`} 
                                        alt={client.contact} 
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.classList.add(`gradient-${client.avatarIndex || 1}`);
                                        }} 
                                    />
                                </div>
                                <span>{client.contact || "לקוח חדש"}</span>
                            </td>
                            <td>{client.company || "-"}</td>
                            <td>{client.phone || "-"}</td>
                            <td>{client.role || "-"}</td>
                            <td>{formatNextCall(client.nextCall)}</td>
                            <td className="status-cell" onClick={(e) => e.stopPropagation()}>
                                <select 
                                    className={`status-select-mini ${client.status === 'חדש' ? 'new' : client.status === 'בטיפול' ? 'in-progress' : 'closed'}`}
                                    value={client.status || 'חדש'}
                                    onChange={(e) => onStatusChange(client.id, e.target.value)}
                                >
                                    <option value="חדש">🔵 חדש</option>
                                    <option value="בטיפול">🟠 בטיפול</option>
                                    <option value="סגור">🟢 סגור</option>
                                </select>
                            </td>
                            <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                                <button 
                                    className="btn-delete-row" 
                                    onClick={() => onDeleteClient(client.id)}
                                    title="מחק לקוח"
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


export default MondayTable;
