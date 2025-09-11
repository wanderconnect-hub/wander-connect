import React, { useState } from 'react';
import type { User } from '../../types';

interface RegisterPageProps {
  onRegister: (newUser: User) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        setIsLoading(false);
        return;
      }

      // Save token for later requests
      localStorage.setItem('token', data.token);

      // Call parent with new user
      onRegister(data.user);

    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold text-center text-stone-800 mb-6">Create Account</h2>
      {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}

      <div>
        <label htmlFor="name-register" className="block text-sm font-medium text-stone-700">Full Name</label>
        <input
          type="text"
          id="name-register"
          value={name}
          onChange={e => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md"
          placeholder="Alex Smith"
          required
        />
      </div>

      <div>
        <label htmlFor="email-register" className="block text-sm font-medium text-stone-700">Email</label>
        <input
          type="email"
          id="email-register"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label htmlFor="password-register" className="block text-sm font-medium text-stone-700">Password</label>
        <input
          type="password"
          id="password-register"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md"
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-stone-400 flex items-center justify-center"
      >
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default RegisterPage;
=