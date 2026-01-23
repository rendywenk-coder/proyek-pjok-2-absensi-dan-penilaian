// config_firebase.js - VERSI FIXED & OPTIMIZED (REVISI PERHITUNGAN NILAI)

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
    
    if (allowedRoles.includes(userRole)) {
        return true;
    }
    
    return false;
}

// Fungsi untuk cek permission penilaian
function checkPenilaianPermission(userRole, userEmail, mataPelajaran = null) {
    const allowedRoles = ['ADMIN', 'GURU_KELAS', 'GURU_PJOK', 'GURU_PAI'];
    
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
        'rekap_absen_admin': ['ADMIN'],
        'rekap_nilai_admin': ['ADMIN']
    };
    
    const allowedRoles = permissions[pageName] || [];
    const hasPermission = allowedRoles.includes(userRole);
    
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
        
        // Path baru untuk admin_rekap - hanya admin yang bisa write
        if (path.includes('admin_rekap/')) {
            return userRole === 'ADMIN';
        }
        
        return false;
    } catch (error) {
        console.error("Error checking write permission:", error);
        return false;
    }
}

// ========== FUNGSI SINKRONISASI BARU ==========

// Fungsi untuk sinkronisasi data nilai ke admin_rekap
async function syncNilaiToAdmin(dataNilai, siswaId, mapel, kelas, semester) {
    try {
        // Hitung nilai akhir terlebih dahulu sesuai blueprint baru
        const s1 = dataNilai.s1 || 0;
        const s2 = dataNilai.s2 || 0;
        const s3 = dataNilai.s3 || 0;
        const s4 = dataNilai.s4 || 0;
        const sts = dataNilai.sts || 0;
        const sakit = dataNilai.sakit || 0;
        const ijin = dataNilai.ijin || 0;
        const alfa = dataNilai.alfa || 0;
        
        // Gunakan fungsi hitungNilaiAkhir yang sudah direvisi
        const hasilNilaiAkhir = hitungNilaiAkhir(s1, s2, s3, s4, sts, sakit, ijin, alfa, semester);
        
        const dataAdmin = {
            nilai_s1: dataNilai.s1 || null,
            nilai_s2: dataNilai.s2 || null,
            nilai_s3: dataNilai.s3 || null,
            nilai_s4: dataNilai.s4 || null,
            nilai_sts: dataNilai.sts || null,
            absensi_sakit: dataNilai.sakit || 0,
            absensi_ijin: dataNilai.ijin || 0,
            absensi_alfa: dataNilai.alfa || 0,
            
            // Data nilai akhir hasil perhitungan REVISI
            nilai_akhir: hasilNilaiAkhir.nilai,
            nilai_huruf: hasilNilaiAkhir.huruf,
            nilai_keterangan: hasilNilaiAkhir.keterangan,
            rata_subtest: hasilNilaiAkhir.rataSubtest,
            nilai_sumatif: hasilNilaiAkhir.nilaiSumatif,
            penalti_kehadiran: hasilNilaiAkhir.penaltiKehadiran,
            jumlah_absen: hasilNilaiAkhir.jumlahAbsen,
            
            nama_siswa: dataNilai.nama_siswa || '',
            kelas: kelas,
            mata_pelajaran: mapel,
            semester: semester,
            guru_pencatat: dataNilai.guru_pencatat || 'unknown',
            last_sync: new Date().toISOString(),
            sync_timestamp: Date.now()
        };
        
        const adminRef = ref(db, `admin_rekap/nilai/${semester}/${kelas}/${mapel}/${siswaId}`);
        await update(adminRef, dataAdmin);
        
        console.log("✅ Data nilai berhasil disinkronkan ke admin_rekap");
        return { success: true };
    } catch (error) {
        console.error("❌ Error sinkronisasi nilai ke admin:", error);
        return { success: false, error: error.message };
    }
}

