import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Post, User } from '../types';
import {
    timeAgo,
    XMarkIcon,
    HeartIcon,
    HeartIconSolid,
    ChatBubbleLeftEllipsisIcon,
    EllipsisVerticalIcon,
    PencilSquareIcon,
    TrashIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '../constants';

interface PostDetailModalProps {
    post: Post;
    currentUser: User;
    onClose: () => void;
    onToggleLike: (postId: number) => void;
    onAddComment: (postId: number, commentText: string) => void;
    onOpenLikesModal: (post: Post) => void;
    onEdit: (post: Post) => void;
    onDelete: (postId: number) => void;
    onNavigate?: (direction: 'next' | 'prev') => void;
    hasNext?: boolean;
    hasPrevious?: boolean;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, currentUser, onClose, onToggleLike, onAddComment, onOpenLikesModal, onEdit, onDelete, onNavigate, hasNext, hasPrevious }) => {
    const [newComment, setNewComment] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const commentInputRef = useRef<HTMLInputElement>(null);
    const commentsContainerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const isLiked = post.likedByUserIds.includes(currentUser.id);
    const likeCount = post.likedByUserIds.length;
    const isOwnPost = post.user.id === currentUser.id;

    useEffect(() => {
        if (commentsContainerRef.current) {
            commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
        }
    }, [post.comments.length]);
    
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

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(post.id, newComment.trim());
            setNewComment('');
        }
    };

    const handleEditClick = () => {
        onClose(); // Close this modal first
        onEdit(post);
        setIsMenuOpen(false);
    };
    
    const handleDeleteClick = () => {
        setIsMenuOpen(false);
        if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            onDelete(post.id);
            onClose(); // Close modal after deletion
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-white hover:bg-white/20 transition-colors z-[51]" aria-label="Close">
                <XMarkIcon className="w-8 h-8" />
            </button>

            <div
                className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Media Section */}
                <div className="w-full md:w-2/3 bg-black flex items-center justify-center order-1 relative group">
                    {post.mediaUrl && post.mediaType === 'image' ? (
                        <img className="max-h-full max-w-full object-contain" src={post.mediaUrl} alt="Travel post" />
                    ) : post.mediaUrl && post.mediaType === 'video' ? (
                        <video className="max-h-full max-w-full" controls autoPlay>
                            <source src={post.mediaUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    ) : <div className="p-8 text-center text-stone-500 bg-stone-100 h-full w-full flex items-center justify-center">{post.caption}</div>}
                    
                    {/* Navigation Buttons */}
                    {hasPrevious && onNavigate && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                            aria-label="Previous post"
                        >
                            <ChevronLeftIcon className="w-8 h-8" />
                        </button>
                    )}
                    {hasNext && onNavigate && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                            aria-label="Next post"
                        >
                            <ChevronRightIcon className="w-8 h-8" />
                        </button>
                    )}
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/3 flex flex-col border-l border-stone-200 order-2">
                    {/* Header */}
                    <div className="p-4 flex items-center justify-between gap-3 border-b border-stone-200">
                        <Link to={`/profile/${post.user.id}`} onClick={onClose} className="flex items-center gap-3 group">
                            <img className="h-10 w-10 rounded-full object-cover" src={post.user.avatarUrl} alt={post.user.name} />
                            <div>
                                <p className="font-bold text-stone-800 group-hover:underline">{post.user.name}</p>
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
                                    <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-stone-200/80 w-40 overflow-hidden z-20 animate-fade-in-down">
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

                    {/* Caption & Comments */}
                    <div ref={commentsContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4">
                        {/* Caption */}
                        {post.caption && (
                            <div className="flex items-start gap-3 text-sm">
                                <Link to={`/profile/${post.user.id}`} onClick={onClose}>
                                    <img src={post.user.avatarUrl} alt={post.user.name} className="w-8 h-8 rounded-full object-cover mt-0.5" />
                                </Link>
                                <div>
                                    <p>
                                        <Link to={`/profile/${post.user.id}`} onClick={onClose} className="font-bold mr-2 hover:underline">{post.user.name}</Link>
                                        {post.caption}
                                    </p>
                                    <p className="text-xs text-stone-400 mt-1">{timeAgo(post.timestamp)}</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Comments */}
                        {post.comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-3 text-sm">
                                <Link to={`/profile/${comment.user.id}`} onClick={onClose}>
                                    <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-8 h-8 rounded-full object-cover mt-0.5" />
                                </Link>
                                <div>
                                    <p>
                                        <Link to={`/profile/${comment.user.id}`} onClick={onClose} className="font-bold mr-2 hover:underline">{comment.user.name}</Link>
                                        {comment.text}
                                    </p>
                                    <p className="text-xs text-stone-400 mt-1">{timeAgo(comment.timestamp)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Actions & Input */}
                    <div className="p-4 border-t border-stone-200">
                        <div className="flex items-center gap-4 mb-2">
                            <button onClick={() => onToggleLike(post.id)} className="flex items-center gap-1.5 group" aria-label="Like post">
                                {isLiked ? (
                                    <HeartIconSolid className="w-7 h-7 text-red-500 transition-transform group-hover:scale-110" />
                                ) : (
                                    <HeartIcon className="w-7 h-7 text-stone-600 transition-transform group-hover:scale-110" />
                                )}
                            </button>
                            <button onClick={() => commentInputRef.current?.focus()} className="flex items-center gap-1.5 group" aria-label="Comment on post">
                                <ChatBubbleLeftEllipsisIcon className="w-7 h-7 text-stone-600 transition-transform group-hover:scale-110" />
                            </button>
                        </div>
                        {likeCount > 0 && 
                            <button onClick={() => onOpenLikesModal(post)} className="font-semibold text-sm mb-2 hover:underline">
                                {likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}
                            </button>
                        }
                        
                        <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-2 border-t border-stone-100 mt-2">
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
                </div>
            </div>
        </div>
    );
};

export default PostDetailModal;