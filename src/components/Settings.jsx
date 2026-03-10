import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { exportClientsToCSV } from '../utils/exportUtils';

function Settings({ clients, session, profile, setProfile }) {
    const [settings, setSettings] = useState({
        businessName: '',
        slug: '',
        thankYouMessage: localStorage.getItem('crm_thank_you_msg') || 'הפרטים התקבלו בהצלחה ונחזור אליך בהקדם.',
        maintenanceMode: localStorage.getItem('crm_maintenance_mode') === 'true',
        // Profile Settings
        brandColor: '#ca8a04',
        businessDescription: '',
        customStatuses: ["חדש", "בטיפול", "נשלחה הצעת מחיר", "סגור"],
        dormancyDays: 3,
        notificationOn: true,
        notificationInApp: true,
        notificationPush: false,
        dailyDigest: false,
        aiUsageCount: 0,
        aiMonthlyLimit: 50
    });

    const [loading, setLoading] = useState(false);
    const [logoLoading, setLogoLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        if (profile) {
            setSettings(prev => ({
                ...prev,
                businessName: profile.business_name || '',
                slug: profile.slug || '',
                logoUrl: profile.settings?.logo_url || '',
                brandColor: profile.settings?.brand_color || '#ca8a04',
                businessDescription: profile.settings?.business_description || '',
                customStatuses: profile.settings?.custom_statuses || ["חדש", "בטיפול", "נשלחה הצעת מחיר", "סגור"],
                dormancyDays: profile.settings?.dormancy_days ?? 3,
                notificationOn: profile.settings?.notification_on ?? true,
                notificationInApp: profile.settings?.notification_in_app ?? true,
                notificationPush: profile.settings?.notification_push ?? false,
                dailyDigest: profile.settings?.daily_digest ?? false,
                aiUsageCount: profile.settings?.ai_usage_count || 0,
                aiMonthlyLimit: profile.settings?.ai_monthly_limit || 50
            }));
        }
    }, [profile]);

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLogoLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath);

            setSettings(prev => ({ ...prev, logoUrl: publicUrl }));
        } catch (err) {
            console.error(err);
            alert("העלאת הלוגו נכשלה: " + err.message);
        } finally {
            setLogoLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleStatusChange = (index, value) => {
        const newStatuses = [...settings.customStatuses];
        newStatuses[index] = value;
        setSettings(prev => ({ ...prev, customStatuses: newStatuses }));
    };

    const addStatus = () => {
        setSettings(prev => ({ ...prev, customStatuses: [...prev.customStatuses, 'סטטוס חדש'] }));
    };

    const removeStatus = (index) => {
        if (settings.customStatuses.length <= 1) return;
        const newStatuses = settings.customStatuses.filter((_, i) => i !== index);
        setSettings(prev => ({ ...prev, customStatuses: newStatuses }));
    };

    const handleSave = async () => {
        setLoading(true);
        setSaveStatus('');

        localStorage.setItem('crm_thank_you_msg', settings.thankYouMessage);
        localStorage.setItem('crm_maintenance_mode', settings.maintenanceMode.toString());

        try {
            const updatedProfile = {
                id: session.user.id,
                slug: settings.slug,
                business_name: settings.businessName,
                settings: {
                    logo_url: settings.logoUrl,
                    custom_statuses: settings.customStatuses,
                    brand_color: settings.brandColor,
                    business_description: settings.businessDescription,
                    dormancy_days: Number(settings.dormancyDays),
                    notification_on: settings.notificationOn,
                    notification_in_app: settings.notificationInApp,
                    notification_push: settings.notificationPush,
                    daily_digest: settings.dailyDigest,
                    ai_usage_count: settings.aiUsageCount,
                    ai_monthly_limit: settings.aiMonthlyLimit
                }
            };

            const { data, error } = await supabase
                .from('profiles')
                .upsert(updatedProfile)
                .select()
                .single();

            if (error) throw error;

            if (setProfile) setProfile(data);
            localStorage.setItem('crm_business_name', settings.businessName);
            
            setSaveStatus('ההגדרות נשמרו בהצלחה!');
            window.dispatchEvent(new Event('storage'));
        } catch (err) {
            console.error(err);
            alert("שגיאה בשמירת הפרופיל: " + err.message);
        } finally {
            setLoading(false);
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    const handleExportCSV = () => exportClientsToCSV(clients, 'CRM_Backup');

    const publicUrl = settings.slug ? `${window.location.origin}/join/${settings.slug}` : 'יש להגדיר מזהה עבור הקישור';

    return (
        <div className="settings-view">
            <div className="settings-header">
                <h2>⚙️ הגדרות המערכת</h2>
                <p>נהלי את המיתוג, הטפסים והנתונים של ה-CRM שלך</p>
            </div>

            <div className="settings-grid">
                {/* Branding Section */}
                <div className="settings-card glass-card">
                    <h3>🏷️ מיתוג וזהות</h3>
                    <div className="info-group">
                        <label>לוגו העסק</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                            <div className="logo-preview-box" style={{ width: '80px', height: '80px', border: '2px dashed hsla(220, 30%, 50%, 0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f8fafc' }}>
                                {settings.logoUrl ? (
                                    <img src={settings.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '5px' }} />
                                ) : (
                                    <span style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'center', fontWeight: 600 }}>אין לוגו</span>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleLogoUpload} 
                                    style={{ display: 'none' }} 
                                    id="logo-upload"
                                />
                                <label htmlFor="logo-upload" className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 15px', fontSize: '0.85rem' }}>
                                    {logoLoading ? '⌛ מעלה...' : '✨ העלה לוגו'}
                                </label>
                                {settings.logoUrl && (
                                    <button 
                                        className="btn-delete-row" 
                                        onClick={() => handleChange('logoUrl', '')}
                                        style={{ marginRight: '10px', fontSize: '0.8rem', color: '#ff4d4d' }}
                                    >
                                        הסר
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="info-group">
                        <label>שם העסק (מופיע בכותרות)</label>
                        <input 
                            type="text" 
                            className="glass-input" 
                            value={settings.businessName}
                            onChange={(e) => handleChange('businessName', e.target.value)}
                        />
                    </div>
                    <div className="info-group">
                        <label>תיאור העסק (מופיע בדף הלידים)</label>
                        <textarea 
                            className="glass-input" 
                            style={{ minHeight: '80px' }}
                            value={settings.businessDescription}
                            onChange={(e) => handleChange('businessDescription', e.target.value)}
                        />
                    </div>
                    <div className="info-group">
                        <label>צבע מיתוג (Brand Color)</label>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input 
                                type="color" 
                                value={settings.brandColor}
                                onChange={(e) => handleChange('brandColor', e.target.value)}
                                style={{ width: '50px', height: '40px', border: 'none', background: 'none', cursor: 'pointer' }}
                            />
                            <code>{settings.brandColor}</code>
                        </div>
                    </div>
                    <div className="info-group">
                        <label>מזהה URL עבור דף הלידים (Slug)</label>
                        <input 
                            type="text" 
                            className="glass-input" 
                            placeholder="مثلا: tal-shani"
                            value={settings.slug}
                            onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        />
                        <p className="helper-text">
                            הקישור שלך: <code style={{ color: settings.brandColor }}>{publicUrl}</code>
                        </p>
                    </div>
                </div>

                {/* Status Pipeline Section */}
                <div className="settings-card glass-card">
                    <h3>📊 ניהול שלבי עבודה (Pipeline)</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-secondary)', marginBottom: '10px' }}>
                        הגדירי את הסטטוסים שיופיעו בלוח ה-Kanban שלך.
                    </p>
                    <div className="status-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {settings.customStatuses.map((status, index) => (
                            <div key={index} style={{ display: 'flex', gap: '10px' }}>
                                <input 
                                    type="text" 
                                    className="glass-input" 
                                    value={status}
                                    onChange={(e) => handleStatusChange(index, e.target.value)}
                                />
                                <button 
                                    className="btn-delete-row" 
                                    onClick={() => removeStatus(index)}
                                    disabled={settings.customStatuses.length <= 1}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="btn-secondary" onClick={addStatus} style={{ marginTop: '10px' }}>
                        ➕ הוסף סטטוס חדש
                    </button>
                </div>

                {/* Lead Form Settings */}
                <div className="settings-card glass-card">
                    <h3>📝 הגדרות טופס</h3>
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
                            <span>השבת את הטופס הציבורי</span>
                        </label>
                    </div>

                    <div className="info-group" style={{ marginTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '20px' }}>
                        <label>הגדרת תרדמה ללידים (בימים)</label>
                        <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', marginBottom: '10px' }}>
                            אחרי כמה ימים ללא יצירת קשר תרצה שהמערכת תתריע שהליד רדום?
                        </p>
                        <input 
                            type="number" 
                            className="glass-input" 
                            value={settings.dormancyDays}
                            onChange={(e) => handleChange('dormancyDays', e.target.value)}
                            min="1"
                            max="365"
                        />
                    </div>
                </div>

                {/* Notifications & Alerts */}
                <div className="settings-card glass-card">
                    <h3>🔔 העדפות התראות</h3>
                    <div className="toggle-group" style={{ marginBottom: '15px' }}>
                        <label className="toggle-label" style={{ fontWeight: 600 }}>
                            <input 
                                type="checkbox" 
                                checked={settings.notificationOn}
                                onChange={(e) => handleChange('notificationOn', e.target.checked)}
                                style={{ transform: 'scale(1.2)' }}
                            />
                            <span>הפעל התראות על לידים רדומים במערכת</span>
                        </label>
                    </div>

                    {settings.notificationOn && (
                        <div style={{ paddingRight: '30px', borderRight: '2px solid rgba(0,0,0,0.05)', marginTop: '10px' }}>
                            <div className="toggle-group">
                                <label className="toggle-label">
                                    <input 
                                        type="checkbox" 
                                        checked={settings.notificationInApp}
                                        onChange={(e) => handleChange('notificationInApp', e.target.checked)}
                                    />
                                    <span>התראה בתוך המערכת (פעמון בדשבורד)</span>
                                </label>
                            </div>
                            <div className="toggle-group">
                                <label className="toggle-label">
                                    <input 
                                        type="checkbox" 
                                        checked={settings.notificationPush}
                                        onChange={(e) => {
                                            handleChange('notificationPush', e.target.checked);
                                            // Request permission if checking
                                            if (e.target.checked && Notification.permission !== "granted") {
                                                Notification.requestPermission();
                                            }
                                        }}
                                    />
                                    <span>התראת דפדפן (Browser Push)</span>
                                </label>
                            </div>
                            <div className="toggle-group" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                <label className="toggle-label" style={{ color: '#0f172a' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={settings.dailyDigest}
                                        onChange={(e) => handleChange('dailyDigest', e.target.checked)}
                                    />
                                    <span>קבל סיכום יומי בלבד בלוח הבקרה (משתיק התראות קופצות)</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Usage Section */}
                <div className="settings-card glass-card">
                    <h3>✨ שימוש ב-AI (ניסוח חכם)</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-secondary)', marginBottom: '15px' }}>
                        סטטוס ניצול מכסת ה-AI שלך ליצירת הודעות וואטסאפ חכמות.
                    </p>
                    <div className="ai-usage-meter" style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                            <span>נוצלו {settings.aiUsageCount} מתוך {settings.aiMonthlyLimit} הודעות</span>
                            <span>{Math.round((settings.aiUsageCount / settings.aiMonthlyLimit) * 100)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ 
                                width: `${Math.min((settings.aiUsageCount / settings.aiMonthlyLimit) * 100, 100)}%`, 
                                height: '100%', 
                                background: 'linear-gradient(90deg, #f59e0b, #d946ef)', 
                                borderRadius: '10px' 
                            }}></div>
                        </div>
                    </div>
                    <p className="helper-text" style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                        המכסה מתאפסת בכל 1 לחודש. במידה ונגמרה המכסה, ניתן לפנות למנהל המערכת להגדלה.
                    </p>
                </div>

                {/* Account & Data */}
                <div className="settings-card glass-card">
                    <h3>👤 חשבון ונתונים</h3>
                    <button className="btn-secondary" style={{ width: '100%', marginBottom: '10px' }} onClick={handleExportCSV}>
                        📥 ייצא לקוחות (CSV)
                    </button>
                    <button className="btn-secondary" style={{ width: '100%' }} onClick={() => alert("בקרוב...")}>
                        🔐 שינוי סיסמה
                    </button>
                </div>
            </div>

            <div className="settings-actions">
                {saveStatus && <span className="save-status-msg">{saveStatus}</span>}
                <button className="btn-primary" onClick={handleSave} disabled={loading} style={{ backgroundColor: settings.brandColor }}>
                    {loading ? "שומר..." : "שמור שינויים"}
                </button>
            </div>
        </div>
    );
}

export default Settings;
