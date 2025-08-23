



import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '../constants';

const Toggle: React.FC<{ isOn: boolean; onToggle: () => void; }> = ({ isOn, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ${isOn ? 'bg-cyan-600' : 'bg-stone-300'}`}
            role="switch"
            aria-checked={isOn}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
};

interface Settings {
    isPrivate: boolean;
    notifyMatches: boolean;
    notifyLikes: boolean;
}

interface SettingsPageProps {
    settings: Settings;
    onUpdateSettings: (newSettings: Settings) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdateSettings }) => {
    const navigate = useNavigate();
    
    const handleToggle = (key: keyof Settings) => {
        onUpdateSettings({ ...settings, [key]: !settings[key] });
    };

    const SettingRow: React.FC<{ title: string, description: string, children: React.ReactNode }> = ({ title, description, children }) => (
        <div className="flex justify-between items-center py-4 border-b border-stone-200 last:border-b-0">
            <div>
                <h3 className="font-semibold text-stone-800">{title}</h3>
                <p className="text-sm text-stone-500">{description}</p>
            </div>
            <div>
                {children}
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <header className="relative flex items-center justify-center mb-8">
                <button onClick={() => navigate('/profile')} className="absolute left-0 p-2 rounded-full hover:bg-stone-100" aria-label="Go back to profile">
                    <ChevronLeftIcon className="w-6 h-6 text-stone-600" />
                </button>
                <h1 className="text-2xl font-bold text-stone-800">Settings</h1>
            </header>
            
            <div className="bg-white p-6 rounded-xl shadow-md border border-stone-200/80">
                <h2 className="text-lg font-bold text-cyan-700 mb-2">Account</h2>
                <SettingRow title="Private Account" description="Only approved followers can see your posts.">
                    <Toggle isOn={settings.isPrivate} onToggle={() => handleToggle('isPrivate')} />
                </SettingRow>
                 <SettingRow title="Two-Factor Authentication" description="Add an extra layer of security.">
                    <button className="text-sm font-semibold text-cyan-600 hover:text-cyan-800">Enable</button>
                </SettingRow>
                
                <h2 className="text-lg font-bold text-cyan-700 mt-8 mb-2">Notifications</h2>
                <SettingRow title="New Matches" description="Get notified for new travel buddy matches.">
                    <Toggle isOn={settings.notifyMatches} onToggle={() => handleToggle('notifyMatches')} />
                </SettingRow>
                <SettingRow title="Post Likes" description="Receive notifications for new likes.">
                    <Toggle isOn={settings.notifyLikes} onToggle={() => handleToggle('notifyLikes')} />
                </SettingRow>
            </div>
        </div>
    );
};

export default SettingsPage;
