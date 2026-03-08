import React, { useState } from 'react';
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
        const existingClient = clients.find(c => String(c.id) === String(updatedClient.id));

        // Format phone: ensure it starts with ' to preserve lead zero in Sheets
        const formattedPhone = updatedClient.phone.startsWith("'") ? updatedClient.phone : `'${updatedClient.phone}`;
        const finalClientData = { ...updatedClient, phone: formattedPhone };

        try {
            if (existingClient) {
                await fetch(`${SHEETDB_URL}/id/${String(updatedClient.id)}`, {
                    method: 'PATCH',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: { ...finalClientData } })
                });
                setClients(prev => prev.map(c => 
                    String(c.id) === String(updatedClient.id) ? finalClientData : c
                ));
            } else {
                const finalClient = { ...finalClientData, id: String(Date.now()) };
                await fetch(SHEETDB_URL, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: [finalClient] })
                });
                setClients(prev => [...prev, finalClient]);
            }
        } catch (error) {
            console.error("Saving failed", error);
            alert("הייתה שגיאה בשמירת הנתונים.");
        } finally {
            setIsSaving(false);
            handleCloseProfile();
        }
    };

    const handleDeleteClient = async (clientId) => {
        const clientToDelete = clients.find(c => String(c.id) === String(clientId));
        if (!clientToDelete) return;
        if (!window.confirm(`האם אתה בטוח שברצונך למחוק את הלקוח "${clientToDelete.contact || 'ללא שם'}"?`)) return;

        console.log("Deleting ID:", clientId);
        try {
            let response = await fetch(`${SHEETDB_URL}/id/${String(clientId)}`, { method: 'DELETE' });
            const result = await response.json();

            if (result.deleted === 0 && clientToDelete.contact) {
                response = await fetch(`${SHEETDB_URL}/contact/${encodeURIComponent(clientToDelete.contact)}`, { method: 'DELETE' });
            }

            if (!response.ok) throw new Error("Delete failed");
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

    const handleExportCSV = () => {
        if (!clients || clients.length === 0) return;
        const headers = "מזהה,שם,טלפון,אימייל,חברה,סטטוס\n";
        const rows = clients.map(c => 
            `"${c.id}","${c.contact || ''}","${c.phone || ''}","${c.email || ''}","${c.company || ''}","${c.status || 'חדש'}"`
        ).join("\n");
        const csvContent = "\ufeff" + headers + rows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `client_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    // Filter Groups
    const todayClients = clients.filter(c => c.nextCall && c.nextCall.split('T')[0] === todayStr);
    const newClients = clients.filter(c => String(c.status) === 'חדש' || !c.status);
    const inProgressClients = clients.filter(c => String(c.status) === 'בטיפול');
    const closedClients = clients.filter(c => String(c.status) === 'סגור');

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
