



import React, { useState } from 'react';
import type { Post } from '../types';
import { XMarkIcon, PhotoIcon } from '../constants';

interface EditPostModalProps {
    post: Post;
    onSave: (updatedPost: Post) => void;
    onClose: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onSave, onClose }) => {
    const [caption, setCaption] = useState(post.caption);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(post.mediaUrl || null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(post.mediaType);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setMediaType(selectedFile.type.startsWith('image') ? 'image' : 'video');
        }
    };
    
    const handleRemoveMedia = () => {
        setFile(null);
        setPreview(null);
        setMediaType(undefined);
    };

    const handleSave = () => {
        const updatedPost: Post = {
            ...post,
            caption: caption,
            mediaUrl: preview || undefined,
            mediaType: mediaType,
        };
        onSave(updatedPost);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-stone-200">
                    <h2 className="text-xl font-bold">Edit Post</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-stone-100" aria-label="Close">
                        <XMarkIcon className="w-6 h-6 text-stone-600" />
                    </button>
                </div>
                
                <div className="p-4">
                    <textarea
                        className="w-full p-2 border-none focus:ring-0 resize-none text-lg"
                        placeholder="Write a caption..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        rows={4}
                        autoFocus
                    />
                    
                    {preview && (
                        <div className="mt-2 relative border border-stone-200 rounded-lg overflow-hidden">
                            {mediaType === 'image' ? (
                                <img src={preview} alt="Preview" className="max-h-80 w-full object-contain bg-stone-100" />
                            ) : (
                                <video src={preview} controls className="max-h-80 w-full rounded-lg bg-stone-100" />
                            )}
                            <button 
                                type="button" 
                                onClick={handleRemoveMedia}
                                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                aria-label="Remove media"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-stone-200 flex justify-between items-center">
                    <label htmlFor="edit-file-upload" className="cursor-pointer text-cyan-600 hover:text-cyan-700 p-2 rounded-lg hover:bg-cyan-50 transition-colors flex items-center gap-2">
                        <PhotoIcon className="w-6 h-6" />
                        <span className="font-semibold text-sm">{preview ? 'Change' : 'Add'} Photo/Video</span>
                    </label>
                    <input
                        id="edit-file-upload"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div className="flex gap-2">
                        <button onClick={onClose} className="text-stone-600 font-semibold py-2 px-4 rounded-lg hover:bg-stone-100 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPostModal;
