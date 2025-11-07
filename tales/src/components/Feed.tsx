'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, addDoc, serverTimestamp, where, getDocs, deleteDoc } from 'firebase/firestore';
import { Story, Profile } from '@/types';
import { Heart, MessageCircle, Share2, X, Send, PlusCircle, Edit2, Trash2, Check, Copy, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface StoryWithProfile extends Story {
  profile?: Profile;
  isLiked?: boolean;
}

interface Comment {
  id: string;
  storyID: string;
  userID: string;
  content: string;
  createdAt: any;
  displayName?: string;
}

interface FeedProps {
  onNavigateToCreate?: () => void;
}

export default function Feed({ onNavigateToCreate }: FeedProps) {
  const { user, profile, signInWithGoogle } = useAuth();
  const [stories, setStories] = useState<StoryWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<StoryWithProfile | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInAction, setSignInAction] = useState<'like' | 'comment'>('like');
  const [signingIn, setSigningIn] = useState(false);
  const [detailStory, setDetailStory] = useState<StoryWithProfile | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Google Icon Component
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
      <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9.001c0 1.452.348 2.827.957 4.041l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.039-3.71z" fill="#EA4335"/>
    </svg>
  );

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const storiesData: StoryWithProfile[] = [];
      
      for (const docSnap of snapshot.docs) {
        const storyData = { ...docSnap.data(), id: docSnap.id } as StoryWithProfile;
        
        // Skip if storyData doesn't have required fields
        if (!storyData.userID || !storyData.storyID) {
          continue;
        }
        
        // Fetch user profile
        const profileSnap = await getDocs(
          query(collection(db, 'profiles'), where('userID', '==', storyData.userID))
        );
        
        if (!profileSnap.empty) {
          storyData.profile = profileSnap.docs[0].data() as Profile;
        }
        
        storiesData.push(storyData);
      }
      
      setStories(storiesData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Track which stories the current user has liked
  useEffect(() => {
    if (!user) return;

    const likesQuery = query(
      collection(db, 'likes'),
      where('userID', '==', user.uid)
    );

    const unsubscribe = onSnapshot(likesQuery, (snapshot) => {
      const likedStoryIds = new Set<string>();
      snapshot.docs.forEach((doc) => {
        const likeData = doc.data();
        if (likeData.storyID) {
          likedStoryIds.add(likeData.storyID);
        }
      });
      console.log('User likes updated:', Array.from(likedStoryIds));
      setUserLikes(likedStoryIds);
    });

    return unsubscribe;
  }, [user]);

  const handleLike = async (storyId: string) => {
    if (!user || !user.uid) {
      setSignInAction('like');
      setShowSignInModal(true);
      return;
    }
    
    if (!storyId) return;

    const isCurrentlyLiked = userLikes.has(storyId);
    
    // Optimistic update - Update UI immediately
    setUserLikes(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyLiked) {
        newSet.delete(storyId);
      } else {
        newSet.add(storyId);
      }
      return newSet;
    });

    // Optimistically update the story count in the UI
    setStories(prevStories => 
      prevStories.map(story => 
        story.storyID === storyId 
          ? { 
              ...story, 
              likesCount: isCurrentlyLiked 
                ? Math.max(0, (story.likesCount || 0) - 1)
                : (story.likesCount || 0) + 1 
            }
          : story
      )
    );

    // Also update detail story if it's open
    if (detailStory?.storyID === storyId) {
      setDetailStory(prev => prev ? {
        ...prev,
        likesCount: isCurrentlyLiked 
          ? Math.max(0, (prev.likesCount || 0) - 1)
          : (prev.likesCount || 0) + 1
      } : null);
    }

    // Prevent action if already in the desired state
    if (isCurrentlyLiked) {
      // User wants to unlike
      try {
        const likesQuery = query(
          collection(db, 'likes'),
          where('storyID', '==', storyId),
          where('userID', '==', user.uid)
        );
        const likesSnapshot = await getDocs(likesQuery);
        
        if (!likesSnapshot.empty) {
          await deleteDoc(doc(db, 'likes', likesSnapshot.docs[0].id));
          
          // Update story likes count (ensure it doesn't go below 0)
          const storyQuery = query(collection(db, 'posts'), where('storyID', '==', storyId));
          const storySnapshot = await getDocs(storyQuery);
          if (!storySnapshot.empty) {
            const storyDocRef = doc(db, 'posts', storySnapshot.docs[0].id);
            const currentData = storySnapshot.docs[0].data();
            const currentLikes = currentData.likesCount || 0;
            
            // Only decrement if count is greater than 0
            if (currentLikes > 0) {
              await updateDoc(storyDocRef, {
                likesCount: increment(-1)
              });
            } else {
              // Ensure it's set to 0 if somehow it was negative
              await updateDoc(storyDocRef, {
                likesCount: 0
              });
            }
          }
        }
      } catch (error) {
        console.error('Error unliking:', error);
        // Revert optimistic update on error
        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.add(storyId);
          return newSet;
        });
        setStories(prevStories => 
          prevStories.map(story => 
            story.storyID === storyId 
              ? { ...story, likesCount: (story.likesCount || 0) + 1 }
              : story
          )
        );
        if (detailStory?.storyID === storyId) {
          setDetailStory(prev => prev ? {
            ...prev,
            likesCount: (prev.likesCount || 0) + 1
          } : null);
        }
      }
    } else {
      // User wants to like - only allow if not already liked
      try {
        // Double check they haven't already liked it
        const likesQuery = query(
          collection(db, 'likes'),
          where('storyID', '==', storyId),
          where('userID', '==', user.uid)
        );
        const existingLike = await getDocs(likesQuery);
        
        if (existingLike.empty) {
          await addDoc(collection(db, 'likes'), {
            storyID: storyId,
            userID: user.uid,
            createdAt: serverTimestamp()
          });

          // Update story likes count
          const storyQuery = query(collection(db, 'posts'), where('storyID', '==', storyId));
          const storySnapshot = await getDocs(storyQuery);
          if (!storySnapshot.empty) {
            const storyDocRef = doc(db, 'posts', storySnapshot.docs[0].id);
            await updateDoc(storyDocRef, {
              likesCount: increment(1)
            });
          }
        }
      } catch (error) {
        console.error('Error liking:', error);
        // Revert optimistic update on error
        setUserLikes(prev => {
          const newSet = new Set(prev);
          newSet.delete(storyId);
          return newSet;
        });
        setStories(prevStories => 
          prevStories.map(story => 
            story.storyID === storyId 
              ? { ...story, likesCount: Math.max(0, (story.likesCount || 0) - 1) }
              : story
          )
        );
        if (detailStory?.storyID === storyId) {
          setDetailStory(prev => prev ? {
            ...prev,
            likesCount: Math.max(0, (prev.likesCount || 0) - 1)
          } : null);
        }
      }
    }
  };

  const openStoryDetail = (story: StoryWithProfile) => {
    setDetailStory(story);
    loadCommentsForStory(story);
  };

  const closeStoryDetail = () => {
    setDetailStory(null);
    setSelectedStory(null);
    setComments([]);
    setNewComment('');
  };

  const loadCommentsForStory = async (story: StoryWithProfile) => {
    if (!story || !story.storyID) return;
    
    setSelectedStory(story);
    
    // Fetch comments for this story
    const q = query(
      collection(db, 'comments'),
      where('storyID', '==', story.storyID),
      orderBy('createdAt', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const commentsData: Comment[] = [];
      
      for (const docSnap of snapshot.docs) {
        const commentData = { ...docSnap.data(), id: docSnap.id } as Comment;
        
        // Fetch commenter's profile
        const profileSnap = await getDocs(
          query(collection(db, 'profiles'), where('userID', '==', commentData.userID))
        );
        
        if (!profileSnap.empty) {
          commentData.displayName = profileSnap.docs[0].data().displayName;
        }
        
        commentsData.push(commentData);
      }
      
      setComments(commentsData);
    });
  };

  const openComments = async (story: StoryWithProfile) => {
    if (!user) {
      setSignInAction('comment');
      setShowSignInModal(true);
      return;
    }
    
    openStoryDetail(story);
  };

  const handleQuickLike = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation(); // Prevent opening detail view
    await handleLike(storyId);
  };

  const handleQuickComment = async (e: React.MouseEvent, story: StoryWithProfile) => {
    e.stopPropagation(); // Prevent opening detail view
    await openComments(story);
  };

  const handleAddComment = async () => {
    if (!user || !user.uid || !profile || !selectedStory || !selectedStory.storyID || !newComment.trim()) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        storyID: selectedStory.storyID,
        userID: user.uid,
        content: newComment.trim(),
        createdAt: serverTimestamp()
      });

      // Update comments count
      const storyQuery = query(collection(db, 'posts'), where('storyID', '==', selectedStory.storyID));
      const storySnapshot = await getDocs(storyQuery);
      if (!storySnapshot.empty) {
        const storyDocRef = doc(db, 'posts', storySnapshot.docs[0].id);
        await updateDoc(storyDocRef, {
          commentsCount: increment(1)
        });
      }

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingComment(commentId);
    setEditedCommentText(currentContent);
  };

  const handleSaveComment = async (commentId: string) => {
    if (!editedCommentText.trim()) return;
    
    try {
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        content: editedCommentText.trim()
      });
      setEditingComment(null);
      setEditedCommentText('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedStory || !selectedStory.storyID) return;
    
    try {
      // Delete the comment
      await deleteDoc(doc(db, 'comments', commentId));

      // Update comments count
      const storyQuery = query(collection(db, 'posts'), where('storyID', '==', selectedStory.storyID));
      const storySnapshot = await getDocs(storyQuery);
      if (!storySnapshot.empty) {
        const storyDocRef = doc(db, 'posts', storySnapshot.docs[0].id);
        const currentData = storySnapshot.docs[0].data();
        const currentComments = currentData.commentsCount || 0;
        
        // Only decrement if count is greater than 0
        if (currentComments > 0) {
          await updateDoc(storyDocRef, {
            commentsCount: increment(-1)
          });
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleShare = async (platform?: string) => {
    if (!detailStory) return;
    
    const shareUrl = window.location.href;
    const shareText = `Check out this amazing story on TaleHue: "${detailStory.content}"`;
    
    // Check if Web Share API is available (mobile devices)
    if (!platform && navigator.share) {
      try {
        await navigator.share({
          title: 'TaleHue Story',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', err);
        // Fall through to show share menu if share was cancelled
      }
    }
    
    // If no platform specified, show the share menu (desktop fallback)
    if (!platform) {
      setShowShareMenu(!showShareMenu);
      return;
    }
    
    // Handle specific platform shares
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'reddit':
        shareLink = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing via web, so we'll copy the link and show a message
        navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
        alert('Link copied! Open Instagram app and paste in a new post or story.');
        return;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        return;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'noopener,noreferrer');
      setShowShareMenu(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {stories.length === 0 ? (
        <div className="text-center py-12 md:py-20">
          <div className="max-w-md mx-auto glass p-8 md:p-12 rounded-3xl border border-purple-400/20">
            <div className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-600 to-orange-500 flex items-center justify-center shadow-2xl neon-glow">
              <PlusCircle size={40} className="text-white md:hidden" />
              <PlusCircle size={56} className="text-white hidden md:block" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-3 md:mb-4 neon-text">
              No stories yet!
            </h3>
                        <p className="text-purple-200 text-lg font-medium">
              Be the first to post some fire content!
            </p>
            <button
              onClick={onNavigateToCreate}
              className="px-8 md:px-10 py-4 md:py-5 bg-gradient-to-r from-purple-500 via-pink-600 to-orange-500 text-white font-black text-base md:text-lg rounded-full hover:shadow-2xl transform hover:scale-110 transition-all flex items-center gap-2 md:gap-3 mx-auto neon-glow"
            >
              <PlusCircle size={20} className="md:hidden" />
              <PlusCircle size={24} className="hidden md:block" />
              Create Your Vibe
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {stories.map((story) => (
            <div
              key={story.storyID}
              className="glass rounded-2xl shadow-xl overflow-hidden border border-white/10 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
            >
              {/* User Info Header */}
              <div className="p-3 border-b border-white/10 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-600 to-orange-500 flex items-center justify-center text-white font-black text-xs shadow-lg ring-2 ring-white/20 overflow-hidden">
                    {story.profile?.profileImage ? (
                      <img 
                        src={story.profile.profileImage} 
                        alt={story.profile.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      story.profile?.displayName.charAt(0).toUpperCase() || 'A'
                    )}
                  </div>
                  <p className="font-bold text-white text-sm">
                    {story.profile?.displayName || 'Anonymous'}
                  </p>
                </div>
              </div>

              {/* Story Image */}
              {story.imageURL && (
                <div className="relative aspect-square overflow-hidden" onClick={() => openStoryDetail(story)}>
                  <img
                    src={story.imageURL}
                    alt={story.content}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              )}

              {/* Story Footer - Description and Actions */}
              <div className="p-3 border-t border-white/10 bg-gradient-to-r from-purple-900/10 via-pink-900/10 to-orange-900/10">
                {/* Action Buttons */}
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={(e) => handleQuickLike(e, story.storyID)}
                    className={`flex items-center gap-1.5 transition-all duration-300 ${
                      userLikes.has(story.storyID)
                        ? 'text-pink-400' 
                        : 'text-white/80 hover:text-pink-400'
                    }`}
                  >
                    <Heart size={20} fill={userLikes.has(story.storyID) ? 'currentColor' : 'none'} strokeWidth={2.5} />
                    <span className="font-bold text-sm">{story.likesCount || 0}</span>
                  </button>
                  <button 
                    onClick={(e) => handleQuickComment(e, story)}
                    className="flex items-center gap-1.5 text-white/80 hover:text-purple-400 transition-all duration-300"
                  >
                    <MessageCircle size={20} strokeWidth={2.5} />
                    <span className="font-bold text-sm">{story.commentsCount || 0}</span>
                  </button>
                </div>

                {/* Story Description */}
                <p className="text-white text-sm leading-tight font-medium line-clamp-2">
                  {story.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Story Detail Modal */}
      {detailStory && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-300"
          onClick={() => setShowShareMenu(false)}
        >
          <div className="relative flex items-center justify-center w-full h-full md:h-auto">
            <div 
              className="glass rounded-none md:rounded-3xl max-w-5xl w-full h-full md:h-auto md:max-h-[90vh] flex flex-col md:flex-row shadow-2xl border-0 md:border border-purple-400/30 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Left: Image Section */}
            <div className="md:w-1/2 bg-black flex items-center justify-center relative max-h-[50vh] md:max-h-none">
              <button
                onClick={closeStoryDetail}
                className="absolute top-2 md:top-4 right-2 md:right-4 p-2 md:p-3 bg-black/60 hover:bg-black/80 rounded-full transition-all duration-300 transform hover:rotate-90 z-10 backdrop-blur-sm"
              >
                <X size={20} className="text-white md:hidden" />
                <X size={24} className="text-white hidden md:block" />
              </button>
              {detailStory.imageURL && (
                <img
                  src={detailStory.imageURL}
                  alt={detailStory.content}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Right: Details & Comments Section */}
            <div className="md:w-1/2 flex flex-col bg-gradient-to-br from-zinc-900/95 to-zinc-950/95 backdrop-blur-xl overflow-y-auto">
              {/* User Info Header */}
              <div className="p-4 md:p-6 border-b border-white/10 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-600 to-orange-500 flex items-center justify-center text-white font-black text-base md:text-lg shadow-lg ring-2 ring-white/20 overflow-hidden">
                    {detailStory.profile?.profileImage ? (
                      <img 
                        src={detailStory.profile.profileImage} 
                        alt={detailStory.profile.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      detailStory.profile?.displayName.charAt(0).toUpperCase() || 'A'
                    )}
                  </div>
                  <div>
                    <p className="font-black text-white text-lg">
                      {detailStory.profile?.displayName || 'Anonymous'}
                    </p>
                    <p className="text-sm text-purple-200">
                      {detailStory.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Story Content */}
              <div className="p-6 border-b border-white/10">
                <p className="text-white text-lg leading-relaxed font-medium mb-4">
                  {detailStory.content}
                </p>
                
                {/* Actions */}
                <div className="flex items-center gap-6">
                  <button
                    onClick={(e) => handleQuickLike(e, detailStory.storyID)}
                    className={`group flex items-center gap-3 transition-all duration-300 transform hover:scale-110 ${
                      userLikes.has(detailStory.storyID)
                        ? 'text-pink-500' 
                        : 'text-zinc-400 hover:text-pink-500'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${userLikes.has(detailStory.storyID) ? 'bg-pink-500/20' : 'bg-white/5 group-hover:bg-pink-500/20'} transition-all`}>
                      <Heart size={22} fill={userLikes.has(detailStory.storyID) ? 'currentColor' : 'none'} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-lg">{detailStory.likesCount || 0}</span>
                  </button>
                  <div className="flex items-center gap-3 text-purple-400">
                    <div className="p-3 rounded-full bg-purple-400/20">
                      <MessageCircle size={22} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-lg">{detailStory.commentsCount || 0}</span>
                  </div>
                  <button 
                    onClick={() => handleShare()}
                    className="group flex items-center gap-3 text-zinc-400 hover:text-green-400 transition-all duration-300 transform hover:scale-110"
                  >
                    <div className="p-3 rounded-full bg-white/5 group-hover:bg-green-400/20 transition-all">
                      <Share2 size={22} strokeWidth={2.5} />
                    </div>
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4">
                <h3 className="text-xl md:text-2xl font-black text-white mb-4">Comments 💬</h3>
                {comments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle size={48} className="mx-auto mb-3 text-purple-300/50" />
                    <p className="text-purple-200/70 text-base">No comments yet. Start the convo! 🔥</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/15 transition-all border border-white/10 group backdrop-blur-sm">
                      <div className="w-11 h-11 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 via-orange-500 to-purple-400 flex items-center justify-center text-white text-base md:text-sm font-black shrink-0 shadow-lg">
                        {comment.displayName?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-black text-base md:text-sm text-white">
                            {comment.displayName || 'Anonymous'}
                          </p>
                          {/* Edit/Delete buttons - always visible on mobile, hover on desktop */}
                          {user && comment.userID === user.uid && (
                            <div className="flex gap-1.5 md:gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                              {editingComment === comment.id ? (
                                <button
                                  onClick={() => handleSaveComment(comment.id)}
                                  className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-all"
                                  title="Save"
                                >
                                  <Check size={18} className="text-green-400" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleEditComment(comment.id, comment.content)}
                                  className="p-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition-all"
                                  title="Edit"
                                >
                                  <Edit2 size={18} className="text-orange-400" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 size={18} className="text-red-400" />
                              </button>
                            </div>
                          )}
                        </div>
                        {editingComment === comment.id ? (
                          <input
                            type="text"
                            value={editedCommentText}
                            onChange={(e) => setEditedCommentText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveComment(comment.id)}
                            className="w-full mt-2 px-3 py-2.5 glass rounded-lg text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium border border-white/10 text-base"
                            autoFocus
                          />
                        ) : (
                          <p className="text-white mt-2 leading-relaxed text-base break-words">{comment.content}</p>
                        )}
                        <p className="text-xs md:text-xs text-purple-300/80 mt-2 font-medium">
                          {comment.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment */}
              {user ? (
                <div className="p-4 md:p-6 border-t border-white/20 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-orange-900/30 backdrop-blur-sm">
                  <div className="flex gap-2 md:gap-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                      placeholder="Post your thoughts..."
                      className="flex-1 px-4 md:px-6 py-3 md:py-4 glass rounded-full text-white text-base placeholder-purple-200/60 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium border border-white/20"
                      disabled={submitting}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submitting}
                      className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-500 via-pink-600 to-orange-500 text-white rounded-full hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-black neon-glow"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 md:p-6 border-t border-white/20 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-orange-900/30 text-center backdrop-blur-sm">
                  <button
                    onClick={async () => {
                      try {
                        await signInWithGoogle();
                      } catch (error) {
                        console.error('Sign-in error:', error);
                      }
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-600 to-orange-500 text-white rounded-full hover:shadow-2xl transition-all font-black neon-glow"
                  >
                    Sign In to Comment 💬
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Share Menu - Positioned to the right of the modal */}
          {showShareMenu && (
            <div 
              className="fixed right-4 top-1/2 -translate-y-1/2 glass rounded-2xl border border-white/20 shadow-2xl p-4 w-72 z-[60]"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-white font-black mb-3 text-sm">Share this story</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-blue-400/20 border border-white/10 hover:border-blue-400/30 transition-all group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="text-sm font-bold text-white">Twitter</span>
                </button>
                
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-600/30 transition-all group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm font-bold text-white">Facebook</span>
                </button>
                
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-green-500/20 border border-white/10 hover:border-green-500/30 transition-all group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="text-sm font-bold text-white">WhatsApp</span>
                </button>
                
                <button
                  onClick={() => handleShare('telegram')}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-sky-500/20 border border-white/10 hover:border-sky-500/30 transition-all group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span className="text-sm font-bold text-white">Telegram</span>
                </button>
                
                <button
                  onClick={() => handleShare('reddit')}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-orange-500/20 border border-white/10 hover:border-orange-500/30 transition-all group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                  <span className="text-sm font-bold text-white">Reddit</span>
                </button>
                
                <button
                  onClick={() => handleShare('instagram')}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-pink-600/20 border border-white/10 hover:border-pink-600/30 transition-all group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                  <span className="text-sm font-bold text-white">Instagram</span>
                </button>
              </div>
              
              <div className="mt-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 transition-all"
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle size={18} className="text-green-400" />
                      <span className="text-sm font-bold text-green-400">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} className="text-white" />
                      <span className="text-sm font-bold text-white">Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      )}

      {/* Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="glass rounded-3xl max-w-md w-full shadow-2xl transform animate-in zoom-in-95 duration-300 border border-purple-400/30">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-t-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-600/20 to-orange-500/20"></div>
              <div className="relative p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 via-pink-600 to-orange-500 flex items-center justify-center shadow-2xl neon-glow">
                  {signInAction === 'like' ? (
                    <Heart size={42} className="text-white" fill="white" />
                  ) : (
                    <MessageCircle size={42} className="text-white" />
                  )}
                </div>
                <h3 className="text-3xl font-black text-white mb-3 neon-text">
                  {signInAction === 'like' ? 'Spread the Love! 💖' : 'Join the Chat! 💬'}
                </h3>
                <p className="text-purple-100 text-lg">
                  {signInAction === 'like' 
                    ? 'Sign in to vibe with creators'
                    : 'Sign in to post your thoughts 💭'}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 pt-4">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-purple-100">
                  <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center shrink-0 border border-purple-400/30">
                    <Heart size={18} className="text-purple-300" />
                  </div>
                  <span className="font-medium">Like & save your fav stories</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-purple-100">
                  <div className="w-10 h-10 rounded-full bg-pink-600/30 flex items-center justify-center shrink-0 border border-pink-500/30">
                    <MessageCircle size={18} className="text-pink-400" />
                  </div>
                  <span className="font-medium">Connect with the community</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-purple-100">
                  <div className="w-10 h-10 rounded-full bg-orange-600/30 flex items-center justify-center shrink-0 border border-orange-500/30">
                    <Share2 size={18} className="text-orange-400" />
                  </div>
                  <span className="font-medium">Share the vibes with friends</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    setSigningIn(true);
                    try {
                      await signInWithGoogle();
                      setShowSignInModal(false);
                    } catch (error) {
                      console.error('Sign-in error:', error);
                    } finally {
                      setSigningIn(false);
                    }
                  }}
                  disabled={signingIn}
                  className="w-full px-8 py-5 bg-gradient-to-r from-purple-500 via-pink-600 to-orange-500 text-white font-black text-lg rounded-full hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 neon-glow"
                >
                  {signingIn ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <GoogleIcon />
                      Sign In with Google
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowSignInModal(false)}
                  disabled={signingIn}
                  className="w-full px-8 py-5 bg-white/5 hover:bg-white/10 text-white font-bold text-lg rounded-full transition-all disabled:opacity-50 border border-white/10"
                >
                  Maybe Later
                </button>
              </div>

              <p className="text-center text-xs text-purple-300/70 mt-6">
                By signing in, you vibe with our Terms & Privacy 🤝
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
