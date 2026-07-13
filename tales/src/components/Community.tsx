'use client';

import { Users, MessageCircle, Palette, Clock } from 'lucide-react';

export default function Community() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div
        className="rounded-xl p-8 text-center"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: 'var(--bg-hover)' }}
        >
          <Clock size={24} style={{ color: 'var(--text-secondary)' }} />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Coming Soon
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          Community features are on the way. Stay tuned.
        </p>

        {/* Feature teasers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
          {[
            {
              icon: Users,
              title: 'Creator Groups',
              desc: 'Find and collaborate with creators who share your interests.',
            },
            {
              icon: MessageCircle,
              title: 'Real-Time Chat',
              desc: 'Share feedback and ideas with others instantly.',
            },
            {
              icon: Palette,
              title: 'Collaborative Spaces',
              desc: 'Work on visual stories together in shared boards.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-4 rounded-lg text-left"
              style={{ border: '1px solid var(--border)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <Icon size={16} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Note */}
        <div
          className="rounded-lg px-4 py-3 text-left mb-6"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>In the meantime:</span>{' '}
            Keep creating stories — the more you share now, the richer your community profile will be at launch.
          </p>
        </div>

        {/* Instagram CTA */}
        <a
          href="https://www.instagram.com/talehue?igsh=MTd1dmJlYXh2Y25vYg%3D%3D&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 px-5 py-3 rounded-lg text-sm font-semibold transition-colors"
          style={{
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          Follow @talehue on Instagram
        </a>
      </div>
    </div>
  );
}
