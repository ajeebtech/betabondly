const admin = require('firebase-admin');

// Path to your service account key JSON file
const serviceAccount = require('./serviceAccountKey.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// TODO: Replace with your Firebase Auth UID
const uid = 'hK1HCLOnuXP1mBxP6rYBsWQwBK43';

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('Admin claim set for user:', uid);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting admin claim:', error);
    process.exit(1);
  });
