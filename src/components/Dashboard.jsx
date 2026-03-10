import React, { useState } from 'react';
import { exportClientsToCSV } from '../utils/exportUtils';
import ClientProfile from './ClientProfile';
import MondayTable from './MondayTable';
import StatisticsBento from './StatisticsBento';
import AnalyticsSection from './AnalyticsSection';
import VoiceflowWidget from './VoiceflowWidget';
import CSVImportModal from './CSVImportModal';
import { supabase } from '../lib/supabase';
import { FileSpreadsheet } from 'lucide-react';

/**
 * Dashboard Component
 * The central command center of the CRM. Features advanced analytics, 
 * summary tiles, and the main client pipeline.
 */
function Dashboard({ clients, setClients, SHEETDB_URL, fetchClients, session, profile }) {
    const [selectedClient, setSelectedClient] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshSuccess, setRefreshSuccess] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Analytics & Stats Calculations
    const totalClients = clients.length;

    // New leads (last 7 days based on ID timestamp)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newLeads = clients.filter(c => {
        const timestamp = parseInt(c.id, 10);
        return !isNaN(timestamp) && timestamp >= sevenDaysAgo.getTime();
    }).length;

    const activePipeline = clients.filter(c => String(c.status) === 'בטיפול').length;
    const closedDeals = clients.filter(c => String(c.status) === 'סגור').length;

    const todayStr = new Date().toISOString().split('T')[0];
    const todoToday = clients.filter(c => c.nextCall && c.nextCall.split('T')[0] === todayStr).length;

    // 2. Logic Handlers
    const handleOpenProfile = (client) => {
        setSelectedClient(client);
        setIsProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setIsProfileOpen(false);
        setTimeout(() => setSelectedClient(null), 300);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setRefreshSuccess(false);
        if (fetchClients) await fetchClients();
        setIsRefreshing(false);
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 3000);
    };

    const handleStatusChange = async (clientId, newStatus) => {
        const previousSnapshot = [...clients];
        // Optimistic Update
        setClients(prev => prev.map(c =>
            String(c.id) === String(clientId) ? { ...c, status: newStatus } : c
        ));

        try {
            const { error } = await supabase
                .from('clients')
                .update({ status: newStatus })
                .eq('id', clientId);

            if (error) throw error;
        } catch (error) {
            console.error("Status update failed", error);
            setClients(previousSnapshot);
            alert(`העדכון נכשל בענן. פירוט השגיאה: ${error.message || ''}`);
        }
    };

    const handleSaveClient = async (updatedClient) => {
        setIsSaving(true);

        // הגנה מפני קריסה: מוודא שיש מספר טלפון לפני הפעלת startsWith
        const phone = updatedClient.phone || "";
        const formattedPhone = phone.startsWith("'") ? phone : `'${phone}`;
        
        try {
            const existingClient = clients.find(c => String(c.id) === String(updatedClient.id));
            const isTempId = String(updatedClient.id).startsWith('temp_');

            if (existingClient && !isTempId) {
                // עדכון לקוח קיים
                const { id, avatarIndex, ...finalClientData } = updatedClient;
                finalClientData.phone = formattedPhone;

                const { data, error } = await supabase
                    .from('clients')
                    .update(finalClientData)
                    .eq('id', updatedClient.id)
                    .select()
                    .single();

                if (error) throw error;

                setClients(prev => prev.map(c => String(c.id) === String(updatedClient.id) ? data : c));
            } else {
                // הוספת לקוח חדש
                const { id, avatarIndex, ...insertData } = updatedClient;
                insertData.phone = formattedPhone;
                insertData.user_id = session?.user?.id; // Validation Check: Make sure user_id is injected contextually

                const { data, error } = await supabase
                    .from('clients')
                    .insert([insertData])
                    .select()
                    .single();

                if (error) throw error;

                setClients(prev => [...prev, data]);
            }
            return true; // מחזיר הצלחה
        } catch (error) {
            console.error("Supabase Save Error:", error);
            const errStr = typeof error === 'object' ? JSON.stringify(error, null, 2) : error;
            alert(`שגיאה בהכנסת נתונים (בדוק קונסול - רשת):\n${error.message || ''}\n\nפירוט הסרוור:\n${errStr}`);
            return false; // מחזיר כישלון
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClient = async (clientId) => {
        const clientToDelete = clients.find(c => String(c.id) === String(clientId));
        if (!clientToDelete) return;
        if (!window.confirm(`האם אתה בטוח שברצונך למחוק את הלקוח "${clientToDelete.contact || 'ללא שם'}"?`)) return;

        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', clientId);

            if (error) throw error;

            setClients(prev => prev.filter(client => String(client.id) !== String(clientId)));
        } catch (error) {
            console.error("Delete failed", error);
            alert(`הייתה שגיאה במחיקת הלקוח. ${error.message || ''}`);
        }
    };

    const handleAddClient = () => {
        const newClient = {
            id: `temp_${Date.now()}`,
            status: "חדש",
            contact: "", phone: "", email: "", role: "", company: "",
            history: "", nextCall: "", documents: []
        };
        handleOpenProfile(newClient);
    };

    const handleExportCSV = () => exportClientsToCSV(clients, 'CRM_Export');

    const filteredClients = clients.filter(c => {
        const query = searchTerm.toLowerCase();
        return (c.contact || "").toLowerCase().includes(query) ||
            (c.company || "").toLowerCase().includes(query) ||
            (c.phone || "").toLowerCase().includes(query);
    });

    // Filter Groups based on FILTERED clients
    const todayClients = filteredClients.filter(c => c.nextCall && c.nextCall.split('T')[0] === todayStr);
    const todayIds = new Set(todayClients.map(c => String(c.id)));

    const newClients = filteredClients.filter(c => !todayIds.has(String(c.id)) && (String(c.status) === 'חדש' || !c.status));
    const inProgressClients = filteredClients.filter(c => !todayIds.has(String(c.id)) && String(c.status) === 'בטיפול');
    const closedClients = filteredClients.filter(c => !todayIds.has(String(c.id)) && String(c.status) === 'סגור');

    return (
        <div className="dashboard">
            {/* 1. Statistics Summary Tiles */}
            <StatisticsBento
                totalClients={totalClients}
                newLeads={newLeads}
                activePipeline={activePipeline}
                closedDeals={closedDeals}
                todoToday={todoToday}
            />

            {/* 2. Visual Analytics Section */}
            <AnalyticsSection clients={clients} />

            {/* 3. Action Toolbar */}
            <div className="dashboard-actions-row">
                <div className="search-bar-container">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="חיפוש לקוח לפי שם, חברה או טלפון..."
                        className="search-input-glass"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="dashboard-actions">
                    <button className="btn-primary" onClick={handleAddClient}>
                        <span className="btn-icon">✚</span> הוספת לקוח חדש
                    </button>

                    <button 
                        className="btn-secondary" 
                        onClick={() => setIsCSVModalOpen(true)}
                        style={{ border: '1px solid #d97706', color: '#b45309', backgroundColor: '#fafaf9', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
                    >
                        <FileSpreadsheet size={18} /> ייבוא מאקסל
                    </button>

                    <button className="btn-secondary" onClick={handleExportCSV}>
                        <span className="btn-icon-excel">📥</span> ייצוא נתונים לאקסל
                    </button>

                    <button className="btn-secondary" onClick={() => window.open('/join', '_blank')}>
                        <span className="btn-icon">🔗</span> צפייה בדף נחיתה
                    </button>

                    <button className={`btn-secondary ${isRefreshing ? 'spinning' : ''}`} onClick={handleRefresh}>
                        <span>{isRefreshing ? "↻" : "🔄"}</span> רענן נתונים
                    </button>

                    {refreshSuccess && <span className="refresh-toast success">עודכן בהצלחה!</span>}
                </div>
            </div>

            {/* 4. Priority: Today's Tasks */}
            {todayClients.length > 0 && (
                <div className="pipeline-section focus-section glass-card">
                    <h2 className="pipeline-title">
                        <span className="icon-pulse">🚨</span> משימות דחופות להיום ({todayClients.length})
                    </h2>
                    <MondayTable
                        clients={todayClients}
                        onClientClick={handleOpenProfile}
                        onStatusChange={handleStatusChange}
                        onDeleteClient={handleDeleteClient}
                    />
                </div>
            )}

            {/* 5. Main Pipeline Sections */}
            <div className="pipeline-section">
                <h2 className="pipeline-title"><span className="status-dot new"></span> לידים שטרם טופלו ({newClients.length})</h2>
                <MondayTable
                    clients={newClients}
                    onClientClick={handleOpenProfile}
                    onStatusChange={handleStatusChange}
                    onDeleteClient={handleDeleteClient}
                />
            </div>

            <div className="pipeline-section">
                <h2 className="pipeline-title"><span className="status-dot in-progress"></span> בטיפול אקטיבי ({inProgressClients.length})</h2>
                <MondayTable
                    clients={inProgressClients}
                    onClientClick={handleOpenProfile}
                    onStatusChange={handleStatusChange}
                    onDeleteClient={handleDeleteClient}
                />
            </div>

            <div className="pipeline-section">
                <h2 className="pipeline-title"><span className="status-dot closed"></span> עסקאות ואירועים שנסגרו ({closedClients.length})</h2>
                <MondayTable
                    clients={closedClients}
                    onClientClick={handleOpenProfile}
                    onStatusChange={handleStatusChange}
                    onDeleteClient={handleDeleteClient}
                />
            </div>

            {/* 6. Profile Modal Overlay */}
            <ClientProfile
                client={selectedClient}
                isOpen={isProfileOpen}
                onClose={handleCloseProfile}
                onSave={handleSaveClient}
                isSaving={isSaving}
            />

            <CSVImportModal 
                isOpen={isCSVModalOpen} 
                onClose={() => setIsCSVModalOpen(false)} 
                sessionId={session?.user?.id} 
                onImportComplete={(msg) => { 
                    alert(msg); 
                    handleRefresh(); 
                }} 
                brandColor={profile?.settings?.brand_color || '#d97706'} 
            />
            
            <VoiceflowWidget />
        </div>
    );
}

export default Dashboard;
