import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
  apiKey: "AIzaSyCDhLtIL2vE5Ui1qkE2CPdxVoeZyx8u5aY",
  authDomain: "billease-gvhdo.firebaseapp.com",
  projectId: "billease-gvhdo",
  storageBucket: "billease-gvhdo.firebasestorage.app",
  messagingSenderId: "1085159550058",
  appId: "AIzaSyCCvKwTxlQilD5zxn7w53SfZ5RQkt-b_Rk",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// IndexedDB persistence for native platforms — guard against double init
let auth;
try {
  auth = Capacitor.isNativePlatform()
    ? initializeAuth(app, { persistence: indexedDBLocalPersistence })
    : getAuth(app);
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
