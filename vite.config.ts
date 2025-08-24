// File: vite.config.ts - FINAL CORRECTED VERSION
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // This loads the .env files
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // This 'define' block is the most important part.
    // It manually finds the environment variables from Vercel's system (process.env)
    // and makes them available to your frontend code. This is the robust fix.
    define: {
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
    plugins: [react()],
    // The problematic `base: './'` line has been REMOVED.
    // Vite's default behavior is correct for Vercel.
  }
})