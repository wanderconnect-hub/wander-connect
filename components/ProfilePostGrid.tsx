import React, { useRef, useState, useEffect } from 'react';
import { PlayIcon } from '../constants';
import type { Post } from '../types';

interface ProfilePostGridProps {
    posts: Post[];
    onPostClick: (post: Post) => void;
}

const GridItem: React.FC<{ post: Post; onPostClick: (post: Post) => void }> = ({ post, onPostClick }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const itemRef = useRef<HTMLButtonElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { threshold: 0.5 } // Trigger when 50% of the item is visible
        );

        const currentItemRef = itemRef.current;
        if (currentItemRef) {
            observer.observe(currentItemRef);
        }

        return () => {
            if (currentItemRef) {
                observer.unobserve(currentItemRef);
            }
        };
    }, []);

    useEffect(() => {
        if (post.mediaType !== 'video' || !videoRef.current) return;

        if (isHovering && isInView) {
            videoRef.current.play().catch(error => {
                console.log("Video autoplay prevented:", error);
            });
        } else {
            videoRef.current.pause();
        }
    }, [isHovering, isInView, post.mediaType]);

    return (
        <button 
            ref={itemRef}
            className="relative aspect-square bg-stone-100 group focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:z-10"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => onPostClick(post)}
            aria-label={`View post: ${post.caption}`}
        >
            {post.mediaUrl && post.mediaType === 'image' ? (
                <img src={post.mediaUrl} alt={post.caption} className="w-full h-full object-cover" />
            ) : post.mediaUrl && post.mediaType === 'video' ? (
                <>
                    <video ref={videoRef} loop muted playsInline src={post.mediaUrl} className="w-full h-full object-cover" />
                    <PlayIcon className="absolute top-1.5 right-1.5 w-5 h-5 text-white drop-shadow-md pointer-events-none" />
                </>
            ) : (
                <div className="w-full h-full p-2 flex items-center justify-center text-center text-xs text-stone-600">
                    {post.caption}
                </div>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {/* Hover effects can go here */}
            </div>
        </button>
    );
};


const ProfilePostGrid: React.FC<ProfilePostGridProps> = ({ posts, onPostClick }) => {
    if (posts.length === 0) {
        return (
            <div className="text-center py-12 px-4 border-t border-stone-200">
                <h2 className="text-xl font-bold text-stone-700">No Posts Yet</h2>
                <p className="text-stone-500 mt-2">This user hasn't shared any adventures.</p>
            </div>
        );
    }

    return (
        <div className="border-t border-stone-200">
            <div className="grid grid-cols-3 gap-0.5 bg-stone-200">
                {posts.map(post => (
                    <GridItem key={post.id} post={post} onPostClick={onPostClick} />
                ))}
            </div>
        </div>
    );
};

export default ProfilePostGrid;