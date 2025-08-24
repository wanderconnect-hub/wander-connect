// File: supabaseClient.ts - CORRECTED VERSION
import { createClient } from '@supabase/supabase-js'

// CHANGED: This now uses import.meta.env and the correct 'VITE_' prefix for Vite projects.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

// This creates the Supabase client that your app will use.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)