// Fungsi untuk sinkronisasi data absensi ke admin_rekap
async function syncAbsensiToAdmin(dataAbsen, tanggal, kelas, siswaId) {
    try {
        const bulan = parseInt(tanggal.split('-')[1]);
        const semester = (bulan >= 1 && bulan <= 6) ? 'genap' : 'ganjil';
        const mapel = dataAbsen.mata_pelajaran || 'akademik';
        
        const dataAdmin = {
            tanggal: tanggal,
            status: dataAbsen.status,
            waktu: dataAbsen.waktu || '-',
            nama_siswa: dataAbsen.nama_lengkap || '',
            kelas: kelas,
            mata_pelajaran: mapel,
            semester: semester,
            guru_pencatat: dataAbsen.pencatat || 'unknown',
            metode: dataAbsen.metode || 'Manual',
            timestamp: new Date().toISOString(),
            sync_timestamp: Date.now()
        };
        
        const adminRef = ref(db, `admin_rekap/absensi/${semester}/${kelas}/${mapel}/${siswaId}/${tanggal}`);
        await update(adminRef, dataAdmin);
        
        console.log("✅ Data absensi berhasil disinkronkan ke admin_rekap");
        return { success: true };
    } catch (error) {
        console.error("❌ Error sinkronisasi absensi ke admin:", error);
        return { success: false, error: error.message };
    }
}

// Fungsi untuk sinkronisasi massal data lama ke admin_rekap
async function syncAllOldData(mapel, kelas, semester) {
    try {
        console.log(`Memulai sinkronisasi data lama: ${mapel}/${kelas}/${semester}`);
        
        // Ambil data nilai lama
        const nilaiRef = ref(db, `nilai/${mapel}/${kelas}`);
        const nilaiSnap = await get(nilaiRef);
        
        if (!nilaiSnap.exists()) {
            return { success: false, message: "Tidak ada data nilai lama" };
        }
        
        const dataNilai = nilaiSnap.val();
        let counter = 0;
        let errors = 0;
        
        // Hitung absensi untuk semester ini
        const rekapAbsen = await hitungRekapAbsensi(kelas, semester, mapel);
        
        // Proses setiap siswa
        for (const siswaId in dataNilai) {
            if (dataNilai[siswaId][semester]) {
                try {
                    const nilai = dataNilai[siswaId][semester];
                    const abs = rekapAbsen[siswaId] || { s: 0, i: 0, a: 0 };
                    
                    // Hitung nilai akhir menggunakan fungsi yang sudah direvisi
                    const s1 = nilai.s1 || 0;
                    const s2 = nilai.s2 || 0;
                    const s3 = nilai.s3 || 0;
                    const s4 = nilai.s4 || 0;
                    const sts = nilai.sts || 0;
                    const sakit = abs.s || 0;
                    const ijin = abs.i || 0;
                    const alfa = abs.a || 0;
                    
                    const hasilNilaiAkhir = hitungNilaiAkhir(s1, s2, s3, s4, sts, sakit, ijin, alfa, semester);
                    
                    const dataSync = {
                        nilai_s1: nilai.s1 || null,
                        nilai_s2: nilai.s2 || null,
                        nilai_s3: nilai.s3 || null,
                        nilai_s4: nilai.s4 || null,
                        nilai_sts: nilai.sts || null,
                        absensi_sakit: abs.s,
                        absensi_ijin: abs.i,
                        absensi_alfa: abs.a,
                        
                        // Data nilai akhir hasil perhitungan REVISI
                        nilai_akhir: hasilNilaiAkhir.nilai,
                        nilai_huruf: hasilNilaiAkhir.huruf,
                        nilai_keterangan: hasilNilaiAkhir.keterangan,
                        rata_subtest: hasilNilaiAkhir.rataSubtest,
                        nilai_sumatif: hasilNilaiAkhir.nilaiSumatif,
                        penalti_kehadiran: hasilNilaiAkhir.penaltiKehadiran,
                        jumlah_absen: hasilNilaiAkhir.jumlahAbsen,
                        
                        nama_siswa: siswaId.replace(/_/g, ' '),
                        kelas: kelas,
                        mata_pelajaran: mapel,
                        semester: semester,
                        guru_pencatat: nilai.updated_by || 'unknown',
                        last_sync: new Date().toISOString(),
                        sync_timestamp: Date.now()
                    };
                    
                    const adminRef = ref(db, `admin_rekap/nilai/${semester}/${kelas}/${mapel}/${siswaId}`);
                    await update(adminRef, dataSync);
                    
                    counter++;
                } catch (error) {
                    console.error(`Error sinkronisasi siswa ${siswaId}:`, error);
                    errors++;
                }
            }
        }
        
        return { 
            success: true, 
            message: `Berhasil sinkronisasi ${counter} data nilai (${errors} error)`,
            count: counter,
            errors: errors
        };
        
    } catch (error) {
        console.error("❌ Error sinkronisasi massal:", error);
        return { success: false, error: error.message };
    }
}

