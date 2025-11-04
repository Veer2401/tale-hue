'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Feed from '@/components/Feed';
import CreateStory from '@/components/CreateStory';
import Profile from '@/components/Profile';
import Community from '@/components/Community';

export default function Home() {
  const [currentView, setCurrentView] = useState<'feed' | 'create' | 'profile' | 'followers'>('feed');

  return (
    <div className="flex min-h-screen">
      <Sidebar onNavigate={setCurrentView} currentView={currentView} />
      <main className="flex-1 ml-64">
        {/* Keep all components mounted but hide inactive ones to preserve state */}
        <div className={currentView === 'feed' ? 'block' : 'hidden'}>
          <Feed />
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
