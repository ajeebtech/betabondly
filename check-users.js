const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkAndFixUsers() {
  try {
    console.log('🔍 Checking Firebase Auth users...\n');
    
    // List all users
    const listUsersResult = await admin.auth().listUsers();
    console.log(`Found ${listUsersResult.users.length} users in Firebase Auth:`);
    
    listUsersResult.users.forEach((userRecord, index) => {
      console.log(`${index + 1}. UID: ${userRecord.uid}`);
      console.log(`   Email: ${userRecord.email}`);
      console.log(`   Display Name: ${userRecord.displayName || 'Not set'}`);
      console.log(`   Created: ${userRecord.metadata.creationTime}`);
      console.log(`   Last Sign In: ${userRecord.metadata.lastSignInTime}`);
      console.log(`   Providers: ${userRecord.providerData.map(p => p.providerId).join(', ')}`);
      console.log('');
    });
    
    // Check for duplicate emails
    const emailMap = new Map();
    listUsersResult.users.forEach(user => {
      if (user.email) {
        if (emailMap.has(user.email)) {
          console.log(`⚠️  DUPLICATE EMAIL FOUND: ${user.email}`);
          console.log(`   User 1: ${emailMap.get(user.email)}`);
          console.log(`   User 2: ${user.uid}`);
        } else {
          emailMap.set(user.email, user.uid);
        }
      }
    });
    
    // Check Firestore user documents
    console.log('\n🔍 Checking Firestore user documents...\n');
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.size} user documents in Firestore:`);
    
    usersSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. Document ID: ${doc.id}`);
      console.log(`   UID: ${data.uid}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Name: ${data.displayName || data.name || 'Not set'}`);
      console.log(`   Couple ID: ${data.coupleId || 'Not set'}`);
      console.log('');
    });
    
    // Find your specific user
    console.log('\n🎯 Looking for jatintheboy@gmail.com...\n');
    const yourUser = listUsersResult.users.find(user => user.email === 'jatintheboy@gmail.com');
    
    if (yourUser) {
      console.log(`✅ Found your Firebase Auth user:`);
      console.log(`   UID: ${yourUser.uid}`);
      console.log(`   Email: ${yourUser.email}`);
      console.log(`   Created: ${yourUser.metadata.creationTime}`);
      console.log(`   Last Sign In: ${yourUser.metadata.lastSignInTime}`);
      
      // Check if there's a corresponding Firestore document
      const userDoc = await db.collection('users').doc(yourUser.uid).get();
      if (userDoc.exists) {
        console.log(`✅ Firestore document exists`);
        const data = userDoc.data();
        console.log(`   Couple ID: ${data.coupleId || 'Not set'}`);
        console.log(`   Dating Start Date: ${data.datingStartDate || 'Not set'}`);
        console.log(`   Invite Code: ${data.inviteCode || 'Not set'}`);
      } else {
        console.log(`❌ No Firestore document found for this user`);
      }
    } else {
      console.log(`❌ No Firebase Auth user found with email jatintheboy@gmail.com`);
    }
    
    // Check for multiple users with same email
    const duplicateEmails = [];
    const emailCounts = new Map();
    listUsersResult.users.forEach(user => {
      if (user.email) {
        emailCounts.set(user.email, (emailCounts.get(user.email) || 0) + 1);
      }
    });
    
    emailCounts.forEach((count, email) => {
      if (count > 1) {
        duplicateEmails.push(email);
      }
    });
    
    if (duplicateEmails.length > 0) {
      console.log('\n⚠️  DUPLICATE EMAILS FOUND:');
      duplicateEmails.forEach(email => {
        console.log(`   ${email}: ${emailCounts.get(email)} users`);
      });
      
      console.log('\n🔧 SOLUTION: You may need to merge or delete duplicate users');
      console.log('   This can be done in Firebase Console > Authentication > Users');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAndFixUsers()
  .then(() => {
    console.log('\n✅ Check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  });
