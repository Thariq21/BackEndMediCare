import { supabase } from "../db_config.js";

export const getRiwayatMedisData = async (req, res) => {
  const { nikPasien } = req.params;

  if (!nikPasien) {
    return res.status(400).json({ error: "NIK pasien dibutuhkan" });
  }

  try {
    // Ambil riwayat medis berdasarkan NIK pasien
    const { data: riwayatMedis, error } = await supabase
      .from("rekam_medis")
      .select(
        "no_rekam_medis, tanggal_periksa, tekanan_darah, suhu_tubuh, keluhan, diagnosa, tindakan, catatan_dokter, tenaga_medis(nama_lengkap)"
      )
      .eq("nik", nikPasien)
      .order("tanggal_periksa", { ascending: false });

    if (error) {
      console.error("Error fetching riwayat medis:", error);
      return res.status(500).json({ error: "Gagal mengambil riwayat medis" });
    }

    if (riwayatMedis.length === 0) {
      return res.status(404).json({ message: "Riwayat medis tidak ditemukan" });
    }

    return res.status(200).json(riwayatMedis);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};
