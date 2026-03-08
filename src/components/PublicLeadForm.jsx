import React, { useState } from 'react';
import './PublicLeadForm.css';

const SHEETDB_URL = "https://sheetdb.io/api/v1/y933qp6w0yxj9";

export default function PublicLeadForm() {
    // Dynamic Settings: Allow override via Dashboard, else use defaults
    const isMaintenance = localStorage.getItem('crm_maintenance_mode') === 'true';
    const thankYouMsg = localStorage.getItem('crm_thank_you_msg') || 'תודה! הפנייה התקבלו. נחזור אליכם קרוב ליצירת חוויה משותפת.';
    const savedBusinessName = localStorage.getItem('crm_business_name');
    
    // Core Branding (Fixed per request)
    const brandingTitle = "טל שני | חוויות שמחברות אנשים";
    const mainHeadline = "חוויות עם ערך שמחברות אנשים";
    const description = "סטייל, תוכן וערך חברתי שנשאר הרבה אחרי שהאירוע נגמר. אני יוצרת חוויות לארגונים שמחפשים יותר מעוד אירוע – ימים שמחברים בין אנשים, צוותים ותחושת משמעות.";
    const buttonText = "בואו נחבר את האנשים שלכם";

    const [formData, setFormData] = useState({
        contact: '',
        phone: '',
        email: '',
        company: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const leadData = {
            id: Date.now().toString(),
            contact: formData.contact,          // Matching column B (contact)
            phone: `'${formData.phone}`,       // Preserve leading zero
            email: formData.email,             // Column D
            company: formData.company || "",   // Column E
            status: "חדש",                     // Column H (Essential for pipeline)
            history: "ליד חדש מהאתר",           // Column F
            nextCall: "",                      // Column G
            avatarIndex: Math.floor(Math.random() * 4) + 1
        };

        try {
            const response = await fetch(SHEETDB_URL, {
                method: 'POST',
                headers: { 
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ data: [leadData] })
            });

            if (response.ok || response.status === 201) {
                setIsSubmitted(true);
            } else {
                alert('אירעה שגיאה בשליחת הטופס. אנא נסה שנית.');
            }
        } catch (err) {
            console.error("Submission Error", err);
            alert('אירעה שגיאה בשליחת הטופס. אנא נסה שנית.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * SUCCESS VIEW
     */
    if (isSubmitted) {
        return (
            <div className="public-form-container">
                <div className="public-form-card success-card">
                    <div className="success-icon">✨</div>
                    <h2>נשלח בהצלחה!</h2>
                    <p>{thankYouMsg}</p>
                </div>
            </div>
        );
    }

    /**
     * MAINTENANCE VIEW
     */
    if (isMaintenance) {
        return (
            <div className="public-form-container">
                <div className="public-form-card maintenance-card">
                    <div className="success-icon">⚙️</div>
                    <h2>מבצעים תחזוקה</h2>
                    <p>הטופס אינו פעיל זמנית. נחזור בקרוב מאוד!</p>
                </div>
            </div>
        );
    }

    /**
     * MAIN LANDING PAGE VIEW
     */
    return (
        <div className="public-form-container">
            <div className="public-form-card">
                {/* Branding & Marketing */}
                <div className="branding-header">
                    <span>{brandingTitle}</span>
                </div>
                
                <div className="marketing-text">
                    <h1>{mainHeadline}</h1>
                    <p>{description}</p>
                </div>

                {/* Modern Form Wrapper */}
                <form onSubmit={handleSubmit} className="public-lead-form">
                    <div className="form-group">
                        <label>שם מלא *</label>
                        <div className="input-with-icon">
                            <input
                                type="text"
                                name="contact"
                                required
                                placeholder="ישראל ישראלי"
                                value={formData.contact}
                                onChange={handleChange}
                            />
                            <span className="input-icon">👤</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>טלפון *</label>
                        <div className="input-with-icon">
                            <input
                                type="tel"
                                name="phone"
                                required
                                placeholder="050-0000000"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            <span className="input-icon">📱</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>אימייל *</label>
                        <div className="input-with-icon">
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <span className="input-icon">✉️</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>שם החברה / הארגון *</label>
                        <div className="input-with-icon">
                            <input
                                type="text"
                                name="company"
                                required
                                placeholder="שם החברה..."
                                value={formData.company}
                                onChange={handleChange}
                            />
                            <span className="input-icon">🏢</span>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            <span className="spin-animation">◌</span>
                        ) : buttonText}
                    </button>
                </form>
            </div>
        </div>
    );
}
