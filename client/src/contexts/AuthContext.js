// src/contexts/AuthContext.js

import React, { useContext, useState, useEffect, createContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile 
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const login = async (email, password) => {
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error('auth/email-not-verified');
      }
      return userCredential;
    } catch (err) {
      throw err;
    }
  };

  const signup = async (email, password, name) => {
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the profile in Firebase Authentication to store the name
      await updateProfile(user, { displayName: name });

      // Create a user document in the Firestore 'users' collection
      // This makes the user appear in the chat list.
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: '', // Default empty photo URL
        preferences: { // Default preferences for new users
          theme: 'blue',
          wallpaper: '',
          // --- Added default backup frequency ---
          backupFrequency: 'off', 
        }
      });

      await sendEmailVerification(user);
      return userCredential;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const sendVerificationEmail = async () => {
    setError('');
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      } else {
        throw new Error("No authenticated user to send verification email to.");
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    sendVerificationEmail,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

