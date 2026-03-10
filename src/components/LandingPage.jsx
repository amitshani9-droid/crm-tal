import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, BellRing, MessageCircle, LayoutTemplate, ShieldCheck, Zap, Star, Table } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import FloatingWhatsApp from './FloatingWhatsApp';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartFree = () => {
    navigate('/signup');
  };

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="logo">AS-<span>CRM</span></div>
        <div className="nav-actions">
          <button className="btn-login" onClick={() => navigate('/login')}>כניסת רשומים</button>
        </div>
      </nav>

      <main className="landing-main">
        {/* HERO SECTION */}
        <section className="hero-section">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            תתחילו לנהל את העסק כמו מקצוענים<br />
            <span className="text-gold">חודש ראשון בחינם!</span>
          </motion.h1>
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            בלי התחייבות ובלי אותיות קטנות. אנחנו נעשה לכם סדר בלקוחות המפוזרים, נפעיל לכם את ה-AI, וניתן לכם חודש שלם לראות איך העסק שלכם צומח.
          </motion.p>
          <motion.button 
            className="hero-cta" 
            onClick={handleStartFree}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            התחילו חודש חינם
          </motion.button>
        </section>

        {/* PROBLEM SECTION */}
        <motion.section className="problem-section" {...fadeIn}>
          <div className="problem-content">
            <span className="problem-tag">הבעיה הקריטית</span>
            <h2>הלקוחות שלך מפוזרים בין קבוצות וואטסאפ, מיילים ואקסלים ישנים?</h2>
            <p>
              מידע מבוזר הוא מידע אבוד. כשפרטי הלקוחות שלך מפוזרים ב"פתקאות" דיגיטליות, 
              בלתי אפשרי לנהל מעקב מקצועי, והכסף פשוט נשאר על הרצפה.
              <strong> עשינו סדר בלוח האירועים שלכם.</strong>
            </p>
          </div>
        </motion.section>

        {/* BENTO GRID FEATURES */}
        <section className="bento-section">
          <div className="bento-grid">
            <motion.div className="bento-card large" {...fadeIn}>
              <div className="card-icon"><ShieldCheck size={32} /></div>
              <h3>מגן לידים רדומים</h3>
              <p>המערכת מזהה לידים שלא קיבלו יחס מעל 3 ימים ומקפיצה לך התראת Push חכמה. לא נותנים לאף עסקה להתקרר.</p>
            </motion.div>
            
            <motion.div className="bento-card" {...fadeIn} transition={{ delay: 0.2 }}>
              <div className="card-icon"><Table size={32} /></div>
              <h3>סדר בבלגן: ייבוא מהיר</h3>
              <p>מביאים איתכם רשימות ישנות? טוענים אקסל או CSV ב-3 קליקים ומקבלים סדר מיידי בכל מאגר הלקוחות הקיים.</p>
            </motion.div>
            
            <motion.div className="bento-card" {...fadeIn} transition={{ delay: 0.3 }}>
              <div className="card-icon"><MessageCircle size={32} /></div>
              <h3>WhatsApp בקליק</h3>
              <p>שליחת הודעה ללקוח ישירות מהמחשב או הנייד בלי לשמור את המספר באנשי הקשר. מהירות היא שם המשחק.</p>
            </motion.div>
            
            <motion.div className="bento-card large" {...fadeIn} transition={{ delay: 0.4 }}>
              <div className="card-icon"><LayoutTemplate size={32} /></div>
              <h3>דף נחיתה ו-CRM יוקרתי</h3>
              <p>כל משתמש מקבל דף נחיתה אישי שאוסף לידים ישירות לצנרת המכירות המעוצבת בסטייל Stone / Gold יוקרתי.</p>
            </motion.div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <motion.section className="pricing-section" {...fadeIn}>
          <div className="pricing-card">
            <div className="gold-ingot-badge">
              <div className="gold-halo-effect"></div>
              <h2 className="etched-text">חבילת ה-Premium</h2>
            </div>
            <p className="price-sub">בואו לראות את הקסם קורה מהיום הראשון</p>
            <span className="price">0 ₪</span>
            <p className="price-sub" style={{ marginTop: '-15px', fontWeight: 800 }}>לחודש הראשון</p>
            <ul className="price-features">
              <li><CheckCircle2 className="check-icon" size={20} /> <b>דמי הקמה חד-פעמיים מסובסדים (העלאת נתונים + הגדרות) ב-299 ₪ בלבד</b> <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '0.9rem', marginRight: '5px' }}> (במקום 1,899 ₪)</span></li>
              <li style={{ color: 'var(--amber-600)', background: 'rgba(217, 119, 6, 0.1)', padding: '10px', borderRadius: '12px', border: '1px solid var(--amber-600)44' }}>
                <CheckCircle2 size={20} /> <b>אחרי חודש: רק 199 ₪ לחודש לניהול מלא ו-AI</b>
              </li>
              <li><CheckCircle2 className="check-icon" size={20} /> אפיון עסקי והטמעה מלאה</li>
              <li><CheckCircle2 className="check-icon" size={20} /> ייבוא וטיוב נתונים מרשימות קיימות</li>
              <li><CheckCircle2 className="check-icon" size={20} /> מערכת התראות לידים רדומים</li>
              <li><CheckCircle2 className="check-icon" size={20} /> דף נחיתה אישי ממותג</li>
            </ul>
            <button className="hero-cta" onClick={handleStartFree}>התחילו חודש חינם</button>
          </div>
        </motion.section>


      </main>

      <footer className="landing-footer">
        <div className="footer-contact">
          <h3>צור קשר</h3>
          <p>טלפון: 053-3407255</p>
          <p>אימייל: amitshani9@gmail.com</p>
        </div>
        <p className="copyright">© {new Date().getFullYear()} AS-CRM. Designed for Excellence.</p>
      </footer>
      <FloatingWhatsApp />
    </div>
  );
};

export default LandingPage;
