// components/PostCard.tsx
import React, { useState, useRef } from 'react';
import { Button } from '@heroui/button';
import { CameraIcon } from './icons/CameraIcon';
import { UserIcon } from './icons/UserIcon';
import { uploadPostImage } from '@/lib/storage';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Post {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  imageUrl?: string;
  userId: string;
}

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onUpdate?: (updatedPost: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const imageUrl = await uploadPostImage(file, post.id);
      
      // Update the post with the new image URL
      const updatedPost = { ...post, imageUrl };
      
      // Update in Firestore
      await updateDoc(doc(db, 'posts', post.id), {
        imageUrl
      });

      // Update local state
      if (onUpdate) {
        onUpdate(updatedPost);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // Handle error (e.g., show error message)
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
          <UserIcon size={20} />
        </div>
        <div>
          <div className="font-medium">{post.author}</div>
          <div className="text-sm text-gray-500">{formatDate(post.timestamp)}</div>
        </div>
      </div>
      
      <p className="mb-3">{post.content}</p>
      
      {post.imageUrl && (
        <div className="mb-3 rounded-md overflow-hidden">
          <img 
            src={post.imageUrl} 
            alt="Post content" 
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      )}
      
      {currentUserId === post.userId && (
        <div className="flex items-center border-t pt-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={isUploading}
          />
          <Button
            color="primary"
            size="sm"
            variant="light"
            startContent={<CameraIcon />}
            onPress={() => fileInputRef.current?.click()}
            isLoading={isUploading}
            className="text-sm"
          >
            {isUploading ? 'Uploading...' : 'Add Photo'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PostCard;