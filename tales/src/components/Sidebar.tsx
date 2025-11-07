'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Home, PlusSquare, UserCircle, Globe, LogOut, LogIn, Info } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  onNavigate: (view: 'feed' | 'create' | 'profile' | 'followers' | 'about') => void;
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
    { icon: Globe, label: 'Community', view: 'followers' as const },
    { icon: UserCircle, label: 'Profile', view: 'profile' as const },
    { icon: Info, label: 'About', view: 'about' as const },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 glass border-r border-white/10 flex flex-col backdrop-blur-xl bg-gradient-to-b from-zinc-900/95 via-zinc-900/90 to-zinc-950/95">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="relative group cursor-pointer">
          {/* Outer glow rings */}
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-600 to-orange-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-60 transition-all duration-1000 animate-pulse"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-pink-600 to-rose-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-700"></div>
          
          {/* Main logo container - ultra dark */}
          <div className="relative bg-gradient-to-br from-black via-zinc-950 to-black rounded-2xl p-6 border-2 border-zinc-800/50 group-hover:border-purple-400/60 transition-all duration-700 group-hover:scale-110 transform shadow-2xl group-hover:shadow-purple-900/50">
            {/* Inner dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/20 via-transparent to-pink-950/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            {/* Animated sparkle elements */}
            <div className="absolute top-3 right-3 w-2 h-2 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 animate-ping shadow-lg shadow-purple-400"></div>
            <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-75 shadow-lg shadow-pink-500"></div>
            <div className="absolute top-1/2 left-2 w-1 h-1 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-150 shadow-lg shadow-orange-500"></div>
            
            {/* Logo text with intense gradient */}
            <h1 className="relative text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-300 to-orange-300 tracking-tighter text-center group-hover:from-purple-100 group-hover:via-pink-200 group-hover:to-orange-200 transition-all duration-700 drop-shadow-2xl animate-in fade-in slide-in-from-top-4 [text-shadow:_0_0_30px_rgb(168_85_247_/_50%)]">
              TaleHue
            </h1>
            
            {/* Multi-layered animated underlines */}
            <div className="mt-3 space-y-1">
              <div className="h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 rounded-full opacity-70 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-700 shadow-lg shadow-purple-400/50 animate-in slide-in-from-left"></div>
              <div className="h-0.5 bg-gradient-to-r from-violet-400 via-pink-400 to-rose-400 rounded-full opacity-0 group-hover:opacity-60 transition-all duration-700 delay-100 animate-in slide-in-from-right"></div>
            </div>
            
            {/* Enhanced shimmer effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>
            </div>
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-400/0 group-hover:border-purple-400/50 rounded-tl-2xl transition-all duration-700"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-pink-500/0 group-hover:border-pink-500/50 rounded-br-2xl transition-all duration-700"></div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onNavigate(item.view)}
            className={`group w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
              currentView === item.view
                ? 'bg-gradient-to-r from-purple-500 via-pink-600 to-orange-500 text-white shadow-lg shadow-purple-400/50 neon-glow'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 hover:border-purple-400/50'
            }`}
          >
            <item.icon size={24} />
            <span className="font-bold text-sm">{item.label}</span>
          </button>
        ))}

        {/* User Profile Section */}
        <div className="pt-4 space-y-3">
          {user && profile ? (
            <div className="px-4 py-4 rounded-2xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-400/30 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/20">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {profile.displayName}
                  </p>
                  <p className="text-xs text-purple-200/70 truncate">{user.email}</p>
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
                className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-orange-900 hover:bg-orange-800 text-white font-bold shadow-lg shadow-orange-900/50 hover:shadow-orange-800/60 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
