import { auth, onAuthStateChanged } from './config_firebase.js';

onAuthStateChanged(auth, (user) => {
    // Ambil nama file sekarang
    const path = window.location.pathname;
    const page = path.split("/").pop();

    // Jika user belum login DAN bukan di halaman index (login), tendang keluar
    if (!user && page !== "index.html" && page !== "") {
        window.location.href = "index.html"; 
    }
});