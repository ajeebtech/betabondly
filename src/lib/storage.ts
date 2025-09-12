import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${uuidv4()}.${fileExt}`;
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const uploadPostImage = async (file: File, postId: string): Promise<string> => {
  return uploadFile(file, `posts/${postId}/images`);
};
