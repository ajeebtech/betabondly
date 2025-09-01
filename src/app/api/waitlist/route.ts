import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { NextResponse } from 'next/server';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);

// Initialize Firebase Admin if not already initialized
if (!global.firebaseAdminApp) {
  global.firebaseAdminApp = initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore(global.firebaseAdminApp);

declare global {
  var firebaseAdminApp: any;
}

export async function POST(request: Request) {
  const { email } = await request.json();
  
  // Basic validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Please provide a valid email address' },
      { status: 400 }
    );
  }

  try {
    // Check if email already exists
    const snapshot = await db.collection('waitlist')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      return NextResponse.json(
        { message: 'You\'re already on the waitlist!' },
        { status: 200 }
      );
    }

    // Add to waitlist
    const docRef = await db.collection('waitlist').add({
      email,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        message: 'Thanks for joining our waitlist!',
        id: docRef.id 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to waitlist' },
      { status: 500 }
    );
  }
}
