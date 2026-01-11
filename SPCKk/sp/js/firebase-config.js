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
  apiKey: "AIzaSyC1BdGk786XLyudxeY7kx9CiSvpSSphrhg",
  authDomain: "spck-94106.firebaseapp.com",
  projectId: "spck-94106",
  storageBucket: "spck-94106.firebasestorage.app",
  messagingSenderId: "746508249338",
  appId: "1:746508249338:web:9f8d8507a3b72786280143",
  measurementId: "G-MNYH8SS1Q5"
};

// INITIALIZE FIREBASE
// Lý do: Khởi tạo Firebase app với config
const app = initializeApp(firebaseConfig)

// EXPORT AUTH & FIRESTORE
// Lý do: Các module khác import để sử dụng
export const auth = getAuth(app)
export const db = getFirestore(app)
