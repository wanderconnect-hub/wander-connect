import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowTrendingUpIcon,
    Cog6ToothIcon,
    PencilSquareIcon,
    ArrowLeftOnRectangleIcon,
} from '../constants';
import type { User, Post } from '../types';
import EditProfileModal from './EditProfileModal';
import ProfilePostGrid from './ProfilePostGrid';
import PostDetailModal from './PostDetailModal';
import PostUploader from './PostUploader'; // <--- ADDED IMPORT

// Helper to format large numbers
const formatStat = (num: number = 0) => {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}m`;
    }
    if (num >= 1000) {
        return `${Math.round(num / 1000)}k`;
    }
    return num.toString();
};

interface UserProfileProps {
    user: User;
    currentUser: User;
    isCurrentUserProfile: boolean;
    posts: Post[];
    onUpdateUser?: (updatedUser: User) => void;
    onLogout?: () => void;
    onToggleLike: (postId: number) => void;
    onAddComment: (postId: number, commentText: string) => void;
    onOpenLikesModal: (post: Post) => void;
    onEditPost: (post: Post) => void;
    onDeletePost: (postId: number) => void;
    onNewPost?: () => void; // <--- ADDED PROP TO TRIGGER REFRESH
}

const UserProfile: React.FC<UserProfileProps> = ({ 
    user, 
    currentUser, 
    isCurrentUserProfile, 
    posts, 
    onUpdateUser, 
    onLogout, 
    onToggleLike, 
    onAddComment, 
    onOpenLikesModal, 
    onEditPost, 
    onDeletePost,
    onNewPost // <--- ADDED PROP
}) => {
  const miles = user.miles ?? 0;
  const goal = (Math.floor(miles / 10000) + 1) * 10000;
  const progressPercentage = (miles / goal) * 100;

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const userPosts = posts.filter(post => post.user.id === user.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleOpenPost = (post: Post) => {
    const index = userPosts.findIndex(p => p.id === post.id);
    if (index !== -1) {
        setSelectedPostIndex(index);
    }
  };

  const handleClosePost = () => {
    setSelectedPostIndex(null);
  };
  
  const handleNavigate = (direction: 'next' | 'prev') => {
    if (selectedPostIndex === null) return;
    const newIndex = direction === 'next' ? selectedPostIndex + 1 : selectedPostIndex - 1;
    if (newIndex >= 0 && newIndex < userPosts.length) {
        setSelectedPostIndex(newIndex);
    }
  };

  const toggleSettings = () => {
    setIsSettingsOpen(prev => !prev);
  };
  
  const handleLogout = () => {
    setIsSettingsOpen(false);
    onLogout?.();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
            setIsSettingsOpen(false);
        }
    };
    if (isSettingsOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);


  const Stat = ({ value, label }: { value: string; label: string }) => (
    <div className="text-center">
      <p className="font-bold text-lg sm:text-xl text-stone-800">{value}</p>
      <p className="text-sm text-stone-500">{label}</p>
    </div>
  );
  
  const MenuItem: React.FC<{
      icon: React.ReactNode; 
      text: string; 
      onClick: () => void;
      isDestructive?: boolean;
  }> = ({ icon, text, onClick, isDestructive = false }) => (
    <li>
        <button onClick={onClick} className={`w-full text-left flex items-center gap-3 px-4 py-3 text-sm ${isDestructive ? 'text-red-600 hover:bg-red-50' : 'text-stone-700 hover:bg-stone-100'} transition-colors`}>
            {icon}
            <span>{text}</span>
        </button>
    </li>
  );

  const partners = user.partners ?? 0;
  const trips = user.trips ?? 0;
  const placesCount = user.placesCount ?? 0;
  
  const selectedPost = selectedPostIndex !== null ? userPosts[selectedPostIndex] : null;
  const hasNext = selectedPostIndex !== null && selectedPostIndex < userPosts.length - 1;
  const hasPrevious = selectedPostIndex !== null && selectedPostIndex > 0;

  return (
    <>
    <div className="max-w-2xl mx-auto bg-white">
        {/* ... (Cover Photo, Settings Button, Avatar code is unchanged) ... */}
        <div className="relative">
            <div className="h-48 sm:h-56 bg-stone-200">
                {user.coverPhotoUrl && <img src={user.coverPhotoUrl} alt={`${user.name}'s cover photo`} className="w-full h-full object-cover" />}
            </div>
            {isCurrentUserProfile && (
                <div className="absolute top-4 right-4 z-30" ref={settingsRef}>
                    <button onClick={toggleSettings} className="text-white bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors p-2 rounded-full" aria-label="Settings" aria-haspopup="true" aria-expanded={isSettingsOpen}>
                        <Cog6ToothIcon className="w-6 h-6" />
                    </button>
                    {isSettingsOpen && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-stone-200/80 w-56 overflow-hidden animate-fade-in-down z-40">
                            <ul className="py-1">
                                <MenuItem icon={<PencilSquareIcon className="w-5 h-5" />} text="Edit Profile" onClick={() => { setIsEditProfileOpen(true); setIsSettingsOpen(false); }} />
                                <MenuItem icon={<Cog6ToothIcon className="w-5 h-5" />} text="Settings" onClick={() => { navigate('/settings'); setIsSettingsOpen(false); }} />
                                <li className="border-t border-stone-200/80 my-1"></li>
                                <MenuItem icon={<ArrowLeftOnRectangleIcon className="w-5 h-5" />} text="Log Out" onClick={handleLogout} isDestructive />
                            </ul>
                        </div>
                    )}
                </div>
            )}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-stone-200">
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
            </div>
        </div>

        {/* ... (User Info & Stats section is unchanged) ... */}
        <div className="pt-20 px-4 pb-6 text-center">
            <h1 className="text-2xl font-bold text-stone-800">{user.name}</h1>
            <p className="mt-2 text-stone-600 whitespace-pre-line text-sm max-w-md mx-auto">{user.bio}</p>
        </div>
        <div className="px-4 pb-6 border-b border-stone-200">
            <div className="flex justify-around items-center">
                <Stat value={trips.toString()} label={trips === 1 ? 'Trip' : 'Trips'} />
                <Stat value={placesCount.toString()} label={placesCount === 1 ? 'Place' : 'Places'} />
                <Stat value={partners.toString()} label={partners === 1 ? 'Buddy' : 'Buddies'} />
            </div>
            <section className="mt-6">
                <div className="flex justify-between items-center text-sm mb-1">
                    <div className="flex items-center gap-2 text-stone-600 font-semibold">
                        <ArrowTrendingUpIcon className="w-5 h-5" />
                        <span>Travel Progress</span>
                    </div>
                    <span className="font-mono text-xs text-stone-500">{formatStat(miles)} / {formatStat(goal)} mi</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2">
                    <div className="bg-cyan-600 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </section>
        </div>

        {/* --- THIS IS THE NEW SECTION --- */}
        {isCurrentUserProfile && onNewPost && (
            <div className="px-4 py-6 border-b border-stone-200">
                <PostUploader currentUser={currentUser} onPost={onNewPost} />
            </div>
        )}

        {/* Post Grid */}
        <ProfilePostGrid posts={userPosts} onPostClick={handleOpenPost} />
    </div>

    {/* ... (Modals are unchanged) ... */}
    {isCurrentUserProfile && isEditProfileOpen && onUpdateUser && (
        <EditProfileModal user={user} onSave={(updatedUser) => { onUpdateUser(updatedUser); setIsEditProfileOpen(false); }} onClose={() => setIsEditProfileOpen(false)} />
    )}
    {selectedPost && (
        <PostDetailModal post={selectedPost} currentUser={currentUser} onClose={handleClosePost} onToggleLike={onToggleLike} onAddComment={onAddComment} onOpenLikesModal={onOpenLikesModal} onEdit={onEditPost} onDelete={(postId) => { onDeletePost(postId); handleClosePost(); }} onNavigate={handleNavigate} hasNext={hasNext} hasPrevious={hasPrevious} />
    )}
    </>
  );
};

export default UserProfile;