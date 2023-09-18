import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBw7HcLCDAibs_IMVu3B9qV8jDx85UURyQ",
    authDomain: "markdown-notes-app-a5e84.firebaseapp.com",
    projectId: "markdown-notes-app-a5e84",
    storageBucket: "markdown-notes-app-a5e84.appspot.com",
    messagingSenderId: "215042291268",
    appId: "1:215042291268:web:b0195db90de7cd723fae11",
    measurementId: "G-Q8KPKYTJR6"
  };

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);