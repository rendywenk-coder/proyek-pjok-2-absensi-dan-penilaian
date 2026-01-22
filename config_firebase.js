
// config_firebase.js - VERSI FIXED & OPTIMIZED

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

// --- BAGIAN PERMISSION CHECK YANG DIPERBAIKI ---

// Fungsi untuk cek permission absensi
function checkAbsensiPermission(userRole, userEmail) {
    // Daftar role yang diizinkan
    const allowedRoles = ['ADMIN', 'GURU_KELAS', 'GURU_PJOK', 'GURU_PAI'];
    
    // Debugging
    console.log(`[AUTH CHECK] Role: ${userRole}, Email: ${userEmail}`);
    
    if (allowedRoles.includes(userRole)) {
        console.log(`[AUTH GRANTED] User ${userEmail} (${userRole}) dapat mengakses absensi`);
        return true;
    }
    
    console.log(`[AUTH DENIED] User ${userEmail} (${userRole}) tidak dapat mengakses absensi`);
    return false;
}

// Fungsi untuk cek permission penilaian
function checkPenilaianPermission(userRole, userEmail, mataPelajaran = null) {
    const allowedRoles = ['ADMIN', 'GURU_KELAS', 'GURU_PJOK', 'GURU_PAI'];
    
    console.log(`[AUTH CHECK PENILAIAN] Role: ${userRole}, Mapel: ${mataPelajaran}`);
    
    if (!allowedRoles.includes(userRole)) {
        return false;
    }
    
    // Validasi khusus berdasarkan mata pelajaran
    if (mataPelajaran) {
        switch(mataPelajaran) {
            case 'akademik':
                return userRole === 'ADMIN' || userRole === 'GURU_KELAS';
            case 'pjok':
                return userRole === 'ADMIN' || userRole === 'GURU_PJOK';
            case 'pai':
                return userRole === 'ADMIN' || userRole === 'GURU_PAI';
            default:
                return false;
        }
    }
    
    return true;
}

// Fungsi untuk cek permission admin dashboard
function checkAdminPermission(userRole) {
    const isAdmin = userRole === 'ADMIN';
    console.log(`[ADMIN CHECK] Role: ${userRole}, Is Admin: ${isAdmin}`);
    return isAdmin;
}

// Fungsi untuk cek permission berdasarkan halaman
function checkPagePermission(userRole, pageName) {
    const permissions = {
        'admin': ['ADMIN'],
        'absensi': ['ADMIN', 'GURU_KELAS', 'GURU_PJOK', 'GURU_PAI'],
        'penilaian': ['ADMIN', 'GURU_KELAS', 'GURU_PJOK', 'GURU_PAI'],
        'laporan': ['ADMIN', 'GURU_KELAS', 'GURU_PJOK', 'GURU_PAI'],
        'dashboard': ['ADMIN', 'GURU_KELAS', 'GURU_PJOK', 'GURU_PAI'],
        'scanner': ['ADMIN', 'GURU_KELAS', 'GURU_PJOK', 'GURU_PAI'],
        'rekap_absen_admin': ['ADMIN'] // Hanya admin
    };
    
    const allowedRoles = permissions[pageName] || [];
    const hasPermission = allowedRoles.includes(userRole);
    
    console.log(`[PAGE CHECK] Page: ${pageName}, Role: ${userRole}, Allowed: ${hasPermission}`);
    
    return hasPermission;
}

// PERBAIKAN: Fungsi untuk validasi delete permission (khusus admin)
async function checkDeletePermission(userId) {
    try {
        const userData = await getUserData(userId);
        if (!userData) return false;
        
        return userData.role === 'ADMIN';
    } catch (error) {
        console.error("Error checking delete permission:", error);
        return false;
    }
}

