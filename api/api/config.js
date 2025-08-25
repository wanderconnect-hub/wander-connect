// File: /api/api/config.js - FINAL CORRECTED VERSION
export default function handler(req, res) {
  // This uses the standard names that Vercel's server can understand.
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  });
}