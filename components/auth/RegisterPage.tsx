import React, { useState } from 'react';
import type { User } from '../../types';

interface RegisterPageProps {
    onRegister: (newUser: { name: string, email: string }) => void;
    allUsers: User[];
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, allUsers }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
            setError('All fields are required.');
            return;
        }
        setError('');
        setIsLoading(true);

        // Mock registration delay
        setTimeout(() => {
            const emailExists = allUsers.some(user => user.email?.toLowerCase() === email.toLowerCase());
            if (emailExists) {
                setError('An account with this email already exists.');
                setIsLoading(false);
                return;
            }
            onRegister({ name, email });
            setIsLoading(false);
        }, 1000);
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
                    className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
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
                    className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
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
                {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
        </form>
    );
};

export default RegisterPage;