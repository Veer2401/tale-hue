'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, query, where } from 'firebase/firestore';
import { Profile } from '@/types';
import { UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Community() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, 'profiles'));
    const usersData = snapshot.docs
      .map(doc => doc.data() as Profile)
      .filter(p => p.userID !== user?.uid);
    setUsers(usersData);
    setLoading(false);
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user || !profile) return;

    try {
      const isFollowing = profile.following.includes(targetUserId);
      
      // Find the current user's profile document
      const userProfileQuery = query(collection(db, 'profiles'), where('userID', '==', user.uid));
      const userProfileSnapshot = await getDocs(userProfileQuery);
      
      // Find the target user's profile document
      const targetProfileQuery = query(collection(db, 'profiles'), where('userID', '==', targetUserId));
      const targetProfileSnapshot = await getDocs(targetProfileQuery);
      
      if (userProfileSnapshot.empty || targetProfileSnapshot.empty) {
        console.error('Profile documents not found');
        return;
      }
      
      const userProfileRef = doc(db, 'profiles', userProfileSnapshot.docs[0].id);
      const targetProfileRef = doc(db, 'profiles', targetProfileSnapshot.docs[0].id);

      if (isFollowing) {
        // Unfollow
        await updateDoc(userProfileRef, {
          following: arrayRemove(targetUserId)
        });
        await updateDoc(targetProfileRef, {
          followers: arrayRemove(user.uid)
        });
      } else {
        // Follow
        await updateDoc(userProfileRef, {
          following: arrayUnion(targetUserId)
        });
        await updateDoc(targetProfileRef, {
          followers: arrayUnion(user.uid)
        });
      }

      // Refresh the user list to show updated state
      fetchUsers();
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
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
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">
        Discover Creators
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((userProfile) => (
          <div
            key={userProfile.userID}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-shadow"
          >
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold mb-3 overflow-hidden">
                {userProfile.profileImage ? (
                  <img src={userProfile.profileImage} alt={userProfile.displayName} className="w-full h-full object-cover" />
                ) : (
                  userProfile.displayName.charAt(0).toUpperCase()
                )}
              </div>
              
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-center">
                {userProfile.displayName}
              </h3>
              <p className="text-sm text-zinc-500 text-center mt-1 line-clamp-2">
                {userProfile.bio || 'No bio yet'}
              </p>

              {/* Stats */}
              <div className="flex gap-4 mt-3 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {userProfile.stories.length}
                  </div>
                  <div className="text-zinc-500">Stories</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {userProfile.followers.length}
                  </div>
                  <div className="text-zinc-500">Followers</div>
                </div>
              </div>

              {/* Follow Button */}
              {user && (
                <button
                  onClick={() => handleFollow(userProfile.userID)}
                  className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    profile?.following.includes(userProfile.userID)
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      : 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:shadow-lg'
                  }`}
                >
                  {profile?.following.includes(userProfile.userID) ? (
                    <>
                      <UserCheck size={16} />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Follow
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-lg">No other users yet. Invite your friends! 🎉</p>
        </div>
      )}
    </div>
  );
}
