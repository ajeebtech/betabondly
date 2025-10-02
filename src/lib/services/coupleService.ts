import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CoupleData {
  coupleId: string;
  users: string[]; // Array of user UIDs
  createdAt: any;
  updatedAt: any;
}

export const createCouple = async (creatorUid: string) => {
  const coupleId = crypto.randomUUID();
  const coupleRef = doc(db, 'couples', coupleId);
  
  await setDoc(coupleRef, {
    coupleId,
    users: [creatorUid],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return coupleId;
};

export const addUserToCouple = async (coupleId: string, userId: string) => {
  const coupleRef = doc(db, 'couples', coupleId);
  
  await updateDoc(coupleRef, {
    users: arrayUnion(userId),
    updatedAt: serverTimestamp()
  });
};

export const getCouple = async (coupleId: string): Promise<CoupleData | null> => {
  const coupleRef = doc(db, 'couples', coupleId);
  const coupleSnap = await getDoc(coupleRef);
  
  if (coupleSnap.exists()) {
    return coupleSnap.data() as CoupleData;
  }
  
  return null;
};

export const getCoupleByUserId = async (userId: string): Promise<CoupleData | null> => {
  const couplesRef = collection(db, 'couples');
  const q = query(
    couplesRef,
    where('users', 'array-contains', userId),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as CoupleData;
  }
  
  return null;
};
