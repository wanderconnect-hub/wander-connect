// components/auth/AuthPage.tsx
import React, { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { getSupabase } from '../../supabaseClient';
import type { SupabaseClient } from '@supabase/supabase-js';

const AuthPage: React.FC = () => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  useEffect(() => {
    const initialize = async () => setSupabase(await getSupabase());
    initialize();
  }, []);
  if (!supabase) return null;
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100/50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-stone-200">
        <h1 className="text-2xl font-bold text-center mb-6 text-cyan-700">Welcome to WanderConnect</h1>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google']} theme="light" />
      </div>
    </div>
  );
};
export default AuthPage;