import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { ClientHeader } from '../components/clients/ClientHeader';
import { ClientDetails } from '../components/clients/ClientDetails';
import { ClientNotes } from '../components/clients/ClientNotes';
import { ClientActivity } from '../components/clients/ClientActivity';
import ClientTasks from '../components/clients/ClientTasks';
import ClientFiles from '../components/clients/ClientFiles';

import { useClientLogs } from '../hooks/useClientLogs';
import { useAuth } from '../contexts/AuthContext';
import { openWhatsApp } from '../utils/whatsappUtils';
import { aiService } from '../services/aiService';
import { Sparkles, Loader2 } from 'lucide-react';

function ClientProfile({ client, isOpen, onClose, onSave, isSaving, onDelete, stages = [] }) {
    const { session } = useAuth();
    const [formData, setFormData] = useState(null);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [aiSummary, setAiSummary] = useState('');
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const drawerContentRef = useRef(null);

    const { logs, activity, loading: logsLoading, addNote } = useClientLogs(client?.id, session?.user?.id);

    useEffect(() => {
        if (client) {
            const cleanPhone = client.phone?.startsWith("'") ? client.phone.substring(1) : client.phone;
            setFormData({ ...client, phone: cleanPhone });
            setAiSummary(''); // Reset summary when client changes
        }
    }, [client]);

    if (!isOpen || !formData) return null;

    const handleGenerateAiSummary = async () => {
        setIsGeneratingAi(true);
        try {
            const summary = await aiService.generateClientSummary(formData.id, logs);
            setAiSummary(summary);
        } catch (err) {
            setAiSummary("נכשל ביצירת סיכום.");
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        const success = await onSave(formData);
        if (success) onClose();
    };

    const sendWhatsApp = (type) => {
        if (type === 'mom') {
            const ownerPhone = import.meta.env.VITE_WHATSAPP_PHONE;
            const msg = `👤 איש קשר: ${formData.contact || 'חסר'}%0A📞 טלפון: ${formData.phone || 'חסר'}%0A🏢 חברה: ${formData.company || 'חסר'}`;
            openWhatsApp(ownerPhone, decodeURIComponent(msg));
        } else {
            openWhatsApp(formData.phone);
        }
    };

    return (
        <>
            <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
            <div className={`client-profile-drawer glass-card ${isOpen ? 'open' : ''}`}>
                <div className="drawer-header no-print">
                    <button className="close-btn action-btn" onClick={onClose}>✕</button>
                    <div className="header-actions">
                        <button onClick={handleGenerateAiSummary} className="action-btn btn-ai" disabled={isGeneratingAi}>
                            {isGeneratingAi ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
                            סיכום AI
                        </button>
                        <button onClick={() => sendWhatsApp('client')} className="whatsapp-client-btn action-btn">💬 לקוח</button>
                        <button onClick={() => sendWhatsApp('mom')} className="whatsapp-btn action-btn">💬 שלח לעצמי</button>
                        <button onClick={() => {
                            if (window.confirm(`האם למחוק את הלקוח "${formData.contact}"?`)) {
                                onDelete(formData.id);
                                onClose();
                            }
                        }} className="action-btn delete-btn">🗑️</button>
                        <button className="btn-primary custom-save action-btn" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "שומר..." : "שמור"}
                        </button>
                    </div>
                </div>

                <div className="drawer-content" ref={drawerContentRef}>
                    <ClientHeader 
                        contact={formData.contact} 
                        company={formData.company} 
                        avatarIndex={formData.avatarIndex}
                        onContactChange={val => handleChange('contact', val)}
                        onCompanyChange={val => handleChange('company', val)}
                    />

                    {aiSummary && (
                        <div className="ai-summary-box" style={{ 
                            background: 'rgba(99, 102, 241, 0.05)', 
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '12px',
                            padding: '15px',
                            marginBottom: '20px',
                            position: 'relative'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#6366f1' }}>
                                <Sparkles size={16} />
                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>סיכום AI של הלקוח</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: '#1e293b' }}>{aiSummary}</p>
                        </div>
                    )}

                    <ClientDetails 
                        phone={formData.phone}
                        email={formData.email}
                        stageId={formData.stage_id}
                        status={formData.status}
                        stages={stages}
                        onPhoneChange={val => handleChange('phone', val)}
                        onEmailChange={val => handleChange('email', val)}
                        onStageChange={val => {
                             const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
                             if (isUuid) handleChange('stage_id', val);
                             else handleChange('status', val);
                        }}
                    />

                    <div className="divider"></div>
                    
                    <div className="profile-sections-grid">
                        <div className="main-sections">
                            <ClientNotes logs={logs} onAddNote={addNote} loading={logsLoading} />
                            <ClientTasks clientId={formData.id} />
                            <ClientFiles clientId={formData.id} />
                        </div>
                        <aside className="side-sections">
                            <ClientActivity activities={activity} />
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ClientProfile;
