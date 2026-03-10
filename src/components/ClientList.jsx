import React from 'react';
import ClientCard from './ClientCard';
import EmptyState from './EmptyState';

function ClientList({ clients, onClientClick }) {
    if (!clients || clients.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="client-grid">
            {clients.map(client => (
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
