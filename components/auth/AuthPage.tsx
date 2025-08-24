// File: components/auth/AuthPage.tsx

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
// IMPORTANT: This path is now correct because supabaseClient.ts is in the root.
import { supabase } from '../../supabaseClient'; 

const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100/50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-stone-200">
        <h1 className="text-2xl font-bold text-center mb-6 text-cyan-700">
          Welcome to WanderConnect
        </h1>
        {/* 
          This is the magic component from Supabase.
          It handles email/password sign up, login, and password reset.
          The 'providers' prop can enable social logins like Google, GitHub, etc.
        */}
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']} // You can add more, e.g., ['google', 'github']
          theme="light"
        />
      </div>
    </div>
  );
};

export default AuthPage;