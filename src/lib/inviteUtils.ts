import { doc, setDoc, getDoc, getFirestore, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

export async function generateInviteCode(userId: string): Promise<string> {
  // Generate a random 5-digit number
  const code = Math.floor(10000 + Math.random() * 90000).toString();
  
  // Check if code already exists
  const inviteRef = doc(db, 'invites', code);
  const inviteSnap = await getDoc(inviteRef);
  
  if (inviteSnap.exists()) {
    // If code exists, generate a new one recursively
    return generateInviteCode(userId);
  }
  
  // Create the invite document
  await setDoc(inviteRef, {
    code,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    used: false,
    usedBy: null,
    usedAt: null
  });
  
  return code;
}

export async function getInviteByCode(code: string) {
  const inviteRef = doc(db, 'invites', code);
  const inviteSnap = await getDoc(inviteRef);
  
  if (!inviteSnap.exists()) {
    return null;
  }
  
  return {
    id: inviteSnap.id,
    ...inviteSnap.data()
  };
}

export async function useInviteCode(code: string, userId: string) {
  const inviteRef = doc(db, 'invites', code);
  
  await updateDoc(inviteRef, {
    used: true,
    usedBy: userId,
    usedAt: new Date().toISOString()
  });
  
  // Update the user document to include the invite code
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    inviteCode: code
  });
  
  return true;
}

export async function getCoupleByInviteCode(code: string) {
  const q = query(
    collection(db, 'users'),
    where('inviteCode', '==', code)
  );
  
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }
  
  return querySnapshot.docs[0].data();
}

export function getInviteLink(code: string): string {
  if (typeof window === 'undefined') {
    return `https://bondly.fun/invite/${code}`;
  }
  return `${window.location.origin}/invite/${code}`;
}
