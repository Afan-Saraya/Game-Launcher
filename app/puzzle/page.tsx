'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Puzzle, Zap, Trophy, Clock, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PuzzleGame from '@/components/games/puzzle/PuzzleGame';
import LoadingScreen from '@/components/shared/LoadingScreen';
import AuthModal from '@/components/shared/AuthModal';
import RecentWinnersMenu from '@/components/shared/RecentWinnersMenu';
import { useAuth } from '@/contexts/AuthContext';
import { getTodayPuzzlePlayCount, getPuzzleTimeUntilReset, fetchRecentPuzzleWinners } from '@/lib/supabase';

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

const MAX_DAILY_PLAYS = 3;

export default function PuzzlePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [playsUsed, setPlaysUsed] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  const playsRemaining = MAX_DAILY_PLAYS - playsUsed;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadPlayCount();
    }
  }, [user?.id]);

  useEffect(() => {
    const updateTimer = () => {
      setTimeUntilReset(getPuzzleTimeUntilReset());
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadPlayCount = async () => {
    if (!user?.id) return;
    const count = await getTodayPuzzlePlayCount(user.id);
    setPlaysUsed(count);
  };

  const handleSelectDifficulty = (diff: Difficulty) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    if (playsRemaining <= 0) return;
    setSelectedDifficulty(diff);
  };

  const handleBack = () => {
    setSelectedDifficulty(null);
    setGameKey(prev => prev + 1);
    // Refresh play count when returning from game
    if (user?.id) {
      loadPlayCount();
    }
    setRefreshTrigger(prev => prev + 1);
  };

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  if (isLoading || authLoading) {
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
          <RecentWinnersMenu gameType="puzzle" fetchWinners={fetchRecentPuzzleWinners} refreshTrigger={refreshTrigger} />
        </header>

        <div className="text-center mb-4 flex-shrink-0">
          <div className="w-14 h-14 mx-auto mb-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Puzzle className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Choose Difficulty</h2>
        </div>

        {/* Daily Plays Counter */}
        {isAuthenticated && (
          <div className="flex items-center justify-center gap-4 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <div className="flex gap-1">
                {[...Array(MAX_DAILY_PLAYS)].map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i < playsRemaining ? 'bg-green-400' : 'bg-white/20'}`} />
                ))}
              </div>
              <span className="text-white/70 text-sm ml-1">{playsRemaining} play{playsRemaining !== 1 ? 's' : ''} left</span>
            </div>
            {playsRemaining === 0 && (
              <div className="flex items-center gap-1.5 text-white/50 text-sm">
                <Clock size={14} />
                <span>{formatTime(timeUntilReset.hours)}:{formatTime(timeUntilReset.minutes)}:{formatTime(timeUntilReset.seconds)}</span>
              </div>
            )}
          </div>
        )}

        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg">
              <LogIn size={20} />Sign in to Play
            </button>
          </div>
        ) : playsRemaining > 0 ? (
          <div className="space-y-3 flex-shrink-0">
            {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => {
              const config = difficultyConfig[diff];
              return (
                <button
                  key={diff}
                  onClick={() => handleSelectDifficulty(diff)}
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
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center p-6 bg-white/5 border border-white/10 rounded-2xl">
              <Clock size={32} className="mx-auto text-white/40 mb-3" />
              <p className="text-white/60 font-medium mb-2">No plays remaining today</p>
              <p className="text-white/40 text-sm flex items-center justify-center gap-2">
                <Clock size={14} />
                Resets in {formatTime(timeUntilReset.hours)}:{formatTime(timeUntilReset.minutes)}:{formatTime(timeUntilReset.seconds)}
              </p>
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 flex-shrink-0">
          <div className="p-3 liquid-glass rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-white font-medium text-sm">How to Play</span>
            </div>
            <ul className="text-white/60 text-xs space-y-1">
              <li>• Select pieces and place them on the board</li>
              <li>• Complete the puzzle to win rewards</li>
              <li>• Faster completion = more rewards!</li>
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
          <RecentWinnersMenu gameType="puzzle" fetchWinners={fetchRecentPuzzleWinners} refreshTrigger={refreshTrigger} />
        </header>

        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Puzzle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">Choose Your Challenge</h2>
          <p className="text-white/60 text-lg">Piece together the image as fast as you can!</p>
        </div>

        {/* Daily Plays Counter */}
        {isAuthenticated && (
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex gap-1.5">
                {[...Array(MAX_DAILY_PLAYS)].map((_, i) => (
                  <div key={i} className={`w-4 h-4 rounded-full transition-colors ${i < playsRemaining ? 'bg-green-400' : 'bg-white/20'}`} />
                ))}
              </div>
              <span className="text-white/70 text-base ml-2">{playsRemaining} play{playsRemaining !== 1 ? 's' : ''} remaining today</span>
            </div>
            {playsRemaining === 0 && (
              <div className="flex items-center gap-2 text-white/50">
                <Clock size={18} />
                <span className="text-lg">{formatTime(timeUntilReset.hours)}:{formatTime(timeUntilReset.minutes)}:{formatTime(timeUntilReset.seconds)}</span>
              </div>
            )}
          </div>
        )}

        {!isAuthenticated ? (
          <div className="flex justify-center mb-12">
            <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-2xl hover:opacity-90 transition-all shadow-lg hover:scale-105">
              <LogIn size={24} />Sign in to Play
            </button>
          </div>
        ) : playsRemaining > 0 ? (
          <div className="grid grid-cols-3 gap-6 mb-12">
            {(Object.keys(difficultyConfig) as Difficulty[]).map((diff) => {
              const config = difficultyConfig[diff];
              return (
                <button
                  key={diff}
                  onClick={() => handleSelectDifficulty(diff)}
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
        ) : (
          <div className="flex justify-center mb-12">
            <div className="text-center p-8 bg-white/5 border border-white/10 rounded-2xl">
              <Clock size={48} className="mx-auto text-white/40 mb-4" />
              <p className="text-white/60 font-medium text-xl mb-2">No plays remaining today</p>
              <p className="text-white/40 flex items-center justify-center gap-2">
                <Clock size={16} />
                Resets in {formatTime(timeUntilReset.hours)}:{formatTime(timeUntilReset.minutes)}:{formatTime(timeUntilReset.seconds)}
              </p>
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto p-6 liquid-glass rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-orange-400" />
            <span className="text-white font-bold text-lg">How to Play</span>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl">1</div>
              <p className="text-white font-medium mb-1">Select</p>
              <p className="text-white/50 text-sm">Pick pieces from the tray</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl">2</div>
              <p className="text-white font-medium mb-1">Place</p>
              <p className="text-white/50 text-sm">Put them on the board</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl">3</div>
              <p className="text-white font-medium mb-1">Win</p>
              <p className="text-white/50 text-sm">Complete fast for more rewards!</p>
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </main>
  );
}
