'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Feed from '@/components/Feed';
import CreateStory from '@/components/CreateStory';
import Profile from '@/components/Profile';
import Community from '@/components/Community';

export default function Home() {
  // Load saved view from localStorage or default to 'feed'
  const [currentView, setCurrentView] = useState<'feed' | 'create' | 'profile' | 'followers'>('feed');

  // Load the saved view on mount
  useEffect(() => {
    const savedView = localStorage.getItem('currentView') as 'feed' | 'create' | 'profile' | 'followers';
    if (savedView) {
      setCurrentView(savedView);
    }
  }, []);

  // Save view to localStorage whenever it changes
  const handleNavigate = (view: 'feed' | 'create' | 'profile' | 'followers') => {
    setCurrentView(view);
    localStorage.setItem('currentView', view);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar onNavigate={handleNavigate} currentView={currentView} />
      <main className="flex-1 ml-64">
        {/* Keep all components mounted but hide inactive ones to preserve state */}
        <div className={currentView === 'feed' ? 'block' : 'hidden'}>
          <Feed onNavigateToCreate={() => handleNavigate('create')} />
        </div>
        <div className={currentView === 'create' ? 'block' : 'hidden'}>
          <CreateStory />
        </div>
        <div className={currentView === 'profile' ? 'block' : 'hidden'}>
          <Profile />
        </div>
        <div className={currentView === 'followers' ? 'block' : 'hidden'}>
          <Community />
        </div>
      </main>
    </div>
  );
}
