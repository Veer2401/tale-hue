'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, addDoc, serverTimestamp, where, getDocs, deleteDoc } from 'firebase/firestore';
import { Story, Profile } from '@/types';
import { Heart, MessageCircle, Share2, X, Send, PlusCircle } from 'lucide-react';
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
    console.log('handleLike called:', { storyId, isCurrentlyLiked, userId: user.uid });

    // Prevent action if already in the desired state
    if (isCurrentlyLiked) {
      // User wants to unlike
      console.log('Unliking post...');
      try {
        const likesQuery = query(
          collection(db, 'likes'),
          where('storyID', '==', storyId),
          where('userID', '==', user.uid)
        );
        const likesSnapshot = await getDocs(likesQuery);
        
        if (!likesSnapshot.empty) {
          console.log('Found like document, deleting...');
          await deleteDoc(doc(db, 'likes', likesSnapshot.docs[0].id));
          
          // Update story likes count
          const storyQuery = query(collection(db, 'posts'), where('storyID', '==', storyId));
          const storySnapshot = await getDocs(storyQuery);
          if (!storySnapshot.empty) {
            const storyDocRef = doc(db, 'posts', storySnapshot.docs[0].id);
            await updateDoc(storyDocRef, {
              likesCount: increment(-1)
            });
          }
          console.log('Unlike completed');
        }
      } catch (error) {
        console.error('Error unliking:', error);
      }
    } else {
      // User wants to like - only allow if not already liked
      console.log('Liking post...');
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
          console.log('Like document created');

          // Update story likes count
          const storyQuery = query(collection(db, 'posts'), where('storyID', '==', storyId));
          const storySnapshot = await getDocs(storyQuery);
          if (!storySnapshot.empty) {
            const storyDocRef = doc(db, 'posts', storySnapshot.docs[0].id);
            await updateDoc(storyDocRef, {
              likesCount: increment(1)
            });
            console.log('Like count updated');
          }
          console.log('Like completed');
        } else {
          console.log('Already liked - preventing duplicate');
        }
      } catch (error) {
        console.error('Error liking:', error);
      }
    }
  };

  const openComments = async (story: StoryWithProfile) => {
    if (!user) {
      setSignInAction('comment');
      setShowSignInModal(true);
      return;
    }
    
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

  const closeComments = () => {
    setSelectedStory(null);
    setComments([]);
    setNewComment('');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {stories.length === 0 ? (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto glass p-12 rounded-3xl border border-purple-500/20">
            <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-2xl neon-glow">
              <PlusCircle size={56} className="text-white" />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 neon-text">
              No stories yet! 🎨
            </h3>
            <p className="text-purple-200 mb-8 text-lg">
              Be the first to drop some fire content! ✨
            </p>
            <button
              onClick={onNavigateToCreate}
              className="px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-black text-lg rounded-full hover:shadow-2xl transform hover:scale-110 transition-all flex items-center gap-3 mx-auto neon-glow"
            >
              <PlusCircle size={24} />
              Create Your Vibe
            </button>
          </div>
        </div>
      ) : (
        stories.map((story) => (
          <div
            key={story.storyID}
            className="glass rounded-3xl shadow-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-[1.02]"
          >
            {/* User Info */}
            <div className="p-5 flex items-center gap-4 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20 border-b border-white/10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center text-white font-black text-lg shadow-lg ring-2 ring-white/20">
                {story.profile?.displayName.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <p className="font-black text-white text-lg">
                  {story.profile?.displayName || 'Anonymous'}
                </p>
              </div>
            </div>

            {/* Story Image */}
            {story.imageURL && (
              <div className="relative group">
                <img
                  src={story.imageURL}
                  alt={story.content}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            )}

            {/* Story Content */}
            <div className="p-6 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80">
              <p className="text-white text-lg mb-3 leading-relaxed font-medium">
                {story.content}
              </p>
              
              {/* Date */}
              <p className="text-sm text-purple-300 mb-5 font-bold">
                {story.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'} ✨
              </p>

              {/* Actions */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleLike(story.storyID)}
                  className={`group flex items-center gap-3 transition-all duration-300 transform hover:scale-110 ${
                    userLikes.has(story.storyID)
                      ? 'text-pink-500' 
                      : 'text-zinc-400 hover:text-pink-500'
                  }`}
                >
                  <div className={`p-3 rounded-full ${userLikes.has(story.storyID) ? 'bg-pink-500/20' : 'bg-white/5 group-hover:bg-pink-500/20'} transition-all`}>
                    <Heart size={22} fill={userLikes.has(story.storyID) ? 'currentColor' : 'none'} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-lg">{story.likesCount || 0}</span>
                </button>
                <button 
                  onClick={() => openComments(story)}
                  className="group flex items-center gap-3 text-zinc-400 hover:text-cyan-400 transition-all duration-300 transform hover:scale-110"
                >
                  <div className="p-3 rounded-full bg-white/5 group-hover:bg-cyan-400/20 transition-all">
                    <MessageCircle size={22} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-lg">{story.commentsCount || 0}</span>
                </button>
                <button className="group flex items-center gap-3 text-zinc-400 hover:text-green-400 transition-all duration-300 transform hover:scale-110">
                  <div className="p-3 rounded-full bg-white/5 group-hover:bg-green-400/20 transition-all">
                    <Share2 size={22} strokeWidth={2.5} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Comments Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-purple-500/30">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-orange-900/30">
              <h3 className="text-2xl font-black text-white">Comments 💬</h3>
              <button
                onClick={closeComments}
                className="p-3 hover:bg-white/10 rounded-full transition-all duration-300 transform hover:rotate-90"
              >
                <X size={24} className="text-purple-300" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle size={64} className="mx-auto mb-4 text-purple-400/50" />
                  <p className="text-purple-300/70 text-lg">No comments yet. Start the convo! 🔥</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-black shrink-0 shadow-lg">
                      {comment.displayName?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-sm text-white">
                        {comment.displayName || 'Anonymous'}
                      </p>
                      <p className="text-purple-100 mt-2 leading-relaxed">{comment.content}</p>
                      <p className="text-xs text-purple-400/70 mt-2">
                        {comment.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            {user && (
              <div className="p-6 border-t border-white/10 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-orange-900/20">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Drop your thoughts..."
                    className="flex-1 px-6 py-4 glass rounded-full text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium border border-white/10"
                    disabled={submitting}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || submitting}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-full hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-black neon-glow"
                  >
                    <Send size={20} />
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
          <div className="glass rounded-3xl max-w-md w-full shadow-2xl transform animate-in zoom-in-95 duration-300 border border-purple-500/30">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-t-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-500/20"></div>
              <div className="relative p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-2xl neon-glow">
                  {signInAction === 'like' ? (
                    <Heart size={42} className="text-white" fill="white" />
                  ) : (
                    <MessageCircle size={42} className="text-white" />
                  )}
                </div>
                <h3 className="text-3xl font-black text-white mb-3 neon-text">
                  {signInAction === 'like' ? 'Spread the Love! 💖' : 'Join the Chat! 💬'}
                </h3>
                <p className="text-purple-200 text-lg">
                  {signInAction === 'like' 
                    ? 'Sign in to vibe with creators ✨'
                    : 'Sign in to drop your thoughts �'}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 pt-4">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-purple-200">
                  <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center shrink-0 border border-purple-500/30">
                    <Heart size={18} className="text-purple-400" />
                  </div>
                  <span className="font-medium">Like & save your fav stories</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-purple-200">
                  <div className="w-10 h-10 rounded-full bg-pink-600/30 flex items-center justify-center shrink-0 border border-pink-500/30">
                    <MessageCircle size={18} className="text-pink-400" />
                  </div>
                  <span className="font-medium">Connect with the community</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-purple-200">
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
                  className="w-full px-8 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-black text-lg rounded-full hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 neon-glow"
                >
                  {signingIn ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                      Signing in...
                    </>
                  ) : (
                    'Sign In with Google 🚀'
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

              <p className="text-center text-xs text-purple-400/70 mt-6">
                By signing in, you vibe with our Terms & Privacy 🤝
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
