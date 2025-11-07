'use client';

import { Sparkles, Image, Heart, Users, Zap, Globe, Palette, Shield } from 'lucide-react';
import { useState } from 'react';
import PrivacyPolicy from './PrivacyPolicy';

export default function About() {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {/* Header Section */}
      <div className="glass rounded-3xl shadow-2xl p-6 md:p-12 border border-purple-400/30 mb-6 md:mb-8">
        <div className="text-center mb-6 md:mb-8">
          <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-600 to-orange-500 flex items-center justify-center shadow-2xl neon-glow">
            <Sparkles className="text-white" size={32} />
            <Sparkles className="text-white hidden md:block" size={48} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-300 to-orange-300 mb-3 md:mb-4 neon-text">
            About TaleHue
          </h1>
          <p className="text-base md:text-xl text-purple-100 font-medium max-w-2xl mx-auto px-4">
            Where Stories Come to Life Through AI-Powered Creativity
          </p>
        </div>

        <div className="prose prose-invert max-w-none px-2 md:px-0">
          <p className="text-zinc-300 text-sm md:text-lg leading-relaxed mb-3 md:mb-4">
            TaleHue is a revolutionary social platform that transforms your thoughts and ideas into stunning visual stories. 
            Powered by cutting-edge AI technology, we make it easy for anyone to create, share, and discover amazing content.
          </p>
          <p className="text-zinc-300 text-sm md:text-lg leading-relaxed">
            Whether you're an artist, writer, or just someone with a creative spark, TaleHue gives you the tools to express 
            yourself in vibrant, visual ways that captivate and inspire.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-4 md:mb-6 text-center gradient-text">
          🚀 Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Feature 1 */}
          <div className="glass rounded-2xl p-4 md:p-6 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-purple-500 flex items-center justify-center mb-3 md:mb-4 shadow-lg">
              <Zap className="text-white" size={24} />
              <Zap className="text-white hidden md:block" size={28} />
            </div>
            <h3 className="text-lg md:text-xl font-black text-white mb-2 md:mb-3">AI-Powered Generation</h3>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              Transform your words into breathtaking images using advanced AI models. Our Flux Pro and Gemini integration 
              creates high-quality, unique visuals tailored to your story.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass rounded-2xl p-4 md:p-6 border border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-pink-600 flex items-center justify-center mb-3 md:mb-4 shadow-lg">
              <Palette className="text-white" size={24} />
              <Palette className="text-white hidden md:block" size={28} />
            </div>
            <h3 className="text-lg md:text-xl font-black text-white mb-2 md:mb-3">Quick Suggestions</h3>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              Not sure what to create? Choose from our curated quick suggestions like "Sunset beach café vibe" or 
              "Neon arcade nostalgia" for instant inspiration.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass rounded-2xl p-4 md:p-6 border border-violet-500/30 hover:border-violet-500/60 transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-violet-600 flex items-center justify-center mb-3 md:mb-4 shadow-lg">
              <Globe className="text-white" size={24} />
              <Globe className="text-white hidden md:block" size={28} />
            </div>
            <h3 className="text-lg md:text-xl font-black text-white mb-2 md:mb-3">Thoughtfully Framed Stories</h3>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              Each story is carefully presented within an elegant card design, preserving the intimacy and emotion of every moment. 
              Our compact, thoughtful layout ensures that even the smallest sentiments are given the space and attention they deserve.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass rounded-2xl p-4 md:p-6 border border-orange-500/30 hover:border-orange-500/60 transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-orange-600 flex items-center justify-center mb-3 md:mb-4 shadow-lg">
              <Users className="text-white" size={24} />
              <Users className="text-white hidden md:block" size={28} />
            </div>
            <h3 className="text-lg md:text-xl font-black text-white mb-2 md:mb-3">Creative Community</h3>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              Connect with fellow creators, discover amazing content, and build your following. Share your unique perspective 
              with a community that appreciates creativity.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass rounded-2xl p-4 md:p-6 border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-purple-600 flex items-center justify-center mb-3 md:mb-4 shadow-lg">
              <Heart className="text-white" size={24} />
              <Heart className="text-white hidden md:block" size={28} />
            </div>
            <h3 className="text-lg md:text-xl font-black text-white mb-2 md:mb-3">Engage & Interact</h3>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              Like, comment, and connect with stories that resonate with you. Build meaningful interactions and 
              grow your creative network organically.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass rounded-2xl p-4 md:p-6 border border-green-500/30 hover:border-green-500/60 transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-green-600 flex items-center justify-center mb-3 md:mb-4 shadow-lg">
              <Image className="text-white" size={24} />
              <Image className="text-white hidden md:block" size={28} />
            </div>
            <h3 className="text-lg md:text-xl font-black text-white mb-2 md:mb-3">High-Quality Images</h3>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              Generate stunning 1536x1536 images with no compression. Every detail is preserved, ensuring your 
              creative vision shines through in crystal-clear quality.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="glass rounded-3xl shadow-2xl p-6 md:p-12 border border-purple-400/30 mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-6 md:mb-8 text-center gradient-text">
          📖 How It Works
        </h2>
        <div className="space-y-4 md:space-y-6">
          <div className="flex gap-3 md:gap-4">
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-black text-sm md:text-base">
              1
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black text-white mb-1 md:mb-2">Sign In & Create Your Profile</h3>
              <p className="text-zinc-400 text-xs md:text-sm">
                Get started with Google Sign-In and set up your creative profile in seconds.
              </p>
            </div>
          </div>

          <div className="flex gap-3 md:gap-4">
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-pink-600 to-orange-600 flex items-center justify-center text-white font-black text-sm md:text-base">
              2
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black text-white mb-1 md:mb-2">Write Your Story</h3>
              <p className="text-zinc-400 text-xs md:text-sm">
                Express yourself in up to 150 characters. Keep it short, sweet, and impactful! Use quick suggestions or write your own.
              </p>
            </div>
          </div>

          <div className="flex gap-3 md:gap-4">
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-orange-600 to-yellow-600 flex items-center justify-center text-white font-black text-sm md:text-base">
              3
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black text-white mb-1 md:mb-2">Generate Your Image</h3>
              <p className="text-zinc-400 text-xs md:text-sm">
                Click "Generate My Vibe" and watch as AI transforms your words into a stunning visual masterpiece.
              </p>
            </div>
          </div>

          <div className="flex gap-3 md:gap-4">
            <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-yellow-600 to-green-600 flex items-center justify-center text-white font-black text-sm md:text-base">
              4
            </div>
            <div>
              <h3 className="text-base md:text-lg font-black text-white mb-1 md:mb-2">Share & Connect</h3>
              <p className="text-zinc-400 text-xs md:text-sm">
                Post your creation to the feed, engage with the community, and watch your creative network grow!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="glass rounded-3xl shadow-2xl p-6 md:p-12 border border-purple-400/30 text-center mb-6 md:mb-8">
        <Globe className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 text-purple-300" />
        <h2 className="text-2xl md:text-3xl font-black text-white mb-3 md:mb-4 gradient-text">
          Our Mission
        </h2>
        <p className="text-zinc-300 text-sm md:text-lg leading-relaxed max-w-3xl mx-auto mb-4 md:mb-6 px-4">
          We believe everyone has a story to tell and a unique creative voice. TaleHue democratizes creative expression 
          by making professional-quality visual storytelling accessible to all. No design skills needed—just your imagination.
        </p>
        <p className="text-purple-200 text-sm md:text-base font-bold">
          Made with ♥️ by TaleHue
        </p>
      </div>

      {/* Privacy Policy Section */}
      <div className="glass rounded-3xl shadow-2xl p-6 md:p-12 border border-blue-400/30 text-center">
        <Shield className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 text-blue-300" />
        <h2 className="text-2xl md:text-3xl font-black text-white mb-3 md:mb-4">
          Privacy & Security
        </h2>
        <p className="text-zinc-300 text-sm md:text-lg leading-relaxed max-w-3xl mx-auto mb-4 md:mb-6 px-4">
          Your privacy matters to us. We are committed to protecting your data and maintaining transparency about how we collect, 
          use, and secure your information. Learn about our content moderation policies and data practices.
        </p>
        <button
          onClick={() => setShowPrivacyPolicy(true)}
          className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700 text-white font-black text-base md:text-lg rounded-full hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2 md:gap-3 mx-auto"
        >
          <Shield size={20} />
          <Shield size={24} className="hidden md:block" />
          Read Privacy Policy
        </button>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 z-50">
          <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />
        </div>
      )}
    </div>
  );
}
