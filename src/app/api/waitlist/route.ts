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
    // First, try to find and update existing email
    const emailQuery = await db.collection('waitlist')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!emailQuery.empty) {
      // Get the first matching document
      const existingDoc = emailQuery.docs[0];
      
      // Update the existing document with current timestamp
      await db.collection('waitlist').doc(existingDoc.id).update({
        email: email,
        updatedAt: new Date().toISOString()
      });

      return NextResponse.json(
        { message: 'Your waitlist entry has been updated!', updated: true },
        { status: 200 }
      );
    }

    // If no existing email found, add new entry
    const docRef = await db.collection('waitlist').add({
      email: email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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