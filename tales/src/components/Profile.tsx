'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Camera, Edit2, Save, Heart, MessageCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Story } from '@/types';

export default function Profile() {
  const { user, profile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [uploading, setUploading] = useState(false);

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
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group"
                >
                  {story.imageURL ? (
                    <>
                      <img src={story.imageURL} alt={story.content} className="w-full h-full object-cover" />
                      {/* Hover overlay with stats */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                        <div className="flex items-center gap-1">
                          <Heart size={20} fill="white" />
                          <span className="font-semibold">{story.likesCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={20} fill="white" />
                          <span className="font-semibold">{story.commentsCount || 0}</span>
                        </div>
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
    </div>
  );
}
