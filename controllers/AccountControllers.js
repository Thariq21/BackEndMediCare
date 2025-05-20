import { supabase } from "../db_config.js";   

export const signUpPasien = async (req, res) => {
    const { email, password, nama, nik, jenis_kelamin, tanggal_lahir, nomor_telp} = req.body;
    const { data, error } = await supabase.from("pasien").insert([{
        email,
        password,
        options: {
            data: {
                nama,
                nik,
                jenis_kelamin,
                tanggal_lahir,
                nomor_telp
            }
        }
    }]);
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ message: "User registered successfully", user: data.user });
}

export const getAllPasien = async (req, res) => {
    const { data, error } = await supabase.from("pasien").select("*");

    console.log(data);

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    return res.status(200).json(data);
}