import React, { useState } from 'react';
import ClientProfile from './ClientProfile';
import MondayTable from './MondayTable';
import StatisticsBento from './StatisticsBento';

function Dashboard({ clients, setClients, SHEETDB_URL, fetchClients }) {
    const [selectedClient, setSelectedClient] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshSuccess, setRefreshSuccess] = useState(false);

    // Calculate Bento Stats
    const totalClients = clients.length;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newLeads = clients.filter(c => {
        const timestamp = parseInt(c.id, 10);
        return !isNaN(timestamp) && timestamp >= sevenDaysAgo.getTime();
    }).length;

    const activePipeline = clients.filter(c => c.status === 'בטיפול').length;
    const closedDeals = clients.filter(c => c.status === 'סגור').length;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todoToday = clients.filter(c => c.nextCall && c.nextCall.split('T')[0] === todayStr).length;

    const handleOpenProfile = (client) => {
        setSelectedClient(client);
        setIsProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setIsProfileOpen(false);
        // Delay clearing the selected client to allow slide-out animation to finish smoothly
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

    /**
     * CRITICAL FIX: Isolated Status Change
     * Updates ONLY the specific client in the local state (Optimistic)
     * and sends a targeted PATCH request to SheetDB.
     */
    const handleStatusChange = async (clientId, newStatus) => {
        // Snapshot current state for rollback if server call fails
        const previousSnapshot = [...clients];

        // 1. ISOLATED OPTIMISTIC UPDATE:
        // Match ONLY the specific client's id. Fallback IDs from App.jsx make this reliable.
        setClients(prev => prev.map(c => 
            c.id === clientId ? { ...c, status: newStatus } : c
        ));

        try {
            // 2. BACKEND SYNC (Targeted PATCH)
            // sheetDB endpoint format: /api/v1/{API_KEY}/id/{ID_VALUE}
            const response = await fetch(`${SHEETDB_URL}/id/${clientId}`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: { status: newStatus } })
            });

            if (!response.ok) throw new Error("Backend update failed");

        } catch (error) {
            console.error("Isolated status update failed", error);
            // ROLLBACK: Revert to previous valid state
            setClients(previousSnapshot);
            alert("העדכון נכשל בענן. הנתונים שוחזרו.");
        }
    };

    const handleSaveClient = async (updatedClient) => {
        setIsSaving(true);
        const existingClient = clients.find(c => c.id === updatedClient.id);

        try {
            if (existingClient) {
                // Update existing record: PATCH request
                await fetch(`${SHEETDB_URL}/id/${updatedClient.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ data: { ...updatedClient } })
                });

                // Update UI state specifically for this client using ID check
                setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
            } else {
                // Add new record: POST request
                await fetch(SHEETDB_URL, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ data: [updatedClient] })
                });

                // Update UI state immediately
                setClients(prev => [...prev, updatedClient]);
            }
        } catch (error) {
            console.error("Error saving data to SheetDB", error);
            alert("הייתה שגיאה בשמירת הנתונים. אנא נסה שוב.");
        } finally {
            setIsSaving(false);
            handleCloseProfile();
        }
    };

    const handleDeleteClient = async (clientId) => {
        if (!window.confirm("האם אתה בטוח שברצונך למחוק את הלקוח? פעולה זו אינה ניתנת לביטול.")) return;

        try {
            const response = await fetch(`${SHEETDB_URL}/id/${clientId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error("Delete failed");

            // Update local state
            setClients(prev => prev.filter(client => client.id !== clientId));
        } catch (error) {
            console.error("Error deleting client from SheetDB", error);
            alert("הייתה שגיאה במחיקת הלקוח. אנא נסה שוב.");
        }
    };

    const handleAddClient = () => {
        const newClient = {
            id: Date.now().toString(),
            status: "חדש",
            contact: "",
            phone: "",
            email: "",
            role: "",
            company: "",
            history: "",
            nextCall: "",
            documents: [],
            avatarIndex: Math.floor(Math.random() * 3) + 1
        };
        handleOpenProfile(newClient);
    };

    const exportToSheets = (clientsToExport) => {
        const headers = ["סטטוס,איש קשר,טלפון,מייל,תפקיד,חברה,שיחה אחרונה\n"];
        const rows = clientsToExport.map(c => {
            const historySafe = c.history ? c.history.replace(/"/g, '""') : "";
            return `"${c.status || 'חדש'}","${c.contact || ''}","${c.phone || ''}","${c.email || ''}","${c.role || ''}","${c.company || ''}","${historySafe}"`;
        }).join("\n");

        const blob = new Blob(["\ufeff" + headers + rows], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `CRM_Tal_Shani_${new Date().toLocaleDateString('he-IL')}.csv`;
        link.click();
    };

    const todayClients = clients.filter(c => c.nextCall && c.nextCall.split('T')[0] === todayStr);

    const newClients = clients.filter(c => c.status === 'חדש' || !c.status);
    const inProgressClients = clients.filter(c => c.status === 'בטיפול');
    const closedClients = clients.filter(c => c.status === 'סגור');

    return (
        <div className="dashboard">
            <StatisticsBento 
                totalClients={totalClients}
                newLeads={newLeads}
                activePipeline={activePipeline}
                closedDeals={closedDeals}
                todoToday={todoToday}
            />

            <div className="dashboard-actions-row">
                <div className="dashboard-actions">
                    {refreshSuccess && <span className="refresh-toast">עודכן בהצלחה!</span>}
                    <button className="btn-secondary btn-glass" onClick={handleRefresh} disabled={isRefreshing} style={{ marginLeft: 'var(--space-md)' }}>
                        <span className={`icon ${isRefreshing ? 'spin-animation' : ''}`}>🔄</span> רענן נתונים
                    </button>
                    <button className="btn-secondary" onClick={() => exportToSheets(clients)} style={{ marginLeft: 'var(--space-md)' }}>
                        📊 ייצוא הלקוחות (CSV)
                    </button>
                    <button className="btn-primary" onClick={handleAddClient} disabled={isSaving}>
                        <span className="icon">➕</span> לקוח חדש
                    </button>
                </div>
            </div>

            {todayClients.length > 0 && (
                <div className="pipeline-section focus-section glass-card">
                    <h2 className="pipeline-title"><span className="icon pulse-icon">🚨</span> לטיפול היום!</h2>
                    <MondayTable 
                        clients={todayClients} 
                        onClientClick={handleOpenProfile} 
                        onStatusChange={handleStatusChange} 
                        onDeleteClient={handleDeleteClient}
                    />
                </div>
            )}

            <div className="pipeline-section">
                <h2 className="pipeline-title"><span className="status-dot new"></span> לידים חדשים ({newClients.length})</h2>
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
                <h2 className="pipeline-title"><span className="status-dot closed"></span> לקוחות שנסגרו ({closedClients.length})</h2>
                <MondayTable 
                    clients={closedClients} 
                    onClientClick={handleOpenProfile} 
                    onStatusChange={handleStatusChange} 
                    onDeleteClient={handleDeleteClient}
                />
            </div>

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
