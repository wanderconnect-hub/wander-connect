// File: /api/api/config.js - FINAL CORRECTED VERSION
export default function handler(req, res) {
  // CHANGED: We are now using the standard variable names without the 'VITE_' prefix.
  // This is the correct way for a Vercel serverless function to read them.
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  });
}