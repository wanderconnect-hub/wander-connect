import React, { useState, useEffect } from 'react';
import { PhotoIcon, XMarkIcon } from '../constants';
import type { Post, User } from '../types';

interface PostUploaderProps {
  onPost: (newPost: Post) => void;
  currentUser: User;
}

const PostUploader: React.FC<PostUploaderProps> = ({ onPost, currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  // NOTE: The useEffect for revoking the blob URL has been removed.
  // It was causing a bug where the URL was revoked immediately after posting,
  // leading to broken media in the new post. In a larger app, a more
  // sophisticated memory management strategy would be needed, but for this
  // project's scope, removing the premature cleanup is the correct fix.

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // If there's an existing preview, revoke it before creating a new one
      if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setMediaType(selectedFile.type.startsWith('image') ? 'image' : 'video');
      if (!isExpanded) {
          setIsExpanded(true);
      }
    }
  };
  
  const resetForm = () => {
    setCaption('');
    setFile(null);
    if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setMediaType(null);
    setIsExpanded(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCaption = caption.trim();
    if (!file && !trimmedCaption) {
      return;
    }
    
    const newPost: Post = {
        id: Date.now(),
        user: currentUser,
        caption: caption,
        location: '',
        timestamp: new Date().toISOString(),
        comments: [],
        likedByUserIds: [],
    };

    if (file && preview && mediaType) {
        newPost.mediaUrl = preview;
        newPost.mediaType = mediaType;
    }

    onPost(newPost);
    // Reset form but don't revoke the URL that was just passed to the parent state
    setCaption('');
    setFile(null);
    setPreview(null);
    setMediaType(null);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-md border border-stone-200/80 flex items-center gap-3">
        <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-10 w-10 rounded-full object-cover" />
        <button 
            onClick={() => setIsExpanded(true)}
            className="flex-1 text-left text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors py-2 px-4 rounded-full"
        >
          Share your latest adventure...
        </button>
        <label htmlFor="file-upload-compact" className="cursor-pointer text-cyan-600 hover:text-cyan-700 p-2 rounded-full hover:bg-cyan-50 transition-colors">
            <PhotoIcon className="w-6 h-6" />
        </label>
        <input
            id="file-upload-compact"
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-stone-200/80">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-10 w-10 rounded-full object-cover" />
            <textarea
              className="w-full p-2 border-none focus:ring-0 resize-none text-lg"
              placeholder={`What's on your mind, ${currentUser.name}?`}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              autoFocus
            />
        </div>
        
        <div className="mt-2 pl-12">
            {preview && (
                <div className="mt-2 relative border border-stone-200 rounded-lg overflow-hidden">
                    {mediaType === 'image' ? (
                        <img src={preview} alt="Preview" className="max-h-80 w-full object-contain bg-stone-100" />
                    ) : (
                        <video src={preview} controls className="max-h-80 w-full rounded-lg bg-stone-100" />
                    )}
                    <button 
                        type="button" 
                        onClick={() => { 
                            if (preview && preview.startsWith('blob:')) {
                                URL.revokeObjectURL(preview);
                            }
                            setFile(null); 
                            setPreview(null); 
                        }}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                        aria-label="Remove media"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>

        <div className="mt-4 pt-4 border-t border-stone-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
                 <label htmlFor="file-upload-expanded" className="cursor-pointer text-cyan-600 hover:text-cyan-700 p-2 rounded-lg hover:bg-cyan-50 transition-colors flex items-center gap-2">
                    <PhotoIcon className="w-6 h-6" />
                    <span className="font-semibold text-sm">Photo/Video</span>
                </label>
                <input
                    id="file-upload-expanded"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={resetForm}
                    className="text-stone-600 font-semibold py-2 px-4 rounded-lg hover:bg-stone-100 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!file && !caption.trim()}
                    className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
                >
                    Post
                </button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default PostUploader;