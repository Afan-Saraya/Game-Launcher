'use client';

import { useState, useEffect } from 'react';
import LauncherHeader from '@/components/launcher/LauncherHeader';
import GameCard from '@/components/launcher/GameCard';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { WheelIcon, MemoryIcon, PuzzleIcon, WordSearchIcon, PacmanIcon, ScratchIcon } from '@/components/shared/GameIcons';
import { Sparkles, Trophy, Coins, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GameInfo } from '@/lib/types';

// Game information data
const GAME_INFO: Record<string, GameInfo> = {
  wheel: {
    howToPlay: [
      'Tap the spin button to start the wheel',
      'Wait for the wheel to stop spinning',
      'Win the prize where the pointer lands',
      'You can spin once per day for free'
    ],
    rewards: { coins: { min: 10, max: 500 }, xp: { min: 5, max: 100 } },
    features: ['Daily Free Spin', 'Multiple Prizes', 'Instant Rewards']
  },
  memory: {
    howToPlay: [
      'Choose a difficulty level',
      'Memorize card positions during preview',
      'Flip cards to find matching pairs',
      'Match all pairs before time runs out'
    ],
    rewards: { coins: { min: 25, max: 400 }, xp: { min: 10, max: 200 } },
    difficulties: ['Easy', 'Medium', 'Hard'],
    features: ['Time Challenge', 'Multiple Difficulties', 'Time-Based Rewards']
  },
  puzzle: {
    howToPlay: [
      'Select your preferred difficulty',
      'Study the complete image during preview',
      'Drag and drop pieces to solve the puzzle',
      'Complete faster for better rewards'
    ],
    rewards: { coins: { min: 25, max: 400 }, xp: { min: 10, max: 200 } },
    difficulties: ['Easy', 'Medium', 'Hard'],
    features: ['Beautiful Images', 'Drag & Drop', 'Time-Based Rewards']
  },
  wordsearch: {
    howToPlay: [
      'Pick a difficulty level',
      'Find all hidden words in the grid',
      'Drag to select words horizontally, vertically, or diagonally',
      'Find all words before time expires'
    ],
    rewards: { coins: { min: 25, max: 400 }, xp: { min: 10, max: 200 } },
    difficulties: ['Easy', 'Medium', 'Hard'],
    features: ['Word Lists', 'Multiple Directions', 'Time-Based Rewards']
  },
  pacman: {
    howToPlay: [
      'Choose a difficulty level',
      'Use arrow keys or swipe to move Pac-Man',
      'Eat all dots while avoiding ghosts',
      'Grab power pellets to eat ghosts!'
    ],
    rewards: { coins: { min: 50, max: 200 }, xp: { min: 25, max: 100 } },
    difficulties: ['Easy', 'Medium', 'Hard'],
    features: ['Classic Arcade', 'Ghost Chase', 'Power-Ups']
  }
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const { isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      const timer = setTimeout(() => setIsLoading(false), 300);
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
        
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-yellow-400" size={24} />
            <h1 className="text-2xl font-bold text-white">Play & Win</h1>
            <Sparkles className="text-yellow-400" size={24} />
          </div>
          <p className="text-white/60 text-sm">Spin, match, and win amazing prizes!</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <GameCard
            title="Wheel"
            description="Spin to win coins and XP!"
            icon={<WheelIcon size={36} />}
            route="/wheel"
            gradient="from-amber-500/30 to-orange-600/30"
            gameInfo={GAME_INFO.wheel}
          />
          
          <GameCard
            title="Memory"
            description="Match pairs before time runs out"
            icon={<MemoryIcon size={36} />}
            route="/memory"
            gradient="from-purple-500/30 to-indigo-600/30"
            gameInfo={GAME_INFO.memory}
          />
          
          <GameCard
            title="Puzzle"
            description="Solve image puzzles fast"
            icon={<PuzzleIcon size={36} />}
            route="/puzzle"
            gradient="from-rose-500/30 to-pink-600/30"
            gameInfo={GAME_INFO.puzzle}
          />
          
          <GameCard
            title="Word Search"
            description="Find hidden words in grid"
            icon={<WordSearchIcon size={36} />}
            route="/wordsearch"
            gradient="from-cyan-500/30 to-blue-600/30"
            gameInfo={GAME_INFO.wordsearch}
          />
          
          <GameCard
            title="Pac-Man"
            description="Eat dots, avoid ghosts!"
            icon={<PacmanIcon size={36} />}
            route="/pacman"
            gradient="from-yellow-400/30 to-orange-500/30"
            gameInfo={GAME_INFO.pacman}
          />
          
          <GameCard
            title="Scratch"
            description="Coming soon!"
            icon={<ScratchIcon size={36} />}
            route="#"
            gradient="from-emerald-500/30 to-teal-600/30"
            disabled
          />
        </div>
        
        <p className="text-center text-white/30 text-xs mt-8">© 2024 Saraya Solutions</p>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col w-full max-w-6xl">
        <LauncherHeader />
        
        <div className="text-center mb-12 mt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="text-yellow-400" size={40} />
            <h1 className="text-5xl font-bold text-white">Play & Win</h1>
            <Sparkles className="text-yellow-400" size={40} />
          </div>
          <p className="text-white/60 text-lg max-w-md mx-auto">
            Spin, match, and win amazing prizes! Choose your game and start winning.
          </p>
        </div>

        <div className="flex items-center justify-center gap-8 mb-12">
          <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
            <Trophy className="text-yellow-400" size={24} />
            <div>
              <p className="text-white/50 text-xs">Total Games</p>
              <p className="text-white font-bold text-lg">6</p>
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
        
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <GameCard
            title="Wheel of Fortune"
            description="Spin the lucky wheel and win coins, XP, and exclusive rewards!"
            icon={<WheelIcon size={40} />}
            route="/wheel"
            gradient="from-amber-500/30 to-orange-600/30"
            gameInfo={GAME_INFO.wheel}
          />
          
          <GameCard
            title="Memory Match"
            description="Test your memory! Flip cards and match pairs before time runs out."
            icon={<MemoryIcon size={40} />}
            route="/memory"
            gradient="from-purple-500/30 to-indigo-600/30"
            gameInfo={GAME_INFO.memory}
          />
          
          <GameCard
            title="Puzzle Challenge"
            description="Piece together beautiful images and challenge your puzzle skills!"
            icon={<PuzzleIcon size={40} />}
            route="/puzzle"
            gradient="from-rose-500/30 to-pink-600/30"
            gameInfo={GAME_INFO.puzzle}
          />
          
          <GameCard
            title="Word Search"
            description="Find hidden words in the grid! Search horizontally, vertically, and diagonally."
            icon={<WordSearchIcon size={40} />}
            route="/wordsearch"
            gradient="from-cyan-500/30 to-blue-600/30"
            gameInfo={GAME_INFO.wordsearch}
          />
          
          <GameCard
            title="Pac-Man"
            description="Classic arcade fun! Eat dots, avoid ghosts, and grab power-ups to win!"
            icon={<PacmanIcon size={40} />}
            route="/pacman"
            gradient="from-yellow-400/30 to-orange-500/30"
            gameInfo={GAME_INFO.pacman}
          />
          
          <GameCard
            title="Scratch Cards"
            description="Coming soon - Scratch to reveal hidden prizes and instant wins!"
            icon={<ScratchIcon size={40} />}
            route="#"
            gradient="from-emerald-500/30 to-teal-600/30"
            disabled
          />
        </div>

        <div className="text-center mt-auto pt-8 border-t border-white/10">
          <p className="text-white/30 text-sm">© 2024 Saraya Solutions. All rights reserved.</p>
        </div>
      </div>
    </main>
  );
}
