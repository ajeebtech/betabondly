import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface CreatePostData {
  coupleId: string;
  userId: string;
  content: string;
  mediaUrl?: string;
}

interface PostData extends CreatePostData {
  id: string;
  createdAt: any;
  updatedAt: any;
}

export const createPost = async (postData: CreatePostData) => {
  const postsRef = collection(db, 'posts');
  
  const docRef = await addDoc(postsRef, {
    ...postData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return docRef.id;
};

export const getPostsByCouple = async (coupleId: string, limit = 20) => {
  const postsRef = collection(db, 'posts');
  const q = query(
    postsRef,
    where('coupleId', '==', coupleId),
    orderBy('createdAt', 'desc'),
    firestoreLimit(limit)
  );
  
  const querySnapshot = await getDocs(q);
  const posts: PostData[] = [];
  
  querySnapshot.forEach((doc) => {
    posts.push({
      id: doc.id,
      ...doc.data()
    } as PostData);
  });
  
  return posts;
};

export const getPostsByUser = async (userId: string, limit = 20) => {
  const postsRef = collection(db, 'posts');
  const q = query(
    postsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    firestoreLimit(limit)
  );
  
  const querySnapshot = await getDocs(q);
  const posts: PostData[] = [];
  
  querySnapshot.forEach((doc) => {
    posts.push({
      id: doc.id,
      ...doc.data()
    } as PostData);
  });
  
  return posts;
};
