'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, addDoc, serverTimestamp, where, getDocs, deleteDoc } from 'firebase/firestore';
import { Story, Profile } from '@/types';
import { Heart, MessageCircle, Share2, X, Send } from 'lucide-react';
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

export default function Feed() {
  const { user, profile } = useAuth();
  const [stories, setStories] = useState<StoryWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<StoryWithProfile | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const storiesData: StoryWithProfile[] = [];
      
      for (const docSnap of snapshot.docs) {
        const storyData = { ...docSnap.data(), id: docSnap.id } as StoryWithProfile;
        
        // Fetch user profile
        const profileSnap = await getDocs(
          query(collection(db, 'profiles'), where('userID', '==', storyData.userID))
        );
        
        if (!profileSnap.empty) {
          storyData.profile = profileSnap.docs[0].data() as Profile;
        }

        // Check if current user liked this story
        if (user) {
          const likesQuery = query(
            collection(db, 'likes'),
            where('storyID', '==', storyData.storyID),
            where('userID', '==', user.uid)
          );
          const likesSnapshot = await getDocs(likesQuery);
          storyData.isLiked = !likesSnapshot.empty;
        }
        
        storiesData.push(storyData);
      }
      
      setStories(storiesData);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleLike = async (storyId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      const likesQuery = query(
        collection(db, 'likes'),
        where('storyID', '==', storyId),
        where('userID', '==', user.uid)
      );
      const likesSnapshot = await getDocs(likesQuery);

      if (isLiked) {
        // Unlike - remove like
        if (!likesSnapshot.empty) {
          await deleteDoc(doc(db, 'likes', likesSnapshot.docs[0].id));
          
          // Update story likes count
          const storyQuery = query(collection(db, 'stories'), where('storyID', '==', storyId));
          const storySnapshot = await getDocs(storyQuery);
          if (!storySnapshot.empty) {
            const storyDocRef = doc(db, 'stories', storySnapshot.docs[0].id);
            await updateDoc(storyDocRef, {
              likesCount: increment(-1)
            });
          }
        }
      } else {
        // Like - add like
        await addDoc(collection(db, 'likes'), {
          storyID: storyId,
          userID: user.uid,
          createdAt: serverTimestamp()
        });

        // Update story likes count
        const storyQuery = query(collection(db, 'stories'), where('storyID', '==', storyId));
        const storySnapshot = await getDocs(storyQuery);
        if (!storySnapshot.empty) {
          const storyDocRef = doc(db, 'stories', storySnapshot.docs[0].id);
          await updateDoc(storyDocRef, {
            likesCount: increment(1)
          });
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const openComments = async (story: StoryWithProfile) => {
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
    if (!user || !profile || !selectedStory || !newComment.trim()) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        storyID: selectedStory.storyID,
        userID: user.uid,
        content: newComment.trim(),
        createdAt: serverTimestamp()
      });

      // Update comments count
      const storyQuery = query(collection(db, 'stories'), where('storyID', '==', selectedStory.storyID));
      const storySnapshot = await getDocs(storyQuery);
      if (!storySnapshot.empty) {
        const storyDocRef = doc(db, 'stories', storySnapshot.docs[0].id);
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
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
        Latest Stories
      </h2>
      
      {stories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-lg">No stories yet. Be the first to create one! ✨</p>
        </div>
      ) : (
        stories.map((story) => (
          <div
            key={story.storyID}
            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-2xl transition-shadow"
          >
            {/* User Info */}
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                {story.profile?.displayName.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {story.profile?.displayName || 'Anonymous'}
                </p>
                <p className="text-xs text-zinc-500">
                  {story.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                </p>
              </div>
            </div>

            {/* Story Image */}
            {story.imageURL && (
              <img
                src={story.imageURL}
                alt={story.content}
                className="w-full aspect-square object-cover"
              />
            )}

            {/* Story Content */}
            <div className="p-4">
              <p className="text-zinc-900 dark:text-zinc-100 text-lg mb-4">
                {story.content}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleLike(story.storyID, story.isLiked || false)}
                  className={`flex items-center gap-2 transition-colors ${
                    story.isLiked 
                      ? 'text-red-500' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-red-500'
                  }`}
                >
                  <Heart size={20} fill={story.isLiked ? 'currentColor' : 'none'} />
                  <span>{story.likesCount || 0}</span>
                </button>
                <button 
                  onClick={() => openComments(story)}
                  className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-500 transition-colors"
                >
                  <MessageCircle size={20} />
                  <span>{story.commentsCount || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-green-500 transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Comments Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Comments</h3>
              <button
                onClick={closeComments}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={20} className="text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-zinc-500 py-8">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {comment.displayName?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {comment.displayName || 'Anonymous'}
                      </p>
                      <p className="text-zinc-700 dark:text-zinc-300 mt-1">{comment.content}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {comment.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            {user && (
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={submitting}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || submitting}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
