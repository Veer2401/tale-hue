'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Camera, Edit2, Save, Heart, MessageCircle, Trash2, X, Check, User, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { Story } from '@/types';

export default function Profile() {
  const { user, profile, updateProfile, signInWithGoogle } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingStory, setEditingStory] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      fetchUserStories();
    }
  }, [profile]);

  const fetchUserStories = async () => {
    if (!user) return;
    
    const q = query(
      collection(db, 'posts'), 
      where('userID', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const stories = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Story));
    setUserStories(stories);
  };

  const handleSaveProfile = async () => {
    await updateProfile({ displayName, bio });
    setEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    setUploading(true);
    const file = e.target.files[0];
    
    try {
      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const imageURL = await base64Promise;
      await updateProfile({ profileImage: imageURL });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story.storyID);
    setEditedContent(story.content);
  };

  const handleSaveStory = async (storyId: string) => {
    if (!editedContent.trim() || editedContent.length > 150) {
      setNotification({ type: 'error', message: 'Story must be between 1-150 characters' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      const storyQuery = query(collection(db, 'posts'), where('storyID', '==', storyId));
      const storySnapshot = await getDocs(storyQuery);
      
      if (!storySnapshot.empty) {
        const storyDocRef = doc(db, 'posts', storySnapshot.docs[0].id);
        await updateDoc(storyDocRef, {
          content: editedContent
        });
        
        // Refresh stories
        await fetchUserStories();
        setEditingStory(null);
        setNotification({ type: 'success', message: '✨ Story updated successfully!' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error updating story:', error);
      setNotification({ type: 'error', message: 'Failed to update story' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteStory = async (story: Story) => {
    setSelectedStory(story);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedStory) return;

    try {
      // Delete the post
      const storyQuery = query(collection(db, 'posts'), where('storyID', '==', selectedStory.storyID));
      const storySnapshot = await getDocs(storyQuery);
      
      if (!storySnapshot.empty) {
        await deleteDoc(doc(db, 'posts', storySnapshot.docs[0].id));
      }

      // Delete all likes for this story
      const likesQuery = query(collection(db, 'likes'), where('storyID', '==', selectedStory.storyID));
      const likesSnapshot = await getDocs(likesQuery);
      await Promise.all(likesSnapshot.docs.map(doc => deleteDoc(doc.ref)));

      // Delete all comments for this story
      const commentsQuery = query(collection(db, 'comments'), where('storyID', '==', selectedStory.storyID));
      const commentsSnapshot = await getDocs(commentsQuery);
      await Promise.all(commentsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

      // Refresh stories
      await fetchUserStories();
      setShowDeleteConfirm(false);
      setSelectedStory(null);
      setNotification({ type: 'success', message: '🗑️ Story deleted successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error deleting story:', error);
      setNotification({ type: 'error', message: 'Failed to delete story' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (!user || !profile) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="glass rounded-3xl shadow-2xl overflow-hidden border border-purple-500/30">
          {/* Gradient Header */}
          <div className="relative h-32 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-xl">
                  <User size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-black mb-1 neon-text">Your Profile Awaits</h2>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-black text-white mb-4 text-center gradient-text">
                Unlock Your Creative Space 🚀
              </h3>
              
              {/* Benefits Grid */}
              <div className="grid md:grid-cols-2 gap-3 mb-6">
                <div className="p-4 glass rounded-2xl border border-purple-500/30">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center mb-3 shadow-lg">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <h4 className="font-black text-white mb-1 text-sm">Create AI Stories</h4>
                  <p className="text-xs text-purple-200">
                    Transform vibes into visual masterpieces
                  </p>
                </div>

                <div className="p-4 glass rounded-2xl border border-pink-500/30">
                  <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center mb-3 shadow-lg">
                    <Heart size={20} className="text-white" />
                  </div>
                  <h4 className="font-black text-white mb-1 text-sm">Build Your Collection</h4>
                  <p className="text-xs text-purple-200">
                    Curate your fire content library 🔥
                  </p>
                </div>

                <div className="p-4 glass rounded-2xl border border-orange-500/30">
                  <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center mb-3 shadow-lg">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <h4 className="font-black text-white mb-1 text-sm">Engage & Connect</h4>
                  <p className="text-xs text-purple-200">
                    Vibe with the creative community 💬
                  </p>
                </div>

                <div className="p-4 glass rounded-2xl border border-indigo-500/30">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mb-3 shadow-lg">
                    <Camera size={20} className="text-white" />
                  </div>
                  <h4 className="font-black text-white mb-1 text-sm">Customize Profile</h4>
                  <p className="text-xs text-purple-200">
                    Make it uniquely yours, bestie 😎
                  </p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <button
                  onClick={async () => {
                    setSigningIn(true);
                    try {
                      await signInWithGoogle();
                    } catch (error) {
                      console.error('Sign-in error:', error);
                    } finally {
                      setSigningIn(false);
                    }
                  }}
                  disabled={signingIn}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-black rounded-full hover:shadow-2xl transform hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center gap-3 neon-glow"
                >
                  {signingIn ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <User size={20} />
                      Sign In & Start Creating 🚀
                    </>
                  )}
                </button>
                <p className="text-xs text-purple-400/70 mt-3 font-medium">
                  Join the creative gang today! 🌟
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className={`glass rounded-2xl px-6 py-4 border shadow-2xl flex items-center gap-3 neon-glow ${
            notification.type === 'success' 
              ? 'border-green-500/50' 
              : 'border-red-500/50'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="text-green-400" size={24} />
            ) : (
              <XCircle className="text-red-400" size={24} />
            )}
            <p className="text-white font-bold">{notification.message}</p>
          </div>
        </div>
      )}

      <div className="glass rounded-3xl shadow-2xl p-8 border border-purple-500/30">
        {/* Profile Header */}
        <div className="flex items-start gap-6 mb-8">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center text-white text-4xl font-black overflow-hidden shadow-2xl neon-glow ring-4 ring-white/20">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                profile.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-lg">
              <Camera size={20} className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-5 py-3 glass rounded-2xl border-2 border-purple-500/30 text-white font-bold text-lg placeholder-purple-300/50"
                  placeholder="Display Name"
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-5 py-3 glass rounded-2xl border-2 border-purple-500/30 text-white font-medium placeholder-purple-300/50 resize-none"
                  placeholder="Bio - Tell your story..."
                  rows={3}
                />
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-black text-white neon-text">
                  {profile.displayName}
                </h2>
                <p className="text-purple-200 mt-2 text-lg font-medium">{profile.bio || 'No bio yet - add your vibe! ✨'}</p>
              </>
            )}

            {/* Stats */}
            <div className="flex gap-8 mt-6">
              <div className="text-center">
                <div className="font-black text-white text-2xl gradient-text">{userStories.length}</div>
                <div className="text-purple-300 text-sm font-bold">Stories</div>
              </div>
              <div className="text-center">
                <div className="font-black text-white text-2xl gradient-text">{profile.followers.length}</div>
                <div className="text-purple-300 text-sm font-bold">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-black text-white text-2xl gradient-text">{profile.following.length}</div>
                <div className="text-purple-300 text-sm font-bold">Following</div>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={editing ? handleSaveProfile : () => setEditing(true)}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-black rounded-full hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-3 neon-glow"
            >
              {editing ? (
                <>
                  <Save size={20} /> Save Changes
                </>
              ) : (
                <>
                  <Edit2 size={20} /> Edit Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* User Stories Grid */}
        <div className="border-t border-white/10 pt-8">
          <h3 className="text-2xl font-black text-white mb-6 neon-text">Your Stories</h3>
          {userStories.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No stories yet. Create your first one!</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {userStories.map((story) => (
                <div 
                  key={story.storyID} 
                  className="aspect-square rounded-lg overflow-hidden relative group"
                >
                  {story.imageURL ? (
                    <>
                      <img src={story.imageURL} alt={story.content} className="w-full h-full object-cover" />
                      {/* Hover overlay with stats and actions */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 text-white p-4">
                        {editingStory === story.storyID ? (
                          <div className="w-full flex flex-col gap-2">
                            <textarea
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              maxLength={150}
                              className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg text-sm resize-none"
                              rows={3}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveStory(story.storyID)}
                                className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-semibold flex items-center justify-center gap-1"
                              >
                                <Check size={16} /> Save
                              </button>
                              <button
                                onClick={() => setEditingStory(null)}
                                className="flex-1 px-3 py-2 bg-zinc-600 hover:bg-zinc-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-1"
                              >
                                <X size={16} /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-center line-clamp-2 mb-2">{story.content}</p>
                            <div className="flex items-center gap-4 mb-2">
                              <div className="flex items-center gap-1">
                                <Heart size={18} fill="white" />
                                <span className="font-semibold">{story.likesCount || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle size={18} fill="white" />
                                <span className="font-semibold">{story.commentsCount || 0}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditStory(story)}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-semibold flex items-center gap-1"
                              >
                                <Edit2 size={14} /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteStory(story)}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold flex items-center gap-1"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white p-4 text-sm">
                      {story.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedStory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
              Delete Story?
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Are you sure you want to delete this story? This will also delete all likes and comments. This action cannot be undone.
            </p>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-zinc-900 dark:text-zinc-100 italic">"{selectedStory.content}"</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedStory(null);
                }}
                className="flex-1 px-4 py-3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
