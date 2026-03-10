import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
    Building2, 
    Image as ImageIcon, 
    Sparkles, 
    Users, 
    Upload, 
    Check, 
    ChevronLeft, 
    ChevronRight,
    X,
    Loader2
} from 'lucide-react';
import CSVImportModal from './CSVImportModal';
import './OnboardingWizard.css';

const OnboardingWizard = ({ profile, session, onComplete, onSkip }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [logoLoading, setLogoLoading] = useState(false);
    const [showCSVModal, setShowCSVModal] = useState(false);
    const [importSuccessMsg, setImportSuccessMsg] = useState('');
    
    const [formData, setFormData] = useState({
        businessName: profile?.business_name || '',
        logoUrl: profile?.settings?.logo_url || '',
        businessDescription: profile?.settings?.business_description || '',
    });

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLogoLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
        } catch (err) {
            console.error(err);
            alert("העלאת הלוגו נכשלה");
        } finally {
            setLogoLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const updatedSettings = {
                ...(profile?.settings || {}),
                logo_url: formData.logoUrl,
                business_description: formData.businessDescription,
            };

            const { error } = await supabase
                .from('profiles')
                .update({
                    business_name: formData.businessName,
                    settings: updatedSettings
                })
                .eq('id', session.user.id);

            if (error) throw error;
            
            onComplete(); 
        } catch (err) {
            console.error(err);
            alert("שגיאה בשמירת הנתונים");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'מיתוג', icon: <Building2 size={20} /> },
        { id: 2, title: 'למידת AI', icon: <Sparkles size={20} /> },
        { id: 3, title: 'נתונים', icon: <Users size={20} /> }
    ];

    const containerVariants = {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 }
    };

    const stepVariants = {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
    };

    return (
        <div className="onboarding-overlay">
            <motion.div 
                className="onboarding-card"
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <button 
                    className="close-wizard-btn"
                    onClick={onSkip}
                    title="סגירה ודילוג"
                >
                    <X size={20} />
                </button>

                {/* Header / Progress */}
                <div className="onboarding-header">
                    <div className="progress-container">
                        {steps.map((s, idx) => (
                            <React.Fragment key={s.id}>
                                <div className={`step-item ${step >= s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}>
                                    <div className="step-icon">
                                        {step > s.id ? <Check size={16} /> : s.icon}
                                    </div>
                                    <span className="step-label">{s.title}</span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`step-connector ${step > s.id ? 'active' : ''}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="onboarding-body">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                variants={stepVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="wizard-step-content"
                            >
                                <div className="step-title-group">
                                    <h2>בואו נכיר את העסק ✨</h2>
                                    <p>הצעד הראשון בדרך למערכת מותאמת אישית עבורכם.</p>
                                </div>

                                <div className="form-group-wizard">
                                    <label>שם העסק</label>
                                    <input 
                                        type="text" 
                                        placeholder="למשל: סטודיו לצילום טל"
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                        className="wizard-input"
                                    />
                                </div>

                                <div className="form-group-wizard">
                                    <label>לוגו העסק</label>
                                    <div className="logo-upload-wrapper">
                                        <div className="logo-preview-wizard-large">
                                            {formData.logoUrl ? (
                                                <img src={formData.logoUrl} alt="Business Logo" />
                                            ) : (
                                                <div className="logo-placeholder">
                                                    <ImageIcon size={40} />
                                                </div>
                                            )}
                                            {logoLoading && (
                                                <div className="logo-loading-overlay">
                                                    <Loader2 className="animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="upload-controls">
                                            <input 
                                                type="file" 
                                                id="onboarding-logo" 
                                                hidden 
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                            />
                                            <label htmlFor="onboarding-logo" className="btn-wizard-secondary">
                                                <Upload size={18} />
                                                <span>העלאת לוגו</span>
                                            </label>
                                            <p className="upload-hint">מומלץ קובץ PNG או JPG שקוף</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                variants={stepVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="wizard-step-content"
                            >
                                <div className="step-title-group">
                                    <h2>אימון ה-AI שלכם 🤖</h2>
                                    <p>ספרו ל-AI על העסק שלכם כדי שהוא ידע לכתוב בשמכם.</p>
                                </div>

                                <div className="form-group-wizard">
                                    <label>תיאור העסק</label>
                                    <textarea 
                                        placeholder="למשל: סטודיו לפילאטיס מכשירים המתמחה בשיקום וחיזוק..."
                                        value={formData.businessDescription}
                                        onChange={(e) => setFormData({...formData, businessDescription: e.target.value})}
                                        className="wizard-textarea"
                                    />
                                    <div className="wizard-hint">
                                        <Sparkles size={14} />
                                        <span>כאן כותבים מה העסק עושה (סגנון, שירותים, קהל יעד) כדי שה-AI ידע לנסח הודעות מושלמות.</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                variants={stepVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="wizard-step-content"
                            >
                                <div className="step-title-group">
                                    <h2>העברת נתונים 📂</h2>
                                    <p>בואו נכניס את הלקוחות שלכם למערכת.</p>
                                </div>

                                <div className="import-action-card">
                                    <div className="import-icon-box">
                                        <Users size={32} />
                                    </div>
                                    <div className="import-text">
                                        <h3>העלאת לקוחות קיימים</h3>
                                        <p>גררו לכאן קובץ אקסל או CSV כדי להתחיל לעבוד מיד.</p>
                                    </div>
                                    <button 
                                        className="btn-wizard-primary"
                                        onClick={() => setShowCSVModal(true)}
                                    >
                                        <Upload size={18} />
                                        <span>העלו קובץ עכשיו</span>
                                    </button>
                                </div>
                                {importSuccessMsg && (
                                    <div className="import-success-toast">
                                        <Check size={16} />
                                        <span>{importSuccessMsg}</span>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="onboarding-footer">
                    {step > 1 && (
                        <button 
                            className="btn-wizard-ghost" 
                            onClick={() => setStep(step - 1)}
                            disabled={loading}
                        >
                            <ChevronRight size={18} />
                            <span>חזרה</span>
                        </button>
                    )}

                    <button 
                        className="btn-wizard-ghost"
                        onClick={onSkip}
                    >
                        דלג לעת עתה
                    </button>
                    
                    <div className="footer-spacer" />

                    {step < 3 ? (
                        <button 
                            className="btn-wizard-primary"
                            onClick={() => setStep(step + 1)}
                        >
                            <span>המשך</span>
                            <ChevronLeft size={18} />
                        </button>
                    ) : (
                        <button 
                            className="btn-wizard-primary pulse"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Check size={18} />}
                            <span>סיום והפעלה</span>
                        </button>
                    )}
                </div>
            </motion.div>

            <CSVImportModal 
                isOpen={showCSVModal}
                onClose={() => setShowCSVModal(false)}
                sessionId={session?.user?.id}
                brandColor="#ca8a04"
                onImportComplete={(msg) => setImportSuccessMsg(msg)}
            />
        </div>
    );
};

export default OnboardingWizard;