// Helper function untuk menghitung rekap absensi
async function hitungRekapAbsensi(kelas, semester, mataPelajaran) {
    try {
        const absensiRef = ref(db, 'absensi');
        const snapshot = await get(absensiRef);
        const rekap = {};
        
        if (snapshot.exists()) {
            const allDates = snapshot.val();
            Object.keys(allDates).forEach(tanggal => {
                if (tanggal === 'scanner_qr') return;
                const bulan = parseInt(tanggal.split('-')[1]);
                let masukSemester = false;
                
                if (semester === 'ganjil' && (bulan >= 7 && bulan <= 12)) masukSemester = true;
                if (semester === 'genap' && (bulan >= 1 && bulan <= 6)) masukSemester = true;
                
                if (masukSemester && allDates[tanggal][kelas]) {
                    const dataKelas = allDates[tanggal][kelas];
                    Object.keys(dataKelas).forEach(siswaId => {
                        const dataAbsen = dataKelas[siswaId];
                        const mp = dataAbsen.mata_pelajaran || 'akademik';
                        
                        if (mp === mataPelajaran) {
                            const status = dataAbsen.status?.toLowerCase();
                            if (!rekap[siswaId]) rekap[siswaId] = { s: 0, i: 0, a: 0 };
                            
                            if (status === 'sakit') rekap[siswaId].s++;
                            else if (status === 'ijin') rekap[siswaId].i++;
                            else if (status === 'alfa') rekap[siswaId].a++;
                        }
                    });
                }
            });
        }
        
        return rekap;
    } catch (error) {
        console.error("Error hitung rekap absensi:", error);
        return {};
    }
}

// Fungsi untuk membaca data dari admin_rekap (untuk rekap admin)
async function getAdminRekapData(semester, kelas, mapel) {
    try {
        const adminRef = ref(db, `admin_rekap/nilai/${semester}/${kelas}/${mapel}`);
        const snapshot = await get(adminRef);
        
        if (snapshot.exists()) {
            return snapshot.val();
        }
        return {};
    } catch (error) {
        console.error("Error membaca admin_rekap:", error);
        return {};
    }
}

// ========== FUNGSI PERHITUNGAN NILAI AKHIR (REVISI SESUAI BLUEPRINT BARU) ==========

// Fungsi untuk menghitung nilai akhir berdasarkan blueprint REVISI
function hitungNilaiAkhir(s1, s2, s3, s4, sts, sakit, ijin, alfa, semester = 'ganjil') {
    try {
        // Validasi input
        const subTests = [s1, s2, s3, s4].filter(val => val !== null && val !== undefined && val > 0);
        const nilaiSTS = sts || 0;
        
        if (subTests.length === 0 && nilaiSTS === 0) {
            return {
                nilai: 0,
                huruf: 'E',
                keterangan: 'Belum ada nilai',
                rataSubtest: 0,
                nilaiSumatif: nilaiSTS,
                penaltiKehadiran: 0,
                jumlahAbsen: (sakit || 0) + (ijin || 0) + (alfa || 0)
            };
        }
        
        // 1. Hitung Rata-rata Subtest (Nilai 1-4)
        const rataSubtest = subTests.length > 0 ? 
            subTests.reduce((a, b) => a + b, 0) / subTests.length : 0;
        
        // 2. Hitung Nilai Sumatif (65% Subtest + 35% STS/SAS)
        // REVISI: Sumatif 1-4 = 65%, STS/SAS = 35%
        const nilaiSumatif = (rataSubtest * 0.65) + (nilaiSTS * 0.35);
        
        // 3. Hitung Penalti Kehadiran sesuai blueprint REVISI
        let penaltiKehadiran = 0;
        const totalAbsen = (sakit || 0) + (ijin || 0) + (alfa || 0);
        
        // REVISI: Alfa = 5% maksimal (diambil dari 5% nilai akhir)
        const penaltiAlfa = Math.min((alfa || 0) * 0.5, 5); // 0.5 poin per alfa, maks 5 poin (5%)
        
        // REVISI: Ijin/Sakit > 10 kali = 2% pengurangan
        const izinSakit = (sakit || 0) + (ijin || 0);
        const penaltiIzin = izinSakit > 10 ? 2 : 0;
        
        penaltiKehadiran = penaltiAlfa + penaltiIzin;
        
        // Maksimal penalti 7% (5% alfa + 2% izin/sakit)
        if (penaltiKehadiran > 7) penaltiKehadiran = 7;
        
        // 4. Hitung Nilai Akhir
        let nilaiAkhir = nilaiSumatif - penaltiKehadiran;
        
        // Pastikan tidak minus dan maksimal 100
        nilaiAkhir = Math.max(0, Math.min(100, nilaiAkhir));
        
        // 5. Konversi ke Huruf
        const huruf = getHurufNilai(nilaiAkhir);
        const keterangan = getKeteranganNilai(huruf);
        
        return {
            nilai: parseFloat(nilaiAkhir.toFixed(2)),
            huruf: huruf,
            keterangan: keterangan,
            rataSubtest: parseFloat(rataSubtest.toFixed(2)),
            nilaiSumatif: parseFloat(nilaiSumatif.toFixed(2)),
            penaltiKehadiran: parseFloat(penaltiKehadiran.toFixed(2)),
            jumlahAbsen: totalAbsen,
            detail: {
                penaltiAlfa: parseFloat(penaltiAlfa.toFixed(2)),
                penaltiIzin: parseFloat(penaltiIzin.toFixed(2)),
                totalIzinSakit: izinSakit
            }
        };
        
    } catch (error) {
        console.error("Error menghitung nilai akhir:", error);
        return {
            nilai: 0,
            huruf: 'E',
            keterangan: 'Error perhitungan',
            rataSubtest: 0,
            nilaiSumatif: 0,
            penaltiKehadiran: 0,
            jumlahAbsen: 0
        };
    }
}

