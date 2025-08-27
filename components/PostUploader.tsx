
// File: components/PostUploader.tsx - FINAL SECURE VERSION
import React, { useState } from 'react';
import { PhotoIcon, XMarkIcon } from '../constants';
import type { Post, User } from '../types';
import { fetchWithAuth } from '../services/apiService';

interface PostUploaderProps {
  onPost: () => void;
  currentUser: User;
  onLogout: () => void;
}

const PostUploader: React.FC<PostUploaderProps> = ({ onPost, currentUser, onLogout }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (preview) URL.revokeObjectURL(preview);
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setMediaType(selectedFile.type.startsWith('image') ? 'image' : 'video');
    if (!isExpanded) setIsExpanded(true);
  };
  
  const resetForm = () => {
    setCaption('');
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setMediaType(null);
    setIsExpanded(false);
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCaption = caption.trim();
    if (!trimmedCaption && !file) return;

    setIsUploading(true);
    let uploadedMediaUrl: string | null = null;
    
    // Quick check for token before attempting to upload.
    // fetchWithAuth will also check, but this is a faster failure.
    if (!localStorage.getItem('authToken')) {
        onLogout();
        return;
    }

    try {
      // Step 1: If a file exists, upload it to Vercel Blob first.
      if (file) {
        const response = await fetchWithAuth(
          `/api/upload?filename=${encodeURIComponent(file.name)}`,
          {
            method: 'POST',
            body: file,
          },
          true // Mark this as a file upload
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'File upload failed.'}));
          throw new Error(errorData.message || 'File upload failed.');
        }
        
        const blobResult = await response.json();
        uploadedMediaUrl = blobResult.url;
      }

      // Step 2: Create the post with text and media URL.
      const postPayload = {
        content: trimmedCaption,
        mediaUrl: uploadedMediaUrl,
        mediaType: mediaType,
      };

      const postResponse = await fetchWithAuth('/api/posts', {
        method: 'POST',
        body: JSON.stringify(postPayload),
      });

      if (!postResponse.ok) {
        const errorData = await postResponse.json();
        throw new Error(errorData.error || 'Failed to save post.');
      }

      // Step 3: Success! Refresh the main post list and reset the form.
      onPost();
      resetForm();

    } catch (error) {
      // The fetchWithAuth service handles 401s by reloading.
      // This catch block will only handle other errors (e.g., 500 server error, network issues).
      // The "Session expired" error from fetchWithAuth's rejection will be caught here, but since the
      // page is already reloading, showing an alert is unnecessary and may not even be seen.
      if (!(error as Error).message.includes('Session expired')) {
          console.error('Error creating post:', error);
          alert(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred.'}`);
      }
      setIsUploading(false); // Re-enable the form on failure.
    }
  };
  
  const isSubmitDisabled = (!file && !caption.trim()) || isUploading;

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
        
        {preview && (
            <div className="mt-2 pl-12">
                <div className="mt-2 relative border border-stone-200 rounded-lg overflow-hidden">
                    {mediaType === 'image' ? (
                        <img src={preview} alt="Preview" className="max-h-80 w-full object-contain bg-stone-100" />
                    ) : (
                        <video src={preview} controls className="max-h-80 w-full rounded-lg bg-stone-100" />
                    )}
                    <button 
                        type="button" 
                        onClick={() => { 
                            if (preview) URL.revokeObjectURL(preview);
                            setFile(null); 
                            setPreview(null); 
                        }}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                        aria-label="Remove media"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}

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
                    disabled={isSubmitDisabled}
                    className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
                >
                    {isUploading ? 'Uploading...' : 'Post'}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default PostUploader;
