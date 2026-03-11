import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { uploadFileToStorage } from '../utils/storageUtils';
import './SetupWizard.css';

const SetupWizard = ({ session, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: '',
    slug: '',
    brandColor: '#4e5df0',
    logoUrl: '',
    customStatuses: ["חדש", "בטיפול", "נשלחה הצעת מחיר", "סגור"],
    businessDescription: ''
  });

  const handleSlugGen = (name) => {
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u0590-\u05FF-]/g, '');
    setFormData(prev => ({ ...prev, businessName: name, slug: slug }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogoLoading(true);
    try {
      const publicUrl = await uploadFileToStorage(file, 'logos', session.user.id);
      setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
    } catch (err) {
      console.error("Logo upload failed:", err);
      alert("העלאת הלוגו נכשלה.");
    } finally {
      setLogoLoading(false);
    }
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      const profileData = {
        id: session.user.id,
        business_name: formData.businessName,
        slug: formData.slug,
        settings: {
          brand_color: formData.brandColor,
          logo_url: formData.logoUrl,
          custom_statuses: formData.customStatuses,
          business_description: formData.businessDescription
        }
      };

      const { error } = await supabase.from('profiles').upsert(profileData);
      if (error) throw error;
      
      onComplete(); // Refresh parent session/profile
    } catch (err) {
      console.error("Profile setup failed:", err);
      alert("שגיאה בשמירת הפרופיל.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-wizard-overlay" dir="rtl">
      <div className="setup-wizard-card glass-card">
        <div className="wizard-progress">
          <div className={`progress-dot ${step >= 1 ? 'active' : ''}`}></div>
          <div className={`progress-dot ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-dot ${step >= 3 ? 'active' : ''}`}></div>
        </div>

        {step === 1 && (
          <div className="wizard-step">
            <h2>ברוכים הבאים! <br />איך קוראים לעסק שלכם?</h2>
            <p>השם הזה יופיע בכותרת המערכת ובדף הלידים שלכם.</p>
            <input 
              type="text" 
              placeholder="למשל: עסק האופנה שלי" 
              className="glass-input-large"
              value={formData.businessName}
              onChange={(e) => handleSlugGen(e.target.value)}
            />
            <div className="slug-preview" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
              <span>הקישור שלכם יהיה:</span>
              <span dir="ltr" style={{ fontWeight: 'bold', color: 'var(--clr-primary)' }}>as-crm.vercel.app/טופס/{decodeURIComponent(formData.slug) || 'שם-העסק'}</span>
            </div>
            <button className="btn-primary btn-large" disabled={!formData.businessName} onClick={() => setStep(2)}>
              ממשיכים לעיצוב ➔
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-step">
            <h2>בואו נכניס קצת צבע ✨</h2>
            <p>בחרו צבע שמתאים למותג שלכם והעלו לוגו.</p>
            
            <div className="branding-setup">
              <div className="color-picker-box">
                <label>צבע מיתוג</label>
                <input type="color" value={formData.brandColor} onChange={(e) => setFormData(prev => ({ ...prev, brandColor: e.target.value }))} />
              </div>
              
              <div className="logo-upload-box">
                <label>לוגו העסק</label>
                <div className="logo-preview-wizard">
                   {formData.logoUrl ? <img src={formData.logoUrl} alt="Logo" /> : <span>העלו לוגו</span>}
                </div>
                <input type="file" id="logo-up" hidden onChange={handleLogoUpload} />
                <label htmlFor="logo-up" className="btn-secondary">{logoLoading ? 'מעלה...' : 'בחר קובץ'}</label>
              </div>
            </div>

            <button className="btn-primary btn-large" onClick={() => setStep(3)}>
              כמעט סיימנו ➔
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-step">
            <h2>לסיום, הגדירו את התהליך</h2>
            <p>מהם הסטטוסים שהליבה של העסק שלכם עוברת?</p>
            <div className="status-grid-wizard">
              {formData.customStatuses.map((s, i) => (
                <div key={i} className="status-item-wizard">
                  <input 
                    value={s} 
                    onChange={(e) => {
                      const newS = [...formData.customStatuses];
                      newS[i] = e.target.value;
                      setFormData(prev => ({ ...prev, customStatuses: newS }));
                    }}
                  />
                </div>
              ))}
            </div>
            <button className="btn-primary btn-large" disabled={loading} onClick={handleFinalize}>
              {loading ? 'מקים את המערכת...' : 'סיימנו! בואו נתחיל 🚀'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupWizard;
