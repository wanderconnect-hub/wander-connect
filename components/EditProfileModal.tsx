

import React, { useState } from 'react';
import type { User } from '../types';
import { XMarkIcon } from '../constants';

interface EditProfileModalProps {
    user: User;
    onSave: (updatedUser: User) => void;
    onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onSave, onClose }) => {
    const [name, setName] = useState(user.name);
    const [bio, setBio] = useState(user.bio);
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
    const [coverPhotoUrl, setCoverPhotoUrl] = useState(user.coverPhotoUrl || '');

    const handleSave = () => {
        onSave({ ...user, name, bio, avatarUrl, coverPhotoUrl });
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h2 id="edit-profile-title" className="text-xl font-bold">Edit Profile</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-100" aria-label="Close">
                        <XMarkIcon className="w-6 h-6 text-stone-600" />
                    </button>
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-stone-700">Name</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label htmlFor="avatar" className="block text-sm font-medium text-stone-700">Avatar URL</label>
                    <input type="text" id="avatar" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                 <div>
                    <label htmlFor="cover" className="block text-sm font-medium text-stone-700">Cover Photo URL</label>
                    <input type="text" id="cover" value={coverPhotoUrl} onChange={e => setCoverPhotoUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-stone-700">Bio</label>
                    <textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                    <button onClick={onClose} className="text-stone-600 font-semibold py-2 px-4 rounded-lg hover:bg-stone-100 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;