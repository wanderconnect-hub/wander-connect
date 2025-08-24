// File: supabaseClient.ts - FINAL CORRECTED VERSION
import { createClient } from '@supabase/supabase-js'

// CHANGED: We now use process.env because our vite.config.ts is defining it for us.
const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)