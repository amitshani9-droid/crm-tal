import { useState } from 'react';
import { useClientsContext } from '../contexts/ClientsContext';
import { pipelineService } from '../services/pipelineService';

export function usePipeline() {
  const { stages, setStages, refreshData } = useClientsContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const saveStages = async (updatedStages) => {
    setIsProcessing(true);
    try {
      const result = await pipelineService.upsertStages(updatedStages);
      setStages(result);
      return result;
    } catch (err) {
      console.error("Pipeline save failed:", err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteStage = async (stageId) => {
    try {
      await pipelineService.deleteStage(stageId);
      setStages(prev => prev.filter(s => s.id !== stageId));
    } catch (err) {
      console.error("Stage delete failed:", err);
      throw err;
    }
  };

  return {
    stages,
    isProcessing,
    saveStages,
    deleteStage,
    refreshPipeline: refreshData
  };
}
