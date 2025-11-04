'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Camera, Edit2, Save, Heart, MessageCircle, Trash2, X, Check } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { Story } from '@/types';

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingStory, setEditingStory] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      alert('Story must be between 1-150 characters');
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
        alert('✨ Story updated successfully!');
      }
    } catch (error) {
      console.error('Error updating story:', error);
      alert('Failed to update story');
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
      alert('🗑️ Story deleted successfully!');
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story');
    }
  };

  if (!user || !profile) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-zinc-500">Please sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800">
        {/* Profile Header */}
        <div className="flex items-start gap-6 mb-8">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                profile.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors">
              <Camera size={16} className="text-white" />
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
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  placeholder="Display Name"
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 resize-none"
                  placeholder="Bio"
                  rows={3}
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {profile.displayName}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mt-2">{profile.bio || 'No bio yet'}</p>
              </>
            )}

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{userStories.length}</span>
                <span className="text-zinc-500 ml-1">Stories</span>
              </div>
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{profile.followers.length}</span>
                <span className="text-zinc-500 ml-1">Followers</span>
              </div>
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{profile.following.length}</span>
                <span className="text-zinc-500 ml-1">Following</span>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={editing ? handleSaveProfile : () => setEditing(true)}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              {editing ? (
                <>
                  <Save size={16} /> Save Profile
                </>
              ) : (
                <>
                  <Edit2 size={16} /> Edit Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* User Stories Grid */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Your Stories</h3>
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
