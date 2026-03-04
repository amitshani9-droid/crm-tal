import React, { useState, useEffect } from 'react';
import ConversationLog from './ConversationLog';
import NextCallReminder from './NextCallReminder';
import FileUploader from './FileUploader';

function ClientProfile({ client, isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        if (client) {
            setFormData({ ...client });
        }
    }, [client]);

    if (!isOpen || !formData) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const handleExportPDF = () => {
        window.print();
    };

    const sendToMomWhatsApp = (client) => {
        const message = `היי אמא, הנה פרטים של לקוח מה-CRM:%0A
👤 איש קשר: ${client.contactPerson || ''}%0A
📞 טלפון: ${client.phone || ''}%0A
🏢 חברה: ${client.companyName || ''}%0A
📅 תזכורת: ${client.nextCallDate ? new Date(client.nextCallDate).toLocaleString('he-IL') : ''}`;

        window.open(`https://wa.me/972544866372?text=${message}`, '_blank');
    };

    const sendToClientWhatsApp = (client) => {
        if (!client.phone) {
            alert("לא הוזן מספר טלפון ללקוח זה.");
            return;
        }
        // Clean phone number (remove dashes, spaces, etc.)
        let cleanPhone = client.phone.replace(/\D/g, '');
        // Prefix with Israel country code if it starts with '0'
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '972' + cleanPhone.substring(1);
        }

        const message = `היי ${client.contactPerson || ''}, `;
        window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    };

    return (
        <>
            <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`client-profile-drawer glass-card ${isOpen ? 'open' : ''}`}>

                <div className="drawer-header no-print">
                    <button className="close-btn action-btn" onClick={onClose}>✕</button>
                    <div className="header-actions">
                        <button onClick={handleExportPDF} className="action-btn btn-secondary">
                            📄 ייצוא ל-PDF
                        </button>
                        <button onClick={() => sendToClientWhatsApp(formData)} className="whatsapp-client-btn action-btn">
                            💬 הודעה ללקוח
                        </button>
                        <button onClick={() => sendToMomWhatsApp(formData)} className="whatsapp-btn action-btn">
                            💬 שלחי לעצמך
                        </button>
                        <button className="btn-primary custom-save action-btn" onClick={handleSave}>שמור שינויים</button>
                    </div>
                </div>

                <div className="drawer-content">
                    {/* Header Area */}
                    <div className="profile-header-info">
                        <div className={`avatar-large gradient-${formData.avatarIndex || 1}`}>
                            <img
                                src={`/avatar-${formData.avatarIndex || 1}.png`}
                                alt="Avatar"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                        <div className="profile-titles">
                            <input
                                type="text"
                                className="editable-title"
                                value={formData.contactPerson}
                                onChange={e => handleChange('contactPerson', e.target.value)}
                                placeholder="שם איש קשר..."
                            />
                            <input
                                type="text"
                                className="editable-subtitle"
                                value={formData.companyName}
                                onChange={e => handleChange('companyName', e.target.value)}
                                placeholder="שם חברה..."
                            />
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="info-grid">
                        <div className="info-group">
                            <label>טלפון</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => handleChange('phone', e.target.value)}
                                placeholder="הזן טלפון..."
                            />
                        </div>
                        <div className="info-group">
                            <label>מייל</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => handleChange('email', e.target.value)}
                                placeholder="הזן מייל..."
                            />
                        </div>
                        <div className="info-group">
                            <label>תפקיד</label>
                            <input
                                type="text"
                                value={formData.role}
                                onChange={e => handleChange('role', e.target.value)}
                                placeholder="הזן תפקיד..."
                            />
                        </div>
                    </div>

                    <div className="divider"></div>

                    {/* Rich Area */}
                    <ConversationLog
                        history={formData.conversationHistory}
                        onChange={(val) => handleChange('conversationHistory', val)}
                    />

                    <NextCallReminder
                        date={formData.nextCallDate}
                        onChange={(val) => handleChange('nextCallDate', val)}
                    />

                    <FileUploader
                        documents={formData.documents}
                        onChange={(docs) => handleChange('documents', docs)}
                    />
                </div>
            </div>
        </>
    );
}

export default ClientProfile;
