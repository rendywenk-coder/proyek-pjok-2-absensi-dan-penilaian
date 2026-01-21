// config_firebase.js - VERSI FIXED (ROLE BASED) - DIPERBAIKI

// 1. Import library Firebase
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
    serverTimestamp,
    orderByChild,
    equalTo
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyClwzyhBm7tRuDPbVRq3L9Qxg3ffbL2vPM",
    authDomain: "projek-pjok-kedua.firebaseapp.com",
    databaseURL: "https://projek-pjok-kedua-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "projek-pjok-kedua",
    storageBucket: "projek-pjok-kedua.firebasestorage.app",
    messagingSenderId: "14796349679",
    appId: "1:14796349679:web:9e16053805f458631b1479"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// 4. Helper Functions (Fungsi Bantuan)

// Ambil Data User Lengkap
async function getUserData(uid) {
    try {
        const snapshot = await get(child(ref(db), `users/${uid}`));
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.warn("User data not found for UID:", uid);
            return null;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
}

// Ambil Role User
async function getUserRole(uid) {
    const userData = await getUserData(uid);
    return userData ? userData.role : null;
}

// Ambil semua data users (untuk admin)
async function getAllUsers() {
    try {
        const snapshot = await get(ref(db, 'users'));
        if (snapshot.exists()) {
            return snapshot.val();
        }
        return {};
    } catch (error) {
        console.error("Error fetching all users:", error);
        return {};
    }
}

// Cek apakah user sudah login
function isUserLoggedIn() {
    return auth.currentUser !== null;
}

// Get current user UID
function getCurrentUserId() {
    return auth.currentUser ? auth.currentUser.uid : null;
}

// Get current user email
function getCurrentUserEmail() {
    return auth.currentUser ? auth.currentUser.email : null;
}

// --- BAGIAN YANG DIPERBAIKI (LOGIKA IZIN) ---

// Fungsi untuk cek permission absensi
// Logic Baru: Semua Role Guru & Admin BOLEH masuk
function checkAbsensiPermission(userRole, userEmail) {
    // Daftar role yang diizinkan
    const allowedRoles = ['ADMIN', 'GURU_KELAS', 'GURU_PJOK', 'GURU_PAI'];
    
    // Debugging (Cek di Console browser jika masih gagal)
    console.log(`[AUTH] Cek Absensi: Role=${userRole}, Email=${userEmail}`);
    
    if (allowedRoles.includes(userRole)) {
        return true;
    }
    return false;
}

// Fungsi untuk cek permission penilaian
// Logic Baru: Semua Role Guru & Admin BOLEH masuk halaman ini
// (Filter mata pelajaran nanti ditangani oleh file penilaian.html sendiri)
function checkPenilaianPermission(userRole, userEmail) {
    // Daftar role yang diizinkan
    const allowedRoles = ['ADMIN', 'GURU_KELAS', 'GURU_PJOK', 'GURU_PAI'];
    
    // Debugging
    console.log(`[AUTH] Cek Penilaian: Role=${userRole}, Email=${userEmail}`);
    
    if (allowedRoles.includes(userRole)) {
        return true;
    }
    return false;
}

// Fungsi untuk cek permission admin dashboard
function checkAdminPermission(userRole) {
    return userRole === 'ADMIN';
}

// Fungsi untuk cek permission berdasarkan halaman
function checkPagePermission(userRole, pageName) {
    const permissions = {
        'admin': ['ADMIN'],
        'absensi': ['ADMIN', 'GURU_KELAS', 'GURU_PJOK', 'GURU_PAI'],
        'penilaian': ['ADMIN', 'GURU_KELAS', 'GURU_PJOK', 'GURU_PAI'],
        'laporan': ['ADMIN', 'GURU_KELAS', 'GURU_PJOK', 'GURU_PAI'],
        'dashboard': ['ADMIN', 'GURU_KELAS', 'GURU_PJOK', 'GURU_PAI']
    };
    
    const allowedRoles = permissions[pageName] || [];
    return allowedRoles.includes(userRole);
}

// ----------------------------------------------

// Fungsi untuk debug write permission (Biarkan saja untuk test)
async function testWritePermission(path, testData = { test: true, timestamp: new Date().toISOString() }) {
    try {
        const testRef = ref(db, path);
        await set(testRef, testData);
        console.log(`✅ Write test SUCCESS to: ${path}`);
        
        // Cleanup
        await remove(testRef);
        return true;
    } catch (error) {
        console.error(`❌ Write test FAILED to ${path}:`, error.message, error.code);
        return false;
    }
}

// Fungsi untuk membuat user baru (admin only)
async function createUserAccount(email, password, userData) {
    try {
        // Create user in auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        
        // Add user data to database
        await set(ref(db, `users/${uid}`), {
            ...userData,
            email: email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        
        console.log(`✅ User created successfully: ${email}`);
        return { success: true, uid: uid };
    } catch (error) {
        console.error(`❌ Error creating user:`, error);
        return { success: false, error: error.message };
    }
}

// Fungsi untuk reset password
async function resetUserPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: "Password reset email sent" };
    } catch (error) {
        console.error(`❌ Error sending reset email:`, error);
        return { success: false, error: error.message };
    }
}

// Fungsi untuk update user data
async function updateUserData(uid, updates) {
    try {
        const updatesWithTimestamp = {
            ...updates,
            updatedAt: serverTimestamp()
        };
        
        await update(ref(db, `users/${uid}`), updatesWithTimestamp);
        console.log(`✅ User data updated for UID: ${uid}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Error updating user data:`, error);
        return { success: false, error: error.message };
    }
}

// Fungsi untuk cek jika email sudah terdaftar
async function checkEmailExists(email) {
    try {
        const usersRef = ref(db, 'users');
        const snapshot = await get(query(usersRef, orderByChild('email'), equalTo(email)));
        return snapshot.exists();
    } catch (error) {
        console.error("Error checking email:", error);
        return false;
    }
}

// Helper untuk redirect jika tidak authorized
function redirectIfUnauthorized(userRole, allowedRoles, redirectUrl = 'login.html') {
    if (!allowedRoles.includes(userRole)) {
        console.warn(`⚠️ Unauthorized access. Redirecting to ${redirectUrl}`);
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

// 5. EXPORT SEMUA FUNGSI
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
    orderByChild,
    equalTo,
    serverTimestamp,
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    getUserData,
    getUserRole,
    getAllUsers,
    getCurrentUserId,
    getCurrentUserEmail,
    isUserLoggedIn,
    checkAbsensiPermission,
    checkPenilaianPermission,
    checkAdminPermission,
    checkPagePermission,
    testWritePermission,
    createUserAccount,
    resetUserPassword,
    updateUserData,
    checkEmailExists,
    redirectIfUnauthorized
};