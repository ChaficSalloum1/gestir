import { useState } from 'react';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from '../firebase';

export function useStorage() {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, path: string): Promise<string> => {
    setUploading(true);
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (path: string): Promise<void> => {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  };

  return {
    uploadFile,
    deleteFile,
    uploading,
  };
}




