// controllers/DashboardController.js
import { supabase } from "../db_config.js"; //

// Asumsi NIK pasien didapatkan dari user yang terautentikasi (misalnya dari JWT token)
// dan akan di-pass sebagai argumen ke fungsi-fungsi ini, atau diambil dari req.user

/**
 * Mengambil data ringkasan untuk dashboard pasien.
 * Ini bisa menjadi satu fungsi besar atau dipecah lagi.
 */
export const getDashboardData = async (req, res) => {
  // Dapatkan NIK pasien dari request (misalnya setelah middleware autentikasi)
  // const nikPasien = req.user.nik; // Contoh jika NIK ada di req.user

  // Untuk sekarang, kita coba hardcode atau ambil dari params untuk testing
  const { nikPasien } = req.params; // Jika Anda mau tes via URL param

  if (!nikPasien) {
    return res.status(400).json({ error: "NIK pasien dibutuhkan" });
  }

  try {
    // 1. Ambil Nama Pasien (Sebenarnya ini mungkin sudah ada saat login, tapi sebagai contoh)
    const { data: pasienData, error: pasienError } = await supabase
      .from("pasien")
      .select("nama_pasien, nik") // Ambil NIK juga untuk verifikasi jika perlu
      .eq("nik", nikPasien)
      .single();

    if (pasienError && pasienError.code !== 'PGRST116') { // PGRST116: single row not found
        console.error("Error fetching pasien data:", pasienError);
        // Jangan langsung return, mungkin data lain masih bisa diambil atau beri nilai default
    }
    if (!pasienData && pasienError && pasienError.code === 'PGRST116') {
        return res.status(404).json({ error: "Pasien tidak ditemukan" });
    }


    // 2. Ambil Data Terkini (Tekanan Darah, Suhu, Tgl Periksa Terakhir)
    // Ini biasanya dari rekam medis terakhir
    const { data: rekamMedisTerakhir, error: rmError } = await supabase
      .from("rekam_medis")
      .select("tanggal_periksa, tekanan_darah, suhu_tubuh, keluhan, diagnosa, tindakan, catatan_dokter, tenaga_medis(nama_lengkap)") // Join dengan tenaga_medis
      .eq("nik", nikPasien)
      .order("tanggal_periksa", { ascending: false })
      .limit(1)
      .single(); // Ambil satu record terbaru

    if (rmError && rmError.code !== 'PGRST116') { // Abaikan error jika tidak ada record, tapi log jika error lain
      console.error("Error fetching rekam medis terakhir:", rmError);
    }

    // 3. Ambil Riwayat Penyakit Utama (Contoh: 5 diagnosa terakhir yang berbeda)
    // Ini contoh sederhana, mungkin perlu logika lebih kompleks
    const { data: riwayatPenyakit, error: rpError } = await supabase
      .from("rekam_medis")
      .select("diagnosa, tanggal_periksa")
      .eq("nik", nikPasien)
      .order("tanggal_periksa", { ascending: false })
      // .neq("diagnosa", null) // Jika ingin yang ada diagnosanya saja
      .limit(5); // Ambil 5 teratas, lalu bisa di-filter di backend untuk keunikan jika perlu

    if (rpError) {
      console.error("Error fetching riwayat penyakit:", rpError);
    }

    // 4. Jadwal Pemeriksaan (Contoh: 2 jadwal mendatang)
    const today = new Date().toISOString().split('T')[0];
    const { data: jadwalPemeriksaan, error: jadwalError } = await supabase
      .from("jadwal_periksa")
      .select("no_jadwal, tanggal, jam, status, tenaga_medis(nama_lengkap, spesialis)") // Join dengan tenaga_medis
      .eq("nik", nikPasien)
      .gte("tanggal", today) // Ambil jadwal mulai hari ini dan ke depan
      .order("tanggal", { ascending: true })
      .order("jam", { ascending: true })
      .limit(2);

    if (jadwalError) {
      console.error("Error fetching jadwal pemeriksaan:", jadwalError);
    }

    // 5. Resep Aktif (Contoh: resep dari rekam medis terakhir atau resep yang belum kedaluwarsa)
    // Ini memerlukan logika lebih, misal mengambil no_resep dari rekam medis terakhir
    // lalu ambil obat_resep berdasarkan no_resep tersebut.
    let resepAktif = [];
    if (rekamMedisTerakhir && rekamMedisTerakhir.no_rekam_medis) { // Perlu pastikan field no_rekam_medis ada di select atas
        const { data: resepData, error: resepError } = await supabase
            .from("resep_dokter")
            .select("no_resep, tanggal_resep, obat_resep(nama_obat, dosis, frekuensi, lama_penggunaan)")
            .eq("no_rekam_medis", rekamMedisTerakhir.no_rekam_medis) // Ini asumsi, Anda perlu no_rekam_medis dari query rekamMedisTerakhir
            .order("tanggal_resep", { ascending: false })
            .limit(1)
            .single();

        if (resepError && resepError.code !== 'PGRST116') {
            console.error("Error fetching resep dokter:", resepError);
        }
        if (resepData) {
            resepAktif = resepData.obat_resep || [];
        }
    }


    res.status(200).json({
      namaPasien: pasienData ? pasienData.nama_pasien : "Pasien",
      dataTerkini: rekamMedisTerakhir
        ? {
            tekananDarah: rekamMedisTerakhir.tekanan_darah,
            suhuTubuh: rekamMedisTerakhir.suhu_tubuh,
            tanggalPemeriksaanTerakhir: rekamMedisTerakhir.tanggal_periksa,
          }
        : null,
      catatanMedisTerbaru: rekamMedisTerakhir
        ? {
            dokter: rekamMedisTerakhir.tenaga_medis ? rekamMedisTerakhir.tenaga_medis.nama_lengkap : "N/A",
            rekomendasi: rekamMedisTerakhir.catatan_dokter, // atau field lain yang relevan
            keluhan: rekamMedisTerakhir.keluhan,
            diagnosa: rekamMedisTerakhir.diagnosa,
            tindakan: rekamMedisTerakhir.tindakan
          }
        : null,
      riwayatPenyakitUtama: riwayatPenyakit || [],
      jadwalPemeriksaan: jadwalPemeriksaan || [],
      resepAktif: resepAktif,
      // Tambahkan data pengingat jika ada logikanya
    });
  } catch (err) {
    console.error("Unexpected error in getDashboardData:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};