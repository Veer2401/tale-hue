import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCOsaHpDM-kwDeMWoXLlDCDubCg4RR_e-w",
  authDomain: "tale-hue-13d8f.firebaseapp.com",
  projectId: "tale-hue-13d8f",
  storageBucket: "tale-hue-13d8f.firebasestorage.app",
  messagingSenderId: "1048006726669",
  appId: "1:1048006726669:web:9b3c73be23b41e35be7144",
  measurementId: "G-F5LD753PFS",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const getInvisibleRecaptcha = (containerId: string) =>
  new RecaptchaVerifier(auth, containerId, { size: "invisible" });

export default app;


