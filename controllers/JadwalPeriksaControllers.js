import { supabase } from "../db_config.js";

/**
 * Mengambil jadwal pemeriksaan mendatang untuk seorang pasien berdasarkan NIK.
 */
export const getJadwalPeriksaData = async (req, res) => {
  const { nikPasien } = req.params;

  if (!nikPasien) {
    return res.status(400).json({ error: "NIK pasien dibutuhkan" });
  }

  try {
    // const today = new Date().toISOString();

    // Query untuk mengambil jadwal periksa
    // dan melakukan join dengan tabel tenaga_medis dan fasilitas_kesehatan
    const { data, error } = await supabase
      .from("jadwal_periksa")
      .select(
        `
        tanggal,
        jam,
        status,
        tenaga_medis (
          nama_lengkap,
          spesialis,
          fasilitas_kesehatan (
            nama_fasilitas,
            alamat
          )
        )
      `
      )
      // Filter berdasarkan NIK pasien
      .eq("nik", nikPasien)
      // Hanya ambil jadwal mulai hari ini dan ke depan
    //   .gte("tanggal", today)
      // Urutkan berdasarkan tanggal dan jam terdekat
      .order("tanggal", { ascending: true })
      .order("jam", { ascending: true });

    if (error) {
      console.error("Error fetching jadwal periksa:", error);
      return res
        .status(500)
        .json({ error: "Gagal mengambil data jadwal pemeriksaan" });
    }

    if (data.length === 0) {
      return res
        .status(404)
        .json({ message: "Jadwal pemeriksaan tidak ditemukan" });
    }

    // Transformasi data agar lebih mudah digunakan di frontend
    // Mirip dengan yang dilakukan di ResepObatControllers.js
    const transformedData = data.map((jadwal) => {
      const tenagaMedis = jadwal.tenaga_medis;
      const faskes = tenagaMedis?.fasilitas_kesehatan;

      // Menggabungkan alamat dari faskes jika ada
      const lokasi = faskes
        ? `${faskes.nama_fasilitas}, ${faskes.alamat}`
        : "N/A";

      return {
        tanggal: jadwal.tanggal,
        jam: jadwal.jam,
        status: jadwal.status,
        nama_dokter: tenagaMedis?.nama_lengkap || "N/A",
        spesialis: tenagaMedis?.spesialis || "N/A",
        lokasi: lokasi,
      };
    });

    return res.status(200).json(transformedData);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};