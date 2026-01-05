'use client';

import { useState, useEffect } from 'react';
import LauncherHeader from '@/components/launcher/LauncherHeader';
import GameCard from '@/components/launcher/GameCard';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { Sparkles, Trophy, Coins, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const { isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to load, then show content
    if (!authLoading) {
      // Small delay for smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  if (isLoading || authLoading) {
    return <LoadingScreen message="Loading games..." />;
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-6">
      {/* Mobile Layout */}
      <div className="w-full max-w-[420px] lg:hidden">
        <LauncherHeader />
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-yellow-400" size={28} />
            <h1 className="text-3xl font-bold text-white">
              Play & Win
            </h1>
            <Sparkles className="text-yellow-400" size={28} />
          </div>
          <p className="text-white/60 text-sm">
            Spin, match, and win amazing prizes!
          </p>
        </div>
        
        <div className="space-y-4">
          <GameCard
            title="Wheel of Fortune"
            description="Spin the lucky wheel and win coins, XP, and exclusive rewards!"
            icon="🎡"
            route="/wheel"
          />
          
          <GameCard
            title="Memory Match"
            description="Test your memory! Flip cards and match pairs before time runs out."
            icon="🧠"
            route="/memory"
          />
          
          <GameCard
            title="Puzzle Challenge"
            description="Piece together beautiful images and challenge your puzzle skills!"
            icon="🧩"
            route="/puzzle"
          />
          
          <GameCard
            title="Scratch Cards"
            description="Coming soon - Scratch to reveal hidden prizes and instant wins!"
            icon="🎫"
            route="#"
            disabled
          />
        </div>
        
        <p className="text-center text-white/30 text-xs mt-8">
          © 2024 Saraya Solutions
        </p>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col w-full max-w-6xl">
        <LauncherHeader />
        
        {/* Hero Section */}
        <div className="text-center mb-12 mt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-yellow-400" size={40} />
            <h1 className="text-5xl font-bold text-white">
              Play & Win
            </h1>
            <Sparkles className="text-yellow-400" size={40} />
          </div>
          <p className="text-white/60 text-lg max-w-md mx-auto">
            Spin, match, and win amazing prizes! Choose your game and start winning.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
            <Trophy className="text-yellow-400" size={24} />
            <div>
              <p className="text-white/50 text-xs">Total Games</p>
              <p className="text-white font-bold text-lg">4</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
            <Coins className="text-yellow-400" size={24} />
            <div>
              <p className="text-white/50 text-xs">Max Coins</p>
              <p className="text-white font-bold text-lg">10,000+</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
            <Zap className="text-cyan-400" size={24} />
            <div>
              <p className="text-white/50 text-xs">Max XP</p>
              <p className="text-white font-bold text-lg">500+</p>
            </div>
          </div>
        </div>
        
        {/* Games Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <GameCard
            title="Wheel of Fortune"
            description="Spin the lucky wheel and win coins, XP, and exclusive rewards!"
            icon="🎡"
            route="/wheel"
          />
          
          <GameCard
            title="Memory Match"
            description="Test your memory! Flip cards and match pairs before time runs out."
            icon="🧠"
            route="/memory"
          />
          
          <GameCard
            title="Puzzle Challenge"
            description="Piece together beautiful images and challenge your puzzle skills!"
            icon="🧩"
            route="/puzzle"
          />
          
          <GameCard
            title="Scratch Cards"
            description="Coming soon - Scratch to reveal hidden prizes and instant wins!"
            icon="🎫"
            route="#"
            disabled
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-auto pt-8 border-t border-white/10">
          <p className="text-white/30 text-sm">
            © 2024 Saraya Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
