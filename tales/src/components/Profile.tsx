'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import {
  Camera, Edit2, Save, Heart, MessageCircle, Trash2, X, Check,
  User, CheckCircle, XCircle, Plus, LogOut, Sun, Moon, Monitor
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import { Story } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface ProfileProps {
  onNavigateToCreate?: () => void;
}

export default function Profile({ onNavigateToCreate }: ProfileProps) {
  const { user, profile, updateProfile, signInWithGoogle, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
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
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio);
      fetchUserStories();
    }
  }, [profile]);

  const fetchUserStories = async () => {
    if (!user) return;
    const q = query(collection(db, 'posts'), where('userID', '==', user.uid), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setUserStories(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Story)));
  };

  const handleSaveProfile = async () => {
    await updateProfile({ displayName, bio });
    setEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      const imageURL = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(e.target.files![0]);
      });
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

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveStory = async (storyId: string) => {
    if (!editedContent.trim() || editedContent.length > 150) {
      showNotification('error', 'Story must be between 1 and 150 characters.');
      return;
    }
    try {
      const storyQuery = query(collection(db, 'posts'), where('storyID', '==', storyId));
      const storySnapshot = await getDocs(storyQuery);
      if (!storySnapshot.empty) {
        await updateDoc(doc(db, 'posts', storySnapshot.docs[0].id), { content: editedContent });
        await fetchUserStories();
        setEditingStory(null);
        setShowEditModal(false);
        setSelectedStory(null);
        showNotification('success', 'Story updated.');
      }
    } catch {
      showNotification('error', 'Failed to update story.');
    }
  };

  const handleDeleteStory = (story: Story) => {
    setSelectedStory(story);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedStory) return;
    try {
      const storyQuery = query(collection(db, 'posts'), where('storyID', '==', selectedStory.storyID));
      const storySnapshot = await getDocs(storyQuery);
      if (!storySnapshot.empty) await deleteDoc(doc(db, 'posts', storySnapshot.docs[0].id));

      const likesQuery = query(collection(db, 'likes'), where('storyID', '==', selectedStory.storyID));
      const likesSnapshot = await getDocs(likesQuery);
      await Promise.all(likesSnapshot.docs.map(d => deleteDoc(d.ref)));

      const commentsQuery = query(collection(db, 'comments'), where('storyID', '==', selectedStory.storyID));
      const commentsSnapshot = await getDocs(commentsQuery);
      await Promise.all(commentsSnapshot.docs.map(d => deleteDoc(d.ref)));

      await fetchUserStories();
      setShowDeleteConfirm(false);
      setSelectedStory(null);
      showNotification('success', 'Story deleted.');
    } catch {
      showNotification('error', 'Failed to delete story.');
    }
  };

  // Unauthenticated state
  if (!user || !profile) {
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
            <User size={24} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Your Profile
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Sign in to view your profile, manage your stories, and customise settings.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-left">
            {[
              { icon: Heart, title: 'Like & Save', desc: 'Interact with stories you love.' },
              { icon: MessageCircle, title: 'Comment', desc: 'Connect with the community.' },
              { icon: Plus, title: 'Create Stories', desc: 'Share your ideas with AI images.' },
              { icon: Camera, title: 'Custom Profile', desc: 'Personalise your presence.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-3 rounded-lg"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} style={{ color: 'var(--accent)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={async () => {
              setSigningIn(true);
              try { await signInWithGoogle(); } catch {}
              finally { setSigningIn(false); }
            }}
            disabled={signingIn}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {signingIn ? 'Signing in…' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-5 right-5 left-5 md:left-auto md:w-80 z-50 animate-slide-in">
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: `1px solid ${notification.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
              color: notification.type === 'success' ? 'var(--success)' : 'var(--danger)',
            }}
          >
            {notification.type === 'success'
              ? <CheckCircle size={16} />
              : <XCircle size={16} />}
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div
        className="rounded-xl p-6 mb-4"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
      >
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden"
              style={{ backgroundColor: '#737373' }}
            >
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                profile.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <label
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
              style={{ backgroundColor: 'var(--bg-elevated)', border: '2px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
            >
              <Camera size={14} style={{ color: 'var(--text-secondary)' }} />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          </div>

          {/* Name / Bio */}
          <div className="w-full text-center">
            {editing ? (
              <div className="space-y-2 max-w-sm mx-auto">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-base text-center font-semibold"
                  placeholder="Display Name"
                />
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-base resize-none"
                  placeholder="Bio"
                  rows={3}
                />
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {profile.displayName}
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {profile.bio || 'No bio yet.'}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-4">
              {[
                { label: 'Stories', count: userStories.length },
                { label: 'Followers', count: profile.followers.length },
                { label: 'Following', count: profile.following.length },
              ].map(({ label, count }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{count}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={editing ? handleSaveProfile : () => setEditing(true)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: 'var(--accent)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
              >
                {editing ? <><Save size={14} /> Save</> : <><Edit2 size={14} /> Edit Profile</>}
              </button>
              {editing && (
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <X size={14} /> Cancel
                </button>
              )}
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ border: '1px solid var(--border)', color: 'var(--danger)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      <div
        className="rounded-xl p-6 mb-4"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Your Stories
        </h3>

        {userStories.length === 0 ? (
          <div className="text-center py-10">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: 'var(--bg-hover)' }}
            >
              <Plus size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              No stories yet.
            </p>
            <button
              onClick={onNavigateToCreate}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            >
              Create Your First Story
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {userStories.map((story) => (
              <div
                key={story.storyID}
                className="aspect-square rounded-lg overflow-hidden relative group"
                style={{ border: '1px solid var(--border)' }}
              >
                {story.imageURL ? (
                  <>
                    <img src={story.imageURL} alt={story.content} className="w-full h-full object-cover" />

                    {/* Mobile action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 md:hidden z-10">
                      <button
                        onClick={() => handleEditStory(story)}
                        className="p-1.5 rounded-lg text-white"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteStory(story)}
                        className="p-1.5 rounded-lg text-white"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Mobile stats */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 py-2 md:hidden"
                      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
                      <div className="flex items-center gap-1 text-white">
                        <Heart size={12} fill="white" />
                        <span className="text-xs font-medium">{story.likesCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white">
                        <MessageCircle size={12} fill="white" />
                        <span className="text-xs font-medium">{story.commentsCount || 0}</span>
                      </div>
                    </div>

                    {/* Desktop hover overlay */}
                    <div className="hidden md:flex absolute inset-0 flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                      <p className="text-white text-xs text-center line-clamp-2 px-2 mb-1">{story.content}</p>
                      <div className="flex items-center gap-4 text-white mb-2">
                        <div className="flex items-center gap-1">
                          <Heart size={14} fill="white" /><span className="text-xs">{story.likesCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={14} fill="white" /><span className="text-xs">{story.commentsCount || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditStory(story)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStory(story)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{ backgroundColor: 'var(--danger)', color: '#fff' }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center p-3"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                      {story.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings — Theme */}
      <div
        className="rounded-xl p-6"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Theme</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Choose your preferred appearance.
            </p>
          </div>
          <div className="flex gap-1 p-1 rounded-lg" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
            {([
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Monitor, label: 'System' },
            ] as const).map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                title={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                style={theme === value ? {
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                } : {
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                }}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedStory && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'var(--modal-overlay)' }}
        >
          <div
            className="rounded-xl max-w-sm w-full p-6 zoom-in"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Delete Story?
            </h3>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              This will permanently delete the story along with all its likes and comments.
            </p>
            <div
              className="rounded-lg p-3 mb-5 text-sm italic"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              "{selectedStory.content}"
            </div>
            <div className="flex gap-2">
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: 'var(--danger)' }}
              >
                Delete
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setSelectedStory(null); }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Story Modal */}
      {showEditModal && selectedStory && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'var(--modal-overlay)' }}
        >
          <div
            className="rounded-xl max-w-sm w-full p-6 zoom-in"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Edit Story
              </h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingStory(null); setSelectedStory(null); }}
                className="p-1 rounded transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <X size={18} />
              </button>
            </div>

            {selectedStory.imageURL && (
              <div className="mb-4 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <img src={selectedStory.imageURL} alt={selectedStory.content} className="w-full aspect-square object-cover" />
              </div>
            )}

            <div className="mb-4">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                maxLength={150}
                className="input-base resize-none"
                rows={4}
                placeholder="Edit your story…"
                autoFocus
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{editedContent.length}/150</span>
                <span className="text-xs" style={{ color: editedContent.length > 150 ? 'var(--danger)' : 'var(--text-muted)' }}>
                  {editedContent.length > 150 ? 'Too long' : ''}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSaveStory(selectedStory.storyID)}
                disabled={!editedContent.trim() || editedContent.length > 150}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <Check size={14} /> Save Changes
              </button>
              <button
                onClick={() => { setShowEditModal(false); setEditingStory(null); setSelectedStory(null); }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
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
