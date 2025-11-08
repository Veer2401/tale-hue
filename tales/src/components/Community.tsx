'use client';

import { Sparkles, Rocket, Zap } from 'lucide-react';

export default function Community() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="max-w-2xl w-full">
        <div className="glass rounded-3xl shadow-2xl p-8 md:p-12 border border-purple-400/30 text-center">
          {/* Animated Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-600 to-orange-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full bg-gradient-to-br from-purple-500 via-pink-600 to-orange-500 flex items-center justify-center shadow-2xl neon-glow animate-bounce">
              <Rocket className="text-white" size={48} />
              <Rocket className="text-white hidden md:block" size={64} />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-300 to-orange-300 mb-4 md:mb-6 neon-text animate-in slide-in-from-top duration-500">
            Coming Soon! 🚀
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 animate-in slide-in-from-top duration-700">
            Squad Goals Loading... 🔥
          </h2>

          {/* Gen Z Messages */}
          <div className="space-y-3 md:space-y-4 mb-8 md:mb-10 animate-in slide-in-from-bottom duration-700">
            <p className="text-purple-100 text-base md:text-lg font-medium flex items-center justify-center gap-2">
              <Zap className="text-yellow-400 animate-pulse" size={20} />
              We're cooking up something absolutely fire 💯
            </p>
            <p className="text-purple-100 text-base md:text-lg font-medium">
              The ultimate creator community is on its way, bestie! ✨
            </p>
            <p className="text-purple-100 text-base md:text-lg font-medium">
              Get ready to connect, collab, and vibe with your tribe 🌟
            </p>
          </div>

          {/* Feature Teasers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            <div className="glass rounded-2xl p-4 md:p-6 border border-purple-400/20 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="text-3xl md:text-4xl mb-2 md:mb-3">👥</div>
              <h3 className="text-white font-bold text-sm md:text-base mb-1 md:mb-2">Creator Squads</h3>
              <p className="text-purple-200 text-xs md:text-sm">Find your creative fam</p>
            </div>

            <div className="glass rounded-2xl p-4 md:p-6 border border-pink-500/20 hover:border-pink-500/50 transition-all duration-300 transform hover:scale-105">
              <div className="text-3xl md:text-4xl mb-2 md:mb-3">💬</div>
              <h3 className="text-white font-bold text-sm md:text-base mb-1 md:mb-2">Real-Time Vibes</h3>
              <p className="text-purple-200 text-xs md:text-sm">Chat & share instantly</p>
            </div>

            <div className="glass rounded-2xl p-4 md:p-6 border border-orange-500/20 hover:border-orange-500/50 transition-all duration-300 transform hover:scale-105">
              <div className="text-3xl md:text-4xl mb-2 md:mb-3">🎨</div>
              <h3 className="text-white font-bold text-sm md:text-base mb-1 md:mb-2">Collab Spaces</h3>
              <p className="text-purple-200 text-xs md:text-sm">Create together, slay together</p>
            </div>
          </div>

          {/* Bottom Message */}
          <div className="glass rounded-2xl p-4 md:p-6 border border-purple-400/20 animate-in fade-in duration-1000 mb-5">
            <p className="text-purple-100 text-sm md:text-base font-medium mb-2 md:mb-3">
              💡 <span className="font-bold text-white">Pro Tip:</span> Keep creating stories while we build this!
            </p>
            <p className="text-purple-200/80 text-xs md:text-sm">
              The more you vibe now, the more lit your community experience will be 🎉
            </p>
          </div>

          {/* Instagram CTA */}
          <a 
            href="https://www.instagram.com/talehue?igsh=MTd1dmJlYXh2Y25vYg%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="block glass rounded-2xl p-4 md:p-5 border border-pink-500/30 hover:border-pink-500 transition-all transform hover:scale-105 group neon-glow animate-in fade-in duration-1000"
          >
            <div className="flex items-center justify-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-pink-600 via-purple-600 to-orange-500 flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="font-black text-white text-base md:text-lg">Follow @talehue on Instagram</p>
                <p className="text-purple-200 text-xs md:text-sm font-medium">Stay updated on the community drop! 💜</p>
              </div>
            </div>
          </a>

          {/* Sparkle Decorations */}
          <div className="absolute top-10 left-10 animate-ping opacity-20">
            <Sparkles className="text-purple-400" size={24} />
          </div>
          <div className="absolute bottom-10 right-10 animate-ping opacity-20" style={{ animationDelay: '1s' }}>
            <Sparkles className="text-pink-400" size={24} />
          </div>
          <div className="absolute top-1/2 left-5 animate-ping opacity-20" style={{ animationDelay: '0.5s' }}>
            <Sparkles className="text-orange-400" size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
