import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Post, User, Comment } from '../types';
import { 
    timeAgo, 
    EllipsisVerticalIcon, 
    PencilSquareIcon,
    TrashIcon,
    HeartIcon,
    HeartIconSolid,
    ChatBubbleLeftEllipsisIcon,
} from '../constants';

interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  currentUser: User;
  onToggleLike: (postId: number) => void;
  onAddComment: (postId: number, commentText: string) => void;
  onOpenLikesModal: (post: Post) => void;
  onDelete: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onEdit, currentUser, onToggleLike, onAddComment, onOpenLikesModal, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  const isOwnPost = post.user.id === currentUser.id;
  const isLiked = post.likedByUserIds.includes(currentUser.id);
  const likeCount = post.likedByUserIds.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showComments && commentsContainerRef.current) {
        commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
    }
  }, [post.comments.length, showComments]);
  
  const handleCommentClick = () => {
      const shouldShow = !showComments;
      setShowComments(shouldShow);
      if (shouldShow) {
          setTimeout(() => commentInputRef.current?.focus(), 0);
      }
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newComment.trim()) {
          onAddComment(post.id, newComment.trim());
          setNewComment('');
      }
  };

  const handleEditClick = () => {
    onEdit(post);
    setIsMenuOpen(false);
  };

  const handleDeleteClick = () => {
    setIsMenuOpen(false);
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        onDelete(post.id);
    }
  };
    
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-stone-200/80">
      {/* Header */}
      <div className="p-4 flex items-center justify-between gap-3">
        <Link to={`/profile/${post.user.id}`} className="flex items-center gap-3 group">
            <img className="h-10 w-10 rounded-full object-cover" src={post.user.avatarUrl} alt={post.user.name} />
            <div>
                <p className="font-bold text-stone-800 group-hover:underline">{post.user.name}</p>
                {post.location && <p className="text-xs text-stone-500">{post.location}</p>}
            </div>
        </Link>
        {isOwnPost && (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="p-1 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-700"
              aria-label="Post options"
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
            >
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-stone-200/80 w-40 overflow-hidden z-10 animate-fade-in-down">
                <ul>
                  <li>
                    <button 
                      onClick={handleEditClick}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      <span>Edit Post</span>
                    </button>
                  </li>
                  <li className="border-t border-stone-100"></li>
                  <li>
                    <button
                        onClick={handleDeleteClick}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                        <span>Delete Post</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Media */}
      {post.mediaUrl && post.mediaType === 'image' ? (
        <img className="w-full h-auto object-cover" src={post.mediaUrl} alt="Travel post" />
      ) : post.mediaUrl && post.mediaType === 'video' ? (
        <video className="w-full h-auto" controls>
          <source src={post.mediaUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : null}

      <div className="p-4">
        {/* Actions Bar */}
        <div className="flex items-center gap-4 mb-2">
            <button onClick={() => onToggleLike(post.id)} className="flex items-center gap-1.5 group" aria-label="Like post">
                {isLiked ? (
                    <HeartIconSolid className="w-6 h-6 text-red-500 transition-transform group-hover:scale-110" />
                ) : (
                    <HeartIcon className="w-6 h-6 text-stone-600 transition-transform group-hover:scale-110" />
                )}
            </button>
            <button onClick={handleCommentClick} className="flex items-center gap-1.5 group" aria-label="Comment on post">
                <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-stone-600 transition-transform group-hover:scale-110" />
            </button>
        </div>
        
        {/* Likes Count */}
        {likeCount > 0 && 
            <button onClick={() => onOpenLikesModal(post)} className="font-semibold text-sm mb-2 hover:underline">
                {likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}
            </button>
        }
        
        {/* --- THIS IS THE FIX --- */}
        {/* Changed 'post.caption' to 'post.content' to match the API data */}
        {post.content && (
           <p className="text-sm">
             <Link to={`/profile/${post.user.id}`} className="font-bold mr-2 hover:underline">{post.user.name}</Link>
             {post.content}
           </p>
        )}
        
        {/* View Comments Button */}
        {post.comments.length > 0 && !showComments && (
            <button onClick={() => setShowComments(true)} className="text-sm text-stone-500 mt-2 hover:underline">
                View all {post.comments.length} comments
            </button>
        )}

        <p className="text-xs text-stone-400 mt-2 uppercase">{timeAgo(post.timestamp)}</p>
      </div>
      
      {/* Comments Section */}
      {showComments && (
          <div className="border-t border-stone-200 px-4 pt-2 pb-1">
            <div ref={commentsContainerRef} className="space-y-2 max-h-48 overflow-y-auto mb-2">
                {post.comments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-2 text-sm">
                        <Link to={`/profile/${comment.user.id}`}>
                            <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-7 h-7 rounded-full object-cover mt-0.5" />
                        </Link>
                        <div className="bg-stone-100 rounded-xl px-3 py-1.5">
                           <p>
                               <Link to={`/profile/${comment.user.id}`} className="font-bold mr-2 hover:underline">{comment.user.name}</Link>
                               {comment.text}
                           </p>
                        </div>
                    </div>
                ))}
            </div>
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 py-2">
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover" />
                <input
                    ref={commentInputRef}
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-stone-100 border-none rounded-full px-4 py-1.5 text-sm focus:ring-2 focus:ring-cyan-500"
                />
                <button type="submit" disabled={!newComment.trim()} className="text-sm font-semibold text-cyan-600 hover:text-cyan-800 disabled:text-stone-400 disabled:cursor-not-allowed">
                    Post
                </button>
            </form>
          </div>
      )}
    </div>
  );
};

export default PostCard;