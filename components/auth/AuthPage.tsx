import React, { useState } from 'react';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import type { User } from '../../types';

interface AuthPageProps {
    onLogin: (user: User) => void;
    onRegister: (newUser: { name: string, email: string }) => void;
    allUsers: User[];
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister, allUsers }) => {
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4" style={{backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070')"}}>
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="relative w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 animate-fade-in-down">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-cyan-700" style={{fontFamily: "'Playfair Display', serif"}}>Wander-Connect</h1>
                    <p className="text-stone-600 mt-2">Your next adventure awaits.</p>
                </div>
                
                {isLoginView ? <LoginPage onLogin={onLogin} allUsers={allUsers} /> : <RegisterPage onRegister={onRegister} allUsers={allUsers} />}
                
                <div className="text-center mt-6">
                    <button 
                        onClick={() => setIsLoginView(!isLoginView)} 
                        className="text-sm font-semibold text-cyan-600 hover:underline focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
                    >
                        {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;