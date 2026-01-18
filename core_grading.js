export function hitungNilaiAkhir(sumatif, ujian, jumlahAlfa) {
    // Bobot Sesuai Blueprint
    const BOBOT_SUMATIF = 0.65;
    const BOBOT_UJIAN = 0.35;
    
    // Hitung Nilai Akademik
    let nilaiAkademik = (sumatif * BOBOT_SUMATIF) + (ujian * BOBOT_UJIAN);

    // Penalti Alfa (1 Alfa = -0.5 poin, max -5 poin) - Bisa disesuaikan
    let penalti = jumlahAlfa * 0.5;
    if (penalti > 5) penalti = 5;

    let hasil = nilaiAkademik - penalti;
    
    // Pastikan tidak minus
    return hasil < 0 ? 0 : parseFloat(hasil.toFixed(2));
}