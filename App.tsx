// File: App.tsx - FINAL PRODUCTION-READY VERSION
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useParams } from 'react-router-dom';
import { HomeIcon, UsersIcon, GlobeAltIcon, UserCircleIcon } from './constants';
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
import { jwtDecode } from 'jwt-decode';
import { fetchWithAuth } from './services/apiService';

const HomePage: React.FC<{ 
    posts: Post[]; 
    refreshPosts: () => void; 
    openEditModal: (post: Post) => void; 
    currentUser: User; 
    onToggleLike: (postId: number) => void; 
    onAddComment: (postId: number, commentText: string) => void; 
    onOpenLikesModal: (post: Post) => void; 
    onDeletePost: (postId: number) => void; 
    isLoading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    onLogout: () => void;
}> = ({ posts, refreshPosts, openEditModal, currentUser, onToggleLike, onAddComment, onOpenLikesModal, onDeletePost, isLoading, hasMore, loadMore, onLogout }) => (
    <div className="max-w-2xl mx-auto py-8 px-4">
        <PostUploader onPost={refreshPosts} currentUser={currentUser} onLogout={onLogout} />
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
        <div className="text-center mt-8 py-4">
            {hasMore ? (
                <button 
                    onClick={loadMore} 
                    disabled={isLoading} 
                    className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-stone-400 disabled:cursor-wait"
                >
                    {isLoading ? 'Loading...' : 'Load More Posts'}
                </button>
            ) : (
                posts.length > 0 && <p className="text-stone-500">You've reached the end of the road! 🗺️</p>
            )}
        </div>
    </div>
);

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
  refreshPosts: () => void; 
}> = ({ currentUser, allUsers, posts, onUpdateUser, onLogout, onToggleLike, onAddComment, onOpenLikesModal, onEditPost, onDeletePost, refreshPosts }) => { 
  
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
      onNewPost={isCurrentUserProfile ? refreshPosts : undefined} 
    /> 
  ); 
};

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewingLikesOfPost, setViewingLikesOfPost] = useState<Post | null>(null);
  const [settings, setSettings] = useState({ isPrivate: false, notifyMatches: true, notifyLikes: true });

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  
  const handleLogout = () => {
      localStorage.removeItem('authToken');
      setCurrentUser(null);
      setPosts([]);
      setAllUsers([]);
  };

  const fetchUsers = async () => {
      try {
          const res = await fetchWithAuth('/api/users');
          if (!res.ok) throw new Error('Failed to fetch users');
          const users = await res.json();
          const validUsers = Array.isArray(users) ? users : [];
          setAllUsers(validUsers);
          
          if (currentUser) {
              const fullCurrentUser = validUsers.find(u => u.id === currentUser.id);
              if (fullCurrentUser) {
                  setCurrentUser(fullCurrentUser);
              }
          }
      } catch (error) {
          console.error("Error fetching users:", error);
          if ((error as Error).message.includes('Session expired')) return;
          setAllUsers([]); 
      }
  };

  const fetchPosts = async (pageNum = 1) => {
    if (isLoadingPosts) return;
    setIsLoadingPosts(true);
    try {
      const response = await fetchWithAuth(`/api/posts?page=${pageNum}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      
      const fetchedPosts = Array.isArray(data?.posts) ? data.posts : [];
      const currentPage = data?.currentPage ?? pageNum;
      const totalPages = data?.totalPages ?? currentPage;

      setPosts(prev => pageNum === 1 ? fetchedPosts : [...prev, ...fetchedPosts]);
      setHasMore(currentPage < totalPages);
      setPage(currentPage);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };
  
  const loadMorePosts = () => {
    if (hasMore && !isLoadingPosts) {
      fetchPosts(page + 1);
    }
  };
  
  const handleRefreshPosts = () => {
    fetchPosts(1);
  };
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded: { userId: number; name: string; email: string; exp: number } = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
            handleLogout();
            return;
        }
        const user: User = { id: decoded.userId, name: decoded.name, email: decoded.email, avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${decoded.name}`, profileComplete: true, bio: '', coverPhotoUrl: '', interests: [], travelStyle: [], miles: 0, partners: 0, placesCount: 0, trips: 0, followingIds: [], followerIds: [], followRequestIds: [] };
        setCurrentUser(user);
        fetchPosts(1);
        fetchUsers();
      } catch (error) { 
        console.error("Invalid token:", error); 
        handleLogout();
      }
    }
  }, []);
  
  const handleLogin = (token: string) => {
    localStorage.setItem('authToken', token);
    const decoded: { userId: number; name: string; email: string; } = jwtDecode(token);
    const user: User = { id: decoded.userId, name: decoded.name, email: decoded.email, avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${decoded.name}`, profileComplete: true, bio: '', coverPhotoUrl: '', interests: [], travelStyle: [], miles: 0, partners: 0, placesCount: 0, trips: 0, followingIds: [], followerIds: [], followRequestIds: [] };
    setCurrentUser(user);
    handleRefreshPosts();
    fetchUsers();
  };
  
  const handleAccountSetupComplete = (completedUser: User) => {};
  const handleUpdateSettings = (newSettings: typeof settings) => { setSettings(newSettings); };
  
  const updatePost = async (updatedPost: Post) => {
    try {
      const response = await fetchWithAuth('/api/posts', {
        method: 'PUT',
        body: JSON.stringify({ id: updatedPost.id, content: updatedPost.content }),
      });
      if (!response.ok) {
        throw new Error('Failed to update post on server');
      }
      setPosts(prevPosts => prevPosts.map(p => p.id === updatedPost.id ? { ...p, content: updatedPost.content } : p));
    } catch (error) {
      console.error("Error updating post:", error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setEditingPost(null);
    }
  };

  const deletePost = async (postId: number) => {
    const originalPosts = posts;
    setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));

    try {
      const response = await fetchWithAuth(`/api/posts?id=${postId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete post on server');
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert('Failed to delete post. Reverting changes.');
      setPosts(originalPosts);
    }
  };

  const handleToggleLike = async (postId: number) => {
    if (!currentUser) return;
    
    const originalPosts = [...posts];
    setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
            const isLiked = p.likedByUserIds.includes(currentUser.id);
            const newLikedIds = isLiked 
                ? p.likedByUserIds.filter(id => id !== currentUser.id)
                : [...p.likedByUserIds, currentUser.id];
            return { ...p, likedByUserIds: newLikedIds };
        }
        return p;
    }));

    try {
        const response = await fetchWithAuth('/api/likes', {
            method: 'POST',
            body: JSON.stringify({ postId })
        });
        if (!response.ok) throw new Error('Failed to update like status.');
    } catch (error) {
        console.error("Error toggling like:", error);
        setPosts(originalPosts);
        alert("Could not update like. Please try again.");
    }
  };

  const handleAddComment = async (postId: number, commentText: string) => {
    if (!currentUser) return;

    try {
        const response = await fetchWithAuth('/api/comments', {
            method: 'POST',
            body: JSON.stringify({ postId, text: commentText })
        });
        if (!response.ok) throw new Error('Failed to post comment.');
        
        const newComment: Comment = await response.json();

        setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
                return { ...p, comments: [...p.comments, newComment] };
            }
            return p;
        }));

    } catch (error) {
        console.error("Error adding comment:", error);
        alert("Could not post comment. Please try again.");
    }
  };

  const openEditModal = (post: Post) => setEditingPost(post);
  const closeEditModal = () => setEditingPost(null);
  const openLikesModal = (post: Post) => setViewingLikesOfPost(post);
  const closeLikesModal = () => setViewingLikesOfPost(null);
  const updateUser = (updatedUser: User) => { if (currentUser && currentUser.id === updatedUser.id) { setCurrentUser(updatedUser); } };
  const handleAddConnection = (partnerId: number) => {};

  if (!currentUser) { return <AuthPage onLogin={handleLogin} />; }
  if (!currentUser.profileComplete) { return <AccountSetupPage user={currentUser} onSetupComplete={handleAccountSetupComplete} />; }
  
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-stone-50 font-sans">
        <main className="flex-grow pb-20">
          <Routes>
            <Route path="/" element={
              <HomePage 
                posts={posts} 
                refreshPosts={handleRefreshPosts}
                openEditModal={openEditModal} 
                currentUser={currentUser} 
                onToggleLike={handleToggleLike} 
                onAddComment={handleAddComment}
                onOpenLikesModal={openLikesModal}
                onDeletePost={deletePost}
                isLoading={isLoadingPosts}
                hasMore={hasMore}
                loadMore={loadMorePosts}
                onLogout={handleLogout}
              />
            } />
            <Route path="/matchmaking" element={
              <MatchmakingForm 
                currentUser={currentUser} 
                allUsers={allUsers} 
                onAddConnection={handleAddConnection} 
              />
            } />
            <Route path="/explore" element={<DestinationExplorer />} />
            <Route path="/profile/:userId" element={
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
                  refreshPosts={handleRefreshPosts}
              />
            } />
            <Route path="/profile" element={
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
                  refreshPosts={handleRefreshPosts}
              />
            } />
            <Route path="/settings" element={
              <SettingsPage 
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            } />
          </Routes>
        </main>
  
        {editingPost && (
          <EditPostModal 
            post={editingPost} 
            onSave={updatePost}
            onClose={closeEditModal} 
          />
        )}
        
        {viewingLikesOfPost && (
          <LikesModal 
            post={viewingLikesOfPost} 
            allUsers={allUsers} 
            onClose={closeLikesModal} 
          />
        )}
  
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200/80 shadow-t-sm z-40">
          <div className="max-w-2xl mx-auto flex justify-around items-center h-16">
            <NavLink to="/" className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-full transition-colors ${isActive ? 'text-cyan-600' : 'text-stone-500 hover:text-cyan-600'}`}>
              <HomeIcon className="w-6 h-6" />
              <span className="text-xs font-medium">Home</span>
            </NavLink>
            <NavLink to="/matchmaking" className={({ isActive }) => `flex flex-col items-center justify-center gap-1 w-full transition-colors ${isActive ? 'text-cyan-600' : 'text-stone-500 hover:text-cyan-600'}`}>
              <UsersIcon className="w-6 h-6" />
              <span className="text-xs font-medium">Match</span>
            </NavLink>
                        <NavLink 
              to="/explore" 
              className={({ isActive }) => 
                `flex flex-col items-center justify-center gap-1 w-full transition-colors ${
                  isActive ? 'text-cyan-600' : 'text-stone-500 hover:text-cyan-600'
                }`
              }
            >
              <GlobeAltIcon className="w-6 h-6" />
              <span className="text-xs font-medium">Explore</span>
            </NavLink>

            <NavLink 
              to="/profile" 
              className={({ isActive }) => 
                `flex flex-col items-center justify-center gap-1 w-full transition-colors ${
                  isActive ? 'text-cyan-600' : 'text-stone-500 hover:text-cyan-600'
                }`
              }
            >
              <UserCircleIcon className="w-6 h-6" />
              <span className="text-xs font-medium">Profile</span>
            </NavLink>
          </div>
        </nav>
      </div>
    </HashRouter>
  );
};

export default App;

