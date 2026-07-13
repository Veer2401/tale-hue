'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Feed from '@/components/Feed';
import CreateStory from '@/components/CreateStory';
import Profile from '@/components/Profile';
import Community from '@/components/Community';
import About from '@/components/About';
import { Home as HomeIcon, PlusSquare, Globe, UserCircle, Info } from 'lucide-react';

type View = 'feed' | 'create' | 'profile' | 'followers' | 'about';

const navItems: { icon: React.ComponentType<{ size: number; strokeWidth: number }>; label: string; view: View }[] = [
  { icon: HomeIcon, label: 'Feed', view: 'feed' },
  { icon: PlusSquare, label: 'Create', view: 'create' },
  { icon: Globe, label: 'Explore', view: 'followers' },
  { icon: UserCircle, label: 'Profile', view: 'profile' },
  { icon: Info, label: 'About', view: 'about' },
];

export default function HomePage() {
  const [currentView, setCurrentView] = useState<View>('feed');

  useEffect(() => {
    const savedView = localStorage.getItem('currentView') as View;
    if (savedView) setCurrentView(savedView);
  }, []);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    localStorage.setItem('currentView', view);
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar onNavigate={handleNavigate} currentView={currentView} />
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-16 md:pb-0">
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

      {/* Mobile Bottom Nav */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          backgroundColor: 'var(--bg)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="flex justify-around items-center px-1 py-2">
          {navItems.map(({ icon: Icon, label, view }) => {
            const isActive = currentView === view;
            return (
              <button
                key={view}
                onClick={() => handleNavigate(view)}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors duration-150"
                style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
