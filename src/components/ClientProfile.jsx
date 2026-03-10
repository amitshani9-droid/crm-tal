import React, { useState, useEffect, useRef } from 'react';
import { getInitials } from '../utils/formatters';
import ConversationLog from './ConversationLog';
import NextCallReminder from './NextCallReminder';
import FileUploader from './FileUploader';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function ClientProfile({ client, isOpen, onClose, onSave, isSaving, onDelete }) {
    const [formData, setFormData] = useState(null);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const drawerContentRef = useRef(null);

    useEffect(() => {
        if (client) {
            const cleanPhone = client.phone?.startsWith("'") ? client.phone.substring(1) : client.phone;
            setFormData({ ...client, phone: cleanPhone });
        }
    }, [client]);

    if (!isOpen || !formData) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        const success = await onSave(formData);
        if (success) onClose();
    };

    const handleDelete = async () => {
        if (window.confirm(`האם למחוק את הלקוח "${formData.contact || 'ללא שם'}"?`)) {
            if (onDelete) {
                await onDelete(formData.id);
                onClose();
            }
        }
    };

    const handleExportPDF = async () => {
        const element = drawerContentRef.current;
        if (!element) return;
        setIsExportingPDF(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#1a1a2e'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            const pageHeight = pdf.internal.pageSize.getHeight();
            let y = 0;
            while (y < pdfHeight) {
                if (y > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, -y, pdfWidth, pdfHeight);
                y += pageHeight;
            }
            const clientName = formData?.contact || 'לקוח';
            pdf.save(`${clientName}_CRM_Profile.pdf`);
        } catch (err) {
            console.error('PDF export failed', err);
            alert('ייצוא ה-PDF נכשל. נסה שנית.');
        } finally {
            setIsExportingPDF(false);
        }
    };

    const sendToMomWhatsApp = (client) => {
        const message = `היי אמא, הנה פרטים של לקוח מה-CRM:%0A
👤 איש קשר: ${client.contact || 'מידע חסר'}%0A
📞 טלפון: ${client.phone || 'מידע חסר'}%0A
🏢 חברה: ${client.company || 'מידע חסר'}%0A
📅 תזכורת: ${client.nextCall ? new Date(client.nextCall).toLocaleString('he-IL') : 'מידע חסר'}`;

        const ownerPhone = import.meta.env.VITE_WHATSAPP_PHONE;
        window.open(`https://wa.me/${ownerPhone}?text=${message}`, '_blank');
    };

    const sendToClientWhatsApp = (client) => {
        if (!client.phone) {
            alert("לא הוזן מספר טלפון ללקוח זה.");
            return;
        }
        
        const rawPhone = client.phone || "";
        const cleanPhone = rawPhone.replace(/['\s-]/g, '');
        
        let finalPhone = cleanPhone;
        if (cleanPhone.startsWith('0')) {
            finalPhone = '972' + cleanPhone.substring(1);
        }

        const message = `היי ${client.contact || 'שם הלקוח'}, `;
        const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <>
            <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`client-profile-drawer glass-card ${isOpen ? 'open' : ''}`}>

                <div className="drawer-header no-print">
                    <button className="close-btn action-btn" onClick={onClose}>✕</button>
                    <div className="header-actions">
                        <button onClick={handleExportPDF} className="action-btn btn-secondary" disabled={isExportingPDF}>
                            {isExportingPDF ? '⏳ מייצא...' : '📄 ייצוא ל-PDF'}
                        </button>
                        <button onClick={() => sendToClientWhatsApp(formData)} className="whatsapp-client-btn action-btn">
                            💬 הודעה ללקוח
                        </button>
                        <button onClick={() => sendToMomWhatsApp(formData)} className="whatsapp-btn action-btn">
                            💬 שלחי לעצמך
                        </button>
                        <button onClick={handleDelete} className="action-btn delete-btn" style={{ color: 'var(--clr-error, #ff4d4d)' }}>
                            🗑️ מחק
                        </button>
                        <button className="btn-primary custom-save action-btn" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "שומר..." : "שמור שינויים"}
                        </button>
                    </div>
                </div>

                <div className="drawer-content" ref={drawerContentRef}>
                    <div className="profile-header-info">
                        <div className={`avatar-large gradient-${formData.avatarIndex || 1}`}>
                            <img
                                src={`/avatar-${formData.avatarIndex || 1}.png`}
                                alt="Avatar"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <span className="avatar-initials">
                                {getInitials(formData.contact)}
                            </span>
                        </div>
                        <div className="profile-titles">
                            <input
                                type="text"
                                className="editable-title"
                                value={formData.contact || ''}
                                onChange={e => handleChange('contact', e.target.value)}
                                placeholder="שם איש קשר (מידע חסר)..."
                            />
                            <input
                                type="text"
                                className="editable-subtitle"
                                value={formData.company || ''}
                                onChange={e => handleChange('company', e.target.value)}
                                placeholder="שם חברה (מידע חסר)..."
                            />
                        </div>
                    </div>

                    <div className="info-grid">
                        <div className="info-group">
                            <label>סטטוס</label>
                            <select
                                className="glass-input"
                                value={formData.status || 'חדש'}
                                onChange={e => handleChange('status', e.target.value)}
                            >
                                <option value="חדש">🔵 חדש</option>
                                <option value="בטיפול">🟠 בטיפול</option>
                                <option value="נשלחה הצעת מחיר">📄 נשלחה הצעת מחיר</option>
                                <option value="סגור">🟢 סגור</option>
                            </select>
                        </div>
                        <div className="info-group">
                            <label>טלפון</label>
                            <input
                                type="tel"
                                value={formData.phone || ''}
                                onChange={e => handleChange('phone', e.target.value)}
                                placeholder="הזן טלפון (מידע חסר)..."
                            />
                        </div>
                        <div className="info-group">
                            <label>מייל</label>
                            <input
                                type="email"
                                value={formData.email || ''}
                                onChange={e => handleChange('email', e.target.value)}
                                placeholder="הזן מייל (מידע חסר)..."
                            />
                        </div>
                        <div className="info-group">
                            <label>תפקיד</label>
                            <input
                                type="text"
                                value={formData.role || ''}
                                onChange={e => handleChange('role', e.target.value)}
                                placeholder="הזן תפקיד (מידע חסר)..."
                            />
                        </div>
                    </div>

                    <div className="divider"></div>

                    <ConversationLog clientId={formData.id} />

                    <NextCallReminder
                        date={formData.nextCall || ''}
                        onChange={(val) => handleChange('nextCall', val)}
                    />

                    <FileUploader clientId={formData.id} />
                </div>
            </div>
        </>
    );
}

export default ClientProfile;