// PERBAIKAN: Fungsi untuk validasi write permission dengan path tertentu
async function checkWritePermission(userId, path) {
    try {
        const userData = await getUserData(userId);
        if (!userData) return false;
        
        const userRole = userData.role;
        
        // Logika permission berdasarkan path
        if (path.includes('absensi/')) {
            return ['ADMIN', 'GURU_KELAS', 'GURU_PJOK', 'GURU_PAI'].includes(userRole);
        }
        
        if (path.includes('nilai/akademik/')) {
            return userRole === 'ADMIN' || userRole === 'GURU_KELAS';
        }
        
        if (path.includes('nilai/pjok/')) {
            return userRole === 'ADMIN' || userRole === 'GURU_PJOK';
        }
        
        if (path.includes('nilai/pai/')) {
            return userRole === 'ADMIN' || userRole === 'GURU_PAI';
        }
        
        if (path.includes('users/')) {
            return userRole === 'ADMIN';
        }
        
        return false;
    } catch (error) {
        console.error("Error checking write permission:", error);
        return false;
    }
}

// ----------------------------------------------

// Fungsi untuk debug write permission
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
        // PERBAIKAN: Validasi role sebelum create
        if (!checkAdminPermission(userData.role)) {
            return { success: false, error: "Hanya admin yang bisa membuat user" };
        }
        
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
        // PERBAIKAN: Validasi permission
        const currentUserId = getCurrentUserId();
        const currentUserData = await getUserData(currentUserId);
        
        if (!currentUserData) {
            return { success: false, error: "User tidak ditemukan" };
        }
        
        // Hanya admin atau user itu sendiri yang bisa update
        if (currentUserData.role !== 'ADMIN' && currentUserId !== uid) {
            return { success: false, error: "Tidak memiliki izin untuk update user ini" };
        }
        
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

// PERBAIKAN: Helper untuk redirect jika tidak authorized dengan logging
function redirectIfUnauthorized(userRole, allowedRoles, redirectUrl = 'index.html', pageName = 'unknown') {
    if (!allowedRoles.includes(userRole)) {
        console.warn(`⚠️ Unauthorized access to ${pageName}. User role: ${userRole}. Redirecting to ${redirectUrl}`);
        
        // Tampilkan alert sebelum redirect
        setTimeout(() => {
            alert(`Akses ditolak. Anda (${userRole}) tidak memiliki izin untuk mengakses halaman ${pageName}.`);
        }, 100);
        
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 500);
        
        return false;
    }
    return true;
}

// PERBAIKAN: Fungsi untuk get semester aktif
async function getSemesterAktif() {
    try {
        const snapshot = await get(ref(db, 'pengaturan/umum'));
        if (snapshot.exists()) {
            const data = snapshot.val();
            return data.semesterAktif || "1";
        }
        return "1"; // Default semester 1
    } catch (error) {
        console.error("Error getting semester aktif:", error);
        return "1";
    }
}

// PERBAIKAN: Fungsi untuk get pengaturan jam pelajaran
async function getJamPelajaran(dayType = 'umum') {
    try {
        const snapshot = await get(ref(db, `pengaturan/jamPelajaran/${dayType}`));
        if (snapshot.exists()) {
            return snapshot.val();
        }
        return null;
    } catch (error) {
        console.error("Error getting jam pelajaran:", error);
        return null;
    }
}

// PERBAIKAN: Fungsi untuk log aktivitas (admin only)
async function logActivity(adminName, action, details) {
    try {
        const logRef = push(ref(db, 'log_aktivitas'));
        await set(logRef, {
            waktu: serverTimestamp(),
            admin: adminName,
            aksi: action,
            detail: details,
            timestamp: Date.now()
        });
        console.log(`✅ Activity logged: ${action}`);
        return true;
    } catch (error) {
        console.error("Error logging activity:", error);
        return false;
    }
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
    checkDeletePermission,
    checkWritePermission,
    testWritePermission,
    createUserAccount,
    resetUserPassword,
    updateUserData,
    checkEmailExists,
    redirectIfUnauthorized,
    getSemesterAktif,
    getJamPelajaran,
    logActivity
};