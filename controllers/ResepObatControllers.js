import { supabase } from "../db_config.js";

export const getResepObatData = async (req, res) => {
  const { nikPasien } = req.params;

  if (!nikPasien) {
    return res.status(400).json({ error: "NIK pasien dibutuhkan" });
  }

  try {
    // Query ini akan mengambil data resep dan secara otomatis menyatukan (nesting)
    // data dari tabel lain yang berelasi.
    const { data: resepList, error } = await supabase
      .from("resep_dokter")
      .select(
        `
        no_resep,
        tanggal_resep,
        status,
        rekam_medis!inner(
          nik,
          tenaga_medis(
            nama_lengkap,
            spesialis,
            fasilitas_kesehatan(nama_fasilitas)
          )
        ),
        obat_resep(
          nama_obat,
          jumlah,
          satuan,
          aturan_pakai,
          lama_penggunaan
        )
      `
      )
      // Filter berdasarkan NIK pasien dari tabel rekam_medis yang di-join
      .eq("rekam_medis.nik", nikPasien)
      .order("tanggal_resep", { ascending: false });

    if (error) {
      console.error("Error fetching resep obat:", error);
      return res.status(500).json({ error: "Gagal mengambil data resep obat" });
    }

    if (resepList.length === 0) {
      return res.status(404).json({ message: "Resep obat tidak ditemukan" });
    }
    
    // (Opsional tapi direkomendasikan) Transformasi data agar lebih mudah digunakan di frontend
    const transformedData = resepList.map((resep) => {
        const { rekam_medis, ...resepHeader } = resep;
        const tenagaMedis = rekam_medis?.tenaga_medis;
        const faskes = tenagaMedis?.fasilitas_kesehatan;

        return {
            ...resepHeader,
            nama_dokter: tenagaMedis?.nama_lengkap || "N/A",
            spesialis: tenagaMedis?.spesialis || "N/A",
            nama_fasilitas: faskes?.nama_fasilitas || "N/A",
        };
    });


    return res.status(200).json(transformedData);

  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};