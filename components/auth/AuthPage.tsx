// File: components/auth/AuthPage.tsx - FINAL CORRECTED VERSION
import React, { useState } from 'react';

interface AuthPageProps {
  onLogin: (token: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const endpoint = '/api/auth';
    const payload = isLogin
      ? { action: 'login', email, password }
      : { action: 'register', email, password, name };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      if (isLogin) {
        onLogin(data.token);
      } else {
        setMessage('Registration successful! Please log in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100/50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-stone-200">
        <h1 className="text-2-xl font-bold text-center mb-6 text-cyan-700">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
          <button type="submit" className="w-full bg-cyan-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-700">
            {isLogin ? 'Log In' : 'Register'}
          </button>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {message && <p className="text-green-500 text-center mt-4">{message}</p>}
        <p className="text-center mt-4">
          <button onClick={() => setIsLogin(!isLogin)} className="text-cyan-600 hover:underline">
            {isLogin ? 'Need an account? Register' : 'Already have an account? Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;