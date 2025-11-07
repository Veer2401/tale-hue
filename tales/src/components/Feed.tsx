'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, addDoc, serverTimestamp, where, getDocs, deleteDoc } from 'firebase/firestore';
import { Story, Profile } from '@/types';
import { Heart, MessageCircle, Share2, X, Send, PlusCircle, Edit2, Trash2, Check } from 'lucide-react';
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
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-300">
          <div className="glass rounded-none md:rounded-3xl max-w-5xl w-full h-full md:h-auto md:max-h-[90vh] flex flex-col md:flex-row shadow-2xl border-0 md:border border-purple-400/30 overflow-hidden">
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
                  <button className="group flex items-center gap-3 text-zinc-400 hover:text-green-400 transition-all duration-300 transform hover:scale-110">
                    <div className="p-3 rounded-full bg-white/5 group-hover:bg-green-400/20 transition-all">
                      <Share2 size={22} strokeWidth={2.5} />
                    </div>
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <h3 className="text-xl font-black text-white mb-4">Comments 💬</h3>
                {comments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle size={48} className="mx-auto mb-3 text-purple-300/50" />
                    <p className="text-purple-200/70">No comments yet. Start the convo! 🔥</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-orange-500 to-purple-400 flex items-center justify-center text-white text-sm font-black shrink-0 shadow-lg">
                        {comment.displayName?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <p className="font-black text-sm text-white">
                            {comment.displayName || 'Anonymous'}
                          </p>
                          {/* Edit/Delete buttons - only show for comment owner */}
                          {user && comment.userID === user.uid && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {editingComment === comment.id ? (
                                <button
                                  onClick={() => handleSaveComment(comment.id)}
                                  className="p-1.5 hover:bg-green-500/20 rounded-lg transition-all"
                                  title="Save"
                                >
                                  <Check size={16} className="text-green-400" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleEditComment(comment.id, comment.content)}
                                  className="p-1.5 hover:bg-orange-500/20 rounded-lg transition-all"
                                  title="Edit"
                                >
                                  <Edit2 size={16} className="text-orange-400" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 size={16} className="text-red-400" />
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
                            className="w-full mt-1.5 px-3 py-2 glass rounded-lg text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium border border-white/10 text-sm"
                            autoFocus
                          />
                        ) : (
                          <p className="text-purple-100 mt-1.5 leading-relaxed text-sm">{comment.content}</p>
                        )}
                        <p className="text-xs text-purple-300/70 mt-1.5">
                          {comment.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment */}
              {user ? (
                <div className="p-6 border-t border-white/10 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                      placeholder="Post your thoughts..."
                      className="flex-1 px-6 py-4 glass rounded-full text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium border border-white/10"
                      disabled={submitting}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submitting}
                      className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-600 to-orange-500 text-white rounded-full hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-black neon-glow"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 border-t border-white/10 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20 text-center">
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
