const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function fixDuplicateUsers() {
  try {
    console.log('🔧 Fixing duplicate users for jatintheboy@gmail.com...\n');
    
    // The two user IDs we found
    const oldUserId = '5xL5cZaDNtQn11m5ZDk21cZZgAy1'; // Has TEST_COUPLE_002
    const newUserId = 'Qm8jj2qRZ8Xh5KEZ1aQA5XNO5ES2'; // No couple ID
    
    console.log(`Old User (${oldUserId}): Has TEST_COUPLE_002`);
    console.log(`New User (${newUserId}): No couple ID`);
    
    // Get the old user's data
    const oldUserDoc = await db.collection('users').doc(oldUserId).get();
    const oldUserData = oldUserDoc.data();
    
    console.log('\n📋 Old user data:');
    console.log(`   Couple ID: ${oldUserData.coupleId}`);
    console.log(`   Dating Start Date: ${oldUserData.datingStartDate}`);
    console.log(`   Invite Code: ${oldUserData.inviteCode}`);
    
    // Update the new user with the old user's data
    console.log('\n🔄 Updating new user with old user data...');
    await db.collection('users').doc(newUserId).set({
      ...oldUserData,
      uid: newUserId, // Make sure UID matches the document ID
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log('✅ New user document updated');
    
    // Update TEST_COUPLE_002 to use the new user ID
    console.log('\n🔄 Updating TEST_COUPLE_002 members...');
    const coupleRef = db.collection('couples').doc('TEST_COUPLE_002');
    const coupleDoc = await coupleRef.get();
    const coupleData = coupleDoc.data();
    
    if (coupleData.members) {
      // Remove old user ID and add new user ID
      const updatedMembers = coupleData.members.filter(id => id !== oldUserId);
      if (!updatedMembers.includes(newUserId)) {
        updatedMembers.push(newUserId);
      }
      
      await coupleRef.update({
        members: updatedMembers,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ TEST_COUPLE_002 members updated');
      console.log(`   New members: ${JSON.stringify(updatedMembers)}`);
    }
    
    // Delete the old user document
    console.log('\n🗑️  Deleting old user document...');
    await db.collection('users').doc(oldUserId).delete();
    console.log('✅ Old user document deleted');
    
    // Delete the old Firebase Auth user
    console.log('\n🗑️  Deleting old Firebase Auth user...');
    await admin.auth().deleteUser(oldUserId);
    console.log('✅ Old Firebase Auth user deleted');
    
    // Verify the fix
    console.log('\n✅ Verification:');
    const newUserDoc = await db.collection('users').doc(newUserId).get();
    const newUserData = newUserDoc.data();
    console.log(`   New user UID: ${newUserId}`);
    console.log(`   Couple ID: ${newUserData.coupleId}`);
    console.log(`   Dating Start Date: ${newUserData.datingStartDate}`);
    
    const finalCoupleDoc = await coupleRef.get();
    const finalCoupleData = finalCoupleDoc.data();
    console.log(`   TEST_COUPLE_002 members: ${JSON.stringify(finalCoupleData.members)}`);
    
    console.log('\n🎉 Fix complete!');
    console.log('   Now when you sign in with jatintheboy@gmail.com, you should:');
    console.log('   1. Use the same Firebase Auth user (no new user creation)');
    console.log('   2. Have access to TEST_COUPLE_002');
    console.log('   3. Keep all your existing data');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixDuplicateUsers()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
