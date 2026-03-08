import React, { useState } from 'react';
import './PublicLeadForm.css';

const SHEETDB_URL = "https://sheetdb.io/api/v1/y933qp6w0yxj9";

export default function PublicLeadForm() {
    const [formData, setFormData] = useState({
        contact: '',
        phone: '',
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

        const payload = {
            id: Date.now(),
            ...formData,
            status: 'חדש' // Automatically set to new lead status
        };

        try {
            const response = await fetch(SHEETDB_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: [payload] })
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

    if (isSubmitted) {
        return (
            <div className="public-form-container">
                <div className="glass-card success-card">
                    <div className="success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <h2>תודה!</h2>
                    <p>הפרטים התקבלו בהצלחה ונחזור אליך בהקדם.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="public-form-container">
            <div className="glass-card public-form-card">
                <div className="public-form-header">
                    <h1>הצטרפו אלינו</h1>
                    <p>מלאו את הפרטים ונחזור אליכם בהקדם</p>
                </div>

                <form onSubmit={handleSubmit} className="public-lead-form">
                    <div className="form-group">
                        <label>איש קשר *</label>
                        <input
                            type="text"
                            name="contact"
                            required
                            placeholder="ישראל ישראלי"
                            value={formData.contact}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>טלפון *</label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            placeholder="050-0000000"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>חברה</label>
                        <input
                            type="text"
                            name="company"
                            placeholder="שם החברה"
                            value={formData.company}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="btn-primary submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            <span className="spin-animation">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="2" x2="12" y2="6"></line>
                                    <line x1="12" y1="18" x2="12" y2="22"></line>
                                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                                    <line x1="2" y1="12" x2="6" y2="12"></line>
                                    <line x1="18" y1="12" x2="22" y2="12"></line>
                                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                                </svg>
                            </span>
                        ) : "שליחה"}
                    </button>
                </form>
            </div>
        </div>
    );
}
