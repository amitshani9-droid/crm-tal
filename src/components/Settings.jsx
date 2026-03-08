import React, { useState, useEffect } from 'react';

/**
 * Settings Component
 * Allows Tal to customize her CRM experience, security, and branding.
 */
function Settings({ clients }) {
    const [settings, setSettings] = useState({
        businessName: localStorage.getItem('crm_business_name') || 'טל שני - הפקת אירועים',
        password: localStorage.getItem('crm_master_password') || 'tal0203',
        thankYouMessage: localStorage.getItem('crm_thank_you_msg') || 'הפרטים התקבלו בהצלחה ונחזור אליך בהקדם.',
        maintenanceMode: localStorage.getItem('crm_maintenance_mode') === 'true'
    });

    const [saveStatus, setSaveStatus] = useState('');

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('crm_business_name', settings.businessName);
        localStorage.setItem('crm_master_password', settings.password);
        localStorage.setItem('crm_thank_you_msg', settings.thankYouMessage);
        localStorage.setItem('crm_maintenance_mode', settings.maintenanceMode.toString());
        
        setSaveStatus('ההגדרות נשמרו בהצלחה!');
        setTimeout(() => setSaveStatus(''), 3000);
        
        // Trigger a custom event to update the sidebar/header without full refresh
        window.dispatchEvent(new Event('storage'));
    };

    const handleExportCSV = () => {
        if (!clients || clients.length === 0) {
            alert("אין נתונים לייצוא.");
            return;
        }

        const headers = "ID,סטטוס,איש קשר,טלפון,מייל,תפקיד,חברה,היסטוריית שיחות,שיחה הבאה\n";
        const rows = clients.map(c => {
            const history = (c.history || "").replace(/"/g, '""');
            const contact = (c.contact || "").replace(/"/g, '""');
            const company = (c.company || "").replace(/"/g, '""');
            const role = (c.role || "").replace(/"/g, '""');
            const phone = (c.phone || "").startsWith("'") ? c.phone.substring(1) : (c.phone || "");

            return `"${c.id}","${c.status || 'חדש'}","${contact}","${phone}","${c.email || ''}","${role}","${company}","${history}","${c.nextCall || ''}"`;
        }).join("\n");

        const csvContent = "\ufeff" + headers + rows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `CRM_Backup_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="settings-view">
            <div className="settings-header">
                <h2>⚙️ הגדרות המערכת</h2>
                <p>נהלי את האבטחה, המיתוג והטפסים של ה-CRM שלך</p>
            </div>

            <div className="settings-grid">
                {/* Branding Section */}
                <div className="settings-card glass-card">
                    <h3>🏷️ מיתוג וזהות</h3>
                    <div className="info-group">
                        <label>שם העסק (מופיע בכותרות)</label>
                        <input 
                            type="text" 
                            className="glass-input" 
                            value={settings.businessName}
                            onChange={(e) => handleChange('businessName', e.target.value)}
                        />
                    </div>
                </div>

                {/* Security Section */}
                <div className="settings-card glass-card">
                    <h3>🔒 אבטחה וכניסה</h3>
                    <div className="info-group">
                        <label>סיסמת כניסה למערכת</label>
                        <input 
                            type="text" 
                            className="glass-input" 
                            value={settings.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                        />
                        <p className="helper-text">זו הסיסמה שתצטרכי להזין במסך הכניסה.</p>
                    </div>
                </div>

                {/* Public Form Section */}
                <div className="settings-card glass-card">
                    <h3>📝 טופס לידים ציבורי</h3>
                    <div className="info-group">
                        <label>הודעת "תודה" לאחר שליחה</label>
                        <textarea 
                            className="glass-input rich-textarea" 
                            value={settings.thankYouMessage}
                            onChange={(e) => handleChange('thankYouMessage', e.target.value)}
                        />
                    </div>
                    <div className="toggle-group">
                        <label className="toggle-label">
                            <input 
                                type="checkbox" 
                                checked={settings.maintenanceMode}
                                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                            />
                            <span>השבת את הטופס הציבורי (מצב תחזוקה)</span>
                        </label>
                    </div>
                </div>

                {/* Data Section */}
                <div className="settings-card glass-card">
                    <h3>📊 גיבוי וייצוא</h3>
                    <p>הורידי את כל בסיס הנתונים שלך לקובץ אקסל (CSV) לשימוש חיצוני או גיבוי.</p>
                    <button className="btn-secondary" style={{ marginTop: 'var(--space-md)', width: '100%' }} onClick={handleExportCSV}>
                        📥 ייצא את כל הלקוחות (CSV)
                    </button>
                </div>
            </div>

            <div className="settings-actions">
                {saveStatus && <span className="save-status-msg">{saveStatus}</span>}
                <button className="btn-primary save-settings-btn" onClick={handleSave}>שמור את כל השינויים</button>
            </div>
        </div>
    );
}

export default Settings;
