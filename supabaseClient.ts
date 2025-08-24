// File: supabaseClient.ts - FINAL SIMPLE VERSION
import { createClient } from '@supabase/supabase-js'

// This is the standard and correct way to access variables in a Vite project.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)