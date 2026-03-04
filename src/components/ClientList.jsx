import React from 'react';
import ClientCard from './ClientCard';
import EmptyState from './EmptyState';

function ClientList({ clients, onClientClick }) {
    if (!clients || clients.length === 0) {
        return <EmptyState />;
    }

    const filteredClients = clients.filter(client => {
        const hasPhone = client.phone && client.phone.trim() !== "";
        const hasCompany = client.company && client.company.trim() !== "";
        return hasPhone || hasCompany;
    });

    if (filteredClients.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="client-grid">
            {filteredClients.map(client => (
                <ClientCard
                    key={client.id}
                    client={client}
                    onClick={() => onClientClick(client)}
                />
            ))}
        </div>
    );
}

export default ClientList;
