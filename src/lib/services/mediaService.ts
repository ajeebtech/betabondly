import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { Media } from '../../types/db';
import { uploadFile } from '../storage';

export const uploadMediaFile = async (
  file: File, 
  userId: string, 
  coupleId: string
): Promise<{ id: string; url: string }> => {
  console.log('Uploading media file:', file.name, 'for couple:', coupleId);
  
  // Upload file to Firebase Storage
  const filePath = `couples/${coupleId}/media`;
  console.log('File path:', filePath);
  const fileUrl = await uploadFile(file, filePath);
  console.log('File uploaded successfully, URL:', fileUrl);
  
  // Create media document in Firestore
  const mediaRef = collection(db, 'media');
  const docRef = await addDoc(mediaRef, {
    userId,
    coupleId,
    fileName: file.name,
    fileUrl,
    fileType: file.type.startsWith('video/') ? 'video' : 'image',
    fileSize: file.size,
    isFavorite: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  console.log('Media document created with ID:', docRef.id);
  return { id: docRef.id, url: fileUrl };
};

export const getMediaByCouple = async (coupleId: string, limitCount = 50): Promise<Media[]> => {
  const mediaRef = collection(db, 'media');
  const q = query(
    mediaRef,
    where('coupleId', '==', coupleId),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  const media: Media[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    media.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as Media);
  });
  
  // Sort by createdAt in descending order (newest first)
  media.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return media;
};

export const toggleMediaFavorite = async (mediaId: string, isFavorite: boolean): Promise<void> => {
  const mediaRef = doc(db, 'media', mediaId);
  await updateDoc(mediaRef, {
    isFavorite,
    updatedAt: serverTimestamp()
  });
};

export const deleteMedia = async (mediaId: string): Promise<void> => {
  const mediaRef = doc(db, 'media', mediaId);
  await deleteDoc(mediaRef);
};

export const getFavoriteMedia = async (coupleId: string): Promise<Media[]> => {
  const mediaRef = collection(db, 'media');
  const q = query(
    mediaRef,
    where('coupleId', '==', coupleId),
    where('isFavorite', '==', true),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  const media: Media[] = [];
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    media.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    } as Media);
  });
  
  return media;
};
