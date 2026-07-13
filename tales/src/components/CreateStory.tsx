'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Image as ImageIcon, Loader2, RefreshCw, Send, CheckCircle, XCircle, Wand2 } from 'lucide-react';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853" />
    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9.001c0 1.452.348 2.827.957 4.041l3.007-2.332z" fill="#FBBC05" />
    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.039-3.71z" fill="#EA4335" />
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
  const [signingIn, setSigningIn] = useState(false);

  const inappropriateWords = [
    'sex', 'nude', 'naked', 'porn', 'xxx', 'boobs', 'breast', 'penis', 'vagina',
    'dick', 'cock', 'pussy', 'fuck', 'shit', 'ass', 'bitch', 'damn', 'hell',
    'bastard', 'slut', 'whore', 'rape', 'kill', 'murder', 'death', 'suicide',
    'drug', 'cocaine', 'heroin', 'meth', 'weed', 'marijuana', 'violence', 'blood',
    'gore', 'nsfw', 'adult', 'sexual', 'erotic', 'fetish', 'kinky'
  ];

  const containsInappropriateContent = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return inappropriateWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(lowerText));
  };

  useEffect(() => {
    const savedContent = localStorage.getItem('talehue_draft_content');
    const savedImage = localStorage.getItem('talehue_draft_image');
    if (savedContent) setContent(savedContent);
    if (savedImage) {
      if (savedImage.startsWith('blob:') || savedImage.startsWith('data:image/')) {
        setPreviewImage(savedImage);
        fetch(savedImage).then(res => res.blob()).then(blob => setImageBlob(blob)).catch(() => {
          localStorage.removeItem('talehue_draft_image');
          setPreviewImage(null);
        });
      } else {
        localStorage.removeItem('talehue_draft_image');
      }
    }
  }, []);

  useEffect(() => {
    if (content) localStorage.setItem('talehue_draft_content', content);
    else localStorage.removeItem('talehue_draft_content');
  }, [content]);

  useEffect(() => {
    if (previewImage) localStorage.setItem('talehue_draft_image', previewImage);
    else localStorage.removeItem('talehue_draft_image');
  }, [previewImage]);

  const suggestions = [
    "Cyberpunk cityscape at midnight",
    "Underwater coral reef paradise",
    "Northern lights over snowy cabin",
    "Tokyo street food night market",
    "Space station window view",
    "Ancient temple ruins at sunrise",
  ];

  const generateImage = async (prompt: string): Promise<void> => {
    setError(null);
    if (containsInappropriateContent(prompt)) {
      setError('Content contains disallowed words. Please use appropriate language.');
      return;
    }
    setGenerating(true);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.details || 'Failed to enhance prompt');
      if (!data.success || !data.imageDescription) throw new Error('Failed to generate image');

      let blob: Blob | null = null;
      let retries = 4;
      let lastError: Error | null = null;

      while (retries > 0 && !blob) {
        try {
          const enhancedPrompt = encodeURIComponent(
            data.imageDescription + ", masterpiece, best quality, photorealistic, 8K UHD, sharp focus, vivid colors"
          );
          const model = retries === 4 || retries === 2 ? 'flux' : 'turbo';
          const imageUrl = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=1024&height=1024&nologo=true&model=${model}&seed=${Date.now()}`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 35000);
          const imageResponse = await fetch(imageUrl, { signal: controller.signal, cache: 'no-store' });
          clearTimeout(timeoutId);

          if (!imageResponse.ok) throw new Error(`Image generation failed: ${imageResponse.status}`);
          const b = await imageResponse.blob();
          if (b.size === 0) throw new Error('Generated image is empty');
          blob = b;
        } catch (err: any) {
          lastError = err;
          retries--;
          if (retries > 0) await new Promise(resolve => setTimeout(resolve, (5 - retries) * 1000));
        }
      }

      if (!blob) throw lastError || new Error('Failed to generate image after 4 attempts');

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setPreviewImage(reader.result);
      };
      reader.readAsDataURL(blob);
      setImageBlob(blob);
    } catch (error: any) {
      if (error.name === 'AbortError') setError('Image generation timed out. Please try again.');
      else if (error.message?.includes('Failed to fetch')) setError('Network error. Please check your connection.');
      else if (error.message?.includes('530')) setError('Image service is busy. Please wait a moment and try again.');
      else setError(error.message || 'Failed to generate image. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setContent(suggestion);
    await generateImage(suggestion);
  };

  const handleGenerateImage = async () => {
    if (!content.trim() || content.length > 150) {
      setError('Story must be between 1 and 150 characters.');
      return;
    }
    await generateImage(content);
  };

  const handleGenerateAgain = () => {
    setPreviewImage(null);
    setImageBlob(null);
    setContent('');
    setError(null);
    localStorage.removeItem('talehue_draft_image');
    localStorage.removeItem('talehue_draft_content');
  };

  const uploadStory = async (blob: Blob) => {
    if (!user) { setError('Please sign in to post stories.'); return; }
    setUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      const base64Image = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Failed to convert image'));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const storyId = `story_${Date.now()}`;
      await addDoc(collection(db, 'posts'), {
        storyID: storyId,
        userID: user.uid,
        content,
        imageURL: base64Image,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
      });

      localStorage.removeItem('talehue_draft_content');
      localStorage.removeItem('talehue_draft_image');
      setContent('');
      setPreviewImage(null);
      setImageBlob(null);
      setSuccessMessage('Story posted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(`Failed to post story: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handlePost = async () => {
    if (!user) {
      try { await signInWithGoogle(); } catch { setError('Please sign in to post your story.'); }
      return;
    }
    if (!imageBlob) return;
    await uploadStory(imageBlob);
  };

  // Sign-in prompt for unauthenticated users
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div
          className="rounded-xl p-8 text-center"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--bg-hover)' }}
          >
            <Wand2 size={24} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Create a Story
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Sign in to write a story and generate an AI image.
          </p>
          <button
            onClick={async () => {
              setSigningIn(true);
              try { await signInWithGoogle(); } catch {}
              finally { setSigningIn(false); }
            }}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {signingIn ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : <GoogleIcon />}
            {signingIn ? 'Signing in…' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Success Toast */}
      {successMessage && (
        <div className="fixed top-5 right-5 left-5 md:left-auto md:w-80 z-50 animate-slide-in">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--success)', color: 'var(--success)' }}
          >
            <CheckCircle size={18} />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Card */}
      <div
        className="rounded-xl p-6 fade-in"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
      >
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Create a Story</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Write up to 150 characters, then generate an AI image.
          </p>
        </div>

        {/* Textarea */}
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!generating && !uploading && content.trim() && content.length <= 150 && !previewImage) {
                  handleGenerateImage();
                }
              }
            }}
            maxLength={150}
            placeholder="Describe your story…"
            className="input-base resize-none"
            rows={4}
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {content.length} / 150
            </span>
            {content.length > 0 && (
              <span
                className="text-xs font-medium"
                style={{ color: content.length > 150 ? 'var(--danger)' : 'var(--text-muted)' }}
              >
                {content.length > 150 ? 'Too long' : 'Good length'}
              </span>
            )}
          </div>
        </div>

        {/* Error */}
        {(error || authError) && (
          <div
            className="flex items-start gap-2.5 px-4 py-3 mb-4 rounded-lg text-sm"
            style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--danger)', color: 'var(--danger)' }}
          >
            <XCircle size={16} className="mt-0.5 shrink-0" />
            <p>{error || authError}</p>
          </div>
        )}

        {/* Suggestions */}
        {!previewImage && (
          <div className="mb-5">
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Quick ideas
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={generating}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--text-primary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Image Preview */}
        {previewImage ? (
          <div className="mb-5 fade-in">
            <div
              className="relative rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              <img src={previewImage} alt="Generated preview" className="w-full aspect-square object-cover" />
              <div
                className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                AI Generated
              </div>
            </div>
            <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
              Review your image before posting.
            </p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleGenerateAgain}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <RefreshCw size={16} />
                Start Over
              </button>
              <button
                onClick={handlePost}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
                style={{ backgroundColor: 'var(--accent)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
              >
                {uploading ? (
                  <><Loader2 className="animate-spin" size={16} /> Posting…</>
                ) : (
                  <><Send size={16} /> Post Story</>
                )}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleGenerateImage}
            disabled={generating || uploading || !content.trim() || content.length > 150}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--accent-hover)'; }}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
          >
            {generating ? (
              <><Loader2 className="animate-spin" size={16} /> Generating image…</>
            ) : (
              <><ImageIcon size={16} /> Generate Image</>
            )}
          </button>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          AI-generated images may not always be accurate. Review before posting.
        </p>
      </div>
    </div>
  );
}
