import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProAnalytics } from '../components/dashboard/ProAnalytics';
import { BarChart2, Download, RefreshCw } from 'lucide-react';
import { useClientsContext } from '../contexts/ClientsContext';

function Analytics() {
    const { businessName } = useAuth();
    const { refreshData } = useClientsContext();

    return (
        <div className="analytics-page-container" style={{ padding: '24px' }}>
            {/* Header Area */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '32px',
                background: 'var(--clr-surface)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid var(--clr-glass-border)'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <BarChart2 size={32} color="var(--clr-primary)" /> דוח ביצועים ואנליטיקה
                    </h1>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>
                        סקירה מעמיקה של הפעילות העסקית עבור <strong>{businessName}</strong>
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" onClick={refreshData} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RefreshCw size={18} /> רענן נתונים
                    </button>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={18} /> ייצוא דוח PDF
                    </button>
                </div>
            </div>

            {/* Main Analytics Content */}
            <ProAnalytics />

            {/* Additional Insights Section */}
            <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h5 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>תובנות AI של המערכת</h5>
                    <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6', color: '#475569' }}>
                            מנתוני החודש האחרון עולה כי קצב סגירת העסקאות עלה ב-15% לעומת החודש הקודם. 
                            השלב של "בטיפול" הוא צוואר הבקבוק המרכזי שלך כרגע - כדאי להקצות יותר זמן לשיחות המשך ללידים בשלב זה.
                        </p>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                    <h5 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>פעילות לידים לפי שעות</h5>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>רוב הלידים שלכם נכנסים בין השעות 10:00 ל-14:00. מומלץ להיות זמינים למענה מיידי בשעות אלו.</p>
                    <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                        {[40, 60, 45, 90, 100, 80, 50, 30, 20, 15, 10].map((h, i) => (
                            <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--clr-primary)', opacity: 0.3, borderRadius: '2px' }}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Analytics;
