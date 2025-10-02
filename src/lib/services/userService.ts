import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

export interface UserData {
  uid: string;
  name: string;
  preferredName: string;
  email: string;
  phone: string;
  bio?: string;
  photoURL?: string;
  coupleId?: string | null;
  createdAt: any;
  updatedAt: any;
}

export const createUser = async (userData: Omit<UserData, 'createdAt' | 'updatedAt'>) => {
  const userRef = doc(db, 'users', userData.uid);
  
  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return userData.uid;
};

export const updateUser = async (uid: string, updates: Partial<UserData>) => {
  const userRef = doc(db, 'users', uid);
  
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const getUser = async (uid: string): Promise<UserData | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserData;
  }
  
  return null;
};

export const uploadProfilePicture = async (file: File, uid: string): Promise<string> => {
  const storageRef = ref(storage, `profilePictures/${uid}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const updateCoupleId = async (uid: string, coupleId: string | null) => {
  return updateUser(uid, { coupleId });
};
