// script_import_siswa.js - PERBAIKAN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// GANTI DENGAN KONFIGURASI ANDA YANG BENAR
const firebaseConfig = {
    apiKey: "AIzaSyClwzyhBm7tRuDPbVRq3L9Qxg3ffbL2vPM",
    authDomain: "projek-pjok-kedua.firebaseapp.com",
    databaseURL: "https://projek-pjok-kedua-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "projek-pjok-kedua",
    storageBucket: "projek-pjok-kedua.firebasestorage.app",
    messagingSenderId: "14796349679",
    appId: "1:14796349679:web:9e16053805f458631b1479"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Data siswa contoh untuk SDN Rawabuntu 03 (sesuaikan dengan data asli)
const dataSiswa = {
    "1A": {
        "ADINDA_JIHAN_NURHALIMAH": {
            nama: "ADINDA JIHAN NURHALIMAH",
            kelas: "1A",
            nis: "2024001",
            gender: "P",
            alamat: "Jl. Rawabuntu Raya No. 1",
            tanggal_lahir: "2018-03-15",
            nama_ortu: "Bapak Nurhalimah",
            telepon: "081234567890",
            email_ortu: "nurhalimah@gmail.com",
            createdAt: new Date().toISOString()
        },
        "AHMAD_FAUZI": {
            nama: "AHMAD FAUZI",
            kelas: "1A",
            nis: "2024002",
            gender: "L",
            alamat: "Jl. Rawabuntu Raya No. 2",
            tanggal_lahir: "2018-05-20",
            nama_ortu: "Ibu Fauzi",
            telepon: "081234567891",
            email_ortu: "fauzi@gmail.com",
            createdAt: new Date().toISOString()
        }
    },
    "1B": {
        "INTAN_PERMATA": {
            nama: "INTAN PERMATA",
            kelas: "1B",
            nis: "2024003",
            gender: "P",
            alamat: "Jl. Rawabuntu Raya No. 3",
            tanggal_lahir: "2018-04-10",
            nama_ortu: "Bapak Permata",
            telepon: "081234567892",
            email_ortu: "permata@gmail.com",
            createdAt: new Date().toISOString()
        }
    },
    "2A": {
        "BUDI_SANTOSO": {
            nama: "BUDI SANTOSO",
            kelas: "2A",
            nis: "2023001",
            gender: "L",
            alamat: "Jl. Rawabuntu Raya No. 4",
            tanggal_lahir: "2017-06-25",
            nama_ortu: "Ibu Santoso",
            telepon: "081234567893",
            email_ortu: "santoso@gmail.com",
            createdAt: new Date().toISOString()
        }
    }
};

// Fungsi untuk import data
async function importData() {
    try {
        let totalImported = 0;
        
        console.log("Memulai import data siswa...");
        
        for (const [kelas, siswaKelas] of Object.entries(dataSiswa)) {
            console.log(`Memproses Kelas ${kelas}...`);
            
            for (const [namaKey, data] of Object.entries(siswaKelas)) {
                // Gunakan nama sebagai key (dengan underscore)
                const keyName = data.nama.replace(/\s+/g, '_').toUpperCase();
                const siswaRef = ref(db, `siswa/${kelas}/${keyName}`);
                
                await set(siswaRef, data);
                console.log(`✓ Imported: ${data.nama} - ${kelas} (NIS: ${data.nis})`);
                totalImported++;
                
                // Tunggu sedikit untuk menghindari rate limit
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        console.log(`\n✅ Import selesai! Total ${totalImported} siswa berhasil diimport.`);
        alert(`✅ Data siswa berhasil diimport!\nTotal: ${totalImported} siswa`);
        
    } catch (error) {
        console.error("❌ Error importing:", error);
        alert("❌ Error: " + error.message);
    }
}

// Tambahkan juga user untuk siswa
async function importUserAccounts() {
    try {
        console.log("Membuat akun user untuk siswa...");
        
        // Anda perlu mengimport auth functions jika ingin membuat akun
        // import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
        // const auth = getAuth(app);
        
        // Untuk saat ini, cukup simpan sebagai data siswa saja
        console.log("Akun user akan dibuat manual atau melalui admin panel");
        
    } catch (error) {
        console.error("Error creating user accounts:", error);
    }
}

// Jalankan import saat file dijalankan
console.log("Script import siswa siap.");
console.log("Untuk menjalankan import, panggil: importData()");

// Export fungsi agar bisa dipanggil dari console
window.importData = importData;
window.importUserAccounts = importUserAccounts;

// Auto-run jika di console
if (typeof window !== 'undefined') {
    console.log("Gunakan perintah: importData() untuk memulai import");
}