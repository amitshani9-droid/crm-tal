import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePipeline } from '../hooks/usePipeline';
import { useClientsContext } from '../contexts/ClientsContext';
import { exportClientsToCSV } from '../utils/exportUtils';
import { uploadFileToStorage } from '../utils/storageUtils';
import { profilesService } from '../services/profilesService';
import { Trash2, Plus, LogOut, Download, Save, Camera } from 'lucide-react';

function Settings() {
    const { clients = [] } = useClientsContext();
    const { session, profile, fetchProfile } = useAuth();
    const { stages, saveStages, deleteStage, isProcessing } = usePipeline();
    
    const [localStages, setLocalStages] = useState([]);
    const [settings, setSettings] = useState({
        businessName: '',
        slug: '',
        logoUrl: '',
        brandColor: '#ca8a04',
        businessDescription: '',
        dormancyDays: 3,
        notificationOn: true
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
                dormancyDays: profile.settings?.dormancy_days ?? 3,
                notificationOn: profile.settings?.notification_on ?? true
            }));
        }
        if (stages) setLocalStages(stages);
    }, [profile, stages]);

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setLogoLoading(true);
        try {
            const publicUrl = await uploadFileToStorage(file, 'logos', session.user.id);
            setSettings(prev => ({ ...prev, logoUrl: publicUrl }));
        } catch (err) {
            alert("העלאת הלוגו נכשלה: " + err.message);
        } finally {
            setLogoLoading(false);
        }
    };

    const handleStageChange = (id, field, value) => {
        setLocalStages(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const addStage = () => {
        const newStage = {
            id: `temp_${Date.now()}`,
            name: 'סטטוס חדש',
            color: '#3b82f6',
            position: localStages.length + 1,
            user_id: session.user.id
        };
        setLocalStages(prev => [...prev, newStage]);
    };

    const removeLocalStage = async (id) => {
        if (localStages.length <= 1) return;
        if (String(id).startsWith('temp_')) {
            setLocalStages(prev => prev.filter(s => s.id !== id));
            return;
        }
        if (window.confirm("מחיקת סטטוס עלולה להשפיע על לקוחות המשויכים אליו. האם המשך?")) {
            await deleteStage(id);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setSaveStatus('');
        try {
            const updatedProfile = {
                id: session.user.id,
                slug: settings.slug,
                business_name: settings.businessName,
                settings: {
                    ...profile.settings,
                    logo_url: settings.logoUrl,
                    brand_color: settings.brandColor,
                    business_description: settings.businessDescription,
                    dormancy_days: Number(settings.dormancyDays),
                    notification_on: settings.notificationOn
                }
            };
            await profilesService.updateProfile(updatedProfile);

            const stagesToUpload = localStages.map(({ id, ...rest }, index) => {
                const stage = { ...rest, position: index + 1, user_id: session.user.id };
                if (!String(id).startsWith('temp_')) stage.id = id;
                return stage;
            });
            await saveStages(stagesToUpload);

            if (fetchProfile) fetchProfile(session.user.id);
            setSaveStatus('ההגדרות נשמרו בהצלחה!');
        } catch (err) {
            alert("שגיאה בשמירה: " + err.message);
        } finally {
            setLoading(false);
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    return (
        <div className="settings-view">
            <div className="settings-header">
                <h2>⚙️ הגדרות המערכת</h2>
                <p>ניהול המיתוג והתהליכים של העסק שלך</p>
            </div>

            <div className="settings-grid">
                <div className="settings-card glass-card">
                    <h3>🏷️ מיתוג וזהות</h3>
                    <div className="info-group">
                        <label>לוגו העסק</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div className="logo-preview-box">
                                {settings.logoUrl ? <img src={settings.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span>אין לוגו</span>}
                            </div>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} id="logo-upload" style={{ display: 'none' }} />
                            <label htmlFor="logo-upload" className="btn-secondary">
                                {logoLoading ? 'מעלה...' : <><Camera size={16} /> העלה לוגו</>}
                            </label>
                        </div>
                    </div>
                    <div className="info-group">
                        <label>שם העסק</label>
                        <input type="text" className="glass-input" value={settings.businessName} onChange={e => setSettings({...settings, businessName: e.target.value})} />
                    </div>
                </div>

                <div className="settings-card glass-card">
                    <h3>📊 שלבי עבודה</h3>
                    <div className="status-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {localStages.map((stage) => (
                            <div key={stage.id} style={{ display: 'flex', gap: '10px' }}>
                                <input type="color" value={stage.color || '#3b82f6'} onChange={e => handleStageChange(stage.id, 'color', e.target.value)} style={{ width: '40px', padding: 0, height: '40px', border: 'none' }} />
                                <input type="text" className="glass-input" value={stage.name} onChange={e => handleStageChange(stage.id, 'name', e.target.value)} style={{ flex: 1 }} />
                                <button className="btn-delete-row" onClick={() => removeLocalStage(stage.id)}><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                    <button className="btn-secondary" onClick={addStage} style={{ marginTop: '10px' }}>
                        <Plus size={16} /> הוסף שלב
                    </button>
                </div>

                <div className="settings-card glass-card">
                    <h3>📥 נתונים</h3>
                    <button className="btn-secondary" onClick={() => exportClientsToCSV(clients, 'CRM_Backup')}>
                        <Download size={16} /> ייצא לקוחות (CSV)
                    </button>
                </div>
            </div>

            <div className="settings-actions">
                {saveStatus && <span className="save-status-msg">{saveStatus}</span>}
                <button className="btn-primary" onClick={handleSave} disabled={loading || isProcessing}>
                    <Save size={18} /> {loading ? "שומר..." : "שמור שינויים"}
                </button>
            </div>
        </div>
    );
}

export default Settings;
