import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { uid, email, displayName, photoURL } = await request.json();

    // Validate required fields
    if (!uid || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: uid and email' },
        { status: 400 }
      );
    }

    // Check if Firebase Admin is initialized
    if (!adminDb) {
      console.error('Firebase Admin not initialized');
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    console.log('Server-side user sync for:', { uid, email, displayName });

    // Check if user document already exists
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDocSnap = await userDocRef.get();

    if (userDocSnap.exists) {
      console.log('User document already exists, updating...');
      await userDocRef.update({
        updatedAt: new Date().toISOString(),
        displayName: displayName || userDocSnap.data()?.displayName || '',
        photoURL: photoURL || userDocSnap.data()?.photoURL || null,
      });
    } else {
      console.log('Creating new user document...');
      const userData = {
        uid,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        displayName: displayName || '',
        emailVerified: true,
        photoURL: photoURL || null,
      };

      await userDocRef.set(userData);
      console.log('✅ User document created successfully');
    }

    // Verify the document was created/updated
    const verifyDoc = await userDocRef.get();
    console.log('✅ Document verification:', verifyDoc.exists);
    if (verifyDoc.exists) {
      console.log('✅ Document data:', verifyDoc.data());
    }

    return NextResponse.json({
      success: true,
      message: 'User synced successfully',
      userData: verifyDoc.data()
    });

  } catch (error: any) {
    console.error('❌ Error syncing user:', error);
    console.error('❌ Error details:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });

    return NextResponse.json(
      { 
        error: 'Failed to sync user',
        details: error?.message 
      },
      { status: 500 }
    );
  }
}