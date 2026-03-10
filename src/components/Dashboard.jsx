import React, { useState } from 'react';
import { exportClientsToCSV } from '../utils/exportUtils';
import ClientProfile from './ClientProfile';
import MondayTable from './MondayTable';
import StatisticsBento from './StatisticsBento';
import AnalyticsSection from './AnalyticsSection';

/**
 * Dashboard Component
 * The central command center of the CRM. Features advanced analytics, 
 * summary tiles, and the main client pipeline.
 */
function Dashboard({ clients, setClients, SHEETDB_URL, fetchClients }) {
    const [selectedClient, setSelectedClient] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
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
            const response = await fetch(`${SHEETDB_URL}/id/${String(clientId)}`, {
                method: 'PATCH',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: { status: newStatus } })
            });
            if (!response.ok) throw new Error("Backend update failed");
        } catch (error) {
            console.error("Status update failed", error);
            setClients(previousSnapshot);
            alert("העדכון נכשל בענן. הנתונים שוחזרו.");
        }
    };

    const handleSaveClient = async (updatedClient) => {
        setIsSaving(true);
        
        // הגנה מפני קריסה: מוודא שיש מספר טלפון לפני הפעלת startsWith
        const phone = updatedClient.phone || "";
        const formattedPhone = phone.startsWith("'") ? phone : `'${phone}`;
        const finalClientData = { ...updatedClient, phone: formattedPhone };

        try {
            const existingClient = clients.find(c => String(c.id) === String(updatedClient.id));
            
            if (existingClient) {
                // עדכון לקוח קיים
                const response = await fetch(`${SHEETDB_URL}/id/${String(updatedClient.id)}`, {
                    method: 'PATCH',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: { ...finalClientData } })
                });
                if (!response.ok) throw new Error("Update failed");
                
                setClients(prev => prev.map(c => String(c.id) === String(updatedClient.id) ? finalClientData : c));
            } else {
                // הוספת לקוח חדש
                const response = await fetch(SHEETDB_URL, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: [finalClientData] })
                });
                if (!response.ok) throw new Error("Creation failed");
                
                setClients(prev => [...prev, finalClientData]);
            }
            return true; // מחזיר הצלחה
        } catch (error) {
            console.error(error);
            alert("שגיאה: השמירה בענן נכשלה. בדוק חיבור לאינטרנט.");
            return false; // מחזיר כישלון
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClient = async (clientId) => {
        const clientToDelete = clients.find(c => String(c.id) === String(clientId));
        if (!clientToDelete) return;
        if (!window.confirm(`האם אתה בטוח שברצונך למחוק את הלקוח "${clientToDelete.contact || 'ללא שם'}"?`)) return;

        console.log("Deleting ID:", clientId);
        try {
            // First attempt: delete by unique ID
            const firstResponse = await fetch(`${SHEETDB_URL}/id/${String(clientId)}`, { method: 'DELETE' });
            const result = await firstResponse.json();

            if (result.deleted > 0) {
                // Primary delete succeeded — remove from local state
                setClients(prev => prev.filter(client => String(client.id) !== String(clientId)));
                return;
            }

            // Fallback: delete by contact name when ID column was empty
            if (clientToDelete.contact) {
                await fetch(`${SHEETDB_URL}/contact/${encodeURIComponent(clientToDelete.contact)}`, { method: 'DELETE' });
            }

            // Remove from local state regardless — the row was likely already absent or matched by name
            setClients(prev => prev.filter(client => String(client.id) !== String(clientId)));
        } catch (error) {
            console.error("Delete failed", error);
            alert("הייתה שגיאה במחיקת הלקוח.");
        }
    };

    const handleAddClient = () => {
        const newClient = {
            id: String(Date.now()),
            status: "חדש",
            contact: "", phone: "", email: "", role: "", company: "",
            history: "", nextCall: "", documents: [],
            avatarIndex: Math.floor(Math.random() * 3) + 1
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
        </div>
    );
}

export default Dashboard;
