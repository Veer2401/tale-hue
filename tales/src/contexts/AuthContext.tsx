'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, Profile } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateProfile: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set persistence to local storage
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.error('Error setting persistence:', err);
    });

    // Check for redirect result on page load
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await fetchOrCreateProfile(result.user);
        }
      })
      .catch((err) => {
        console.error('Redirect error:', err);
        setError(err.message);
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch or create user profile
        await fetchOrCreateProfile(firebaseUser);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchOrCreateProfile = async (firebaseUser: FirebaseUser) => {
    const profileRef = doc(db, 'profiles', firebaseUser.uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      setProfile(profileSnap.data() as Profile);
    } else {
      // Create user document
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userData: User = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Anonymous',
        email: firebaseUser.email || '',
        phoneNumber: firebaseUser.phoneNumber || '',
        photoURL: firebaseUser.photoURL || '',
        createdAt: serverTimestamp()
      };
      await setDoc(userRef, userData);

      // Create initial profile
      const newProfile: Profile = {
        userID: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'Anonymous',
        bio: '',
        profileImage: firebaseUser.photoURL || '',
        followers: [],
        following: [],
        stories: []
      };
      await setDoc(profileRef, newProfile);
      setProfile(newProfile);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      // Configure Google Provider
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      // Try popup first, fallback to redirect
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (popupError: any) {
        // If popup is blocked or fails, use redirect
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request'
        ) {
          console.log('Popup blocked, using redirect method...');
          await signInWithRedirect(auth, googleProvider);
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/permission-denied') {
        setError('Firebase API key is invalid or suspended. Please check your Firebase configuration.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Please add it to Firebase authorized domains.');
      } else {
        setError(error.message || 'Failed to sign in. Please try again.');
      }
      
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (updatedProfile: Partial<Profile>) => {
    if (!user) return;
    
    const profileRef = doc(db, 'profiles', user.uid);
    await setDoc(profileRef, updatedProfile, { merge: true });
    
    if (profile) {
      setProfile({ ...profile, ...updatedProfile });
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, signInWithGoogle, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
