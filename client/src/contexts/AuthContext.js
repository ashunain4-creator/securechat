// src/contexts/AuthContext.js

import React, { useContext, useState, useEffect, createContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile // MODIFIED: Imported updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase'; // MODIFIED: Imported db for Firestore
import { doc, setDoc } from 'firebase/firestore'; // MODIFIED: Imported doc and setDoc for Firestore

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const login = async (email, password) => {
    setError(''); // Clear previous errors
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password); //
      // Check if the user's email is verified after a successful sign-in.
      if (!userCredential.user.emailVerified) { //
        // If not verified, sign the user out immediately.
        await signOut(auth); //
        // Throw a custom error to be caught by the LoginPage component.
        throw new Error('auth/email-not-verified'); //
      }
      return userCredential; //
    } catch (err) {
      // Pass the error up to the component for handling.
      throw err; //
    }
  };

  const signup = async (email, password, name) => {
    setError(''); //
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password); //
      const user = userCredential.user;

      // NEW: Update the profile in Firebase Authentication to store the name
      await updateProfile(user, { displayName: name });

      // NEW: Create a user document in the Firestore 'users' collection
      // This is the critical step that makes the user appear in the chat list.
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: '', // Default empty photo URL
        preferences: { // Default preferences
          theme: 'blue',
          wallpaper: '',
        }
      });

      await sendEmailVerification(user); //
      return userCredential; //
    } catch (err) {
      setError(err.message); //
      throw err; //
    }
  };

  const logout = () => {
    return signOut(auth); //
  };

  const sendVerificationEmail = async () => {
    setError(''); //
    try {
      if (auth.currentUser) { //
        await sendEmailVerification(auth.currentUser); //
      } else {
        throw new Error("No authenticated user to send verification email to."); //
      }
    } catch (err) {
      setError(err.message); //
      throw err; //
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => { //
      setCurrentUser(user); //
      setLoading(false); //
    });
    return unsubscribe; //
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    sendVerificationEmail,
    error,
    setError
  }; //

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  ); //
};