// Fungsi untuk mendapatkan huruf nilai
function getHurufNilai(nilai) {
    if (nilai >= 90) return 'A';
    if (nilai >= 80) return 'B';
    if (nilai >= 70) return 'C';
    if (nilai >= 60) return 'D';
    return 'E';
}

// Fungsi untuk mendapatkan keterangan nilai
function getKeteranganNilai(huruf) {
    const keterangan = {
        'A': 'Sangat Baik',
        'B': 'Baik',
        'C': 'Cukup',
        'D': 'Kurang',
        'E': 'Sangat Kurang'
    };
    return keterangan[huruf] || 'Tidak ada nilai';
}

// Fungsi untuk menghitung nilai dari beberapa subtest (legacy function - TETAP DIJAGA)
function hitungNilaiDariSubtest(s1, s2, s3, s4, sumatif, sakit = 0, ijin = 0, alfa = 0) {
    try {
        // Filter nilai yang valid
        const subtests = [s1, s2, s3, s4].filter(val => val !== null && val !== undefined && val > 0);
        const rataSubtest = subtests.length > 0 ? 
            subtests.reduce((a, b) => a + b, 0) / subtests.length : 0;
        
        // REVISI: 65% subtest + 35% sumatif
        let nilaiAkademik = (rataSubtest * 0.65) + (sumatif * 0.35);
        
        // Hitung penalti kehadiran sesuai blueprint REVISI
        const totalAbsen = sakit + ijin + alfa;
        
        // Alfa = 5% maksimal
        const penaltiAlfa = Math.min(alfa * 0.5, 5);
        
        // Ijin/Sakit > 10 kali = 2%
        const izinSakit = sakit + ijin;
        const penaltiIzin = izinSakit > 10 ? 2 : 0;
        
        let penalti = penaltiAlfa + penaltiIzin;
        
        // Maksimal penalti 7%
        if (penalti > 7) penalti = 7;
        
        let finalScore = nilaiAkademik - penalti;
        
        // Pastikan nilai antara 0-100
        finalScore = Math.max(0, Math.min(100, finalScore));
        
        return {
            nilai: Math.round(finalScore),
            huruf: getHurufNilai(finalScore),
            rataSubtest: parseFloat(rataSubtest.toFixed(2)),
            nilaiAkademik: parseFloat(nilaiAkademik.toFixed(2)),
            penalti: parseFloat(penalti.toFixed(2)),
            totalAbsen: totalAbsen,
            detail: {
                penaltiAlfa: parseFloat(penaltiAlfa.toFixed(2)),
                penaltiIzin: parseFloat(penaltiIzin.toFixed(2))
            }
        };
        
    } catch (error) {
        console.error("Error hitung nilai subtest:", error);
        return {
            nilai: 0,
            huruf: 'E',
            rataSubtest: 0,
            nilaiAkademik: 0,
            penalti: 0,
            totalAbsen: 0
        };
    }
}

// ===================================================

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
    
    // Fungsi sinkronisasi baru
    syncNilaiToAdmin,
    syncAbsensiToAdmin,
    syncAllOldData,
    getAdminRekapData,
    hitungRekapAbsensi,
    
    // Fungsi perhitungan nilai baru REVISI
    hitungNilaiAkhir,
    hitungNilaiDariSubtest,
    
    // Fungsi lainnya
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