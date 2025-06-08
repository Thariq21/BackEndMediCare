import { supabase } from "../db_config.js";
import bcrypt from "bcrypt";
import { hasEmailDomain } from "../hooks/hasEmailDomain.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET; // Ganti dengan env var di produksi

export const signUp = async (req, res) => {
  const { email, password, nama_pasien, nik, jenis_kelamin } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("pasien")
      .insert([
        {
          email,
          password: hashedPassword,
          nama_pasien,
          nik,
          jenis_kelamin: jenis_kelamin === "Laki-laki" ? "L" : "P",
        },
      ])
      .select();

    if (error) {
      console.error("Insert error:", error);
      return res.status(400).json({ error: error.message });
    }

    // Hapus password dari data[0]
    const { password: _, ...userWithoutPassword } = data[0];

    return res.status(200).json({
      message: "User registered successfully",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user, error;

    if (hasEmailDomain(email, "gmail.com")) {
      const result = await supabase
        .from("pasien")
        .select("*")
        .eq("email", email)
        .single();
      user = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from("tenaga_medis")
        .select("*")
        .eq("email", email)
        .single();
      user = result.data;
      error = result.error;
    }

    if (error || !user) {
      return res.status(400).json({ error: "Email tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Password salah" });
    }

    const { password: _, ...userWithoutPassword } = user;

    // Buat token
    const token = jwt.sign(
      {
        id: user.id,
        role: hasEmailDomain(user.email, "gmail.com") ? "pasien" : "admin",
      },
      JWT_SECRET,
      { expiresIn: "15m" } // Token expired dalam 15 min
    );

    return res.status(200).json({
      message: "User signed in successfully",
      user: userWithoutPassword,
      token, // Kirim token ke frontend
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllPasien = async (req, res) => {
  const { data, error } = await supabase.from("pasien").select("*");

  console.log(data);

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(200).json(data);
};
