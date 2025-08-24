// File: /api/api/config.js
export default function handler(req, res) {
  // This function runs ONLY on the server, where the variables are safe.
  // It sends the public keys to the frontend when asked.
  res.status(200).json({
    supabaseUrl: process.env.VITE_SUPABASE_URL,
    supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
  });
}