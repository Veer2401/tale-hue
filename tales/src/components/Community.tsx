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
          <div className="glass rounded-2xl p-4 md:p-6 border border-purple-400/20 animate-in fade-in duration-1000">
            <p className="text-purple-100 text-sm md:text-base font-medium mb-2 md:mb-3">
              💡 <span className="font-bold text-white">Pro Tip:</span> Keep creating stories while we build this!
            </p>
            <p className="text-purple-200/80 text-xs md:text-sm">
              The more you vibe now, the more lit your community experience will be 🎉
            </p>
          </div>

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
