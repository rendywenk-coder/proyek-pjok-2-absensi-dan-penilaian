// 1. Import library Firebase (Versi 10.7.1)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    update, 
    onValue, 
    push, 
    child, 
    remove, 
    query, 
    limitToLast, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. Konfigurasi Firebase Bapak (Tetap Sama)
const firebaseConfig = {
    apiKey: "AIzaSyClwzyhBm7tRuDPbVRq3L9Qxg3ffbL2vPM",
    authDomain: "projek-pjok-kedua.firebaseapp.com",
    databaseURL: "https://projek-pjok-kedua-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "projek-pjok-kedua",
    storageBucket: "projek-pjok-kedua.firebasestorage.app",
    messagingSenderId: "858347640381",
    appId: "1:858347640381:web:a770fc185fd4b867bbfc54"
};

// 3. Inisialisasi
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// 4. EXPORT SEMUA (Agar semua file HTML yang kita perbaiki tadi tidak error)
export { 
    app, 
    db, 
    auth, 
    ref, 
    set, 
    get, 
    update, 
    onValue, 
    push, 
    child, 
    remove, 
    query, 
    limitToLast, 
    serverTimestamp, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
};