import React from 'react';
import { motion } from 'framer-motion';
import { 
    Users, 
    Link as LinkIcon, 
    Plus, 
    ArrowRightLeft,
    Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './EmptyDashboardState.css';

const EmptyDashboardState = ({ onAddClient, onImportCSV, publicSlug, brandColor }) => {
    const { profile } = useAuth();
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const publicUrl = publicSlug ? `${window.location.origin}/טופס/${publicSlug}` : `${window.location.origin}/טופס`;

    return (
        <motion.div className="empty-dashboard" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div className="empty-hero-section" variants={itemVariants}>
                <div className="empty-icon-glow" style={{ '--brand-color': brandColor }}>
                    {profile?.settings?.logo_url ? (
                        <img src={profile.settings.logo_url} alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    ) : (
                        <Users size={48} />
                    )}
                    <div className="sparkle-orbit">
                        <Sparkles className="sparkle-1" size={16} />
                        <Sparkles className="sparkle-2" size={12} />
                    </div>
                </div>
                <h1>ברוכים הבאים ל-AS-CRM! 🚀</h1>
                <p>הדשבורד שלך כרגע שקט, אבל זה הזמן המושלם להתחיל למלא אותו בלקוחות חדשים.</p>
            </motion.div>

            <div className="action-grid-empty">
                <motion.div className="action-card-empty glass-card" variants={itemVariants} onClick={onAddClient}>
                    <div className="card-icon manual"><Plus size={24} /></div>
                    <h3>הוספת לקוח ידנית</h3>
                    <p>התחל בקטן - צור את הלקוח הראשון שלך בתוך שניות.</p>
                </motion.div>

                <motion.div className="action-card-empty glass-card" variants={itemVariants} onClick={onImportCSV}>
                    <div className="card-icon import"><ArrowRightLeft size={24} /></div>
                    <h3>ייבוא מהיר מאקסל</h3>
                    <p>יש לך כבר רשימת לקוחות? העלה אותה בכמה קליקים.</p>
                </motion.div>

                <motion.div className="action-card-empty glass-card" variants={itemVariants} onClick={() => window.open(publicUrl, '_blank')}>
                    <div className="card-icon link"><LinkIcon size={24} /></div>
                    <h3>דף נחיתה מוכן לשימוש</h3>
                    <p>שלח את הקישור הזה ללקוחות - הם יופיעו כאן אוטומטית!</p>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default EmptyDashboardState;
