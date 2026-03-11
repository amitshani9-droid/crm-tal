import { useState } from 'react';
import { useClientsContext } from '../contexts/ClientsContext';
import { clientsService } from '../services/clientsService';
import { activitiesService } from '../services/activitiesService';

export function useClients() {
  const { clients, setClients, refreshData, isLoading } = useClientsContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const updateClientStatus = async (clientId, updateData) => {
    // If updateData is a string, assume it's the stage_id or legacy status
    const actualUpdate = typeof updateData === 'string' 
      ? (updateData.includes('-') ? { stage_id: updateData } : { status: updateData })
      : updateData;

    // Optimistic Update
    const previousClients = [...clients];
    setClients(prev => prev.map(c => 
      String(c.id) === String(clientId) ? { ...c, ...actualUpdate } : c
    ));

    try {
      await clientsService.updateClient(clientId, actualUpdate);
      
      // Log Activity
      if (actualUpdate.stage_id) {
         activitiesService.logActivity({
           clientId,
           action: 'STATUS_CHANGED',
           data: { stage_id: actualUpdate.stage_id }
         });
      }
    } catch (err) {
      console.error("Status update failed:", err);
      setClients(previousClients);
      throw err;
    }
  };

  const saveClient = async (clientData) => {
    setIsProcessing(true);
    try {
      const isNew = String(clientData.id).startsWith('temp_');
      let result;
      
      if (isNew) {
        const { id, ...dataToInsert } = clientData;
        result = await clientsService.createClient(dataToInsert);
        setClients(prev => [...prev, result]);
        
        activitiesService.logActivity({
          clientId: result.id,
          action: 'CLIENT_CREATED'
        });
      } else {
        result = await clientsService.updateClient(clientData.id, clientData);
        setClients(prev => prev.map(c => String(c.id) === String(clientData.id) ? result : c));
      }
      return result;
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteClient = async (clientId) => {
    try {
      await clientsService.deleteClient(clientId);
      setClients(prev => prev.filter(c => String(c.id) !== String(clientId)));
    } catch (err) {
      console.error("Delete failed:", err);
      throw err;
    }
  };

  return {
    clients,
    isLoading,
    isProcessing,
    updateClientStatus,
    saveClient,
    deleteClient,
    refreshClients: refreshData
  };
}
