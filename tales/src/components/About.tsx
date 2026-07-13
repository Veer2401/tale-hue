'use client';

import { Zap, Palette, Globe, Users, Heart, Image as ImageIcon, Shield } from 'lucide-react';
import { useState } from 'react';
import PrivacyPolicy from './PrivacyPolicy';

export default function About() {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div
        className="rounded-xl p-6"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
      >
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          About TaleHue
        </h1>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
          TaleHue is a social platform that transforms your ideas into visual stories using AI. 
          Write a short caption and our AI generates a unique image to accompany it — no design skills needed.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Whether you're an artist, writer, or just someone with something to say, TaleHue gives you the tools 
          to express yourself and share with a community that appreciates creativity.
        </p>
      </div>

      {/* Key Features */}
      <div
        className="rounded-xl p-6"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              icon: Zap,
              title: 'AI Image Generation',
              desc: 'Your story description is enhanced and transformed into a high-quality image using Flux and Gemini AI.',
            },
            {
              icon: Palette,
              title: 'Quick Suggestions',
              desc: 'Not sure where to start? Pick from curated prompts to generate an image instantly.',
            },
            {
              icon: Globe,
              title: 'Story Cards',
              desc: 'Each story is presented in a clean card — image and caption together, simple and focused.',
            },
            {
              icon: Users,
              title: 'Creative Community',
              desc: 'Discover stories from others, follow creators, and build your own following.',
            },
            {
              icon: Heart,
              title: 'Engagement',
              desc: 'Like and comment on stories that resonate with you. Build connections organically.',
            },
            {
              icon: ImageIcon,
              title: 'High-Quality Images',
              desc: 'Images are generated at full resolution with no compression — your story looks sharp everywhere.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-3 p-4 rounded-lg transition-colors"
              style={{ border: '1px solid var(--border)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <Icon size={16} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div
        className="rounded-xl p-6"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          How It Works
        </h2>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: 'Sign In',
              desc: 'Get started with Google Sign-In. Your profile is created automatically.',
            },
            {
              step: 2,
              title: 'Write Your Story',
              desc: 'Express an idea in up to 150 characters. Use the quick suggestions for inspiration.',
            },
            {
              step: 3,
              title: 'Generate an Image',
              desc: 'Click "Generate Image" and AI turns your words into a visual.',
            },
            {
              step: 4,
              title: 'Share & Connect',
              desc: 'Post your story to the feed, engage with others, and grow your creative network.',
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {step}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <div
        className="rounded-xl p-6 text-center"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
      >
        <Globe size={28} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
        <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Our Mission
        </h2>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
          We believe everyone has a story worth telling. TaleHue makes professional-quality visual storytelling 
          accessible to anyone — no design skills or expensive tools required. Just your imagination.
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Made with care by TaleHue</p>
      </div>

      {/* Privacy & Security */}
      <div
        className="rounded-xl p-6"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <Shield size={18} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Privacy &amp; Security
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Your privacy matters. We are transparent about how we collect, use, and protect your data. 
              Our content moderation policies ensure a safe and respectful community.
            </p>
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Shield size={14} />
              Read Privacy Policy
            </button>
          </div>
        </div>
      </div>

      {/* Instagram CTA */}
      <a
        href="https://www.instagram.com/talehue?igsh=MTd1dmJlYXh2Y25vYg%3D%3D&utm_source=qr"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-5 py-4 rounded-xl transition-colors"
        style={{
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-elevated)',
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Follow @talehue on Instagram
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Updates, behind-the-scenes, and more.
            </p>
          </div>
        </div>
        <span
          className="text-sm font-semibold px-4 py-1.5 rounded-lg ml-3 shrink-0"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
        >
          Follow
        </span>
      </a>

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 z-50">
          <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />
        </div>
      )}
    </div>
  );
}
