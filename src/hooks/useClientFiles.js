import { useState, useEffect } from 'react';
import { filesService } from '../services/filesService';

export function useClientFiles(clientId) {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (clientId && !String(clientId).startsWith('temp_')) {
      fetchFiles();
    }
  }, [clientId]);

  const fetchFiles = async () => {
    try {
      const data = await filesService.fetchClientFiles(clientId);
      setFiles(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const uploadFiles = async (selectedFiles) => {
    setIsUploading(true);
    setError(null);
    const newFiles = [];
    try {
      for (const file of selectedFiles) {
        const result = await filesService.uploadFile(clientId, file);
        newFiles.push(result);
      }
      setFiles(prev => [...newFiles, ...prev]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (fileId, fileUrl) => {
    try {
      await filesService.deleteFile(fileId, fileUrl);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return { files, isUploading, error, uploadFiles, deleteFile, refreshFiles: fetchFiles };
}
