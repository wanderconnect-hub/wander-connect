
import React from 'react';
import { Link } from 'react-router-dom';
import type { Post, User } from '../types';
import { XMarkIcon } from '../constants';

interface LikesModalProps {
    post: Post;
    allUsers: User[];
    onClose: () => void;
}

const LikesModal: React.FC<LikesModalProps> = ({ post, allUsers, onClose }) => {

    const usersWhoLiked = post.likedByUserIds
        .map(userId => allUsers.find(u => u.id === userId))
        .filter((u): u is User => u !== undefined);

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            aria-modal="true"
            role="dialog"
            aria-labelledby="likes-modal-title"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 h-[400px] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-stone-200">
                    <h2 id="likes-modal-title" className="text-lg font-bold">Liked by</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-100" aria-label="Close">
                        <XMarkIcon className="w-6 h-6 text-stone-600" />
                    </button>
                </div>
                
                <div className="p-2 overflow-y-auto">
                    {usersWhoLiked.length > 0 ? (
                        <ul>
                            {usersWhoLiked.map(user => (
                                <li key={user.id}>
                                    <Link 
                                        to={`/profile/${user.id}`} 
                                        onClick={onClose}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-100"
                                    >
                                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover"/>
                                        <span className="font-semibold text-stone-800">{user.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-stone-500 p-8">No one has liked this post yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LikesModal;
