import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  sendPasswordResetEmail,
  Auth,
  User
} from 'firebase/auth';
import { initializeFirestore, doc, getDoc, setDoc, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'your_firebase_api_key' &&
    firebaseConfig.apiKey.length > 10
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
    });
  } catch (error) {
    console.warn('Firebase initialization error:', error);
  }
}

export { app, auth, db };

// Helper to check if a user is an authorized admin in Firestore
export const verifyAdminRole = async (user: User | null): Promise<boolean> => {
  if (!user || !db) return false;

  try {
    // 1. Check /admins/{uid} in Firestore
    const adminDocRef = doc(db, 'admins', user.uid);
    const adminDoc = await getDoc(adminDocRef);
    if (adminDoc.exists()) {
      const data = adminDoc.data();
      const role = data?.role;
      if (role === 'admin' || role === 'super_admin') {
        return true;
      }
    }

    // 2. Check /users/{uid} in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      const role = data?.role;
      if (role === 'admin' || role === 'super_admin') {
        return true;
      }
    }
  } catch (error) {
    console.error('Error verifying admin role in Firestore:', error);
  }

  // Strictly deny access if role is not 'admin' or 'super_admin'
  return false;
};

// Sign in with Email and Password
export const signInWithEmail = async (email: string, pass: string) => {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Please verify your credentials in .env.');
  }
  return await signInWithEmailAndPassword(auth, email, pass);
};

// Create a new Admin Account with Email and Password
export const signUpAdminWithEmail = async (email: string, pass: string, displayName?: string) => {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Please verify your credentials in .env.');
  }
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (db && cred.user) {
    await setDoc(doc(db, 'admins', cred.user.uid), {
      email: cred.user.email,
      role: 'admin',
      displayName: displayName || 'KINORA Administrator',
      createdAt: new Date().toISOString(),
    });
  }
  return cred;
};

// Sign out
export const logOutAdmin = async () => {
  if (auth) {
    await signOut(auth);
  }
};

// Reset Password
export const resetAdminPassword = async (email: string) => {
  if (!auth) {
    throw new Error('Firebase Auth is not configured. Please set your credentials in .env.');
  }
  return await sendPasswordResetEmail(auth, email);
};
