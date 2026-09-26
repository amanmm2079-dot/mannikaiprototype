import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile, UserRole } from '../types';
import { recordAuditLog } from './caseService';
import { DEMO_ACCOUNTS, DemoAccount, ensureFirebaseAuthAccount, seedFirestoreCollections } from './seedService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  quickDemoLogin: (acc: DemoAccount) => Promise<void>;
  impersonateRole: (role: UserRole) => void;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Firebase Auth listener & auto-seed database
  useEffect(() => {
    // 1. Seed default collections if empty
    seedFirestoreCollections().catch((err) => {
      console.warn('Initial seed error (may already be seeded):', err);
    });

    // 2. Listen to real Firebase Auth changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
          } else {
            // Check if there is an account by email match in demo accounts
            const matchedDemo = DEMO_ACCOUNTS.find(d => d.email.toLowerCase() === (firebaseUser.email || '').toLowerCase());
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: matchedDemo ? matchedDemo.name : firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Authenticated User',
              email: firebaseUser.email || '',
              role: matchedDemo ? matchedDemo.role : 'victim',
              active: true,
              districtId: matchedDemo?.districtId || 'pune',
              stateId: matchedDemo?.stateId || 'maharashtra',
              language: 'hi',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile from Firestore:', err);
        }
      } else {
        // Fallback to default demo user for frictionless review if no user is signed in
        const defaultDemo = DEMO_ACCOUNTS[0]; // Sunita D. (Victim)
        setUserProfile({
          uid: 'demo-sunita-uid',
          name: defaultDemo.name,
          email: defaultDemo.email,
          role: defaultDemo.role,
          active: true,
          districtId: defaultDemo.districtId,
          stateId: defaultDemo.stateId,
          language: 'hi',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await recordAuditLog({
        actorUid: res.user.uid,
        actorRole: userProfile?.role || 'user',
        action: 'AUTHENTICATION_LOGIN_SUCCESS',
        targetType: 'auth',
        targetId: res.user.uid,
        metadata: { email },
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (currentUser) {
      await recordAuditLog({
        actorUid: currentUser.uid,
        actorRole: userProfile?.role || 'user',
        action: 'AUTHENTICATION_LOGOUT',
        targetType: 'auth',
        targetId: currentUser.uid,
      });
    }
    await signOut(auth);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const quickDemoLogin = async (acc: DemoAccount) => {
    setLoading(true);
    try {
      // 1. Log in or create real Firebase Auth account
      const { uid } = await ensureFirebaseAuthAccount(acc);
      // 2. Set profile
      const prof: UserProfile = {
        uid,
        name: acc.name,
        email: acc.email,
        role: acc.role,
        active: true,
        districtId: acc.districtId,
        stateId: acc.stateId,
        language: 'hi',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUserProfile(prof);

      await recordAuditLog({
        actorUid: uid,
        actorRole: acc.role,
        action: 'DEMO_ACCOUNT_AUTHENTICATED',
        targetType: 'auth',
        targetId: uid,
        metadata: { role: acc.role, name: acc.name },
      });
    } catch (err) {
      console.warn('Fallback to local demo session if offline:', err);
      setUserProfile({
        uid: `demo-${acc.role}-uid`,
        name: acc.name,
        email: acc.email,
        role: acc.role,
        active: true,
        districtId: acc.districtId,
        stateId: acc.stateId,
        language: 'hi',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const impersonateRole = (role: UserRole) => {
    const acc = DEMO_ACCOUNTS.find(a => a.role === role) || DEMO_ACCOUNTS[0];
    quickDemoLogin(acc);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        login,
        logout,
        resetPassword,
        quickDemoLogin,
        impersonateRole,
        isDemoMode: true,
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
