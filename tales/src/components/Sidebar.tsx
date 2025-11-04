'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Home, PlusSquare, User, Users, LogOut, LogIn } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  onNavigate: (view: 'feed' | 'create' | 'profile' | 'followers') => void;
  currentView: string;
}

export default function Sidebar({ onNavigate, currentView }: SidebarProps) {
  const { user, profile, signInWithGoogle, signOut, error } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in failed:', err);
    } finally {
      setSigningIn(false);
    }
  };

  const menuItems = [
    { icon: Home, label: 'Feed', view: 'feed' as const },
    { icon: PlusSquare, label: 'Create Story', view: 'create' as const },
    { icon: Users, label: 'Community', view: 'followers' as const },
    { icon: User, label: 'Profile', view: 'profile' as const },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
          Tale Hue
        </h1>
        <p className="text-xs text-zinc-500 mt-1">Stories in Color</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              currentView === item.view
                ? 'bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 text-purple-600 dark:text-purple-400'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <item.icon size={22} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        {/* User Profile Section - Below Profile/Community */}
        <div className="pt-4 space-y-2">
          {user && profile ? (
            <div className="px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {profile.displayName}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 text-sm transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In with Google
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
