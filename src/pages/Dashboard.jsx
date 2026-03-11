import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useClients } from '../hooks/useClients';
import { usePipeline } from '../hooks/usePipeline';
import { useDashboardStats } from '../hooks/useDashboardStats';

// Dashboard Components
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { KanbanBoard } from '../components/dashboard/KanbanBoard';
import { TasksWidget } from '../components/dashboard/TasksWidget';
import { ActivityWidget } from '../components/dashboard/ActivityWidget';
import { ClientSearchBar } from '../components/dashboard/ClientSearchBar';
import { DormantLeadsWidget } from '../components/dashboard/DormantLeadsWidget';
import ClientProfile from './ClientProfile';

import { Plus, LayoutGrid, RefreshCw } from 'lucide-react';

function Dashboard() {
    const { profile } = useAuth();
    const { clients, saveClient, deleteClient, updateClientStatus, refreshClients, isProcessing } = useClients();
    const { stages } = usePipeline();
    
    const [selectedClient, setSelectedClient] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const stats = useDashboardStats(clients, stages);

    const handleOpenProfile = (client) => {
        setSelectedClient(client);
        setIsProfileOpen(true);
    };

    const handleCloseProfile = () => {
        setIsProfileOpen(false);
        setTimeout(() => setSelectedClient(null), 300);
    };

    const handleAddClient = () => {
        const firstStageId = stages.length > 0 ? stages[0].id : null;
        const newClient = {
            id: `temp_${Date.now()}`,
            contact: "", phone: "", email: "", role: "", company: "",
            stage_id: firstStageId
        };
        handleOpenProfile(newClient);
    };

    const handleDropClient = async (clientId, stageId) => {
        try {
            await updateClientStatus(clientId, { stage_id: stageId });
        } catch (err) {
            alert("נכשל בעדכון הסטטוס");
        }
    };

    return (
        <div className="dashboard-container" style={{ padding: '0 0 40px 0' }}>
            {/* Header / Top Bar */}
            <div className="dashboard-header" style={{ 
                padding: '24px', 
                background: 'var(--clr-surface)', 
                borderBottom: '1px solid var(--clr-glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>שלום, {profile?.business_name || 'מנהל'} 👋</h1>
                    <ClientSearchBar onSelectClient={handleOpenProfile} />
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" onClick={refreshClients}>
                        <RefreshCw size={18} />
                    </button>
                    <button className="btn-primary" onClick={handleAddClient}>
                        <Plus size={18} /> ליד חדש
                    </button>
                </div>
            </div>

            <div style={{ padding: '0 24px' }}>
                <DashboardStats stats={stats} />

                <div className="dashboard-workspace">
                    {/* Main Area: Pipeline */}
                    <main className="main-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <LayoutGrid size={22} color="var(--clr-primary)" /> צינור מכירות (Pipeline)
                            </h2>
                        </div>
                        
                        <KanbanBoard 
                            stages={stages} 
                            clients={clients} 
                            onDropClient={handleDropClient} 
                            onOpenProfile={handleOpenProfile} 
                        />
                    </main>

                    {/* Sidebar Area: Widgets */}
                    <aside className="sidebar-widgets" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <TasksWidget onOpenProfile={handleOpenProfile} />
                        <DormantLeadsWidget onOpenProfile={handleOpenProfile} />
                        <ActivityWidget />
                    </aside>
                </div>
            </div>

            <ClientProfile
                client={selectedClient}
                isOpen={isProfileOpen}
                onClose={handleCloseProfile}
                onSave={saveClient}
                isSaving={isProcessing}
                stages={stages}
                onDelete={deleteClient}
            />
        </div>
    );
}

export default Dashboard;
