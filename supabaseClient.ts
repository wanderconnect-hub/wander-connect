// File: supabaseClient.ts
// This file should be at the same level as your App.tsx

import { createClient } from '@supabase/supabase-js'

// These variables are pulled from the Environment Variables you set in Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This creates the Supabase client, which you will use to interact with Supabase services
export const supabase = createClient(supabaseUrl, supabaseAnonKey)