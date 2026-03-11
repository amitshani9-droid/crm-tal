import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { clientsService } from '../services/clientsService';
import { pipelineService } from '../services/pipelineService';

const ClientsContext = createContext();

export function ClientsProvider({ children }) {
  const { session, profile } = useAuth();
  const [clients, setClients] = useState([]);
  const [stages, setStages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [clientsData, stagesData] = await Promise.all([
        clientsService.fetchClients(session.user.id),
        pipelineService.fetchStages(session.user.id)
      ]);
      
      setClients(clientsData);
      setStages(stagesData);
    } catch (err) {
      console.error("Context Data Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.id && profile?.slug) {
      fetchData();
    }
  }, [session, profile, fetchData]);

  const value = {
    clients,
    setClients,
    stages,
    setStages,
    isLoading,
    error,
    refreshData: fetchData
  };

  return (
    <ClientsContext.Provider value={value}>
      {children}
    </ClientsContext.Provider>
  );
}

export const useClientsContext = () => {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error('useClientsContext must be used within a ClientsProvider');
  }
  return context;
};
