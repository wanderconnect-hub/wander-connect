import React, { useState } from 'react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email,
          password,
        }),
      });

      // backend should ALWAYS return JSON
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed.');
        setIsLoading(false);
        return;
      }

      // ✅ Login success → save token and user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      alert('Login successful!');
      // redirect or reload
      window.location.href = '/';
    } catch (err: any) {
      setError('Server error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <h2 className="text-2xl font-semibold text-center text-stone-800 mb-6">Welcome Back</h2>
      {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}

      <div>
        <label htmlFor="email-login" className="block text-sm font-medium text-stone-700">Email</label>
        <input
          type="email"
          id="email-login"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label htmlFor="password-login" className="block text-sm font-medium text-stone-700">Password</label>
        <input
          type="password"
          id="password-login"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-stone-400 flex items-center justify-center"
      >
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
};

export default LoginPage;
