import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
// Initialize Supabase client
// Ensure you have the following environment variables set in your .env file

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

