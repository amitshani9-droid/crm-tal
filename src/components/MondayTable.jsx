import React, { useState, useEffect } from 'react';
import { getInitials } from '../utils/formatters';

/**
 * MondayTable Component
 * Displays a list of clients in a Monday.com style table with isolated row actions.
 */
function MondayTable({ clients, onClientClick, onStatusChange, onDeleteClient, itemsPerPage = 8 }) {
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 whenever the clients list changes (e.g. after search)
    useEffect(() => { setCurrentPage(1); }, [clients]);

    if (!clients || clients.length === 0) {
        return <div className="placeholder-view">אין לקוחות להצגה בתצוגה זו.</div>;
    }

    const totalPages = Math.ceil(clients.length / itemsPerPage);
    const paginated = clients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


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
                    {paginated.map(client => (
                        <tr 
                            key={`client-${client.id}`} 
                            onClick={() => onClientClick(client)} 
                            className="monday-table-row"
                        >
                            <td className="contact-cell">
                                <div className="avatar-mini">
                                    <img 
                                        src={`/avatar-${client.avatarIndex || 1}.png`} 
                                        alt={client.contact} 
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.classList.add(`gradient-${client.avatarIndex || 1}`);
                                        }} 
                                    />
                                    <span className="avatar-initials">
                                        {getInitials(client.contact)}
                                    </span>
                                </div>
                                <span>{client.contact || "לקוח חדש"}</span>
                            </td>
                            <td>{client.company || "-"}</td>
                            <td className="phone-cell">
                                <div className="phone-display">
                                    <span>{client.phone?.startsWith("'") ? client.phone.substring(1) : (client.phone || "-")}</span>
                                    {client.phone && (
                                        <button 
                                            className="whatsapp-pill-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Improved Phone Cleaning logic (Avoid double 972)
                                                let rawNum = client.phone.replace(/\D/g, '');
                                                if (rawNum.startsWith('0')) {
                                                    rawNum = '972' + rawNum.substring(1);
                                                } else if (rawNum.startsWith('5')) {
                                                    rawNum = '972' + rawNum; // Standard IL mobile with no 0
                                                }
                                                const cleanNumber = rawNum;
                                                const message = `היי ${client.contact || 'שם הלקוח'}, כאן טל מ-Tali's Events, אשמח לתת לך פרטים על יום הגיבוש שלנו!`;
                                                const url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`;
                                                window.open(url, '_blank');
                                            }}
                                            title="שלח הודעת וואטסאפ"
                                        >
                                            <span className="wa-icon">💬</span>
                                            <span className="wa-text">שלח הודעה</span>
                                        </button>
                                    )}
                                </div>
                            </td>
                            <td>{client.role || "-"}</td>
                            <td>{formatNextCall(client.nextCall)}</td>
                            <td className="status-cell" onClick={(e) => e.stopPropagation()}>
                                <select 
                                    className={`status-select-mini ${
                                        String(client.status) === 'סגור' ? 'closed' : 
                                        String(client.status) === 'בטיפול' ? 'in-progress' : 'new'
                                    }`}
                                    value={client.status || 'חדש'}
                                    onChange={(e) => onStatusChange(client.id, e.target.value)}
                                >
                                    <option value="חדש">חדש</option>
                                    <option value="בטיפול">בטיפול</option>
                                    <option value="סגור">סגור</option>
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
            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        ‹ הקודם
                    </button>
                    <span className="pagination-info">
                        עמוד {currentPage} מתוך {totalPages}
                    </span>
                    <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        הבא ›
                    </button>
                </div>
            )}
        </div>
    );
}


export default MondayTable;
