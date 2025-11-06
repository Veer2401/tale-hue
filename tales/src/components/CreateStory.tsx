'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Sparkles, Image as ImageIcon, Loader2, RefreshCw, Send, CheckCircle, XCircle } from 'lucide-react';

export default function CreateStory() {
  const { user, profile, signInWithGoogle, error: authError } = useAuth();
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    setError(null);
    
    if (!user) {
      try {
        await signInWithGoogle();
      } catch (err) {
        setError('Failed to sign in. Please try again.');
      }
      return;
    }

    if (!content.trim() || content.length > 150) {
      setError('Story must be between 1 and 150 characters');
      return;
    }

    setGenerating(true);
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: content })
      });

      const data = await response.json();
      
      if (data.success && data.imageDescription) {
        console.log('Enhanced prompt:', data.imageDescription);
        
        // Use Flux model via Pollinations for sharp, high-quality images
        const enhancedPrompt = encodeURIComponent(data.imageDescription + ", ultra detailed, sharp focus, high quality, professional");
        
        // Flux model: Good balance of quality and speed
        const imageUrl = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=1024&height=1024&nologo=true&model=flux&seed=${Date.now()}`;
        
        console.log('Fetching image from Pollinations:', imageUrl);
        
        // Fetch and use the image directly
        const imageResponse = await fetch(imageUrl);
        
        if (!imageResponse.ok) {
          throw new Error(`Image fetch failed: ${imageResponse.status}`);
        }
        
        const imageBlob = await imageResponse.blob();
        
        if (imageBlob.size === 0) {
          throw new Error('Generated image is empty');
        }
        
        console.log('Image loaded successfully, size:', imageBlob.size, 'bytes');
        
        const previewURL = URL.createObjectURL(imageBlob);
        setPreviewImage(previewURL);
        setImageBlob(imageBlob);
      } else {
        throw new Error('Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      setError('Failed to generate image. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePost = async () => {
    if (!imageBlob || !user) return;
    await uploadStory(imageBlob);
  };

  const handleGenerateAgain = () => {
    setPreviewImage(null);
    setImageBlob(null);
    setError(null);
  };

  const uploadStory = async (imageBlob: Blob) => {
    if (!user) {
      setError('Please sign in to post stories');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      console.log('Starting upload process...');
      
      // Create a compressed version of the image
      const img = new Image();
      const imgUrl = URL.createObjectURL(imageBlob);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imgUrl;
      });
      
      // Create canvas and compress image
      const canvas = document.createElement('canvas');
      const maxSize = 800; // Reduce size for Firestore limits
      let width = img.width;
      let height = img.height;
      
      // Scale down if needed
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      // Convert to base64 with lower quality (0.6 = 60% quality)
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
      console.log('Image compressed, size:', compressedBase64.length, 'bytes');
      
      URL.revokeObjectURL(imgUrl);

      // Create story document in Firestore with compressed image
      const storyId = `story_${Date.now()}`;
      const storyData = {
        storyID: storyId,
        userID: user.uid,
        content: content,
        imageURL: compressedBase64,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date()
      };

      console.log('Creating post document...');
      await addDoc(collection(db, 'posts'), storyData);
      
      console.log('Post created successfully!');

      // Reset form
      setContent('');
      setPreviewImage(null);
      setImageBlob(null);
      
      // Show success message with beautiful UI
      setSuccessMessage('✨ Your story was posted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error: any) {
      console.error('Error uploading story:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setError(`Failed to upload story: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className="glass rounded-2xl px-6 py-4 border border-green-500/50 shadow-2xl flex items-center gap-3 neon-glow">
            <CheckCircle className="text-green-400" size={24} />
            <p className="text-white font-bold">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="glass rounded-3xl shadow-2xl p-10 border border-purple-500/30">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-xl neon-glow">
            <Sparkles className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white neon-text">Create Your Vibe ✨</h2>
            <p className="text-sm text-purple-300 font-medium">Drop your story in 150 chars max 🔥</p>
          </div>
        </div>

        {/* Story Input */}
        <div className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={150}
            placeholder="What's your story? Make it lit... 🚀"
            className="w-full h-40 p-6 glass rounded-3xl border-2 border-purple-500/30 focus:border-purple-500 focus:outline-none text-white text-lg resize-none placeholder-purple-300/50 font-medium backdrop-blur-xl"
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-purple-300 font-bold">
              {content.length}/150 characters
            </span>
            {content.length > 0 && (
              <span className={`text-sm font-black ${content.length > 150 ? 'text-red-400' : 'text-green-400'}`}>
                {content.length > 150 ? '❌ Too long bestie' : '✓ Perfect vibe'}
              </span>
            )}
          </div>
        </div>

        {/* Image Preview */}
        {previewImage && (
          <div className="mb-6">
            <div className="relative rounded-3xl overflow-hidden border-4 border-purple-500 shadow-2xl neon-glow">
              <img 
                src={previewImage} 
                alt="Generated story preview" 
                className="w-full aspect-square object-cover"
              />
              <div className="absolute top-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full">
                <p className="text-xs text-white font-bold">🎨 AI Generated</p>
              </div>
            </div>
            <p className="text-xs text-purple-300 text-center mt-3 font-medium">
              Your masterpiece awaits! 🌟
            </p>
          </div>
        )}

        {/* Error Message */}
        {(error || authError) && (
          <div className="mb-6 p-5 bg-red-500/10 border-2 border-red-500/30 rounded-2xl backdrop-blur-sm">
            <p className="text-sm text-red-300 font-bold">
              ⚠️ {error || authError}
            </p>
          </div>
        )}

        {/* Generate Button or Post/Regenerate Buttons */}
        {!previewImage ? (
          <button
            onClick={handleGenerateImage}
            disabled={generating || uploading || !content.trim() || content.length > 150}
            className="w-full py-6 px-8 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-black text-xl rounded-full hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-4 neon-glow"
          >
            {generating ? (
              <>
                <Loader2 className="animate-spin" size={28} />
                Cooking up magic...
              </>
            ) : (
              <>
                <ImageIcon size={28} />
                {user ? 'Generate My Vibe 🎨' : 'Sign In to Create 🚀'}
              </>
            )}
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={handleGenerateAgain}
              disabled={uploading}
              className="flex-1 py-5 px-6 glass border-2 border-white/20 text-white font-black text-lg rounded-full hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-105"
            >
              <RefreshCw size={24} />
              Remix It
            </button>
            <button
              onClick={handlePost}
              disabled={uploading}
              className="flex-1 py-5 px-6 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 text-white font-black text-lg rounded-full hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 neon-glow"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={24} />
                  Drop It! 🔥
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
