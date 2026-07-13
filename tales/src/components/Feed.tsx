'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, query, orderBy, onSnapshot, doc, updateDoc,
  increment, addDoc, serverTimestamp, where, getDocs,
  deleteDoc, limit
} from 'firebase/firestore';
import { Story, Profile } from '@/types';
import {
  Heart, MessageCircle, Share2, X, Send, PlusCircle,
  Edit2, Trash2, Check, Copy, CheckCircle
} from 'lucide-react';
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

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853" />
    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9.001c0 1.452.348 2.827.957 4.041l3.007-2.332z" fill="#FBBC05" />
    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29c.708-2.127 2.692-3.71 5.039-3.71z" fill="#EA4335" />
  </svg>
);

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
  const [shouldReverse, setShouldReverse] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const storiesData: StoryWithProfile[] = [];
      const userIds = new Set<string>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.userID) userIds.add(data.userID);
      });

      const profilesMap = new Map<string, Profile>();
      if (userIds.size > 0) {
        const profilesQuery = query(collection(db, 'profiles'), where('userID', 'in', Array.from(userIds)));
        const profilesSnap = await getDocs(profilesQuery);
        profilesSnap.docs.forEach(doc => {
          const p = doc.data() as Profile;
          profilesMap.set(p.userID, p);
        });
      }

      for (const docSnap of snapshot.docs) {
        const storyData = { ...docSnap.data(), id: docSnap.id } as StoryWithProfile;
        if (!storyData.userID || !storyData.storyID) continue;
        storyData.profile = profilesMap.get(storyData.userID);
        storiesData.push(storyData);
      }

      setStories(storiesData);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setShouldReverse(prev => !prev), 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;
    const likesQuery = query(collection(db, 'likes'), where('userID', '==', user.uid));
    const unsubscribe = onSnapshot(likesQuery, (snapshot) => {
      const likedStoryIds = new Set<string>();
      snapshot.docs.forEach(doc => {
        const d = doc.data();
        if (d.storyID) likedStoryIds.add(d.storyID);
      });
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
    setUserLikes(prev => {
      const next = new Set(prev);
      isCurrentlyLiked ? next.delete(storyId) : next.add(storyId);
      return next;
    });
    setStories(prev => prev.map(s => s.storyID === storyId
      ? { ...s, likesCount: isCurrentlyLiked ? Math.max(0, (s.likesCount || 0) - 1) : (s.likesCount || 0) + 1 }
      : s));
    if (detailStory?.storyID === storyId) {
      setDetailStory(prev => prev ? {
        ...prev,
        likesCount: isCurrentlyLiked ? Math.max(0, (prev.likesCount || 0) - 1) : (prev.likesCount || 0) + 1
      } : null);
    }

    if (isCurrentlyLiked) {
      try {
        const lq = query(collection(db, 'likes'), where('storyID', '==', storyId), where('userID', '==', user.uid));
        const ls = await getDocs(lq);
        if (!ls.empty) {
          await deleteDoc(doc(db, 'likes', ls.docs[0].id));
          const sq = query(collection(db, 'posts'), where('storyID', '==', storyId));
          const ss = await getDocs(sq);
          if (!ss.empty) {
            const current = ss.docs[0].data().likesCount || 0;
            await updateDoc(doc(db, 'posts', ss.docs[0].id), { likesCount: current > 0 ? increment(-1) : 0 });
          }
        }
      } catch {
        setUserLikes(prev => { const n = new Set(prev); n.add(storyId); return n; });
        setStories(prev => prev.map(s => s.storyID === storyId ? { ...s, likesCount: (s.likesCount || 0) + 1 } : s));
      }
    } else {
      try {
        const lq = query(collection(db, 'likes'), where('storyID', '==', storyId), where('userID', '==', user.uid));
        const existing = await getDocs(lq);
        if (existing.empty) {
          await addDoc(collection(db, 'likes'), { storyID: storyId, userID: user.uid, createdAt: serverTimestamp() });
          const sq = query(collection(db, 'posts'), where('storyID', '==', storyId));
          const ss = await getDocs(sq);
          if (!ss.empty) await updateDoc(doc(db, 'posts', ss.docs[0].id), { likesCount: increment(1) });
        }
      } catch {
        setUserLikes(prev => { const n = new Set(prev); n.delete(storyId); return n; });
        setStories(prev => prev.map(s => s.storyID === storyId ? { ...s, likesCount: Math.max(0, (s.likesCount || 0) - 1) } : s));
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
    if (!story?.storyID) return;
    setSelectedStory(story);
    const q = query(collection(db, 'comments'), where('storyID', '==', story.storyID), orderBy('createdAt', 'asc'));
    onSnapshot(q, async (snapshot) => {
      const commentsData: Comment[] = [];
      for (const docSnap of snapshot.docs) {
        const commentData = { ...docSnap.data(), id: docSnap.id } as Comment;
        const pSnap = await getDocs(query(collection(db, 'profiles'), where('userID', '==', commentData.userID)));
        if (!pSnap.empty) commentData.displayName = pSnap.docs[0].data().displayName;
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
    e.stopPropagation();
    await handleLike(storyId);
  };

  const handleQuickComment = async (e: React.MouseEvent, story: StoryWithProfile) => {
    e.stopPropagation();
    await openComments(story);
  };

  const handleAddComment = async () => {
    if (!user?.uid || !profile || !selectedStory?.storyID || !newComment.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        storyID: selectedStory.storyID, userID: user.uid,
        content: newComment.trim(), createdAt: serverTimestamp()
      });
      const sq = query(collection(db, 'posts'), where('storyID', '==', selectedStory.storyID));
      const ss = await getDocs(sq);
      if (!ss.empty) await updateDoc(doc(db, 'posts', ss.docs[0].id), { commentsCount: increment(1) });
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
      await updateDoc(doc(db, 'comments', commentId), { content: editedCommentText.trim() });
      setEditingComment(null);
      setEditedCommentText('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedStory?.storyID) return;
    try {
      await deleteDoc(doc(db, 'comments', commentId));
      const sq = query(collection(db, 'posts'), where('storyID', '==', selectedStory.storyID));
      const ss = await getDocs(sq);
      if (!ss.empty) {
        const current = ss.docs[0].data().commentsCount || 0;
        if (current > 0) await updateDoc(doc(db, 'posts', ss.docs[0].id), { commentsCount: increment(-1) });
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleShare = async (platform?: string) => {
    if (!detailStory) return;
    const shareUrl = window.location.href;
    const shareText = `Check out this story on TaleHue: "${detailStory.content}"`;

    if (!platform && navigator.share) {
      try {
        await navigator.share({ title: 'TaleHue Story', text: shareText, url: shareUrl });
        return;
      } catch {}
    }

    if (!platform) { setShowShareMenu(!showShareMenu); return; }

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    let shareLink = '';

    switch (platform) {
      case 'twitter': shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`; break;
      case 'facebook': shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`; break;
      case 'whatsapp': shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`; break;
      case 'telegram': shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`; break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        return;
    }
    if (shareLink) { window.open(shareLink, '_blank', 'noopener,noreferrer'); setShowShareMenu(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
        />
      </div>
    );
  }

  const displayStories = shouldReverse ? [...stories].reverse() : stories;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Instagram follow banner */}
      <a
        href="https://www.instagram.com/talehue?igsh=MTd1dmJlYXh2Y25vYg%3D%3D&utm_source=qr"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between mb-6 px-4 py-3 rounded-xl transition-colors"
        style={{
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Follow @talehue</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Stay updated on Instagram</p>
          </div>
        </div>
        <span className="text-sm font-semibold px-4 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
          Follow
        </span>
      </a>

      {/* Empty state */}
      {stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 fade-in">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'var(--bg-hover)' }}
          >
            <PlusCircle size={32} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No stories yet</h3>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
            Be the first to share a story.
          </p>
          <button
            onClick={onNavigateToCreate}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
          >
            Create a Story
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayStories.map((story) => (
            <div
              key={story.storyID}
              className="rounded-xl overflow-hidden cursor-pointer stagger-item transition-colors"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
            >
              {/* Header */}
              <div
                className="flex items-center gap-2.5 px-3 py-2.5"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden"
                  style={{ backgroundColor: '#737373' }}
                >
                  {story.profile?.profileImage ? (
                    <img src={story.profile.profileImage} alt={story.profile.displayName} className="w-full h-full object-cover" />
                  ) : (
                    story.profile?.displayName.charAt(0).toUpperCase() || 'A'
                  )}
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {story.profile?.displayName || 'Anonymous'}
                </p>
              </div>

              {/* Image */}
              {story.imageURL && (
                <div className="relative aspect-square overflow-hidden" onClick={() => openStoryDetail(story)}>
                  <img
                    src={story.imageURL}
                    alt={story.content}
                    className="w-full h-full object-cover transition-transform duration-500"
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                </div>
              )}

              {/* Footer */}
              <div className="px-3 pt-2.5 pb-3" style={{ borderTop: '1px solid var(--border)' }}>
                {/* Actions */}
                <div className="flex items-center gap-4 mb-2">
                  <button
                    onClick={(e) => handleQuickLike(e, story.storyID)}
                    className="flex items-center gap-1.5 transition-colors"
                    style={{ color: userLikes.has(story.storyID) ? 'var(--danger)' : 'var(--text-secondary)' }}
                  >
                    <Heart size={20} fill={userLikes.has(story.storyID) ? 'currentColor' : 'none'} strokeWidth={2} />
                    <span className="text-sm font-medium">{story.likesCount || 0}</span>
                  </button>
                  <button
                    onClick={(e) => handleQuickComment(e, story)}
                    className="flex items-center gap-1.5 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    <MessageCircle size={20} strokeWidth={2} />
                    <span className="text-sm font-medium">{story.commentsCount || 0}</span>
                  </button>
                </div>
                {/* Caption */}
                <p className="text-sm leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
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
          className="fixed inset-0 flex items-center justify-center z-50 p-0 md:p-6"
          style={{ backgroundColor: 'var(--modal-overlay)' }}
          onClick={() => setShowShareMenu(false)}
        >
          <div
            className="relative flex items-center justify-center w-full h-full md:h-auto"
          >
            <div
              className="rounded-none md:rounded-xl max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] flex flex-col md:flex-row overflow-hidden zoom-in"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left: Image */}
              <div className="md:w-1/2 bg-black flex items-center justify-center relative max-h-[50vh] md:max-h-none">
                <button
                  onClick={closeStoryDetail}
                  className="absolute top-3 right-3 p-2 rounded-full z-10 transition-colors"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                  <X size={20} className="text-white" />
                </button>
                {detailStory.imageURL && (
                  <img src={detailStory.imageURL} alt={detailStory.content} className="w-full h-full object-contain" />
                )}
              </div>

              {/* Right: Details & Comments */}
              <div
                className="md:w-1/2 flex flex-col overflow-y-auto"
                style={{ backgroundColor: 'var(--bg-elevated)' }}
              >
                {/* Author row */}
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden"
                    style={{ backgroundColor: '#737373' }}
                  >
                    {detailStory.profile?.profileImage ? (
                      <img src={detailStory.profile.profileImage} alt={detailStory.profile.displayName} className="w-full h-full object-cover" />
                    ) : (
                      detailStory.profile?.displayName.charAt(0).toUpperCase() || 'A'
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {detailStory.profile?.displayName || 'Anonymous'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {detailStory.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                    </p>
                  </div>
                </div>

                {/* Caption + Actions */}
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>
                    {detailStory.content}
                  </p>
                  <div className="flex items-center gap-5">
                    <button
                      onClick={(e) => handleQuickLike(e, detailStory.storyID)}
                      className="flex items-center gap-1.5 transition-colors"
                      style={{ color: userLikes.has(detailStory.storyID) ? 'var(--danger)' : 'var(--text-secondary)' }}
                    >
                      <Heart size={22} fill={userLikes.has(detailStory.storyID) ? 'currentColor' : 'none'} strokeWidth={2} />
                      <span className="text-sm font-medium">{detailStory.likesCount || 0}</span>
                    </button>
                    <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <MessageCircle size={22} strokeWidth={2} />
                      <span className="text-sm font-medium">{detailStory.commentsCount || 0}</span>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => handleShare()}
                        className="flex items-center gap-1.5 transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                      >
                        <Share2 size={22} strokeWidth={2} />
                      </button>

                      {/* Share Menu */}
                      {showShareMenu && (
                        <div
                          className="absolute bottom-8 left-0 rounded-xl shadow-xl p-3 w-52 z-10"
                          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                          onClick={e => e.stopPropagation()}
                        >
                          <p className="text-xs font-semibold mb-2 px-1" style={{ color: 'var(--text-secondary)' }}>Share</p>
                          {[
                            { id: 'twitter', label: 'Twitter / X' },
                            { id: 'facebook', label: 'Facebook' },
                            { id: 'whatsapp', label: 'WhatsApp' },
                            { id: 'telegram', label: 'Telegram' },
                          ].map(({ id, label }) => (
                            <button
                              key={id}
                              onClick={() => handleShare(id)}
                              className="w-full text-left px-2 py-2 rounded-lg text-sm transition-colors"
                              style={{ color: 'var(--text-primary)' }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                              {label}
                            </button>
                          ))}
                          <button
                            onClick={() => handleShare('copy')}
                            className="w-full text-left px-2 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                            style={{ color: copiedLink ? 'var(--success)' : 'var(--text-primary)' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            {copiedLink ? <CheckCircle size={14} /> : <Copy size={14} />}
                            {copiedLink ? 'Link Copied!' : 'Copy Link'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Comments</p>
                  {comments.length === 0 ? (
                    <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                      No comments yet.
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ backgroundColor: '#737373' }}
                        >
                          {comment.displayName?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {comment.displayName || 'Anonymous'}
                            </p>
                            {user && comment.userID === user.uid && (
                              <div className="flex gap-1 shrink-0">
                                {editingComment === comment.id ? (
                                  <button
                                    onClick={() => handleSaveComment(comment.id)}
                                    className="p-1 rounded transition-colors"
                                    style={{ color: 'var(--success)' }}
                                  >
                                    <Check size={14} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleEditComment(comment.id, comment.content)}
                                    className="p-1 rounded transition-colors"
                                    style={{ color: 'var(--text-muted)' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="p-1 rounded transition-colors"
                                  style={{ color: 'var(--text-muted)' }}
                                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                >
                                  <Trash2 size={14} />
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
                              className="input-base mt-1 text-sm"
                              autoFocus
                            />
                          ) : (
                            <p className="text-sm mt-0.5 break-words" style={{ color: 'var(--text-primary)' }}>
                              {comment.content}
                            </p>
                          )}
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {comment.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add comment */}
                {user ? (
                  <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                        placeholder="Add a comment…"
                        className="input-base text-sm"
                        disabled={submitting}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || submitting}
                        className="px-3 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                        style={{ backgroundColor: 'var(--accent)' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 text-center" style={{ borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={async () => { try { await signInWithGoogle(); } catch {} }}
                      className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      Sign in to comment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      {showSignInModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'var(--modal-overlay)' }}
        >
          <div
            className="rounded-xl max-w-sm w-full p-6 zoom-in"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <div className="text-center mb-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: 'var(--bg-hover)' }}
              >
                {signInAction === 'like' ? (
                  <Heart size={24} style={{ color: 'var(--danger)' }} />
                ) : (
                  <MessageCircle size={24} style={{ color: 'var(--accent)' }} />
                )}
              </div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {signInAction === 'like' ? 'Sign in to like' : 'Sign in to comment'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {signInAction === 'like'
                  ? 'Sign in to like and save stories.'
                  : 'Sign in to join the conversation.'}
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={async () => {
                  setSigningIn(true);
                  try { await signInWithGoogle(); setShowSignInModal(false); }
                  catch (error) { console.error('Sign-in error:', error); }
                  finally { setSigningIn(false); }
                }}
                disabled={signingIn}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {signingIn ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {signingIn ? 'Signing in…' : 'Sign in with Google'}
              </button>
              <button
                onClick={() => setShowSignInModal(false)}
                disabled={signingIn}
                className="w-full py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                style={{
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Not now
              </button>
            </div>
            <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
              By signing in, you agree to our Terms &amp; Privacy Policy.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
