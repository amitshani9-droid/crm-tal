import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { User, Phone, Mail, Building2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './PublicLeadForm.css';

export default function PublicLeadForm() {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    
    const [profile, setProfile] = useState({
        userId: searchParams.get('u'),
        businessName: "CRM System",
        loading: true,
        error: null,
        settings: {
            brand_color: '#4e5df0',
            business_description: 'ברוכים הבאים לדף הנחיתה שלנו.',
            custom_statuses: ["חדש"]
        }
    });

    const [formData, setFormData] = useState({ contact: '', phone: '', email: '', company: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const resolveSlug = async () => {
            let query = supabase.from('profiles').select('id, business_name, settings');
            
            if (slug) {
                query = query.eq('slug', slug);
            } else if (searchParams.get('u')) {
                query = query.eq('id', searchParams.get('u'));
            } else {
                setProfile(prev => ({ ...prev, loading: false }));
                return;
            }

            try {
                const { data, error } = await query.single();
                if (error || !data) throw new Error("Link invalid");

                setProfile({
                    userId: data.id,
                    businessName: data.business_name || "עסק ללא שם",
                    loading: false,
                    error: null,
                    settings: {
                        ...profile.settings,
                        ...data.settings
                    }
                });
            } catch (err) {
                console.error("Resolution failed:", err.message);
                setProfile(prev => ({ ...prev, loading: false, error: "קישור לא תקין" }));
            }
        };

        resolveSlug();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug, searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const onlyNums = value.replace(/[^\d]/g, '');
            setFormData(prev => ({ ...prev, [name]: onlyNums }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!profile.userId) return alert("שגיאה בקישור.");
        
        if (formData.phone.length < 9) {
            alert("נא להזין מספר טלפון חוקי בן 9-10 ספרות.");
            return;
        }

        setIsLoading(true);

        const newLead = {
            user_id: profile.userId,
            contact: formData.contact,
            phone: formData.phone.replace("'", ""),
            email: formData.email,
            company: formData.company,
            history: `ליד חדש מדף הנחיתה (${slug || 'ID-based'})`,
            status: profile.settings.custom_statuses?.[0] || "חדש"
        };

        try {
            const { error } = await supabase.from('clients').insert([newLead]);
            if (error) throw error;
            setIsSubmitted(true);
        } catch (err) {
            console.error("Submission error:", err);
            alert("שגיאה בשליחה.");
        } finally {
            setIsLoading(false);
        }
    };

    if (profile.loading) return <div className="public-form-wrapper"><div className="placeholder-view">טוען...</div></div>;
    if (profile.error) return <div className="public-form-wrapper"><h2 className="error-text">קישור לא תקין</h2></div>;
    if (isSubmitted) return (
        <div className="public-form-wrapper" style={{ '--brand-color': profile.settings.brand_color || '#d97706' }}>
            <div className="success-glass-card">
                <div className="success-icon-wrap">
                    <CheckCircle size={80} strokeWidth={1.5} />
                </div>
                <h2>תודה יקיריי!</h2>
                <p>הפרטים נשלחו בהצלחה ל-{profile.businessName}.<br/>ניצור קשר בהקדם.</p>
            </div>
        </div>
    );

    const brandColor = profile.settings.brand_color || '#d97706';
    const logoUrl = profile.settings.logo_url;

    return (
        <div className="public-form-wrapper" style={{ '--brand-color': brandColor }}>
            <div className="public-split-card glassmorphism">
                {/* Premium Stone & Gold Business Side (Replaces any old duplicate headers) */}
                <div className="premium-business-side">
                    <div className="stone-gold-bg-effect"></div>
                    <div className="branding-header">
                        {logoUrl && (
                            <img src={logoUrl} alt="Logo" className="business-logo" />
                        )}
                        <span className="business-name" style={{ color: brandColor }}>{profile.businessName}</span>
                    </div>
                    
                    <div className="marketing-text">
                        <h1>השאירו פרטים ונחזור אליכם</h1>
                        <p>{profile.settings.business_description}</p>
                    </div>
                </div>

                {/* Lead Form Side */}
                <div className="lead-form-side">
                    <form onSubmit={handleSubmit} className="public-lead-form">
                        <div className="input-with-icon">
                            <input name="contact" required placeholder="שם מלא *" value={formData.contact} onChange={handleChange} />
                            <User className="input-icon-lucide" size={20} />
                        </div>
                        <div className="input-with-icon">
                            <input type="tel" name="phone" required placeholder="טלפון פנייה *" value={formData.phone} onChange={handleChange} dir="rtl" />
                            <Phone className="input-icon-lucide" size={20} />
                        </div>
                        <div className="input-with-icon">
                            <input type="email" name="email" placeholder="אימייל (אופציונלי)" value={formData.email} onChange={handleChange} />
                            <Mail className="input-icon-lucide" size={20} />
                        </div>
                        <div className="input-with-icon">
                            <input name="company" placeholder="שם החברה (אופציונלי)" value={formData.company} onChange={handleChange} />
                            <Building2 className="input-icon-lucide" size={20} />
                        </div>
                        
                        <button type="submit" className="submit-btn gold-btn" disabled={isLoading || formData.phone.length < 9}>
                            {isLoading ? "שולח..." : "שלח פרטים"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
