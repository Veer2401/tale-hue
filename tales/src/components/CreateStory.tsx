'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Sparkles, Image as ImageIcon, Loader2, RefreshCw, Send } from 'lucide-react';

export default function CreateStory() {
  const { user, profile, signInWithGoogle, error: authError } = useAuth();
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        // Generate image using Pollinations AI (free image generation API)
        const enhancedPrompt = encodeURIComponent(
          `${data.imageDescription}, masterpiece, best quality, ultra detailed, 8k, sharp focus, professional photography, award winning, cinematic composition, perfect lighting`
        );
        
        // Use Pollinations AI with Flux-Pro model for superior quality
        const imageUrl = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=1024&height=1024&nologo=true&model=flux&enhance=true&seed=${Date.now()}`;
        
        // Fetch the generated image
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        
        // Create a canvas to overlay the story text on the AI image
        const img = new Image();
        const imgUrl = URL.createObjectURL(imageBlob);
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 1024;
          canvas.height = 1024;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Draw the AI-generated image
            ctx.drawImage(img, 0, 0, 1024, 1024);
            
            // Add artistic semi-transparent overlay with gradient
            const overlayGradient = ctx.createLinearGradient(0, 700, 0, 1024);
            overlayGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            overlayGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
            overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
            ctx.fillStyle = overlayGradient;
            ctx.fillRect(0, 700, 1024, 324);
            
            // Add subtle glow effect behind text
            ctx.shadowColor = 'rgba(168, 85, 247, 0.4)';
            ctx.shadowBlur = 30;
            
            // Add the story text at bottom with better typography
            ctx.fillStyle = 'white';
            ctx.font = 'bold 36px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.letterSpacing = '0.5px';
            
            // Word wrap for story text
            const words = content.split(' ');
            let line = '';
            let y = 900;
            const lineHeight = 48;
            const maxWidth = 920;
            
            words.forEach((word, i) => {
              const testLine = line + word + ' ';
              const metrics = ctx.measureText(testLine);
              if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line.trim(), 512, y);
                line = word + ' ';
                y += lineHeight;
              } else {
                line = testLine;
              }
            });
            ctx.fillText(line.trim(), 512, y);
            
            // Convert to blob with high quality
            canvas.toBlob((finalBlob) => {
              if (finalBlob) {
                const previewURL = URL.createObjectURL(finalBlob);
                setPreviewImage(previewURL);
                setImageBlob(finalBlob);
              }
            }, 'image/png', 1.0);
          }
          
          // Clean up
          URL.revokeObjectURL(imgUrl);
        };
        
        img.src = imgUrl;
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
      
      // Show success message
      alert('✨ Your story was posted successfully!');
      
    } catch (error: any) {
      console.error('Error uploading story:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setError(`Failed to upload story: ${error.message}`);
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Create Your Story</h2>
            <p className="text-sm text-zinc-500">Share your tale in 150 characters or less</p>
          </div>
        </div>

        {/* Story Input */}
        <div className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={150}
            placeholder="Write your story here... ✨"
            className="w-full h-32 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none text-zinc-900 dark:text-zinc-100 resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-zinc-500">
              {content.length}/150 characters
            </span>
            {content.length > 0 && (
              <span className={`text-sm ${content.length > 150 ? 'text-red-500' : 'text-green-500'}`}>
                {content.length > 150 ? '❌ Too long' : '✓ Perfect'}
              </span>
            )}
          </div>
        </div>

        {/* Image Preview */}
        {previewImage && (
          <div className="mb-6">
            <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500">
              <img 
                src={previewImage} 
                alt="Generated story preview" 
                className="w-full aspect-square object-cover"
              />
            </div>
            <p className="text-xs text-zinc-500 text-center mt-2">
              Preview of your generated image
            </p>
          </div>
        )}

        {/* Error Message */}
        {(error || authError) && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error || authError}
            </p>
          </div>
        )}

        {/* Generate Button or Post/Regenerate Buttons */}
        {!previewImage ? (
          <button
            onClick={handleGenerateImage}
            disabled={generating || uploading || !content.trim() || content.length > 150}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-semibold rounded-2xl hover:shadow-2xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            {generating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Generating Magic...
              </>
            ) : (
              <>
                <ImageIcon size={20} />
                {user ? 'Generate Image' : 'Sign In to Generate'}
              </>
            )}
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={handleGenerateAgain}
              disabled={uploading}
              className="flex-1 py-4 px-6 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold rounded-2xl hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <RefreshCw size={20} />
              Generate Again
            </button>
            <button
              onClick={handlePost}
              disabled={uploading}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-semibold rounded-2xl hover:shadow-2xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Posting...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Post Story
                </>
              )}
            </button>
          </div>
        )}

        {/* Info */}
        {!user && (
          <p className="text-center text-sm text-zinc-500 mt-4">
            Sign in with Google to start creating stories
          </p>
        )}
      </div>
    </div>
  );
}
