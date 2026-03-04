import React, { useState } from 'react';
import ClientList from './ClientList';
import ClientProfile from './ClientProfile';
import StatisticsHeader from './StatisticsHeader';

function Dashboard({ clients, setClients, SHEETDB_URL }) {
    const [selectedClient, setSelectedClient] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleOpenProfile = (client) => {
        setSelectedClient(client);
        setIsProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setIsProfileOpen(false);
        // Delay clearing the selected client to allow slide-out animation to finish smoothly
        setTimeout(() => setSelectedClient(null), 300);
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

                // Update UI state immediately after successful fetch
                setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
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
                setClients([...clients, updatedClient]);
            }
        } catch (error) {
            console.error("Error saving data to SheetDB", error);
            alert("הייתה שגיאה בשמירת הנתונים. אנא נסה שוב.");
        } finally {
            setIsSaving(false);
            handleCloseProfile();
        }
    };

    const handleAddClient = () => {
        const newClient = {
            id: Date.now().toString(),
            contactPerson: "",
            phone: "",
            email: "",
            role: "",
            companyName: "",
            conversationHistory: "",
            nextCallDate: "",
            documents: [],
            avatarIndex: Math.floor(Math.random() * 3) + 1
        };
        handleOpenProfile(newClient);
    };

    const exportToSheets = (clientsToExport) => {
        const headers = ["איש קשר,טלפון,מייל,תפקיד,חברה,שיחה אחרונה\n"];
        const rows = clientsToExport.map(c => {
            const historySafe = c.conversationHistory ? c.conversationHistory.replace(/"/g, '""') : "";
            return `"${c.contactPerson || ''}","${c.phone || ''}","${c.email || ''}","${c.role || ''}","${c.companyName || ''}","${historySafe}"`;
        }).join("\n");

        const blob = new Blob(["\ufeff" + headers + rows], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `CRM_Tal_Shani_${new Date().toLocaleDateString('he-IL')}.csv`;
        link.click();
    };

    const totalClients = clients.length;
    const callsThisWeek = clients.filter(c => c.nextCallDate !== "").length; // Simplified logic, just checking if date exists for demo

    return (
        <div className="dashboard">
            <StatisticsHeader clients={clients} />

            <div className="dashboard-actions-row">
                <div className="dashboard-actions">
                    <button className="btn-secondary" onClick={() => exportToSheets(clients)} style={{ marginLeft: 'var(--space-md)' }}>
                        📊 ייצוא הלקוחות (CSV)
                    </button>
                    <button className="btn-primary" onClick={handleAddClient} disabled={isSaving}>
                        <span className="icon">➕</span> לקוח חדש
                    </button>
                </div>
            </div>

            <ClientList clients={clients} onClientClick={handleOpenProfile} />

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
