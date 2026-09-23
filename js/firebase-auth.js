/**
 * Treat App - Firebase Authentication Controller
 * Project: treat-app-official
 * Handles Admin Authentication via Firebase v10 Modular SDK (CDN)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIIpYSBq8pSYgVmZF_O4c-hbJ5HdeIoQ0",
  authDomain: "treat-app-official.firebaseapp.com",
  projectId: "treat-app-official",
  storageBucket: "treat-app-official.firebasestorage.app",
  messagingSenderId: "673182827969",
  appId: "1:673182827969:web:a2f4f61361a7c1ebbb1b40",
  measurementId: "G-CRK95P1XQ7"
};

// Initialize Firebase App & Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Friendly error message translator
function formatAuthError(error) {
  if (!error) return "An unknown authentication error occurred.";
  const code = error.code || "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Invalid admin email or password. Please check and try again.";
    case "auth/invalid-email":
      return "Please enter a valid admin email address.";
    case "auth/user-disabled":
      return "This admin account has been disabled. Contact system owner.";
    case "auth/too-many-requests":
      return "Access temporarily blocked due to multiple failed attempts. Please wait a few minutes or reset password.";
    case "auth/network-request-failed":
      return "Network connection issue. Please check your internet connection.";
    case "auth/popup-closed-by-user":
      return "Google sign-in popup was closed before completing.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups for this site.";
    case "auth/operation-not-allowed":
      return "Email/Password sign-in is not enabled in Firebase Console. Please enable it in Authentication -> Sign-in method.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in your Firebase Console. Add it in Authentication -> Settings -> Authorized domains.";
    default:
      return error.message || "Failed to authenticate. Access denied.";
  }
}

// Ready state promise
let authReadyResolver;
const isReadyPromise = new Promise((resolve) => {
  authReadyResolver = resolve;
});

let isFirstStateFired = false;
let currentUser = null;
const authListeners = new Set();

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (!isFirstStateFired) {
    isFirstStateFired = true;
    authReadyResolver(user);
  }
  authListeners.forEach((callback) => {
    try {
      callback(user);
    } catch (err) {
      console.error("Error in TreatAuth listener callback:", err);
    }
  });
});

// TreatAuth Global API
export const TreatAuth = {
  auth,

  /**
   * Check if Firebase Auth initial state has been resolved
   */
  isReady() {
    return isReadyPromise;
  },

  /**
   * Get current authenticated Firebase user
   */
  getCurrentUser() {
    return currentUser || auth.currentUser;
  },

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated() {
    return !!(currentUser || auth.currentUser);
  },

  /**
   * Sign in with Email and Password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<UserCredential>}
   */
  async loginWithEmail(email, password) {
    if (!email || !password) {
      throw new Error("Please provide both admin email and password.");
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      currentUser = userCredential.user;
      return userCredential.user;
    } catch (error) {
      const friendlyMsg = formatAuthError(error);
      const enhancedError = new Error(friendlyMsg);
      enhancedError.code = error.code;
      enhancedError.original = error;
      throw enhancedError;
    }
  },

  /**
   * Sign in with Google (1-click founder authentication)
   * @returns {Promise<UserCredential>}
   */
  async loginWithGoogle() {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      currentUser = userCredential.user;
      return userCredential.user;
    } catch (error) {
      const friendlyMsg = formatAuthError(error);
      const enhancedError = new Error(friendlyMsg);
      enhancedError.code = error.code;
      enhancedError.original = error;
      throw enhancedError;
    }
  },

  /**
   * Send Password Reset Email
   * @param {string} email
   * @returns {Promise<void>}
   */
  async sendPasswordReset(email) {
    if (!email) {
      throw new Error("Please enter your admin email address to receive reset link.");
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error) {
      const friendlyMsg = formatAuthError(error);
      const enhancedError = new Error(friendlyMsg);
      enhancedError.code = error.code;
      enhancedError.original = error;
      throw enhancedError;
    }
  },

  /**
   * Sign out from Firebase
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await signOut(auth);
      currentUser = null;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  /**
   * Subscribe to auth state changes
   * @param {Function} callback (user) => void
   * @returns {Function} unsubscribe function
   */
  onAuthStateChanged(callback) {
    authListeners.add(callback);
    // If auth state already resolved, invoke immediately
    if (isFirstStateFired) {
      try {
        callback(currentUser);
      } catch (err) {
        console.error("Error in immediate TreatAuth callback:", err);
      }
    }
    return () => {
      authListeners.delete(callback);
    };
  }
};

// Expose globally for vanilla scripts
if (typeof window !== "undefined") {
  window.TreatAuth = TreatAuth;
  window.dispatchEvent(new CustomEvent("treat:auth-ready", { detail: TreatAuth }));
}

export default TreatAuth;
