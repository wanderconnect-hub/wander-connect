// File: supabaseClient.ts - FINAL ROBUST VERSION
import { createClient } from '@supabase/supabase-js'

// CHANGED: We now use process.env, which our new vite.config.ts will provide.
const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)