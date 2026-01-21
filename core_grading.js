// core_grading.js

// Function to calculate final grade
export function hitungNilaiAkhir(sumatif, ujian, jumlahAlfa) {
    // Bobot Sesuai Blueprint
    const BOBOT_SUMATIF = 0.65;
    const BOBOT_UJIAN = 0.35;
    
    // Hitung Nilai Akademik
    let nilaiAkademik = (sumatif * BOBOT_SUMATIF) + (ujian * BOBOT_UJIAN);

    // Penalti Alfa (1 Alfa = -0.5 poin, max -5 poin)
    let penalti = jumlahAlfa * 0.5;
    if (penalti > 5) penalti = 5;

    let hasil = nilaiAkademik - penalti;
    
    // Pastikan tidak minus
    return hasil < 0 ? 0 : parseFloat(hasil.toFixed(2));
}

// Function to calculate grade from subtests
export function hitungNilaiDariSubtest(s1, s2, s3, s4, sumatif, sakit = 0, ijin = 0, alfa = 0) {
    // Calculate average of subtests
    const subtests = [s1, s2, s3, s4].filter(val => val > 0);
    const rataSubtest = subtests.length > 0 ? 
        subtests.reduce((a, b) => a + b, 0) / subtests.length : 0;
    
    // Calculate academic score (65% subtests + 35% sumatif)
    let nilaiAkademik = (rataSubtest * 0.65) + (sumatif * 0.35);
    
    // Apply attendance penalties
    const totalAbsen = sakit + ijin + alfa;
    let penalti = totalAbsen * 0.25; // Reduced penalty for better scoring
    
    // Max penalty 10 points
    if (penalti > 10) penalti = 10;
    
    let finalScore = nilaiAkademik - penalti;
    
    // Ensure score is between 0-100
    finalScore = Math.max(0, Math.min(100, finalScore));
    
    return {
        nilai: Math.round(finalScore),
        rataSubtest: parseFloat(rataSubtest.toFixed(2)),
        nilaiAkademik: parseFloat(nilaiAkademik.toFixed(2)),
        penalti: parseFloat(penalti.toFixed(2)),
        totalAbsen: totalAbsen
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