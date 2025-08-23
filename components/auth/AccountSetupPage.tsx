


import React, { useState } from 'react';
import type { User } from '../../types';
import { ChevronLeftIcon, TRAVEL_STYLES, INTERESTS } from '../../constants';

interface AccountSetupPageProps {
    user: User;
    onSetupComplete: (completedUser: User) => void;
}

const AccountSetupPage: React.FC<AccountSetupPageProps> = ({ user, onSetupComplete }) => {
    const [step, setStep] = useState(1);
    const [userData, setUserData] = useState<User>(user);
    const [error, setError] = useState<string | null>(null);
    const totalSteps = 4;

    const nextStep = () => {
        setError(null);
        if (step === 1 && !userData.name.trim()) {
            setError("Please enter your display name.");
            return;
        }
        if (step === 2 && userData.travelStyle.length === 0) {
            setError("Please select at least one travel style.");
            return;
        }
        if (step === 3 && userData.interests.length === 0) {
            setError("Please select at least one interest.");
            return;
        }
        setStep(s => Math.min(s + 1, totalSteps));
    };
    const prevStep = () => {
        setError(null);
        setStep(s => Math.max(s - 1, 1));
    };

    const handleFieldChange = (field: keyof User, value: any) => {
        setUserData(prev => ({ ...prev, [field]: value }));
    };

    const handleToggleSelection = (field: 'travelStyle' | 'interests', value: string) => {
        const currentSelection = userData[field];
        const newSelection = currentSelection.includes(value)
            ? currentSelection.filter(item => item !== value)
            : [...currentSelection, value];
        handleFieldChange(field, newSelection);
    };

    const handleSubmit = () => {
        if (!userData.bio.trim()) {
            setError("A short bio is required to complete your profile.");
            return;
        }
        setError(null);
        onSetupComplete(userData);
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-center">Welcome, {user.name}!</h2>
                        <p className="text-center text-stone-500 mt-2 mb-6">Let's set up your traveler profile.</p>
                        <div className="flex flex-col items-center gap-4">
                            <img src={userData.avatarUrl} alt="Avatar" className="h-24 w-24 rounded-full object-cover shadow-md" />
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-stone-700">Display Name</label>
                                <input type="text" id="name" value={userData.name} onChange={e => handleFieldChange('name', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                            <div>
                                <label htmlFor="avatarUrl" className="block text-sm font-medium text-stone-700">Avatar URL</label>
                                <input type="text" id="avatarUrl" value={userData.avatarUrl} onChange={e => handleFieldChange('avatarUrl', e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-center">What's your travel style?</h2>
                        <p className="text-center text-stone-500 mt-2 mb-6">Select all that apply.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {TRAVEL_STYLES.map(style => (
                                <button key={style} onClick={() => handleToggleSelection('travelStyle', style)} className={`p-3 border rounded-lg font-semibold text-center transition-colors ${userData.travelStyle.includes(style) ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white hover:bg-stone-100 border-stone-300'}`}>
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-center">What are your interests?</h2>
                        <p className="text-center text-stone-500 mt-2 mb-6">This helps us find better matches.</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {INTERESTS.map(interest => (
                                <button key={interest} onClick={() => handleToggleSelection('interests', interest)} className={`p-3 border rounded-lg font-semibold text-center transition-colors ${userData.interests.includes(interest) ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white hover:bg-stone-100 border-stone-300'}`}>
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-center">Tell us about yourself</h2>
                        <p className="text-center text-stone-500 mt-2 mb-6">Write a short bio to appear on your profile.</p>
                        <textarea id="bio" value={userData.bio} onChange={e => handleFieldChange('bio', e.target.value)} rows={5} className="block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" placeholder="Adventure seeker, foodie, and lover of spontaneous road trips..." />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-lg">
                <div className="mb-4 px-2">
                    <div className="flex justify-between items-center mb-2">
                        {step > 1 ? (
                            <button onClick={prevStep} className="flex items-center text-sm font-semibold text-stone-600 hover:text-stone-800">
                                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                                Back
                            </button>
                        ) : <div />}
                        <span className="text-sm font-semibold text-stone-500">Step {step} of {totalSteps}</span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                        <div className="bg-cyan-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border p-8 min-h-[450px] flex flex-col justify-center animate-fade-in">
                    <div className="flex-grow flex flex-col justify-center">
                        {renderStepContent()}
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mt-4 h-5">{error}</p>}
                </div>

                <div className="mt-6">
                    {step < totalSteps ? (
                        <button onClick={nextStep} className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 transition-colors">
                            Next
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                            Finish Setup
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountSetupPage;