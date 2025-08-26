// File: App.tsx - FINAL CORRECTED VERSION
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useParams } from 'react-router-dom';
import { HomeIcon, UsersIcon, GlobeAltIcon, UserCircleIcon } from './constants';
import PostUploader from './components/PostUploader';
import MatchmakingForm from './components/MatchmakingForm';
import DestinationExplorer from './components/DestinationExplorer';
import UserProfile from './components/UserProfile';
import type { Post, User } from './types';
import EditPostModal from './components/EditPostModal';
import SettingsPage from './components/SettingsPage';
import AuthPage from './components/auth/AuthPage';
import AccountSetupPage from './components/auth/AccountSetupPage';
import LikesModal from './components/LikesModal';
import PostCard from './components/PostCard';
import { jwtDecode } from 'jwt-decode';

// --- HELPER FUNCTION TO FETCH POSTS ---
const fetchPosts = async (setter: React.Dispatch<React.SetStateAction<Post[]>>) => {
  try {
    const response = await fetch('/api/posts');
    if (!response.ok) throw new Error('Failed to fetch posts');
    const data = await response.json();
    setter(data);
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
};

// (HomePage and ProfilePage components are fine as they were)
const HomePage: React.FC<{ posts: Post[]; refreshPosts: () => void; openEditModal: (post: Post) => void; currentUser: User; onToggleLike: (postId: number) => void; onAddComment: (postId: number, commentText: string) => void; onOpenLikesModal: (post: Post) => void; onDeletePost: (postId: number) => void; }> = ({ posts, refreshPosts, openEditModal, currentUser, onToggleLike, onAddComment, onOpenLikesModal, onDeletePost }) => ( <div className="max-w-2xl mx-auto py-8 px-4"> <PostUploader onPost={refreshPosts} currentUser={currentUser} /> <div className="mt-8 space-y-6"> {posts.map(post => ( <PostCard key={post.id} post={post} onEdit={openEditModal} currentUser={currentUser} onToggleLike={onToggleLike} onAddComment={onAddComment} onOpenLikesModal={onOpenLikesModal} onDelete={onDeletePost} /> ))} </div> </div> );
const ProfilePage: React.FC<{ currentUser: User; allUsers: User[]; posts: Post[]; onUpdateUser: (updatedUser: User) => void; onLogout: () => void; onToggleLike: (postId: number) => void; onAddComment: (postId: number, commentText: string) => void; onOpenLikesModal: (post: Post) => void; onEditPost: (post: Post) => void; onDeletePost: (postId: number) => void; refreshPosts: () => void; }> = ({ currentUser, allUsers, posts, onUpdateUser, onLogout, onToggleLike, onAddComment, onOpenLikesModal, onEditPost, onDeletePost, refreshPosts }) => { const { userId } = useParams<{ userId: string }>(); const userToShow = userId ? allUsers.find(u => u.id === parseInt(userId, 10)) : currentUser; if (!userToShow) { return <div className="text-center p-8">User not found.</div>; } const isCurrentUserProfile = userToShow.id === currentUser.id; return ( <UserProfile user={userToShow} currentUser={currentUser} isCurrentUserProfile={isCurrentUserProfile} onUpdateUser={isCurrentUserProfile ? onUpdateUser : undefined} onLogout={isCurrentUserProfile ? onLogout : undefined} posts={posts} onToggleLike={onToggleLike} onAddComment={onAddComment} onOpenLikesModal={onOpenLikesModal} onEditPost={onEditPost} onDeletePost={onDeletePost} onNewPost={isCurrentUserProfile ? refreshPosts : undefined} /> ); };

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewingLikesOfPost, setViewingLikesOfPost] = useState<Post | null>(null);
  const [settings, setSettings] = useState({ isPrivate: false, notifyMatches: true, notifyLikes: true });

  // Function to pass to children to trigger a refetch
  const handleRefreshPosts = () => fetchPosts(setPosts);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded: { userId: number; name: string; email: string; } = jwtDecode(token);
        const user: User = { id: decoded.userId, name: decoded.name, email: decoded.email, avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${decoded.name}`, profileComplete: true, bio: '', coverPhotoUrl: '', interests: [], travelStyle: [], miles: 0, partners: 0, placesCount: 0, trips: 0 };
        setCurrentUser(user);
      } catch (error) { console.error("Invalid token:", error); localStorage.removeItem('authToken'); }
    }
  }, []);
  
  // Fetch posts only once when the app loads
  useEffect(() => {
    handleRefreshPosts();
  }, []);

  const handleLogin = (token: string) => {
    localStorage.setItem('authToken', token);
    const decoded: { userId: number; name: string; email: string; } = jwtDecode(token);
    const user: User = { id: decoded.userId, name: decoded.name, email: decoded.email, avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${decoded.name}`, profileComplete: true, bio: '', coverPhotoUrl: '', interests: [], travelStyle: [], miles: 0, partners: 0, placesCount: 0, trips: 0 };
    setCurrentUser(user);
  };
  
  const handleLogout = () => {
      localStorage.removeItem('authToken');
      setCurrentUser(null);
  };
  
  // --- REMOVED THE addPost FUNCTION as it's handled in the component now ---
  
  const handleAccountSetupComplete = (completedUser: User) => {};
  const handleUpdateSettings = (newSettings: typeof settings) => { setSettings(newSettings); };
  const updatePost = (updatedPost: Post) => { setPosts(prevPosts => prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p)); setEditingPost(null); };
  const deletePost = (postId: number) => { setPosts(prevPosts => prevPosts.filter(p => p.id !== postId)); };
  const openEditModal = (post: Post) => setEditingPost(post);
  const closeEditModal = () => setEditingPost(null);
  const openLikesModal = (post: Post) => setViewingLikesOfPost(post);
  const closeLikesModal = () => setViewingLikesOfPost(null);
  const updateUser = (updatedUser: User) => { if (currentUser && currentUser.id === updatedUser.id) { setCurrentUser(updatedUser); } };
  const handleToggleLike = (postId: number) => {};
  const handleAddComment = (postId: number, commentText: string) => {};
  const handleAddConnection = (partnerId: number) => {};

  if (!currentUser) { return <AuthPage onLogin={handleLogin} />; }
  // if (!currentUser.profileComplete) { return <AccountSetupPage user={currentUser} onSetupComplete={handleAccountSetupComplete} />; }

  return (
    <HashRouter>
      <div className="min-h-screen bg-stone-100/50 font-sans">
        <main className="pb-24">
            <Routes>
                <Route path="/" element={ <HomePage posts={posts} refreshPosts={handleRefreshPosts} openEditModal={openEditModal} currentUser={currentUser} onToggleLike={handleToggleLike} onAddComment={handleAddComment} onOpenLikesModal={openLikesModal} onDeletePost={deletePost} /> } />
                <Route path="/matchmaking" element={<MatchmakingForm currentUser={currentUser} allUsers={allUsers} onAddConnection={handleAddConnection} />} />
                <Route path="/explore" element={<DestinationExplorer />} />
                <Route path="/profile/:userId?" element={ <ProfilePage currentUser={currentUser} allUsers={allUsers} posts={posts} onUpdateUser={updateUser} onLogout={handleLogout} onToggleLike={handleToggleLike} onAddComment={handleAddComment} onOpenLikesModal={openLikesModal} onEditPost={openEditModal} onDeletePost={deletePost} refreshPosts={handleRefreshPosts} />} />
                <Route path="/settings" element={<SettingsPage settings={settings} onUpdateSettings={handleUpdateSettings} />} />
            </Routes>
        </main>
        
        {editingPost && <EditPostModal post={editingPost} onSave={updatePost} onClose={closeEditModal} />}
        {viewingLikesOfPost && <LikesModal post={viewingLikesOfPost} allUsers={allUsers} onClose={closeLikesModal} />}

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-lg">
            <div className="flex justify-around max-w-2xl mx-auto">
                <NavLink to="/" className={({ isActive }) => `flex flex-col items-center justify-center p-3 text-sm transition-colors duration-200 ${isActive ? 'text-cyan-600' : 'text-stone-500 hover:text-cyan-500'}`}> <HomeIcon className="w-6 h-6 mb-1" /> <span>Home</span> </NavLink>
                <NavLink to="/matchmaking" className={({ isActive }) => `flex flex-col items-center justify-center p-3 text-sm transition-colors duration-200 ${isActive ? 'text-cyan-600' : 'text-stone-500 hover:text-cyan-500'}`}> <UsersIcon className="w-6 h-6 mb-1" /> <span>Match</span> </NavLink>
                <NavLink to="/explore" className={({ isActive }) => `flex flex-col items-center justify-center p-3 text-sm transition-colors duration-200 ${isActive ? 'text-cyan-600' : 'text-stone-500 hover:text-cyan-500'}`}> <GlobeAltIcon className="w-6 h-6 mb-1" /> <span>Explore</span> </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center justify-center p-3 text-sm transition-colors duration-200 ${isActive ? 'text-cyan-600' : 'text-stone-500 hover:text-cyan-500'}`}> <UserCircleIcon className="w-6 h-6 mb-1" /> <span>Profile</span> </NavLink>
            </div>
        </nav>
      </div>
    </HashRouter>
  );
};

export default App;