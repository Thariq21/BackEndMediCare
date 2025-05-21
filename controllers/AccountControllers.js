import { supabase } from "../db_config.js";

export const signUpPasien = async (req, res) => {
  const { email, password, nama_lengkap, nik, jenis_kelamin } = req.body;

  try {
    const { data, error } = await supabase
      .from("pasien")
      .insert([
        {
          email,
          password, // ⚠️ Pastikan kolom ini ada di DDL, atau hapus jika tidak diperlukan
          nama_lengkap,
          nik,
          jenis_kelamin,
        },
      ])
      .select(); // untuk mengembalikan data yang dimasukkan

    if (error) {
      console.error("Insert error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      message: "User registered successfully",
      user: data[0], // ✅ ambil objek pertama
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const signInPasien = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase
    .from("pasien")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .single();

  if (error || !data) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  return res.status(200).json({
    message: "User signed in successfully",
    user: data,
  });
};

export const getAllPasien = async (req, res) => {
  const { data, error } = await supabase.from("pasien").select("*");

  console.log(data);

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json(data);
};
