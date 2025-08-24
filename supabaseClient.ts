// File: supabaseClient.ts - DEBUGGING VERSION
import { createClient } from '@supabase/supabase-js'

// 
// THIS IS THE MOST IMPORTANT LINE FOR DEBUGGING:
// It will print the value that Vercel is actually sending to your application.
//
console.log("Vercel provided this Supabase URL:", import.meta.env.VITE_SUPABASE_URL);


// This code attempts to read the environment variables from Vercel.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

// This creates the Supabase client that your app will use.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)