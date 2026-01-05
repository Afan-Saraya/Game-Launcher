'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Puzzle, Zap, Trophy, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PuzzleGame from '@/components/games/puzzle/PuzzleGame';
import LoadingScreen from '@/components/shared/LoadingScreen';

type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyConfig {
  gridSize: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  easy: {
    gridSize: 3,
    icon: <Puzzle className="w-5 h-5 lg:w-6 lg:h-6" />,
    color: 'from-green-500 to-emerald-600',
    description: '3×3 grid - 9 pieces',
  },
  medium: {
    gridSize: 4,
    icon: <Zap className="w-5 h-5 lg:w-6 lg:h-6" />,
    color: 'from-yellow-500 to-orange-600',
    description: '4×4 grid - 16 pieces',
  },
  hard: {
    gridSize: 5,
    icon: <Trophy className="w-5 h-5 lg:w-6 lg:h-6" />,
    color: 'from-red-500 to-pink-600',
    description: '5×5 grid - 25 pieces',
  },
};

// Puzzle image to preload
const PUZZLE_IMAGE = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=600&fit=crop';

export default function PuzzlePage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreloaded, setImagePreloaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Preload the puzzle image during loading screen
    const img = new Image();
    img.onload = () => setImagePreloaded(true);
    img.onerror = () => setImagePreloaded(true); // Continue even if image fails
    img.src = PUZZLE_IMAGE;
  }, []);

  useEffect(() => {
    // Show content once image is preloaded
    if (imagePreloaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [imagePreloaded]);

  const handleBack = () => {
    setSelectedDifficulty(null);
    setGameKey(prev => prev + 1);
  };

  if (isLoading) {
    return <LoadingScreen message="Loading puzzle..." />;
  }

  if (selectedDifficulty) {
    return (
      <PuzzleGame
        key={gameKey}
        difficulty={selectedDifficulty}
        gridSize={difficultyConfig[selectedDifficulty].gridSize}
        onBack={handleBack}
      />
    );
  }

  return (
    <main className="min-h-screen lg:h-auto h-[100dvh] flex flex-col px-4 py-4 overflow-hidden">
      {/* Mobile Layout */}
      <div className="w-full max-w-[420px] mx-auto flex flex-col h-full lg:hidden">
        <header className="flex items-center justify-between w-full mb-4 flex-shrink-0">
          <button onClick={() => router.back()} className="text-white/70 p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-white">Puzzle Challenge</h1>
          <div className="w-10" />
        </header>

        <div className="text-center mb-4 flex-shrink-0">
          <div className="w-14 h-14 mx-auto mb-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Puzzle className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Choose Difficulty</h2>
        </div>

        <div className="space-y-3 flex-shrink-0">
          {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => {
            const config = difficultyConfig[diff];
            return (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className="w-full prize-card rounded-xl p-4 border border-white/10 text-left transition-all duration-300 hover:scale-[1.02] hover:border-white/20 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white capitalize">{diff}</h3>
                    <p className="text-white/50 text-xs">{config.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm">{config.gridSize}×{config.gridSize}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-4 flex-shrink-0">
          <div className="p-3 liquid-glass rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-white font-medium text-sm">How to Play</span>
            </div>
            <ul className="text-white/60 text-xs space-y-1">
              <li>• Drag pieces to complete the image</li>
              <li>• Tap a piece to auto-place it</li>
              <li>• Use preview to see the full image</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col w-full max-w-5xl mx-auto py-8">
        <header className="flex items-center justify-between w-full mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-white/70 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Puzzle Challenge</h1>
          <div className="w-24" />
        </header>

        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Puzzle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">Choose Your Challenge</h2>
          <p className="text-white/60 text-lg">Piece together the image as fast as you can!</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12">
          {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => {
            const config = difficultyConfig[diff];
            return (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className="prize-card rounded-2xl p-6 border border-white/10 text-left transition-all duration-300 hover:scale-[1.03] hover:border-white/20 group"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {config.icon}
                </div>
                <h3 className="text-2xl font-bold text-white capitalize mb-1">{diff}</h3>
                <p className="text-white/50 text-sm mb-4">{config.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Grid Size</span>
                    <span className="text-white font-medium">{config.gridSize}×{config.gridSize}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Pieces</span>
                    <span className="text-white font-medium">{config.gridSize * config.gridSize}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-orange-400" />
                    <span className="text-orange-400 font-medium">Time Challenge</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="max-w-2xl mx-auto p-6 liquid-glass rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-orange-400" />
            <span className="text-white font-bold text-lg">How to Play</span>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl">1</div>
              <p className="text-white font-medium mb-1">Drag</p>
              <p className="text-white/50 text-sm">Pick up pieces from the tray</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl">2</div>
              <p className="text-white font-medium mb-1">Place</p>
              <p className="text-white/50 text-sm">Drop them on the board</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl">3</div>
              <p className="text-white font-medium mb-1">Complete</p>
              <p className="text-white/50 text-sm">Finish the image!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
