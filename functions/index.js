const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
initializeApp();
const db = getFirestore();

// Callable registration reserves the normalized username in a trusted transaction.
exports.registerWithUsername = onCall(async (request) => {
  const { firstName, lastName, age, username, password } = request.data || {};
  const normalized = String(username || '').trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(normalized) || !password || password.length < 8) {
    throw new HttpsError('invalid-argument', 'Please provide valid registration details.');
  }
  const usernameRef = db.doc(`usernames/${normalized}`);
  const account = await getAuth().createUser({ email: `${normalized}@accounts.lunacycle.app`, password, displayName: `${firstName} ${lastName}` });
  try {
    await db.runTransaction(async (tx) => {
      const reserved = await tx.get(usernameRef);
      if (reserved.exists) throw new HttpsError('already-exists', 'Username is already taken.');
      tx.create(usernameRef, { uid: account.uid, createdAt: FieldValue.serverTimestamp() });
      tx.create(db.doc(`users/${account.uid}`), { firstName, lastName, age: Number(age), username: normalized, usernameNormalized: normalized, createdAt: FieldValue.serverTimestamp(), preferences: { theme: 'light', defaultCycle: 28 } });
    });
  } catch (error) {
    await getAuth().deleteUser(account.uid);
    throw error;
  }
  return { uid: account.uid };
});

exports.deleteAccountData = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
  const uid = request.auth.uid;
  const profile = await db.doc(`users/${uid}`).get();
  const batch = db.batch();
  const periods = await db.collection(`users/${uid}/periods`).get();
  periods.docs.forEach(doc => batch.delete(doc.ref));
  if (profile.exists && profile.data().usernameNormalized) batch.delete(db.doc(`usernames/${profile.data().usernameNormalized}`));
  batch.delete(db.doc(`users/${uid}`));
  await batch.commit();
  await getAuth().deleteUser(uid);
  return { deleted: true };
});
