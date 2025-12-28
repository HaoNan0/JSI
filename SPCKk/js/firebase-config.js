/* ============================================
   FIREBASE CONFIGURATION
   Lý do: Initialize Firebase cho Authentication & Firestore
   Thay YOUR_* bằng credentials từ Firebase Console
   ============================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

// FIREBASE CONFIG
// Lý do: Credentials từ Firebase Console
// User cần replace với project thật
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
}

// INITIALIZE FIREBASE
// Lý do: Khởi tạo Firebase app với config
const app = initializeApp(firebaseConfig)

// EXPORT AUTH & FIRESTORE
// Lý do: Các module khác import để sử dụng
export const auth = getAuth(app)
export const db = getFirestore(app)
