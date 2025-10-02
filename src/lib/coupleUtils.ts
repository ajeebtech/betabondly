import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { generateInviteCode } from './inviteUtils';

interface CoupleData {
  id: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
  inviteCode: string;
}

export async function createCouple(userId: string, partnerEmail: string): Promise<CoupleData> {
  const inviteCode = await generateInviteCode(userId);
  const coupleData: Omit<CoupleData, 'id'> = {
    members: [userId],
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    inviteCode,
  };

  const coupleRef = doc(db, 'couples', inviteCode);
  await setDoc(coupleRef, coupleData);

  // Update user document with couple ID
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    coupleId: inviteCode,
    updatedAt: serverTimestamp(),
  });

  return { id: inviteCode, ...coupleData };
}

export async function joinCouple(userId: string, inviteCode: string): Promise<CoupleData> {
  const coupleRef = doc(db, 'couples', inviteCode);
  const coupleSnap = await getDoc(coupleRef);

  if (!coupleSnap.exists()) {
    throw new Error('Invalid invite code');
  }

  const coupleData = coupleSnap.data() as CoupleData;
  
  // Check if user is already a member
  if (coupleData.members.includes(userId)) {
    return coupleData;
  }

  // Add user to couple
  await updateDoc(coupleRef, {
    members: arrayUnion(userId),
    updatedAt: serverTimestamp(),
  });

  // Update user document with couple ID
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    coupleId: inviteCode,
    updatedAt: serverTimestamp(),
  });

  return {
    id: coupleSnap.id,
    ...coupleData,
    members: [...coupleData.members, userId],
  };
}

export async function getCouple(coupleId: string): Promise<CoupleData | null> {
  const coupleRef = doc(db, 'couples', coupleId);
  const coupleSnap = await getDoc(coupleRef);
  
  if (!coupleSnap.exists()) {
    return null;
  }

  return {
    id: coupleSnap.id,
    ...coupleSnap.data(),
  } as CoupleData;
}

export async function getCoupleByUserId(userId: string): Promise<CoupleData | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists() || !userSnap.data()?.coupleId) {
    return null;
  }

  return getCouple(userSnap.data().coupleId);
}
