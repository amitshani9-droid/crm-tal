import React from 'react';
import { MessageCircle } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const FloatingWhatsApp = () => {
    // Replaced 0 with 972 prefix for Israel
    const phoneNumber = '972533407255'; 
    const message = encodeURIComponent('היי עמית, אני מעוניין להתייעץ לגבי המערכת שלך');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="floating-whatsapp"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
                scale: 1, 
                opacity: 1,
                boxShadow: [
                    "0px 0px 0px 0px rgba(202, 138, 4, 0.7)",
                    "0px 0px 0px 20px rgba(202, 138, 4, 0)",
                ]
            }}
            transition={{
                boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                },
                scale: { duration: 0.5 }
            }}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
            style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #d97706, #ca8a04)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                zIndex: 9998,
                cursor: 'pointer',
                textDecoration: 'none'
            }}
        >
            <MessageCircle size={32} />
        </motion.a>
    );
};

export default FloatingWhatsApp;
