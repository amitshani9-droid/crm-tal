import React, { useState } from 'react';

function LeadForm({ SHEETDB_URL, onBack }) {
    const [formData, setFormData] = useState({
        contact: "",
        phone: "",
        company: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newLead = {
            id: String(Date.now()),
            status: "חדש",
            contact: formData.contact,
            phone: `'${formData.phone}`,
            company: formData.company,
            email: "",
            role: "",
            history: "הגיע דרך טופס לידים מהיר חיצוני",
            nextCall: "",
            documents: [],
            avatarIndex: Math.floor(Math.random() * 3) + 1
        };

        try {
            await fetch(SHEETDB_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: [newLead] })
            });

            setIsSuccess(true);
            setFormData({ contact: "", phone: "", company: "" });
        } catch (error) {
            console.error("Error submitting lead:", error);
            alert("הייתה שגיאה בשליחת הטופס. נסה שוב.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="lead-form-wrapper">
                <div className="glass-card lead-card success-card">
                    <h2>🎉 תודה רבה איש יקר!</h2>
                    <p>הפרטים שלך נקלטו בהצלחה. אנחנו נחזור אליך בהקדם.</p>
                    <button className="btn-primary" style={{ marginTop: 'var(--space-md)' }} onClick={() => setIsSuccess(false)}>בחזרה למילוי נוסף</button>
                    {onBack && <button className="btn-secondary" style={{ marginTop: 'var(--space-sm)' }} onClick={onBack}>חזור למערכת</button>}
                </div>
            </div>
        );
    }

    return (
        <div className="lead-form-wrapper">
            <div className="glass-card lead-card">
                <h2>השאר פרטים לחזרה</h2>
                <p className="lead-subtitle">הכנס פרטים למערכת ה-CRM החדשה</p>
                <form onSubmit={handleSubmit} className="lead-form">
                    <div className="info-group">
                        <label>שם מלא</label>
                        <input
                            type="text"
                            name="contact"
                            className="glass-input"
                            value={formData.contact}
                            onChange={handleChange}
                            required
                            placeholder="הזן שם..."
                        />
                    </div>
                    <div className="info-group">
                        <label>טלפון</label>
                        <input
                            type="tel"
                            name="phone"
                            className="glass-input"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="הזן מס' טלפון..."
                        />
                    </div>
                    <div className="info-group">
                        <label>חברה / ארגון</label>
                        <input
                            type="text"
                            name="company"
                            className="glass-input"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="שם החברה (לא חובה)..."
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? "שולח נתונים..." : "שלח פרטים"}
                    </button>
                </form>
                {onBack && <button className="btn-secondary back-btn" onClick={onBack}>חזור למערכת</button>}
            </div>
        </div>
    );
}

export default LeadForm;
