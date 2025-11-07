'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Feed from '@/components/Feed';
import CreateStory from '@/components/CreateStory';
import Profile from '@/components/Profile';
import Community from '@/components/Community';
import About from '@/components/About';

export default function Home() {
  // Load saved view from localStorage or default to 'feed'
  const [currentView, setCurrentView] = useState<'feed' | 'create' | 'profile' | 'followers' | 'about'>('feed');

  // Load the saved view on mount
  useEffect(() => {
    const savedView = localStorage.getItem('currentView') as 'feed' | 'create' | 'profile' | 'followers' | 'about';
    if (savedView) {
      setCurrentView(savedView);
    }
  }, []);

  // Save view to localStorage whenever it changes
  const handleNavigate = (view: 'feed' | 'create' | 'profile' | 'followers' | 'about') => {
    setCurrentView(view);
    localStorage.setItem('currentView', view);
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar onNavigate={handleNavigate} currentView={currentView} />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Keep all components mounted but hide inactive ones to preserve state */}
        <div className={currentView === 'feed' ? 'block' : 'hidden'}>
          <Feed onNavigateToCreate={() => handleNavigate('create')} />
        </div>
        <div className={currentView === 'create' ? 'block' : 'hidden'}>
          <CreateStory />
        </div>
        <div className={currentView === 'profile' ? 'block' : 'hidden'}>
          <Profile onNavigateToCreate={() => handleNavigate('create')} />
        </div>
        <div className={currentView === 'followers' ? 'block' : 'hidden'}>
          <Community />
        </div>
        <div className={currentView === 'about' ? 'block' : 'hidden'}>
          <About />
        </div>
      </main>
      
      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="flex justify-around items-center px-2 py-3 overflow-x-auto">
          <button
            onClick={() => handleNavigate('feed')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all shrink-0 ${
              currentView === 'feed'
                ? 'text-purple-400'
                : 'text-zinc-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Feed</span>
          </button>
          
          <button
            onClick={() => handleNavigate('create')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all shrink-0 ${
              currentView === 'create'
                ? 'text-purple-400'
                : 'text-zinc-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-medium">Create</span>
          </button>
          
          <button
            onClick={() => handleNavigate('followers')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all shrink-0 ${
              currentView === 'followers'
                ? 'text-purple-400'
                : 'text-zinc-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">Explore</span>
          </button>
          
          <button
            onClick={() => handleNavigate('profile')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all shrink-0 ${
              currentView === 'profile'
                ? 'text-purple-400'
                : 'text-zinc-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </button>
          
          <button
            onClick={() => handleNavigate('about')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all shrink-0 ${
              currentView === 'about'
                ? 'text-purple-400'
                : 'text-zinc-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">About</span>
          </button>
        </div>
      </div>
    </div>
  );
}
