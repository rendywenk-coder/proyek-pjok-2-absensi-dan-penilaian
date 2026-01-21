// pengaturan_sistem.js - JavaScript untuk halaman Pengaturan Sistem

import { db, ref, get, set, update, remove, onValue, serverTimestamp } from './config_firebase.js';

// Global variables
const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const HARI_UMUM = ['Senin', 'Selasa', 'Rabu', 'Kamis'];
const HARI_JUMAT = ['Jumat'];

// Jam pelajaran default - BISA DIEDIT
let JAM_PELAJARAN_UMUM = [];
let JAM_PELAJARAN_JUMAT = [];

// Daftar mata pelajaran standar SD
const MAPEL_STANDAR_SD = [
    { kode: 'PAI', nama: 'Pendidikan Agama Islam' },
    { kode: 'BIG', nama: 'Bahasa Inggris' },
    { kode: 'PKY', nama: 'Prakarya' },
    { kode: 'BTQ', nama: 'BTQ (Baca Tulis Quran)' },
    { kode: 'MAT', nama: 'Matematika' },
    { kode: 'BIN', nama: 'Bahasa Indonesia' },
    { kode: 'PPK', nama: 'Pendidikan Pancasila' },
    { kode: 'IPAS', nama: 'IPAS (Ilmu Pengetahuan Alam dan Sosial)' },
    { kode: 'SBD', nama: 'Seni Budaya' },
    { kode: 'MPL', nama: 'Mapel Pilihan' },
    { kode: 'MUL', nama: 'Muatan Lokal' },
    { kode: 'IPA', nama: 'Ilmu Pengetahuan Alam' },
    { kode: 'IPS', nama: 'Ilmu Pengetahuan Sosial' },
    { kode: 'PJK', nama: 'Pendidikan Jasmani dan Kesehatan' },
    { kode: 'TIK', nama: 'Teknologi Informasi dan Komunikasi' }
];

// Pilihan khusus selain mata pelajaran
const PILIHAN_KHUSUS = [
    { id: 'istirahat', kode: 'IST', nama: 'Istirahat' },
    { id: 'upacara', kode: 'UPC', nama: 'Upacara' },
    { id: 'kebersihan', kode: 'KBR', nama: 'Kebersihan Kelas' },
    { id: 'sholat', kode: 'SHT', nama: 'Sholat Dhuha' },
    { id: 'konseling', kode: 'KNS', nama: 'Konseling' },
    { id: 'ekstra', kode: 'EKS', nama: 'Ekstrakurikuler' },
    { id: 'kosong', kode: '---', nama: 'Kosong' }
];

// Fungsi untuk show message
function showMessage(text, type) {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) {
        console.log(`${type.toUpperCase()}: ${text}`);
        return;
    }
    
    messageBox.textContent = text;
    messageBox.className = `message ${type}`;
    messageBox.style.display = 'block';
    
    setTimeout(() => {
        messageBox.style.display = 'none';
        messageBox.textContent = '';
        messageBox.className = 'message';
    }, 5000);
}

// Fungsi untuk update counter mapel
function updateMapelCounter(count) {
    const counter = document.getElementById('mapelCount');
    if (counter) {
        counter.textContent = count;
    }
}

// Load jam pelajaran dari database
async function loadJamPelajaran() {
    try {
        console.log('Loading jam pelajaran...');
        
        const [umumSnapshot, jumatSnapshot] = await Promise.all([
            get(ref(db, 'pengaturan/jamPelajaran/umum')),
            get(ref(db, 'pengaturan/jamPelajaran/jumat'))
        ]);
        
        if (umumSnapshot.exists()) {
            const jamData = umumSnapshot.val();
            if (jamData && typeof jamData === 'object') {
                JAM_PELAJARAN_UMUM = Object.values(jamData).sort((a, b) => {
                    return a.mulai.localeCompare(b.mulai);
                });
                console.log('Loaded jam umum:', JAM_PELAJARAN_UMUM.length, 'jam');
            }
        } else {
            // Default jika belum ada
            JAM_PELAJARAN_UMUM = [
                { mulai: '07:00', selesai: '07:40', label: '07:00 - 07:40' },
                { mulai: '07:40', selesai: '08:20', label: '07:40 - 08:20' },
                { mulai: '08:20', selesai: '09:00', label: '08:20 - 09:00' },
                { mulai: '09:00', selesai: '09:40', label: '09:00 - 09:40' },
                { mulai: '10:00', selesai: '10:40', label: '10:00 - 10:40' },
                { mulai: '10:40', selesai: '11:20', label: '10:40 - 11:20' },
                { mulai: '11:20', selesai: '12:00', label: '11:20 - 12:00' },
                { mulai: '12:00', selesai: '12:40', label: '12:00 - 12:40' }
            ];
            console.log('Using default jam umum');
        }
        
        if (jumatSnapshot.exists()) {
            const jamData = jumatSnapshot.val();
            if (jamData && typeof jamData === 'object') {
                JAM_PELAJARAN_JUMAT = Object.values(jamData).sort((a, b) => {
                    return a.mulai.localeCompare(b.mulai);
                });
                console.log('Loaded jam jumat:', JAM_PELAJARAN_JUMAT.length, 'jam');
            }
        } else {
            // Default jika belum ada
            JAM_PELAJARAN_JUMAT = [
                { mulai: '07:00', selesai: '07:40', label: '07:00 - 07:40' },
                { mulai: '07:40', selesai: '08:20', label: '07:40 - 08:20' },
                { mulai: '08:20', selesai: '09:00', label: '08:20 - 09:00' },
                { mulai: '09:00', selesai: '09:40', label: '09:00 - 09:40' },
                { mulai: '10:00', selesai: '10:40', label: '10:00 - 10:40' },
                { mulai: '10:40', selesai: '11:20', label: '10:40 - 11:20' }
            ];
            console.log('Using default jam jumat');
        }
        
        // Render form edit jam jika ada container
        const editJamContainer = document.getElementById('editJamContainer');
        if (editJamContainer) {
            renderEditJamForm();
        }
    } catch (error) {
        console.error('Error loading jam pelajaran:', error);
        showMessage('Gagal memuat jam pelajaran', 'error');
    }
}

