


import React, { useState } from 'react';
import type { User } from '../../types';

interface LoginPageProps {
    onLogin: (user: User) => void;
    allUsers: User[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, allUsers }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // This is a mock login. In a real app, this would be an API call.
        setTimeout(() => {
            const user = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
            
            if (user && password === 'password123') { // Mock password check
                onLogin(user);
            } else {
                setError('Invalid email or password.');
                setPassword(''); // Clear password on failed attempt
            }
            setIsLoading(false);
        }, 1000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-stone-800 mb-6">Log In</h2>
            {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
            
            <div>
                <label htmlFor="email-login" className="block text-sm font-medium text-stone-700">Email</label>
                <input 
                    type="email" 
                    id="email-login" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required 
                />
            </div>
            
            <div>
                <label htmlFor="password-login" className="block text-sm font-medium text-stone-700">Password</label>
                <input 
                    type="password" 
                    id="password-login" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required 
                />
            </div>
            
            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-stone-400 flex items-center justify-center"
            >
                {isLoading ? 'Logging In...' : 'Log In'}
            </button>
        </form>
    );
};

export default LoginPage;