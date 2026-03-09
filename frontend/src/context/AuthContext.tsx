import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Firebase not configured; run the app in "no-auth" mode.
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Ensure user profile exists in backend and store backend JWT for API auth.
        try {
          const res = await axios.post('/api/auth/register', {
            firebase_uid: user.uid,
            email: user.email,
          });

          const accessToken = res?.data?.access_token;
          if (accessToken) {
            localStorage.setItem('token', accessToken);
          } else {
            // Fallback to Firebase ID token if backend didn't return a JWT.
            const firebaseToken = await user.getIdToken();
            localStorage.setItem('token', firebaseToken);
          }
        } catch (error) {
          console.error('Failed to sync user profile:', error);
          // Fallback to Firebase ID token (may still work if backend verifies Firebase tokens)
          const firebaseToken = await user.getIdToken();
          localStorage.setItem('token', firebaseToken);
        }
      } else {
        localStorage.removeItem('token');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Authentication is disabled (Firebase is not configured).');
    }
    await signInWithEmailAndPassword(auth, email, password);
    // User profile will be synced automatically in onAuthStateChanged
  };

  const signUp = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Authentication is disabled (Firebase is not configured).');
    }
    await createUserWithEmailAndPassword(auth, email, password);
    // User profile will be created automatically in onAuthStateChanged
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Authentication is disabled (Firebase is not configured).');
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // User profile will be synced automatically in onAuthStateChanged
  };

  const logout = async () => {
    if (!auth) {
      return;
    }
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
