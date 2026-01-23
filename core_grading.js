// core_grading.js - VERSI REVISI SESUAI BLUEPRINT BARU

// Function to calculate final grade sesuai blueprint REVISI
export function hitungNilaiAkhir(sumatif, ujian, jumlahAlfa, jumlahIjinSakit = 0, semester = 'ganjil') {
    // REVISI: Bobot Sesuai Blueprint Baru
    const BOBOT_SUMATIF = 0.65;    // 65% dari nilai 1-4
    const BOBOT_UJIAN = 0.35;      // 35% dari STS/SAS
    
    // Hitung Nilai Akademik
    let nilaiAkademik = (sumatif * BOBOT_SUMATIF) + (ujian * BOBOT_UJIAN);

    // REVISI: Penalti Alfa (1 Alfa = -0.5 poin, max -5 poin = 5%)
    let penaltiAlfa = jumlahAlfa * 0.5;
    if (penaltiAlfa > 5) penaltiAlfa = 5;

    // REVISI: Penalti Ijin/Sakit jika > 10 kali = 2%
    let penaltiIzin = (jumlahIjinSakit > 10) ? 2 : 0;

    // Total penalti (maksimal 7%)
    let totalPenalti = penaltiAlfa + penaltiIzin;
    if (totalPenalti > 7) totalPenalti = 7;

    let hasil = nilaiAkademik - totalPenalti;
    
    // Pastikan tidak minus dan maksimal 100
    hasil = Math.max(0, Math.min(100, hasil));
    
    return {
        nilai: parseFloat(hasil.toFixed(2)),
        penaltiAlfa: parseFloat(penaltiAlfa.toFixed(2)),
        penaltiIzin: parseFloat(penaltiIzin.toFixed(2)),
        totalPenalti: parseFloat(totalPenalti.toFixed(2))
    };
}

// Function to calculate grade from subtests sesuai blueprint REVISI
export function hitungNilaiDariSubtest(s1, s2, s3, s4, sumatif, sakit = 0, ijin = 0, alfa = 0, semester = 'ganjil') {
    // Calculate average of subtests
    const subtests = [s1, s2, s3, s4].filter(val => val > 0);
    const rataSubtest = subtests.length > 0 ? 
        subtests.reduce((a, b) => a + b, 0) / subtests.length : 0;
    
    // REVISI: Calculate academic score (65% subtests + 35% sumatif)
    let nilaiAkademik = (rataSubtest * 0.65) + (sumatif * 0.35);
    
    // REVISI: Apply attendance penalties sesuai blueprint baru
    const totalAbsen = sakit + ijin + alfa;
    
    // Alfa: 0.5 poin per alfa, maksimal 5 poin (5%)
    let penaltiAlfa = alfa * 0.5;
    if (penaltiAlfa > 5) penaltiAlfa = 5;
    
    // Ijin/Sakit > 10 kali: 2% pengurangan
    const izinSakit = sakit + ijin;
    let penaltiIzin = izinSakit > 10 ? 2 : 0;
    
    let totalPenalti = penaltiAlfa + penaltiIzin;
    
    // Maksimal penalti 7% (5% alfa + 2% izin/sakit)
    if (totalPenalti > 7) totalPenalti = 7;
    
    let finalScore = nilaiAkademik - totalPenalti;
    
    // Ensure score is between 0-100
    finalScore = Math.max(0, Math.min(100, finalScore));
    
    return {
        nilai: parseFloat(finalScore.toFixed(2)),
        rataSubtest: parseFloat(rataSubtest.toFixed(2)),
        nilaiAkademik: parseFloat(nilaiAkademik.toFixed(2)),
        penalti: parseFloat(totalPenalti.toFixed(2)),
        totalAbsen: totalAbsen,
        detail: {
            penaltiAlfa: parseFloat(penaltiAlfa.toFixed(2)),
            penaltiIzin: parseFloat(penaltiIzin.toFixed(2))
        }
    };
}

// Function to get grade letter
export function getGradeLetter(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
}

// Function to get grade description
export function getGradeDescription(score) {
    if (score >= 90) return 'Sangat Baik';
    if (score >= 80) return 'Baik';
    if (score >= 70) return 'Cukup';
    if (score >= 60) return 'Kurang';
    return 'Sangat Kurang';
}

// Function to calculate grade from multiple subtests with detailed breakdown
export function hitungNilaiDetail(s1, s2, s3, s4, sts, sakit, ijin, alfa, semester) {
    // Filter valid subtests
    const subtests = [s1, s2, s3, s4].filter(val => val !== null && val !== undefined && val > 0);
    const rataSubtest = subtests.length > 0 ? 
        subtests.reduce((a, b) => a + b, 0) / subtests.length : 0;
    
    // REVISI: 65% subtest + 35% STS/SAS
    const nilaiSumatif = (rataSubtest * 0.65) + (sts * 0.35);
    
    // REVISI: Calculate penalties
    const penaltiAlfa = Math.min(alfa * 0.5, 5);
    const izinSakit = sakit + ijin;
    const penaltiIzin = izinSakit > 10 ? 2 : 0;
    const totalPenalti = Math.min(penaltiAlfa + penaltiIzin, 7);
    
    let nilaiAkhir = nilaiSumatif - totalPenalti;
    nilaiAkhir = Math.max(0, Math.min(100, nilaiAkhir));
    
    const huruf = getGradeLetter(nilaiAkhir);
    const keterangan = getGradeDescription(huruf);
    
    return {
        nilai: parseFloat(nilaiAkhir.toFixed(2)),
        huruf: huruf,
        keterangan: keterangan,
        rataSubtest: parseFloat(rataSubtest.toFixed(2)),
        nilaiSumatif: parseFloat(nilaiSumatif.toFixed(2)),
        penaltiKehadiran: parseFloat(totalPenalti.toFixed(2)),
        jumlahAbsen: sakit + ijin + alfa,
        detail: {
            penaltiAlfa: parseFloat(penaltiAlfa.toFixed(2)),
            penaltiIzin: parseFloat(penaltiIzin.toFixed(2)),
            totalIzinSakit: izinSakit
        }
    };
}