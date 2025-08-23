

import React from 'react';
import { HashRouter, Routes, Route, NavLink, useParams } from 'react-router-dom';
import { HomeIcon, UsersIcon, GlobeAltIcon, UserCircleIcon, MOCK_POSTS, MOCK_USERS } from './constants';
import PostUploader from './components/PostUploader';
import MatchmakingForm from './components/MatchmakingForm';
import DestinationExplorer from './components/DestinationExplorer';
import UserProfile from './components/UserProfile';
import type { Post, User, Comment } from './types';
import EditPostModal from './components/EditPostModal';
import SettingsPage from './components/SettingsPage';
import AuthPage from './components/auth/AuthPage';
import AccountSetupPage from './components/auth/AccountSetupPage';
import LikesModal from './components/LikesModal';
import PostCard from './components/PostCard';

const HomePage: React.FC<{
    posts: Post[];
    addPost: (newPost: Post) => void;
    openEditModal: (post: Post) => void;
    currentUser: User;
    onToggleLike: (postId: number) => void;
    onAddComment: (postId: number, commentText: string) => void;
    onOpenLikesModal: (post: Post) => void;
    onDeletePost: (postId: number) => void;
}> = ({ posts, addPost, openEditModal, currentUser, onToggleLike, onAddComment, onOpenLikesModal, onDeletePost }) => {
    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <PostUploader onPost={addPost} currentUser={currentUser} />
            <div className="mt-8 space-y-6">
                {posts.map(post => (
                    <PostCard 
                        key={post.id} 
                        post={post} 
                        onEdit={openEditModal} 
                        currentUser={currentUser}
                        onToggleLike={onToggleLike}
                        onAddComment={onAddComment}
                        onOpenLikesModal={onOpenLikesModal}
                        onDelete={onDeletePost}
                    />
                ))}
            </div>
        </div>
    );
};

const ProfilePage: React.FC<{
    currentUser: User;
    allUsers: User[];
    posts: Post[];
    onUpdateUser: (updatedUser: User) => void;
    onLogout: () => void;
    onToggleLike: (postId: number) => void;
    onAddComment: (postId: number, commentText: string) => void;
    onOpenLikesModal: (post: Post) => void;
    onEditPost: (post: Post) => void;
    onDeletePost: (postId: number) => void;
}> = ({ currentUser, allUsers, posts, onUpdateUser, onLogout, onToggleLike, onAddComment, onOpenLikesModal, onEditPost, onDeletePost }) => {
    const { userId } = useParams<{ userId: string }>();
    const userToShow = userId ? allUsers.find(u => u.id === parseInt(userId, 10)) : currentUser;
    
    if (!userToShow) {
        return <div className="text-center p-8">User not found.</div>;
    }

    const isCurrentUserProfile = userToShow.id === currentUser.id;

    return (
        <UserProfile
            user={userToShow}
            currentUser={currentUser}
            isCurrentUserProfile={isCurrentUserProfile}
            onUpdateUser={isCurrentUserProfile ? onUpdateUser : undefined}
            onLogout={isCurrentUserProfile ? onLogout : undefined}
            posts={posts}
            onToggleLike={onToggleLike}
            onAddComment={onAddComment}
            onOpenLikesModal={onOpenLikesModal}
            onEditPost={onEditPost}
            onDeletePost={onDeletePost}
        />
    );
};


