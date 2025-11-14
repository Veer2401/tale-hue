'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Sparkles, Image as ImageIcon, Loader2, RefreshCw, Send, CheckCircle, XCircle } from 'lucide-react';

// Google Icon Component
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9.001c0 1.452.348 2.827.957 4.041l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.039-3.71z" fill="#EA4335"/>
  </svg>
);

export default function CreateStory() {
  const { user, profile, signInWithGoogle, error: authError } = useAuth();
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Content moderation - List of inappropriate words
  const inappropriateWords = [
    'sex', 'nude', 'naked', 'porn', 'xxx', 'boobs', 'breast', 'penis', 'vagina',
    'dick', 'cock', 'pussy', 'fuck', 'shit', 'ass', 'bitch', 'damn', 'hell',
    'bastard', 'slut', 'whore', 'rape', 'kill', 'murder', 'death', 'suicide',
    'drug', 'cocaine', 'heroin', 'meth', 'weed', 'marijuana', 'violence', 'blood',
    'gore', 'nsfw', 'adult', 'sexual', 'erotic', 'fetish', 'kinky'
  ];

  // Function to check if content contains inappropriate words
  const containsInappropriateContent = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return inappropriateWords.some(word => {
      // Check for whole word matches to avoid false positives
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(lowerText);
    });
  };

  // Load persisted data on component mount
  useEffect(() => {
    const savedContent = localStorage.getItem('talehue_draft_content');
    const savedImage = localStorage.getItem('talehue_draft_image');
    
    if (savedContent) {
      setContent(savedContent);
    }
    
    if (savedImage) {
      // Validate that it's a proper data URL before trying to fetch
      if (savedImage.startsWith('blob:') || savedImage.startsWith('data:image/')) {
        setPreviewImage(savedImage);
        // Convert base64 back to blob
        fetch(savedImage)
          .then(res => res.blob())
          .then(blob => setImageBlob(blob))
          .catch(err => {
            console.error('Error loading saved image:', err);
            // Clear invalid image from localStorage
            localStorage.removeItem('talehue_draft_image');
            setPreviewImage(null);
          });
      } else {
        // Invalid format, clear it
        localStorage.removeItem('talehue_draft_image');
      }
    }
  }, []);

  // Persist content to localStorage
  useEffect(() => {
    if (content) {
      localStorage.setItem('talehue_draft_content', content);
    } else {
      localStorage.removeItem('talehue_draft_content');
    }
  }, [content]);

  // Persist image to localStorage
  useEffect(() => {
    if (previewImage) {
      localStorage.setItem('talehue_draft_image', previewImage);
    } else {
      localStorage.removeItem('talehue_draft_image');
    }
  }, [previewImage]);

  // Predefined suggestions
  const suggestions = [
    "Sunset beach café vibe",
    "Inside a cool recording studio",
    "Magical Christmas village at night",
    "Neon arcade nostalgia",
    "Cozy winter market scene",
    "F1 pit lane adrenaline rush"
  ];

  const handleSuggestionClick = async (suggestion: string) => {
    setContent(suggestion);
    setError(null);

    // Check for inappropriate content
    if (containsInappropriateContent(suggestion)) {
      setError('⚠️ Cannot generate story: Content contains inappropriate or disallowed words. Please use respectful language.');
      return;
    }

    setGenerating(true);
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: suggestion })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to enhance prompt');
      }
      
      if (data.success && data.imageDescription) {
        console.log('Enhanced prompt:', data.imageDescription);
        
        // Use Flux Pro model for highest quality and faster generation
        const enhancedPrompt = encodeURIComponent(
          data.imageDescription + 
          ", masterpiece, best quality, photorealistic, 8K UHD, ultra detailed, sharp focus, vivid colors, professional photography"
        );
        
        // Flux Pro model: Higher quality with optimized speed
        const imageUrl = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=1536&height=1536&nologo=true&model=flux-pro&enhance=true&seed=${Date.now()}`;
        
        console.log('Fetching high-quality image from Pollinations...');
        
        // Fetch image with timeout for faster failure detection
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        const imageResponse = await fetch(imageUrl, { 
          signal: controller.signal,
          cache: 'no-store'
        });
        clearTimeout(timeoutId);
        
        if (!imageResponse.ok) {
          throw new Error(`Image generation failed: ${imageResponse.status}`);
        }
        
        const imageBlob = await imageResponse.blob();
        
        if (imageBlob.size === 0) {
          throw new Error('Generated image is empty');
        }
        
        console.log('High-quality image loaded successfully, size:', imageBlob.size, 'bytes');
        
        // Convert blob to base64 for storage (suggestion click path)
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setPreviewImage(reader.result);
          }
        };
        reader.readAsDataURL(imageBlob);
        
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

  const handleGenerateImage = async () => {
    setError(null);

    if (!content.trim() || content.length > 150) {
      setError('Story must be between 1 and 150 characters');
      return;
    }

    // Check for inappropriate content
    if (containsInappropriateContent(content)) {
      setError('⚠️ Cannot generate image: Content contains inappropriate or disallowed words. Please use respectful language.');
      setGenerating(false);
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
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to enhance prompt');
      }
      
      if (data.success && data.imageDescription) {
        console.log('Enhanced prompt:', data.imageDescription);
        
        // Use Flux Pro model for highest quality and faster generation
        const enhancedPrompt = encodeURIComponent(
          data.imageDescription + 
          ", masterpiece, best quality, photorealistic, 8K UHD, ultra detailed, sharp focus, vivid colors, professional photography"
        );
        
        // Flux Pro model: Higher quality with optimized speed
        // Using higher resolution for better quality
        const imageUrl = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=1536&height=1536&nologo=true&model=flux-pro&enhance=true&seed=${Date.now()}`;
        
        console.log('Fetching high-quality image from Pollinations...');
        console.log('Image URL:', imageUrl);
        
        // Fetch image with timeout for faster failure detection
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for high-quality images
        
        const imageResponse = await fetch(imageUrl, { 
          signal: controller.signal,
          cache: 'no-store'
        });
        clearTimeout(timeoutId);
        
        if (!imageResponse.ok) {
          throw new Error(`Image generation failed: ${imageResponse.status}`);
        }
        
        const imageBlob = await imageResponse.blob();
        
        if (imageBlob.size === 0) {
          throw new Error('Generated image is empty');
        }
        
        console.log('High-quality image loaded successfully, size:', imageBlob.size, 'bytes');
        
        // Convert blob to base64 for storage (main generate path)
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setPreviewImage(reader.result);
          }
        };
        reader.readAsDataURL(imageBlob);
        
        setImageBlob(imageBlob);
      } else {
        throw new Error('Failed to generate image');
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      if (error.name === 'AbortError') {
        setError('Image generation timed out. The AI service might be busy. Please try again.');
      } else if (error.message?.includes('Failed to fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(error.message || 'Failed to generate image. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handlePost = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
      } catch (err) {
        setError('Please sign in to post your story.');
      }
      return;
    }
    
    if (!imageBlob) return;
    await uploadStory(imageBlob);
  };

  const handleGenerateAgain = () => {
    setPreviewImage(null);
    setImageBlob(null);
    setContent('');
    setError(null);
    // Clear localStorage when regenerating
    localStorage.removeItem('talehue_draft_image');
    localStorage.removeItem('talehue_draft_content');
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
      
      // Convert image blob directly to base64 without compression
      const reader = new FileReader();
      
      const base64Image = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert image to base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });
      
      console.log('Image converted to base64, size:', base64Image.length, 'bytes');

      // Create story document in Firestore with original quality image
      const storyId = `story_${Date.now()}`;
      const storyData = {
        storyID: storyId,
        userID: user.uid,
        content: content,
        imageURL: base64Image,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date()
      };

      console.log('Creating post document...');
      await addDoc(collection(db, 'posts'), storyData);
      
      console.log('Post created successfully!');

      // Clear localStorage and reset form
      localStorage.removeItem('talehue_draft_content');
      localStorage.removeItem('talehue_draft_image');
      setContent('');
      setPreviewImage(null);
      setImageBlob(null);
      
      // Show success message with beautiful UI
      setSuccessMessage('Your story was posted successfully!');
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
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-4 md:top-6 right-4 md:right-6 left-4 md:left-auto z-50 animate-slide-in">
          <div className="glass rounded-2xl px-4 md:px-6 py-3 md:py-4 border border-green-500/50 shadow-2xl flex items-center gap-2 md:gap-3 neon-glow">
            <CheckCircle className="text-green-400" size={20} />
            <CheckCircle className="text-green-400 hidden md:block" size={24} />
            <p className="text-white font-bold text-sm md:text-base">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="glass rounded-3xl shadow-2xl p-6 md:p-10 border border-purple-400/30">
        {/* Header */}
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-600 to-orange-500 flex items-center justify-center shadow-xl neon-glow">
            <Sparkles className="text-white" size={24} />
            <Sparkles className="text-white hidden md:block" size={32} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white neon-text">Create Your Vibe</h2>
            <p className="text-xs md:text-sm text-purple-200 font-medium">
              {user ? 'Post your story in 150 chars max 🔥' : 'Think Unique �'}
            </p>
          </div>
        </div>

        {/* Story Input */}
        <div className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={150}
            placeholder="What's your story? Make it lit... 🚀"
            className="w-full h-32 md:h-40 p-4 md:p-6 glass rounded-3xl border-2 border-purple-400/30 focus:border-purple-400 focus:outline-none text-white text-base md:text-lg resize-none placeholder-purple-200/50 font-medium backdrop-blur-xl"
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs md:text-sm text-purple-200 font-bold">
              {content.length}/150 characters
            </span>
            {content.length > 0 && (
              <span className={`text-xs md:text-sm font-black ${content.length > 150 ? 'text-red-400' : 'text-green-400'}`}>
                {content.length > 150 ? '❌ Too long bestie' : '✓ Perfect vibe'}
              </span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {(error || authError) && (
          <div className="mb-6 p-5 bg-red-500/10 border-2 border-red-500/30 rounded-2xl backdrop-blur-sm">
            <p className="text-sm text-red-300 font-bold">
              {error || authError}
            </p>
          </div>
        )}

        {/* Quick Suggestions */}
        {!previewImage && (
          <div className="mb-6">
            <p className="text-sm text-purple-200 font-bold mb-3">Quick Ideas:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={generating}
                  className="px-4 py-2 glass border border-purple-400/30 hover:border-purple-400 text-purple-100 hover:text-white text-sm font-medium rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Preview with Side Buttons */}
        {previewImage ? (
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
              {/* Image */}
              <div className="flex-shrink-0 w-full md:w-auto">
                <div className="relative rounded-3xl overflow-hidden border-4 border-purple-400 shadow-2xl neon-glow max-w-sm mx-auto md:mx-0">
                  <img 
                    src={previewImage} 
                    alt="Generated story preview" 
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute top-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full">
                    <p className="text-xs text-white font-bold">AI Generated</p>
                  </div>
                </div>
                <p className="text-xs text-purple-200 text-center mt-3 font-medium">
                  Your masterpiece awaits! 🌟
                </p>
              </div>

              {/* Buttons on the right */}
              <div className="flex flex-col gap-4 w-full md:w-auto md:min-w-[200px] justify-center">
                <button
                  onClick={handleGenerateAgain}
                  disabled={uploading}
                  className="py-5 px-6 glass border-2 border-white/20 text-white font-black text-lg rounded-full hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-105"
                >
                  <RefreshCw size={24} />
                  Remix It
                </button>
                <button
                  onClick={handlePost}
                  disabled={uploading}
                  className="py-5 px-6 bg-gradient-to-r from-green-500 via-emerald-500 to-purple-500 text-white font-black text-lg rounded-full hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 neon-glow"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send size={24} />
                      Post 🔥
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleGenerateImage}
            disabled={generating || uploading || !content.trim() || content.length > 150}
            className="w-full py-6 px-8 bg-gradient-to-r from-purple-500 via-pink-600 to-orange-500 text-white font-black text-xl rounded-full hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-4 neon-glow"
          >
            {generating ? (
              <>
                <Loader2 className="animate-spin" size={28} />
                Cooking up magic...
              </>
            ) : (
              <>
                <ImageIcon size={28} />
                Generate My Vibe ✨
              </>
            )}
          </button>
        )}

        {/* AI Disclaimer */}
        <div className="mt-6 p-4 glass border border-purple-400/20 rounded-2xl backdrop-blur-sm">
          <p className="text-xs text-purple-200/80 text-center font-medium">
            <span className="font-bold text-purple-300">Note:</span> AI-generated content may not always be perfect. Please review before posting.
          </p>
        </div>
      </div>
    </div>
  );
}
