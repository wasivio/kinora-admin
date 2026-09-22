import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  signInWithEmail, 
  signUpAdminWithEmail,
  logOutAdmin, 
  resetAdminPassword, 
  verifyAdminRole, 
  isFirebaseConfigured 
} from '../lib/firebase';
import { AdminUser } from '../types';

interface AuthContextType {
  currentUser: User | null;
  adminUser: AdminUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  isFirebaseActive: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerAdminWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isFirebaseActive = isFirebaseConfigured();

  // Listen to Firebase Auth state
  useEffect(() => {
    if (isFirebaseActive && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setIsLoading(true);
        if (user) {
          const authorized = await verifyAdminRole(user);
          if (authorized) {
            setCurrentUser(user);
            setIsAdmin(true);
            setAdminUser({
              uid: user.uid,
              email: user.email || 'admin@kinora.com',
              displayName: user.displayName || 'KINORA Admin',
              photoURL: user.photoURL || undefined,
              role: 'admin',
            });
          } else {
            // Strictly sign out non-admin users
            await logOutAdmin();
            setCurrentUser(null);
            setAdminUser(null);
            setIsAdmin(false);
          }
        } else {
          setCurrentUser(null);
          setAdminUser(null);
          setIsAdmin(false);
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [isFirebaseActive]);

  const handleLoginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (!isFirebaseActive || !auth) {
        throw new Error('Firebase Authentication is not configured.');
      }
      const cred = await signInWithEmail(email, pass);
      const authorized = await verifyAdminRole(cred.user);
      if (!authorized) {
        await logOutAdmin();
        throw new Error('Access Denied: Aapke account ke paas KINORA Admin privileges nahi hain. Sirf "admin" role wale hi login kar sakte hain.');
      }
      setCurrentUser(cred.user);
      setIsAdmin(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterAdmin = async (email: string, pass: string, name?: string) => {
    setIsLoading(true);
    try {
      if (!isFirebaseActive || !auth) {
        throw new Error('Firebase Authentication is not configured.');
      }
      const cred = await signUpAdminWithEmail(email, pass, name);
      setCurrentUser(cred.user);
      setIsAdmin(true);
      setAdminUser({
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: name || 'KINORA Administrator',
        role: 'admin',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      if (isFirebaseActive && auth) {
        await logOutAdmin();
      }
      setCurrentUser(null);
      setAdminUser(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (isFirebaseActive) {
      await resetAdminPassword(email);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        adminUser,
        isAdmin,
        isLoading,
        isFirebaseActive,
        loginWithEmail: handleLoginWithEmail,
        registerAdminWithEmail: handleRegisterAdmin,
        logout: handleLogout,
        resetPassword: handleResetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
