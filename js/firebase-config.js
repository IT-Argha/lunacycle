window.LUNACYCLE_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBOnKnTACNGYqUNiWRwfXX3X66OSAxymA4',
  authDomain: 'lunacycle-app-7bcc4.firebaseapp.com',
  projectId: 'lunacycle-app-7bcc4',
  storageBucket: 'lunacycle-app-7bcc4.firebasestorage.app',
  messagingSenderId: '642491622015',
  appId: '1:642491622015:web:2255a91e0b90ee82dfd54a'
};
window.LUNACYCLE_DEMO_MODE = false;

if (window.firebase && !firebase.apps.length) {
  firebase.initializeApp(window.LUNACYCLE_FIREBASE_CONFIG);
}

window.lunaFirebase = window.firebase ? {
  auth: firebase.auth(),
  db: firebase.firestore(),
  functions: firebase.functions()
} : null;