// Render form edit jam pelajaran
function renderEditJamForm() {
    const container = document.getElementById('editJamContainer');
    if (!container) return;
    
    let html = `
        <div style="margin-top: 30px; border-top: 2px solid #e2e8f0; padding-top: 25px;">
            <h4 style="color: var(--dark); margin-bottom: 20px; font-size: 16px; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-clock"></i> Edit Jam Pelajaran
            </h4>
            
            <!-- Tab untuk memilih hari -->
            <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                <button id="tabUmum" class="tab-jam active" onclick="showJamTab('umum')" 
                        style="padding: 8px 16px; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                    <i class="fa-solid fa-calendar-day"></i> Senin-Kamis (${JAM_PELAJARAN_UMUM.length} jam)
                </button>
                <button id="tabJumat" class="tab-jam" onclick="showJamTab('jumat')" 
                        style="padding: 8px 16px; background: #f8fafc; color: var(--dark); border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-weight: 500;">
                    <i class="fa-solid fa-mosque"></i> Khusus Jum'at (${JAM_PELAJARAN_JUMAT.length} jam)
                </button>
            </div>
            
            <!-- Container untuk jam Senin-Kamis -->
            <div id="jamUmumContainer" style="display: block;">
                <h5 style="color: var(--dark); margin-bottom: 15px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-calendar-week"></i> Jam Pelajaran Senin s/d Kamis
                    <span style="background: var(--accent); color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px;">
                        ${JAM_PELAJARAN_UMUM.length} jam
                    </span>
                </h5>
                <div id="jamUmumList" style="margin-bottom: 15px;">
    `;
    
    JAM_PELAJARAN_UMUM.forEach((jam, index) => {
        html += `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 8px; background: #f8fafc; border-radius: 6px; border-left: 4px solid var(--accent);">
                <div style="font-weight: 600; min-width: 40px;">Jam ${index + 1}</div>
                <input type="time" id="jamUmumMulai_${index}" value="${jam.mulai}" 
                       style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; width: 100px; font-size: 12px;">
                <span style="color: #64748b;">s/d</span>
                <input type="time" id="jamUmumSelesai_${index}" value="${jam.selesai}" 
                       style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; width: 100px; font-size: 12px;">
                <button onclick="hapusJamPelajaran('umum', ${index})" style="background: #fee2e2; color: #991b1b; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;" ${JAM_PELAJARAN_UMUM.length <= 1 ? 'disabled' : ''}>
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    html += `
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <button onclick="tambahJamPelajaran('umum')" class="btn-success" style="padding: 8px 12px; font-size: 12px; display: flex; align-items: center; gap: 5px;">
                        <i class="fa-solid fa-plus"></i> Tambah Jam
                    </button>
                </div>
            </div>
            
            <!-- Container untuk jam Jumat -->
            <div id="jamJumatContainer" style="display: none;">
                <h5 style="color: var(--dark); margin-bottom: 15px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-star"></i> Jam Pelajaran Khusus Jum'at
                    <span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px;">
                        ${JAM_PELAJARAN_JUMAT.length} jam
                    </span>
                </h5>
                <div style="background: #fffbeb; padding: 10px; border-radius: 6px; margin-bottom: 15px; border-left: 4px solid #f59e0b;">
                    <div style="display: flex; align-items: center; gap: 8px; color: #92400e; font-size: 12px;">
                        <i class="fa-solid fa-info-circle"></i>
                        <span><strong>Catatan:</strong> Hari Jum'at pulang lebih awal jam 11.20</span>
                    </div>
                </div>
                <div id="jamJumatList" style="margin-bottom: 15px;">
    `;
    
    JAM_PELAJARAN_JUMAT.forEach((jam, index) => {
        html += `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 8px; background: #fffbeb; border-radius: 6px; border-left: 4px solid #f59e0b;">
                <div style="font-weight: 600; min-width: 40px;">Jam ${index + 1}</div>
                <input type="time" id="jamJumatMulai_${index}" value="${jam.mulai}" 
                       style="padding: 6px; border: 1px solid #fbbf24; border-radius: 4px; width: 100px; font-size: 12px; background: #fef3c7;">
                <span style="color: #92400e;">s/d</span>
                <input type="time" id="jamJumatSelesai_${index}" value="${jam.selesai}" 
                       style="padding: 6px; border: 1px solid #fbbf24; border-radius: 4px; width: 100px; font-size: 12px; background: #fef3c7;">
                <button onclick="hapusJamPelajaran('jumat', ${index})" style="background: #fee2e2; color: #991b1b; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;" ${JAM_PELAJARAN_JUMAT.length <= 1 ? 'disabled' : ''}>
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    html += `
                </div>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <button onclick="tambahJamPelajaran('jumat')" class="btn-warning" style="padding: 8px 12px; font-size: 12px; display: flex; align-items: center; gap: 5px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fa-solid fa-plus"></i> Tambah Jam
                    </button>
                </div>
            </div>
            
            <!-- Tombol Simpan & Reset -->
            <div style="display: flex; gap: 10px; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                <button onclick="simpanJamPelajaran()" class="btn-primary" style="padding: 10px 16px; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-save"></i> SIMPAN SEMUA JAM PELAJARAN
                </button>
                <button onclick="resetJamPelajaran()" class="btn-danger" style="padding: 10px 16px; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-rotate-left"></i> RESET KE DEFAULT
                </button>
            </div>
            
            <small style="color: #64748b; display: block; margin-top: 10px; font-size: 11px;">
                <i class="fa-solid fa-circle-info"></i> 
                <strong>Senin-Kamis:</strong> ${JAM_PELAJARAN_UMUM.length} jam | 
                <strong>Jum'at:</strong> ${JAM_PELAJARAN_JUMAT.length} jam (pulang lebih awal)
            </small>
        </div>
    `;
    
    container.innerHTML = html;
}

// Show tab jam pelajaran
function showJamTab(tab) {
    const tabUmum = document.getElementById('tabUmum');
    const tabJumat = document.getElementById('tabJumat');
    const containerUmum = document.getElementById('jamUmumContainer');
    const containerJumat = document.getElementById('jamJumatContainer');
    
    if (tab === 'umum') {
        tabUmum.style.background = 'var(--accent)';
        tabUmum.style.color = 'white';
        tabJumat.style.background = '#f8fafc';
        tabJumat.style.color = 'var(--dark)';
        containerUmum.style.display = 'block';
        containerJumat.style.display = 'none';
    } else {
        tabUmum.style.background = '#f8fafc';
        tabUmum.style.color = 'var(--dark)';
        tabJumat.style.background = '#f59e0b';
        tabJumat.style.color = 'white';
        containerUmum.style.display = 'none';
        containerJumat.style.display = 'block';
    }
}

// Tambah jam pelajaran baru
function tambahJamPelajaran(tipe) {
    const jamArray = tipe === 'umum' ? JAM_PELAJARAN_UMUM : JAM_PELAJARAN_JUMAT;
    const maxJam = tipe === 'umum' ? 10 : 8; // Maksimal jam untuk masing-masing
    
    if (jamArray.length >= maxJam) {
        showMessage(`Maksimal ${maxJam} jam pelajaran untuk ${tipe === 'umum' ? 'Senin-Kamis' : 'Jum\'at'}`, 'error');
        return;
    }
    
    const lastJam = jamArray[jamArray.length - 1];
    let newMulai = '13:00';
    let newSelesai = '13:40';
    
    if (lastJam) {
        // Tambah 40 menit dari jam terakhir
        const [hours, minutes] = lastJam.selesai.split(':').map(Number);
        const endTime = new Date();
        endTime.setHours(hours);
        endTime.setMinutes(minutes + 40);
        
        newMulai = lastJam.selesai;
        newSelesai = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;
    }
    
    const newJam = {
        mulai: newMulai,
        selesai: newSelesai,
        label: `${newMulai} - ${newSelesai}`
    };
    
    if (tipe === 'umum') {
        JAM_PELAJARAN_UMUM.push(newJam);
    } else {
        JAM_PELAJARAN_JUMAT.push(newJam);
    }
    
    renderEditJamForm();
    showMessage(`Jam pelajaran baru ditambahkan untuk ${tipe === 'umum' ? 'Senin-Kamis' : 'Jum\'at'}`, 'success');
}

// Hapus jam pelajaran
function hapusJamPelajaran(tipe, index) {
    const jamArray = tipe === 'umum' ? JAM_PELAJARAN_UMUM : JAM_PELAJARAN_JUMAT;
    const minJam = tipe === 'umum' ? 1 : 1;
    
    if (jamArray.length <= minJam) {
        showMessage(`Minimal harus ada ${minJam} jam pelajaran untuk ${tipe === 'umum' ? 'Senin-Kamis' : 'Jum\'at'}`, 'error');
        return;
    }
    
    if (!confirm(`Hapus jam pelajaran ke-${index + 1} untuk ${tipe === 'umum' ? 'Senin-Kamis' : 'Jum\'at'}?`)) return;
    
    jamArray.splice(index, 1);
    renderEditJamForm();
    showMessage('Jam pelajaran dihapus', 'success');
}

// Simpan jam pelajaran ke database
async function simpanJamPelajaran() {
    try {
        console.log('Saving jam pelajaran...');
        
        // Validasi jam pelajaran umum (Senin-Kamis)
        for (let i = 0; i < JAM_PELAJARAN_UMUM.length; i++) {
            const jamMulai = document.getElementById(`jamUmumMulai_${i}`)?.value;
            const jamSelesai = document.getElementById(`jamUmumSelesai_${i}`)?.value;
            
            if (!jamMulai || !jamSelesai) {
                showMessage(`Jam Senin-Kamis ke-${i + 1} tidak valid`, 'error');
                return;
            }
            
            // Format waktu dengan leading zero
            const formatTime = (time) => {
                if (!time) return '00:00';
                const [hours, minutes] = time.split(':');
                return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
            };
            
            // Update data di array
            JAM_PELAJARAN_UMUM[i].mulai = formatTime(jamMulai);
            JAM_PELAJARAN_UMUM[i].selesai = formatTime(jamSelesai);
            JAM_PELAJARAN_UMUM[i].label = `${JAM_PELAJARAN_UMUM[i].mulai} - ${JAM_PELAJARAN_UMUM[i].selesai}`;
            
            // Cek overlap waktu
            if (JAM_PELAJARAN_UMUM[i].mulai >= JAM_PELAJARAN_UMUM[i].selesai) {
                showMessage(`Jam Senin-Kamis ke-${i + 1}: Waktu mulai harus lebih awal dari waktu selesai`, 'error');
                return;
            }
            
            // Cek overlap dengan jam berikutnya
            if (i < JAM_PELAJARAN_UMUM.length - 1) {
                const nextJamMulai = document.getElementById(`jamUmumMulai_${i + 1}`)?.value;
                if (jamSelesai > nextJamMulai) {
                    showMessage(`Jam Senin-Kamis ke-${i + 1} bertabrakan dengan jam ke-${i + 2}`, 'error');
                    return;
                }
            }
        }
        
        // Validasi jam pelajaran Jumat
        for (let i = 0; i < JAM_PELAJARAN_JUMAT.length; i++) {
            const jamMulai = document.getElementById(`jamJumatMulai_${i}`)?.value;
            const jamSelesai = document.getElementById(`jamJumatSelesai_${i}`)?.value;
            
            if (!jamMulai || !jamSelesai) {
                showMessage(`Jam Jum'at ke-${i + 1} tidak valid`, 'error');
                return;
            }
            
            // Format waktu dengan leading zero
            const formatTime = (time) => {
                if (!time) return '00:00';
                const [hours, minutes] = time.split(':');
                return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
            };
            
            // Update data di array
            JAM_PELAJARAN_JUMAT[i].mulai = formatTime(jamMulai);
            JAM_PELAJARAN_JUMAT[i].selesai = formatTime(jamSelesai);
            JAM_PELAJARAN_JUMAT[i].label = `${JAM_PELAJARAN_JUMAT[i].mulai} - ${JAM_PELAJARAN_JUMAT[i].selesai}`;
            
            // Cek overlap waktu
            if (JAM_PELAJARAN_JUMAT[i].mulai >= JAM_PELAJARAN_JUMAT[i].selesai) {
                showMessage(`Jam Jum'at ke-${i + 1}: Waktu mulai harus lebih awal dari waktu selesai`, 'error');
                return;
            }
            
            // Cek overlap dengan jam berikutnya
            if (i < JAM_PELAJARAN_JUMAT.length - 1) {
                const nextJamMulai = document.getElementById(`jamJumatMulai_${i + 1}`)?.value;
                if (jamSelesai > nextJamMulai) {
                    showMessage(`Jam Jum'at ke-${i + 1} bertabrakan dengan jam ke-${i + 2}`, 'error');
                    return;
                }
            }
        }
        
        // Konversi ke format Firebase (object dengan key numerik)
        const jamUmumData = {};
        JAM_PELAJARAN_UMUM.forEach((jam, index) => {
            jamUmumData[index] = jam;
        });
        
        const jamJumatData = {};
        JAM_PELAJARAN_JUMAT.forEach((jam, index) => {
            jamJumatData[index] = jam;
        });
        
        console.log('Saving to Firebase:', {
            jamUmum: jamUmumData,
            jamJumat: jamJumatData
        });
        
        // Simpan ke database
        await Promise.all([
            set(ref(db, 'pengaturan/jamPelajaran/umum'), jamUmumData),
            set(ref(db, 'pengaturan/jamPelajaran/jumat'), jamJumatData)
        ]);
        
        showMessage('✅ Jam pelajaran berhasil disimpan! (Senin-Kamis & Jum\'at)', 'success');
        
        // Refresh jadwal jika ada kelas yang dipilih
        const kelas = document.getElementById('selectKelas')?.value;
        if (kelas) {
            setTimeout(() => loadJadwal(), 500);
        }
        
    } catch (error) {
        console.error('Error saving jam pelajaran:', error);
        showMessage('❌ Gagal menyimpan jam pelajaran', 'error');
    }
}

// Reset jam pelajaran ke default
function resetJamPelajaran() {
    if (!confirm('Reset semua jam pelajaran ke default? Semua perubahan akan hilang.')) return;
    
    // Reset jam Senin-Kamis
    JAM_PELAJARAN_UMUM = [
        { mulai: '07:00', selesai: '07:40', label: '07:00 - 07:40' },
        { mulai: '07:40', selesai: '08:20', label: '07:40 - 08:20' },
        { mulai: '08:20', selesai: '09:00', label: '08:20 - 09:00' },
        { mulai: '09:00', selesai: '09:40', label: '09:00 - 09:40' },
        { mulai: '10:00', selesai: '10:40', label: '10:00 - 10:40' },
        { mulai: '10:40', selesai: '11:20', label: '10:40 - 11:20' },
        { mulai: '11:20', selesai: '12:00', label: '11:20 - 12:00' },
        { mulai: '12:00', selesai: '12:40', label: '12:00 - 12:40' }
    ];
    
    // Reset jam Jumat (lebih sedikit, pulang jam 11.20)
    JAM_PELAJARAN_JUMAT = [
        { mulai: '07:00', selesai: '07:40', label: '07:00 - 07:40' },
        { mulai: '07:40', selesai: '08:20', label: '07:40 - 08:20' },
        { mulai: '08:20', selesai: '09:00', label: '08:20 - 09:00' },
        { mulai: '09:00', selesai: '09:40', label: '09:00 - 09:40' },
        { mulai: '10:00', selesai: '10:40', label: '10:00 - 10:40' },
        { mulai: '10:40', selesai: '11:20', label: '10:40 - 11:20' }
    ];
    
    renderEditJamForm();
    showMessage('Jam pelajaran direset ke default', 'success');
}

// Load pengaturan umum
async function loadPengaturanUmum() {
    try {
        const snapshot = await get(ref(db, 'pengaturan/umum'));
        if (snapshot.exists()) {
            const data = snapshot.val();
            document.getElementById('tahunAjaran').value = data.tahunAjaran || '';
            document.getElementById('semesterAktif').value = data.semesterAktif || 'ganjil';
            document.getElementById('jamMasuk').value = data.jamMasuk || '07:00';
            document.getElementById('jamPulang').value = data.jamPulang || '13:00';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        showMessage('Gagal memuat pengaturan', 'error');
    }
}

// Fungsi untuk menambah mapel standar SD
async function tambahMapelStandar() {
    if (!confirm('Tambah semua mata pelajaran standar SD?\nIni akan menambahkan 15 mata pelajaran standar.')) return;
    
    try {
        const snapshot = await get(ref(db, 'pengaturan/mapel'));
        const existingMapel = snapshot.exists() ? snapshot.val() : {};
        
        // Tambahkan semua mapel standar
        const updates = {};
        MAPEL_STANDAR_SD.forEach((mapel) => {
            const mapelId = mapel.kode.toLowerCase();
            
            // Hanya tambah jika belum ada
            if (!existingMapel[mapelId]) {
                updates[mapelId] = {
                    kode: mapel.kode,
                    nama: mapel.nama,
                    isStandarSD: true,
                    createdAt: serverTimestamp()
                };
            }
        });
        
        if (Object.keys(updates).length === 0) {
            showMessage('Semua mata pelajaran standar sudah ada', 'info');
            return;
        }
        
        await update(ref(db, 'pengaturan/mapel'), updates);
        await loadMapel(); // Reload daftar
        showMessage(`✅ ${Object.keys(updates).length} mata pelajaran standar berhasil ditambahkan!`, 'success');
        
    } catch (error) {
        console.error('Error adding mapel standar:', error);
        showMessage('❌ Gagal menambah mata pelajaran standar', 'error');
    }
}

// Fungsi untuk menambah pilihan khusus
async function tambahPilihanKhusus() {
    if (!confirm('Tambah pilihan khusus (Istirahat, Upacara, dll)?\nIni akan menambahkan 7 pilihan khusus.')) return;
    
    try {
        const snapshot = await get(ref(db, 'pengaturan/mapel'));
        const existingMapel = snapshot.exists() ? snapshot.val() : {};
        
        // Tambahkan semua pilihan khusus
        const updates = {};
        PILIHAN_KHUSUS.forEach((pilihan) => {
            // Hanya tambah jika belum ada
            if (!existingMapel[pilihan.id]) {
                updates[pilihan.id] = {
                    kode: pilihan.kode,
                    nama: pilihan.nama,
                    isPilihanKhusus: true,
                    createdAt: serverTimestamp()
                };
            }
        });
        
        if (Object.keys(updates).length === 0) {
            showMessage('Semua pilihan khusus sudah ada', 'info');
            return;
        }
        
        await update(ref(db, 'pengaturan/mapel'), updates);
        await loadMapel(); // Reload daftar
        showMessage(`✅ ${Object.keys(updates).length} pilihan khusus berhasil ditambahkan!`, 'success');
        
    } catch (error) {
        console.error('Error adding pilihan khusus:', error);
        showMessage('❌ Gagal menambah pilihan khusus', 'error');
    }
}

// Load daftar mata pelajaran
async function loadMapel() {
    try {
        const snapshot = await get(ref(db, 'pengaturan/mapel'));
        const listMapel = document.getElementById('listMapel');
        
        if (snapshot.exists()) {
            const mapel = snapshot.val();
            let html = '<div style="display: grid; gap: 8px;">';
            
            // Sort mapel by nama
            const sortedMapel = Object.entries(mapel).sort((a, b) => 
                a[1].nama.localeCompare(b[1].nama)
            );
            
            sortedMapel.forEach(([id, data]) => {
                const isKhusus = ['istirahat', 'upacara', 'kebersihan', 'sholat', 'konseling', 'ekstra', 'kosong'].includes(id);
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; 
                             padding: 10px; background: ${isKhusus ? '#f0f9ff' : '#f8fafc'}; border-radius: 6px;
                             border-left: 4px solid ${isKhusus ? '#3b82f6' : '#10b981'}">
                        <div>
                            <strong>${data.nama}</strong>
                            <span style="background: ${isKhusus ? '#dbeafe' : '#e2e8f0'}; padding: 2px 8px; border-radius: 4px; 
                                       font-size: 11px; margin-left: 8px;">${data.kode}</span>
                            ${isKhusus ? '<span style="background: #3b82f6; color: white; padding: 1px 6px; border-radius: 10px; font-size: 9px; margin-left: 5px;">KHUSUS</span>' : ''}
                        </div>
                        <button onclick="hapusMapel('${id}')" style="background: #fee2e2; color: #991b1b; 
                                border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; 
                                font-size: 12px; display: ${isKhusus ? 'none' : 'block'}">
                            Hapus
                        </button>
                    </div>
                `;
            });
            
            html += '</div>';
            listMapel.innerHTML = html;
            
            // Update counter
            updateMapelCounter(sortedMapel.length);
        } else {
            listMapel.innerHTML = '<p style="color: #64748b; text-align: center;">Belum ada mata pelajaran</p>';
            updateMapelCounter(0);
        }
    } catch (error) {
        console.error('Error loading mapel:', error);
        showMessage('Gagal memuat mata pelajaran', 'error');
    }
}

// Fungsi untuk menambah mata pelajaran custom
async function tambahMapel() {
    const nama = document.getElementById('mapelBaru').value.trim();
    const kode = document.getElementById('kodeMapel').value.trim().toUpperCase();
    
    // Validasi
    if (!nama || !kode) {
        showMessage('Nama dan kode mata pelajaran harus diisi', 'error');
        return;
    }
    
    if (kode.length !== 3) {
        showMessage('Kode harus 3 huruf', 'error');
        return;
    }
    
    // Cek apakah kode sudah ada
    const snapshot = await get(ref(db, 'pengaturan/mapel'));
    if (snapshot.exists()) {
        const existingMapel = snapshot.val();
        const mapelId = kode.toLowerCase();
        
        if (existingMapel[mapelId]) {
            showMessage(`Kode "${kode}" sudah digunakan`, 'error');
            return;
        }
        
        // Cek apakah nama sudah ada
        const isNamaExists = Object.values(existingMapel).some(m => 
            m.nama.toLowerCase() === nama.toLowerCase()
        );
        
        if (isNamaExists) {
            showMessage(`Nama "${nama}" sudah ada`, 'error');
            return;
        }
    }
    
    if (!confirm(`Tambah mata pelajaran baru?\nNama: ${nama}\nKode: ${kode}`)) return;
    
    try {
        const mapelId = kode.toLowerCase();
        const mapelData = {
            kode: kode,
            nama: nama,
            isCustom: true,
            createdAt: serverTimestamp()
        };
        
        await set(ref(db, `pengaturan/mapel/${mapelId}`), mapelData);
        
        // Reset form
        document.getElementById('mapelBaru').value = '';
        document.getElementById('kodeMapel').value = '';
        
        await loadMapel(); // Reload daftar
        showMessage(`✅ Mata pelajaran "${nama}" (${kode}) berhasil ditambahkan!`, 'success');
        
    } catch (error) {
        console.error('Error adding mapel:', error);
        showMessage('❌ Gagal menambah mata pelajaran', 'error');
    }
}

// Fungsi untuk menghapus mata pelajaran
async function hapusMapel(mapelId) {
    if (!confirm('Hapus mata pelajaran ini?\nCatatan: Ini tidak akan menghapus dari jadwal yang sudah dibuat.')) return;
    
    try {
        // Hanya izinkan hapus mapel custom, bukan yang standar atau khusus
        const snapshot = await get(ref(db, `pengaturan/mapel/${mapelId}`));
        if (snapshot.exists()) {
            const mapelData = snapshot.val();
            if (mapelData.isStandarSD || mapelData.isPilihanKhusus) {
                showMessage('Tidak bisa menghapus mata pelajaran standar atau pilihan khusus', 'error');
                return;
            }
        }
        
        await remove(ref(db, `pengaturan/mapel/${mapelId}`));
        await loadMapel(); // Reload daftar
        showMessage('✅ Mata pelajaran berhasil dihapus!', 'success');
        
    } catch (error) {
        console.error('Error deleting mapel:', error);
        showMessage('❌ Gagal menghapus mata pelajaran', 'error');
    }
}

// Load jadwal berdasarkan kelas
async function loadJadwal() {
    const kelas = document.getElementById('selectKelas').value;
    if (!kelas) {
        const container = document.getElementById('jadwalContainer');
        container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 20px;">Pilih kelas untuk mengatur jadwal pelajaran</p>';
        return;
    }

    const container = document.getElementById('jadwalContainer');
    container.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Memuat jadwal untuk kelas ${kelas}...</p>
        </div>
    `;

    try {
        console.log(`Loading schedule for class ${kelas}...`);
        
        const [snapshot, mapelSnapshot] = await Promise.all([
            get(ref(db, `pengaturan/jadwal/${kelas}`)),
            get(ref(db, 'pengaturan/mapel'))
        ]);
        
        // Dapatkan daftar mapel untuk dropdown
        const mapelList = mapelSnapshot.exists() ? mapelSnapshot.val() : {};
        
        console.log('Loaded mapel list:', Object.keys(mapelList).length, 'items');
        
        // Pisahkan mapel standar, custom, dan khusus
        const mapelStandar = [];
        const mapelCustom = [];
        const mapelKhusus = [];
        
        Object.entries(mapelList).forEach(([id, mapel]) => {
            const item = { id, ...mapel };
            if (['istirahat', 'upacara', 'kebersihan', 'sholat', 'konseling', 'ekstra', 'kosong'].includes(id)) {
                mapelKhusus.push(item);
            } else if (mapel.isStandarSD) {
                mapelStandar.push(item);
            } else {
                mapelCustom.push(item);
            }
        });
        
        // Sort masing-masing kategori
        mapelStandar.sort((a, b) => a.nama.localeCompare(b.nama));
        mapelCustom.sort((a, b) => a.nama.localeCompare(b.nama));
        mapelKhusus.sort((a, b) => a.nama.localeCompare(b.nama));
        
        // Buat options dengan grouping
        let mapelOptions = '<option value="">-- Pilih Mata Pelajaran --</option>';
        
        if (mapelStandar.length > 0) {
            mapelOptions += '<optgroup label="Mata Pelajaran Standar">';
            mapelStandar.forEach(mapel => {
                mapelOptions += `<option value="${mapel.id}">${mapel.nama} (${mapel.kode})</option>`;
            });
            mapelOptions += '</optgroup>';
        }
        
        if (mapelCustom.length > 0) {
            mapelOptions += '<optgroup label="Mata Pelajaran Custom">';
            mapelCustom.forEach(mapel => {
                mapelOptions += `<option value="${mapel.id}">${mapel.nama} (${mapel.kode})</option>`;
            });
            mapelOptions += '</optgroup>';
        }
        
        if (mapelKhusus.length > 0) {
            mapelOptions += '<optgroup label="Pilihan Khusus">';
            mapelKhusus.forEach(mapel => {
                mapelOptions += `<option value="${mapel.id}">${mapel.nama} (${mapel.kode})</option>`;
            });
            mapelOptions += '</optgroup>';
        }

        // Data jadwal yang ada
        const existingData = snapshot.exists() ? snapshot.val() : {};
        
        console.log('Existing schedule data for', kelas, ':', existingData);

        // Buat tabel untuk hari Senin-Kamis
        let html = `
            <div style="margin-bottom: 30px;">
                <h5 style="color: var(--dark); margin-bottom: 15px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-calendar-week"></i> Jadwal Senin s/d Kamis - Kelas ${kelas}
                    <span style="background: var(--accent); color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px;">
                        ${JAM_PELAJARAN_UMUM.length} jam
                    </span>
                </h5>
                <div class="table-responsive">
                    <table class="jadwal-table">
                        <thead>
                            <tr>
                                <th style="width: 140px;">Jam Pelajaran</th>
                                ${HARI_UMUM.map(hari => `<th>${hari}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
        `;

        // Tampilkan jam untuk Senin-Kamis
        JAM_PELAJARAN_UMUM.forEach((jam, jamIndex) => {
            html += `<tr><td style="font-weight: 600; background: #f8fafc; width: 140px;">${jam.label}</td>`;
            
            HARI_UMUM.forEach((hari, hariIndex) => {
                const cellId = `cell_${kelas}_${hari}_${jamIndex}_umum`;
                const currentValue = existingData[hari] && existingData[hari][jamIndex] 
                    ? existingData[hari][jamIndex] 
                    : '';
                
                const currentMapel = currentValue ? mapelList[currentValue] : null;
                const displayText = currentMapel ? `${currentMapel.nama} (${currentMapel.kode})` : '';
                
                html += `
                    <td>
                        <select id="${cellId}" class="jadwal-select" 
                                style="width: 100%; min-width: 160px;">
                            ${mapelOptions}
                            ${currentValue ? `<option value="${currentValue}" selected>${displayText}</option>` : ''}
                        </select>
                    </td>
                `;
            });
            
            html += '</tr>';
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Tabel untuk Jumat -->
            <div style="margin-bottom: 20px;">
                <h5 style="color: var(--dark); margin-bottom: 15px; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-star"></i> Jadwal Khusus Jum'at - Kelas ${kelas}
                    <span style="background: #f59e0b; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px;">
                        ${JAM_PELAJARAN_JUMAT.length} jam (Pulang jam ${JAM_PELAJARAN_JUMAT[JAM_PELAJARAN_JUMAT.length - 1]?.selesai || '11:20'})
                    </span>
                </h5>
                <div style="background: #fffbeb; padding: 10px; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #f59e0b;">
                    <div style="display: flex; align-items: center; gap: 8px; color: #92400e; font-size: 12px;">
                        <i class="fa-solid fa-info-circle"></i>
                        <span><strong>Catatan:</strong> Hari Jum'at memiliki ${JAM_PELAJARAN_JUMAT.length} jam pelajaran dengan pulang lebih awal</span>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="jadwal-table">
                        <thead>
                            <tr>
                                <th style="width: 140px;">Jam Pelajaran</th>
                                ${HARI_JUMAT.map(hari => `<th style="background: #fef3c7;">${hari}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
        `;

        // Tampilkan jam untuk Jumat
        JAM_PELAJARAN_JUMAT.forEach((jam, jamIndex) => {
            html += `<tr><td style="font-weight: 600; background: #fffbeb; width: 140px;">${jam.label}</td>`;
            
            HARI_JUMAT.forEach((hari, hariIndex) => {
                const cellId = `cell_${kelas}_${hari}_${jamIndex}_jumat`;
                const currentValue = existingData[hari] && existingData[hari][jamIndex] 
                    ? existingData[hari][jamIndex] 
                    : '';
                
                const currentMapel = currentValue ? mapelList[currentValue] : null;
                const displayText = currentMapel ? `${currentMapel.nama} (${currentMapel.kode})` : '';
                
                html += `
                    <td style="background: #fffbeb;">
                        <select id="${cellId}" class="jadwal-select" 
                                style="width: 100%; min-width: 160px; background: #fef3c7;">
                            ${mapelOptions}
                            ${currentValue ? `<option value="${currentValue}" selected>${displayText}</option>` : ''}
                        </select>
                    </td>
                `;
            });
            
            html += '</tr>';
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="simpanJadwal('${kelas}')" class="btn-primary">
                    <i class="fa-solid fa-save"></i> SIMPAN JADWAL KELAS ${kelas}
                </button>
                <button onclick="resetJadwal('${kelas}')" class="btn-danger" style="margin-left: 10px;">
                    <i class="fa-solid fa-rotate-left"></i> RESET
                </button>
                <button onclick="copyJadwal('${kelas}')" class="btn-info" style="margin-left: 10px;">
                    <i class="fa-solid fa-copy"></i> COPY KE KELAS LAIN
                </button>
            </div>
            <div id="editJamContainer"></div>
            
            <div style="margin-top: 30px; padding: 15px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid var(--accent);">
                <div style="display: flex; align-items: center; gap: 10px; color: #0369a1;">
                    <i class="fa-solid fa-circle-info"></i>
                    <div>
                        <strong>Info:</strong> Setelah menyimpan jadwal, guru dapat langsung melihat jadwal mereka di halaman 
                        <a href="jadwal_guru.html" style="color: var(--accent); font-weight: 600;">Jadwal Mengajar</a>.
                        <br><small style="font-size: 11px;">Sistem akan sinkron secara realtime dengan halaman guru.</small>
                    </div>
                </div>
            </div>
            
            <!-- Debug info -->
            <div style="margin-top: 20px; padding: 10px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                <details>
                    <summary style="font-size: 12px; color: #64748b; cursor: pointer;">
                        <i class="fa-solid fa-bug"></i> Debug Info (Jumlah Jam & Data)
                    </summary>
                    <div style="margin-top: 10px; font-size: 11px; color: #64748b;">
                        <div><strong>Jam Umum:</strong> ${JAM_PELAJARAN_UMUM.length} (Senin-Kamis)</div>
                        <div><strong>Jam Jumat:</strong> ${JAM_PELAJARAN_JUMAT.length} (Khusus Jum'at)</div>
                        <div><strong>Total Mapel:</strong> ${Object.keys(mapelList).length}</div>
                        <div><strong>Jadwal untuk Jumat:</strong> ${existingData['Jumat'] ? Object.keys(existingData['Jumat']).length + ' jam' : 'Tidak ada'}</div>
                    </div>
                </details>
            </div>
        `;

        container.innerHTML = html;

        // Set nilai yang sudah ada untuk semua hari
        if (snapshot.exists()) {
            const data = snapshot.val();
            
            console.log('Setting existing values for class', kelas, ':', data);
            
            // Set untuk hari Senin-Kamis
            HARI_UMUM.forEach(hari => {
                if (data[hari]) {
                    Object.entries(data[hari]).forEach(([jamIndex, mapelId]) => {
                        const selectId = `cell_${kelas}_${hari}_${jamIndex}_umum`;
                        const selectElement = document.getElementById(selectId);
                        if (selectElement) {
                            selectElement.value = mapelId;
                            console.log(`Set ${selectId} = ${mapelId}`);
                        }
                    });
                }
            });
            
            // Set untuk hari Jumat
            HARI_JUMAT.forEach(hari => {
                if (data[hari]) {
                    Object.entries(data[hari]).forEach(([jamIndex, mapelId]) => {
                        const selectId = `cell_${kelas}_${hari}_${jamIndex}_jumat`;
                        const selectElement = document.getElementById(selectId);
                        if (selectElement) {
                            selectElement.value = mapelId;
                            console.log(`Set ${selectId} = ${mapelId} (Jumat jam ${jamIndex})`);
                        }
                    });
                }
            });
        }
        
        // Tambah event listener untuk semua select Senin-Kamis
        HARI_UMUM.forEach(hari => {
            JAM_PELAJARAN_UMUM.forEach((jam, jamIndex) => {
                const selectId = `cell_${kelas}_${hari}_${jamIndex}_umum`;
                const selectElement = document.getElementById(selectId);
                if (selectElement) {
                    selectElement.addEventListener('change', function() {
                        updateJadwalCell(kelas, hari, jamIndex, this.value, 'umum');
                    });
                }
            });
        });
        
        // Tambah event listener untuk semua select Jumat
        HARI_JUMAT.forEach(hari => {
            JAM_PELAJARAN_JUMAT.forEach((jam, jamIndex) => {
                const selectId = `cell_${kelas}_${hari}_${jamIndex}_jumat`;
                const selectElement = document.getElementById(selectId);
                if (selectElement) {
                    selectElement.addEventListener('change', function() {
                        updateJadwalCell(kelas, hari, jamIndex, this.value, 'jumat');
                    });
                }
            });
        });
        
        // Render form edit jam di bawah tabel
        setTimeout(() => {
            renderEditJamForm();
        }, 100);
        
    } catch (error) {
        console.error('Error loading schedule:', error);
        container.innerHTML = `
            <p style="color: #ef4444; text-align: center; padding: 20px;">
                <i class="fa-solid fa-triangle-exclamation"></i> Gagal memuat jadwal: ${error.message}
            </p>
        `;
    }
}

// Update jadwal per cell
async function updateJadwalCell(kelas, hari, jamIndex, mapelId, tipe) {
    try {
        const updateData = {};
        updateData[`pengaturan/jadwal/${kelas}/${hari}/${jamIndex}`] = mapelId || null;
        
        await update(ref(db), updateData);
        
        // Tampilkan pesan sukses
        console.log(`Jadwal diperbarui: ${kelas} - ${hari} jam ${jamIndex} = ${mapelId || '(dikosongkan)'}`);
        
    } catch (error) {
        console.error('Error updating cell:', error);
        showMessage('Gagal memperbarui jadwal', 'error');
    }
}

// Simpan semua jadwal
async function simpanJadwal(kelas) {
    if (!confirm(`Simpan jadwal untuk kelas ${kelas}?\nSemua perubahan akan disimpan ke database.`)) return;
    
    try {
        let jadwalData = {};
        
        // Simpan untuk hari Senin-Kamis
        HARI_UMUM.forEach(hari => {
            jadwalData[hari] = {};
            JAM_PELAJARAN_UMUM.forEach((jam, jamIndex) => {
                const selectId = `cell_${kelas}_${hari}_${jamIndex}_umum`;
                const selectElement = document.getElementById(selectId);
                if (selectElement) {
                    jadwalData[hari][jamIndex] = selectElement.value || null;
                }
            });
        });
        
        // Simpan untuk hari Jumat
        HARI_JUMAT.forEach(hari => {
            jadwalData[hari] = {};
            JAM_PELAJARAN_JUMAT.forEach((jam, jamIndex) => {
                const selectId = `cell_${kelas}_${hari}_${jamIndex}_jumat`;
                const selectElement = document.getElementById(selectId);
                if (selectElement) {
                    jadwalData[hari][jamIndex] = selectElement.value || null;
                }
            });
        });

        console.log('Saving schedule for', kelas, ':', jadwalData);
        
        await set(ref(db, `pengaturan/jadwal/${kelas}`), jadwalData);
        showMessage(`✅ Jadwal Kelas ${kelas} berhasil disimpan!`, 'success');
        
        console.log(`Schedule saved successfully for ${kelas}`);
        
        // Show summary
        let totalJam = 0;
        HARI_UMUM.forEach(hari => {
            if (jadwalData[hari]) {
                totalJam += Object.keys(jadwalData[hari]).length;
            }
        });
        HARI_JUMAT.forEach(hari => {
            if (jadwalData[hari]) {
                totalJam += Object.keys(jadwalData[hari]).length;
            }
        });
        
        console.log(`Total ${totalJam} jam pelajaran disimpan untuk ${kelas}`);
        
    } catch (error) {
        console.error('Error saving schedule:', error);
        showMessage('❌ Gagal menyimpan jadwal', 'error');
    }
}

// Reset jadwal
async function resetJadwal(kelas) {
    if (!confirm(`Reset jadwal kelas ${kelas}?\nSemua data akan dihapus dan tidak dapat dikembalikan.`)) return;
    
    try {
        await remove(ref(db, `pengaturan/jadwal/${kelas}`));
        loadJadwal();
        showMessage('Jadwal berhasil direset', 'success');
    } catch (error) {
        console.error('Error resetting schedule:', error);
        showMessage('Gagal mereset jadwal', 'error');
    }
}

// Copy jadwal ke kelas lain
async function copyJadwal(kelasAsal) {
    const kelasTujuan = prompt(`Copy jadwal dari kelas ${kelasAsal} ke kelas mana? (contoh: 1B, 2A, dll):`, '');
    
    if (!kelasTujuan || !kelasTujuan.match(/^[1-6][A-C]$/)) {
        showMessage('Kelas tujuan tidak valid. Format: 1A, 2B, dst.', 'error');
        return;
    }
    
    if (kelasAsal === kelasTujuan) {
        showMessage('Tidak bisa copy ke kelas yang sama', 'error');
        return;
    }
    
    if (!confirm(`Copy jadwal dari kelas ${kelasAsal} ke kelas ${kelasTujuan}?\nSemua data jadwal lama di ${kelasTujuan} akan ditimpa.`)) return;
    
    try {
        const snapshot = await get(ref(db, `pengaturan/jadwal/${kelasAsal}`));
        
        if (!snapshot.exists()) {
            showMessage('Jadwal kelas asal tidak ditemukan', 'error');
            return;
        }
        
        const jadwalData = snapshot.val();
        await set(ref(db, `pengaturan/jadwal/${kelasTujuan}`), jadwalData);
        
        showMessage(`✅ Jadwal berhasil dicopy dari kelas ${kelasAsal} ke ${kelasTujuan}!`, 'success');
        
        // Jika kelas tujuan sedang dipilih, reload jadwal
        const kelasSelected = document.getElementById('selectKelas').value;
        if (kelasSelected === kelasTujuan) {
            loadJadwal();
        }
        
    } catch (error) {
        console.error('Error copying schedule:', error);
        showMessage('❌ Gagal copy jadwal', 'error');
    }
}

// Simpan pengaturan umum
async function simpanPengaturan() {
    const tahunAjaran = document.getElementById('tahunAjaran').value.trim();
    const semesterAktif = document.getElementById('semesterAktif').value;
    const jamMasuk = document.getElementById('jamMasuk').value;
    const jamPulang = document.getElementById('jamPulang').value;
    
    // Validasi tahun ajaran
    if (!tahunAjaran || !tahunAjaran.match(/^\d{4}\/\d{4}$/)) {
        showMessage('Format tahun ajaran harus seperti: 2024/2025', 'error');
        return;
    }
    
    // Validasi jam masuk dan pulang
    if (jamMasuk >= jamPulang) {
        showMessage('Jam masuk harus lebih awal dari jam pulang', 'error');
        return;
    }
    
    try {
        const pengaturan = {
            tahunAjaran: tahunAjaran,
            semesterAktif: semesterAktif,
            jamMasuk: jamMasuk,
            jamPulang: jamPulang,
            updatedAt: serverTimestamp()
        };

        await set(ref(db, 'pengaturan/umum'), pengaturan);
        showMessage('✅ Pengaturan berhasil disimpan!', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showMessage('❌ Gagal menyimpan pengaturan', 'error');
    }
}

// Setup realtime listeners untuk sinkronisasi otomatis
function setupRealtimeListeners() {
    console.log('Setting up realtime listeners for auto-sync...');
    
    // Listen untuk perubahan pada jam pelajaran
    onValue(ref(db, 'pengaturan/jamPelajaran/umum'), (snapshot) => {
        if (snapshot.exists()) {
            const jamData = snapshot.val();
            if (jamData && typeof jamData === 'object') {
                JAM_PELAJARAN_UMUM = Object.values(jamData).sort((a, b) => a.mulai.localeCompare(b.mulai));
                console.log('Jam umum updated via realtime:', JAM_PELAJARAN_UMUM.length);
            }
        }
    });
    
    onValue(ref(db, 'pengaturan/jamPelajaran/jumat'), (snapshot) => {
        if (snapshot.exists()) {
            const jamData = snapshot.val();
            if (jamData && typeof jamData === 'object') {
                JAM_PELAJARAN_JUMAT = Object.values(jamData).sort((a, b) => a.mulai.localeCompare(b.mulai));
                console.log('Jam jumat updated via realtime:', JAM_PELAJARAN_JUMAT.length);
            }
        }
    });
    
    // Listen untuk perubahan pada mata pelajaran
    onValue(ref(db, 'pengaturan/mapel'), (snapshot) => {
        if (snapshot.exists()) {
            console.log('Mapel updated via realtime');
            // Reload mapel list
            loadMapel();
        }
    });
    
    // Listen untuk perubahan pada jadwal (untuk debug)
    const kelasList = ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', 
                      '4A', '4B', '4C', '5A', '5B', '5C', '6A', '6B', '6C'];
    
    kelasList.forEach(kelas => {
        onValue(ref(db, `pengaturan/jadwal/${kelas}`), (snapshot) => {
            console.log(`Schedule updated for ${kelas}:`, snapshot.exists() ? 'Exists' : 'Empty');
        });
    });
}

// Initialize on page load
function initPengaturanSistem() {
    console.log('Initializing pengaturan sistem...');
    
    // Load semua data
    Promise.all([
        loadPengaturanUmum(),
        loadMapel(),
        loadJamPelajaran()
    ]).then(() => {
        // Setup realtime listeners setelah data pertama kali dimuat
        setupRealtimeListeners();
        console.log('Pengaturan sistem initialized successfully');
    }).catch(error => {
        console.error('Error initializing:', error);
        showMessage('Gagal memuat data sistem', 'error');
    });
    
    // Tambah event listener untuk kelas
    const selectKelas = document.getElementById('selectKelas');
    if (selectKelas) {
        selectKelas.addEventListener('change', loadJadwal);
    }
}

// Export semua fungsi ke window object
window.initPengaturanSistem = initPengaturanSistem;
window.loadPengaturanUmum = loadPengaturanUmum;
window.loadMapel = loadMapel;
window.loadJamPelajaran = loadJamPelajaran;
window.loadJadwal = loadJadwal;
window.showJamTab = showJamTab;
window.tambahJamPelajaran = tambahJamPelajaran;
window.hapusJamPelajaran = hapusJamPelajaran;
window.simpanJamPelajaran = simpanJamPelajaran;
window.resetJamPelajaran = resetJamPelajaran;
window.tambahMapelStandar = tambahMapelStandar;
window.tambahPilihanKhusus = tambahPilihanKhusus;
window.tambahMapel = tambahMapel;
window.hapusMapel = hapusMapel;
window.updateJadwalCell = updateJadwalCell;
window.simpanJadwal = simpanJadwal;
window.resetJadwal = resetJadwal;
window.copyJadwal = copyJadwal;
window.simpanPengaturan = simpanPengaturan;
window.showMessage = showMessage;