const App: React.FC = () => {
  const [posts, setPosts] = React.useState<Post[]>(MOCK_POSTS);
  const [allUsers, setAllUsers] = React.useState<User[]>(MOCK_USERS);
  const [editingPost, setEditingPost] = React.useState<Post | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [viewingLikesOfPost, setViewingLikesOfPost] = React.useState<Post | null>(null);
  const [settings, setSettings] = React.useState({
    isPrivate: false,
    notifyMatches: true,
    notifyLikes: true,
  });

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleRegister = (newUser: { name: string, email: string }) => {
    const userToSetup: User = {
        id: Date.now(),
        name: newUser.name,
        email: newUser.email,
        avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${newUser.name}`,
        coverPhotoUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200',
        bio: '',
        travelStyle: [],
        interests: [],
        profileComplete: false,
        trips: 0,
        placesCount: 0,
        partners: 0,
        miles: 0,
    };
    setAllUsers(prev => [...prev, userToSetup]);
    setCurrentUser(userToSetup);
  };
  
  const handleAccountSetupComplete = (completedUser: User) => {
      const fullyCompletedUser = { ...completedUser, profileComplete: true };
      setCurrentUser(fullyCompletedUser);
      updateUser(fullyCompletedUser);
  };
  
  const handleLogout = () => {
      setCurrentUser(null);
  };

  const handleUpdateSettings = (newSettings: typeof settings) => {
      setSettings(newSettings);
  };

  const addPost = (newPost: Post) => {
      setPosts(prevPosts => [{
        ...newPost,
        likedByUserIds: [],
        comments: [],
      }, ...prevPosts]);
  };

  const updatePost = (updatedPost: Post) => {
      setPosts(prevPosts => prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p));
      setEditingPost(null);
  };
  
  const deletePost = (postId: number) => {
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
  };

  const openEditModal = (post: Post) => setEditingPost(post);
  const closeEditModal = () => setEditingPost(null);
  const openLikesModal = (post: Post) => setViewingLikesOfPost(post);
  const closeLikesModal = () => setViewingLikesOfPost(null);

  const updateUser = (updatedUser: User) => {
      if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
      }
      setAllUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
      setPosts(prevPosts => 
          prevPosts.map(p => {
              const updatedPost = p.user.id === updatedUser.id ? { ...p, user: updatedUser } : p;
              const updatedComments = updatedPost.comments.map(c => 
                c.user.id === updatedUser.id ? { ...c, user: updatedUser } : c
              );
              return { ...updatedPost, comments: updatedComments };
          })
      );
  };

  const handleToggleLike = (postId: number) => {
    if (!currentUser) return;
    const currentUserId = currentUser.id;

    setPosts(prevPosts =>
        prevPosts.map(p => {
            if (p.id === postId) {
                const isLiked = p.likedByUserIds.includes(currentUserId);
                if (isLiked) {
                    return { ...p, likedByUserIds: p.likedByUserIds.filter(id => id !== currentUserId) };
                } else {
                    return { ...p, likedByUserIds: [...p.likedByUserIds, currentUserId] };
                }
            }
            return p;
        })
    );
  };

  const handleAddComment = (postId: number, commentText: string) => {
      if (!currentUser) return;
      const newComment: Comment = {
          id: Date.now(),
          user: currentUser,
          text: commentText,
          timestamp: new Date().toISOString(),
      };
      setPosts(prevPosts => 
        prevPosts.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p)
      );
  };

  const handleAddConnection = (partnerId: number) => {
    if (!currentUser) return;

    const updatedUsersMap = new Map<number, User>();

    const newCurrentUser = { ...currentUser, partners: (currentUser.partners || 0) + 1 };
    updatedUsersMap.set(currentUser.id, newCurrentUser);
    
    const partnerUser = allUsers.find(u => u.id === partnerId);
    if (partnerUser) {
        const newPartnerUser = { ...partnerUser, partners: (partnerUser.partners || 0) + 1 };
        updatedUsersMap.set(partnerId, newPartnerUser);
    } else {
        console.error("Could not find partner to connect with.");
        return;
    }

    setCurrentUser(newCurrentUser);

    setAllUsers(prevUsers =>
        prevUsers.map(u => updatedUsersMap.get(u.id) || u)
    );

    setPosts(prevPosts =>
        prevPosts.map(p => {
            const updatedPostUser = updatedUsersMap.get(p.user.id);
            const postWithUpdatedUser = updatedPostUser ? { ...p, user: updatedPostUser } : p;
            
            const updatedComments = postWithUpdatedUser.comments.map(c => {
                const updatedCommentUser = updatedUsersMap.get(c.user.id);
                return updatedCommentUser ? { ...c, user: updatedCommentUser } : c;
            });

            return { ...postWithUpdatedUser, comments: updatedComments };
        })
    );
  };

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} onRegister={handleRegister} allUsers={allUsers} />;
  }

  if (!currentUser.profileComplete) {
      return <AccountSetupPage user={currentUser} onSetupComplete={handleAccountSetupComplete} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-stone-100/50 font-sans">
        <main className="pb-24">
            <Routes>
                <Route path="/" element={
                    <HomePage 
                        posts={posts} 
                        addPost={addPost}
                        openEditModal={openEditModal}
                        currentUser={currentUser}
                        onToggleLike={handleToggleLike}
                        onAddComment={handleAddComment}
                        onOpenLikesModal={openLikesModal}
                        onDeletePost={deletePost}
                    />
                } />
                <Route path="/matchmaking" element={<MatchmakingForm currentUser={currentUser} allUsers={allUsers} onAddConnection={handleAddConnection} />} />
                <Route path="/explore" element={<DestinationExplorer />} />
                <Route path="/profile/:userId?" element={
                    <ProfilePage 
                        currentUser={currentUser}
                        allUsers={allUsers}
                        posts={posts}
                        onUpdateUser={updateUser} 
                        onLogout={handleLogout}
                        onToggleLike={handleToggleLike}
                        onAddComment={handleAddComment}
                        onOpenLikesModal={openLikesModal}
                        onEditPost={openEditModal}
                        onDeletePost={deletePost}
                    />} 
                />
                <Route path="/settings" element={<SettingsPage settings={settings} onUpdateSettings={handleUpdateSettings} />} />
            </Routes>
        </main>
        
        {editingPost && (
            <EditPostModal post={editingPost} onSave={updatePost} onClose={closeEditModal} />
        )}

        {viewingLikesOfPost && (
            <LikesModal 
                post={viewingLikesOfPost} 
                allUsers={allUsers} 
                onClose={closeLikesModal} 
            />
        )}

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-lg">
          <div className="flex justify-around max-w-2xl mx-auto">
            <NavLink to="/" className={({ isActive }) => `flex flex-col items-center justify-center p-3 text-sm transition-colors duration-200 ${isActive ? 'text-cyan-600' : 'text-stone-500 hover:text-cyan-500'}`}>
              <HomeIcon className="w-6 h-6 mb-1" />
              <span>Home</span>
            </NavLink>
            <NavLink to="/matchmaking" className={({ isActive }) => `flex flex-col items-center justify-center p-3 text-sm transition-colors duration-200 ${isActive ? 'text-cyan-600' : 'text-stone-500 hover:text-cyan-500'}`}>
              <UsersIcon className="w-6 h-6 mb-1" />
              <span>Match</span>
            </NavLink>
            <NavLink to="/explore" className={({ isActive }) => `flex flex-col items-center justify-center p-3 text-sm transition-colors duration-200 ${isActive ? 'text-cyan-600' : 'text-stone-500 hover:text-cyan-500'}`}>
              <GlobeAltIcon className="w-6 h-6 mb-1" />
              <span>Explore</span>
            </NavLink>
             <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center justify-center p-3 text-sm transition-colors duration-200 ${isActive ? 'text-cyan-600' : 'text-stone-500 hover:text-cyan-500'}`}>
              <UserCircleIcon className="w-6 h-6 mb-1" />
              <span>Profile</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </HashRouter>
  );
};

export default App;