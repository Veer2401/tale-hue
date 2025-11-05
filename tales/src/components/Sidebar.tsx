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
    <div className="fixed left-0 top-0 h-screen w-64 glass border-r border-white/10 flex flex-col backdrop-blur-xl bg-gradient-to-b from-zinc-900/95 via-zinc-900/90 to-zinc-950/95">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-3xl font-black gradient-text neon-text tracking-tight">
          ✨ TaleHue
        </h1>
        <p className="text-xs text-purple-300/70 mt-1 font-medium">AI Stories • Vibe • Create</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`group w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
              currentView === item.view
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white shadow-lg shadow-purple-500/50 neon-glow'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 hover:border-purple-500/50'
            }`}
          >
            <item.icon size={24} />
            <span className="font-bold text-sm">{item.label}</span>
          </button>
        ))}

        {/* User Profile Section */}
        <div className="pt-4 space-y-3">
          {user && profile ? (
            <div className="px-4 py-4 rounded-2xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/20">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {profile.displayName}
                  </p>
                  <p className="text-xs text-purple-300/70 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 hover:text-white text-sm font-bold transition-all duration-300 transform hover:scale-105"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                  <p className="text-xs text-red-300 font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-lg shadow-blue-900/50 hover:shadow-blue-800/60 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {signingIn ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Signing In...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm">Sign In</span>
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
