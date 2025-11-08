'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Camera, Edit2, Save, Heart, MessageCircle, Trash2, X, Check, User, Sparkles, CheckCircle, XCircle, Plus, LogOut } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { Story } from '@/types';

interface ProfileProps {
  onNavigateToCreate?: () => void;
}

export default function Profile({ onNavigateToCreate }: ProfileProps) {
  const { user, profile, updateProfile, signInWithGoogle, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingStory, setEditingStory] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
    setSelectedStory(story);
    setShowEditModal(true);
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
        setShowEditModal(false);
        setSelectedStory(null);
        setNotification({ type: 'success', message: 'Story updated successfully!' });
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
        <div className="glass rounded-3xl shadow-2xl overflow-hidden border border-purple-400/30">
          {/* Gradient Header */}
          <div className="relative h-32 bg-gradient-to-br from-purple-500 via-pink-600 to-orange-500">
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
                <div className="p-4 glass rounded-2xl border border-purple-400/30">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center mb-3 shadow-lg">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <h4 className="font-black text-white mb-1 text-sm">Create AI Stories</h4>
                  <p className="text-xs text-purple-100">
                    Transform vibes into visual masterpieces
                  </p>
                </div>

                <div className="p-4 glass rounded-2xl border border-pink-500/30">
                  <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center mb-3 shadow-lg">
                    <Heart size={20} className="text-white" />
                  </div>
                  <h4 className="font-black text-white mb-1 text-sm">Build Your Collection</h4>
                  <p className="text-xs text-purple-100">
                    Curate your fire content library 🔥
                  </p>
                </div>

                <div className="p-4 glass rounded-2xl border border-orange-500/30">
                  <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center mb-3 shadow-lg">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <h4 className="font-black text-white mb-1 text-sm">Engage & Connect</h4>
                  <p className="text-xs text-purple-100">
                    Vibe with the creative community 💬
                  </p>
                </div>

                <div className="p-4 glass rounded-2xl border border-indigo-500/30">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mb-3 shadow-lg">
                    <Camera size={20} className="text-white" />
                  </div>
                  <h4 className="font-black text-white mb-1 text-sm">Customize Profile</h4>
                  <p className="text-xs text-purple-100">
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
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-600 to-orange-500 text-white font-black rounded-full hover:shadow-2xl transform hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none inline-flex items-center gap-3 neon-glow"
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
                <p className="text-xs text-purple-300/70 mt-3 font-medium">
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
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 md:top-6 right-4 md:right-6 left-4 md:left-auto z-50 animate-slide-in">
          <div className={`glass rounded-2xl px-4 md:px-6 py-3 md:py-4 border shadow-2xl flex items-center gap-2 md:gap-3 neon-glow ${
            notification.type === 'success' 
              ? 'border-green-500/50' 
              : 'border-red-500/50'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="text-green-400" size={20} />
            ) : (
              <XCircle className="text-red-400" size={20} />
            )}
            <p className="text-white font-bold text-sm md:text-base">{notification.message}</p>
          </div>
        </div>
      )}

      <div className="glass rounded-3xl shadow-2xl p-4 md:p-8 border border-purple-400/30">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-4 mb-6 md:mb-8">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-500 via-pink-600 to-orange-500 flex items-center justify-center text-white text-4xl md:text-5xl font-black overflow-hidden shadow-2xl neon-glow ring-4 ring-white/20">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                profile.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-lg active:scale-95">
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
          <div className="flex-1 w-full text-center">
            {editing ? (
              <div className="space-y-3 max-w-md mx-auto">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 glass rounded-2xl border-2 border-purple-400/30 text-white font-bold text-lg placeholder-purple-200/50 text-center"
                  placeholder="Display Name"
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 glass rounded-2xl border-2 border-purple-400/30 text-white font-medium placeholder-purple-200/50 resize-none text-base"
                  placeholder="Bio - Tell your story..."
                  rows={3}
                />
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <h2 className="text-3xl md:text-4xl font-black text-white neon-text mb-2">
                  {profile.displayName}
                </h2>
                <p className="text-purple-100 text-base md:text-lg font-medium px-4">{profile.bio || 'No bio yet - add your vibe!'}</p>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-6 md:gap-10 mt-5 justify-center">
              <div className="text-center">
                <div className="font-black text-white text-2xl md:text-3xl gradient-text">{userStories.length}</div>
                <div className="text-purple-200 text-sm md:text-base font-bold">Stories</div>
              </div>
              <div className="text-center">
                <div className="font-black text-white text-2xl md:text-3xl gradient-text">{profile.followers.length}</div>
                <div className="text-purple-200 text-sm md:text-base font-bold">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-black text-white text-2xl md:text-3xl gradient-text">{profile.following.length}</div>
                <div className="text-purple-200 text-sm md:text-base font-bold">Following</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center items-center max-w-md mx-auto">
              <button
                onClick={editing ? handleSaveProfile : () => setEditing(true)}
                className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-600 to-orange-500 text-white font-black text-base rounded-full hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2 neon-glow active:scale-95"
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
              
              <button
                onClick={signOut}
                className="w-full sm:w-auto px-6 py-3 glass border-2 border-red-400/30 hover:border-red-400 text-red-400 hover:text-white hover:bg-red-500/20 font-black text-base rounded-full transform hover:scale-105 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* User Stories Grid */}
        <div className="border-t border-white/10 pt-6 md:pt-8 mt-6 md:mt-8">
          <h3 className="text-2xl md:text-3xl font-black text-white mb-5 md:mb-6 neon-text text-center md:text-left">Your Stories</h3>
          {userStories.length === 0 ? (
            <div className="text-center py-10 md:py-12">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-5 md:mb-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-600 to-orange-500 flex items-center justify-center shadow-2xl neon-glow">
                <Sparkles className="text-white" size={40} />
              </div>
              <p className="text-zinc-400 text-lg md:text-xl mb-6 font-medium px-4">No stories yet. Create your first one!</p>
              <button
                onClick={onNavigateToCreate}
                className="px-7 md:px-8 py-3.5 md:py-4 bg-gradient-to-r from-purple-500 via-pink-600 to-orange-500 text-white font-black text-lg rounded-full hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto neon-glow active:scale-95"
              >
                <Plus size={24} />
                Create Your First Story
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {userStories.map((story) => (
                <div 
                  key={story.storyID} 
                  className="aspect-square rounded-xl md:rounded-2xl overflow-hidden relative group shadow-lg"
                >
                  {story.imageURL ? (
                    <>
                      <img src={story.imageURL} alt={story.content} className="w-full h-full object-cover" />
                      
                      {/* Mobile: Always visible action buttons at top-right */}
                      <div className="absolute top-2 right-2 flex gap-1.5 md:hidden z-10">
                        <button
                          onClick={() => handleEditStory(story)}
                          className="p-2 bg-orange-500/95 backdrop-blur-sm hover:bg-orange-600 rounded-xl shadow-lg transition-all active:scale-90"
                          title="Edit"
                        >
                          <Edit2 size={16} className="text-white" />
                        </button>
                        <button
                          onClick={() => handleDeleteStory(story)}
                          className="p-2 bg-red-500/95 backdrop-blur-sm hover:bg-red-600 rounded-xl shadow-lg transition-all active:scale-90"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-white" />
                        </button>
                      </div>

                      {/* Mobile: Stats badge at bottom */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-4 bg-black/70 backdrop-blur-md rounded-xl py-2 px-3 md:hidden">
                        <div className="flex items-center gap-1.5">
                          <Heart size={14} fill="white" className="text-white" />
                          <span className="font-bold text-sm text-white">{story.likesCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle size={14} fill="white" className="text-white" />
                          <span className="font-bold text-sm text-white">{story.commentsCount || 0}</span>
                        </div>
                      </div>

                      {/* Desktop: Hover overlay with stats and actions */}
                      <div className="hidden md:flex absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex-col items-center justify-center gap-3 text-white p-4">
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
                            <p className="text-sm text-center line-clamp-2 mb-2 px-1">{story.content}</p>
                            <div className="flex items-center gap-4 mb-2">
                              <div className="flex items-center gap-1">
                                <Heart size={18} fill="white" />
                                <span className="font-semibold text-sm">{story.likesCount || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle size={18} fill="white" />
                                <span className="font-semibold text-sm">{story.commentsCount || 0}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 flex-wrap justify-center">
                              <button
                                onClick={() => handleEditStory(story)}
                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-semibold flex items-center gap-1"
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
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-500 to-orange-500 flex items-center justify-center text-white p-2 md:p-4 text-xs md:text-sm">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="glass rounded-3xl max-w-md w-full p-6 border border-red-400/30 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3 neon-text">
              Delete Story?
            </h3>
            <p className="text-zinc-300 text-sm md:text-base mb-4">
              Are you sure you want to delete this story? This will also delete all likes and comments. This action cannot be undone.
            </p>
            <div className="glass rounded-2xl p-3 md:p-4 mb-6 border border-white/10">
              <p className="text-sm md:text-base text-white italic">"{selectedStory.content}"</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all transform active:scale-95"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedStory(null);
                }}
                className="flex-1 px-4 py-3 glass border border-white/20 hover:bg-white/10 text-white rounded-xl font-semibold transition-all transform active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Story Modal - Mobile Friendly */}
      {showEditModal && selectedStory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="glass rounded-3xl max-w-md w-full p-6 border border-purple-400/30 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl md:text-2xl font-bold text-white neon-text">
                Edit Your Story
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStory(null);
                  setSelectedStory(null);
                }}
                className="p-2 glass hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            
            {/* Story Image Preview */}
            {selectedStory.imageURL && (
              <div className="mb-4 rounded-2xl overflow-hidden border-2 border-purple-400/30">
                <img 
                  src={selectedStory.imageURL} 
                  alt={selectedStory.content}
                  className="w-full aspect-square object-cover"
                />
              </div>
            )}

            {/* Edit Form */}
            <div className="mb-4">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                maxLength={150}
                className="w-full px-4 py-3 glass rounded-2xl border-2 border-purple-400/30 focus:border-purple-400 focus:outline-none text-white text-base resize-none placeholder-purple-200/50 font-medium"
                rows={4}
                placeholder="Edit your story..."
                autoFocus
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-purple-200 font-bold">
                  {editedContent.length}/150 characters
                </span>
                <span className={`text-xs font-black ${editedContent.length > 150 ? 'text-red-400' : 'text-green-400'}`}>
                  {editedContent.length > 150 ? '❌ Too long' : '✓ Perfect'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleSaveStory(selectedStory.storyID)}
                disabled={!editedContent.trim() || editedContent.length > 150}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white rounded-xl font-semibold transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 neon-glow"
              >
                <Check size={18} />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStory(null);
                  setSelectedStory(null);
                }}
                className="flex-1 px-4 py-3 glass border border-white/20 hover:bg-white/10 text-white rounded-xl font-semibold transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
