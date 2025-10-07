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
    // Create a safe document ID from email
    const emailKey = email.toLowerCase().replace(/\./g, "_").replace(/@/g, "_at_");
    
    // Check if document already exists
    const docRef = db.collection('waitlist').doc(emailKey);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      // Email already exists - reject the request
      return NextResponse.json(
        { 
          error: 'This email is already on our waitlist!',
          message: 'You\'re already signed up. We\'ll notify you when we launch!',
          alreadyExists: true
        },
        { status: 409 } // Conflict status code
      );
    }
    
    // Email doesn't exist - create new entry
    await docRef.set({
      email: email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        message: 'Thanks for joining our waitlist!',
        id: emailKey,
        success: true
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