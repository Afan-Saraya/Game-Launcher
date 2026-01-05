'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Zap, Clock, Trophy, Loader2, Coins, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MemoryGame from '@/components/games/memory/MemoryGame';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMemoryConfig, MemoryConfigDb } from '@/lib/supabase';

type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyDisplay {
  icon: React.ReactNode;
  color: string;
  description: string;
}

const difficultyDisplay: Record<Difficulty, DifficultyDisplay> = {
  easy: {
    icon: <Brain className="w-5 h-5 lg:w-6 lg:h-6" />,
    color: 'from-green-500 to-emerald-600',
    description: 'Perfect for beginners',
  },
  medium: {
    icon: <Zap className="w-5 h-5 lg:w-6 lg:h-6" />,
    color: 'from-yellow-500 to-orange-600',
    description: 'A balanced challenge',
  },
  hard: {
    icon: <Trophy className="w-5 h-5 lg:w-6 lg:h-6" />,
    color: 'from-red-500 to-pink-600',
    description: 'For memory masters',
  },
};

export default function MemoryPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [config, setConfig] = useState<MemoryConfigDb[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    const data = await fetchMemoryConfig();
    setConfig(data);
    setLoading(false);
  };

  const handleBack = () => {
    setSelectedDifficulty(null);
    setGameKey(prev => prev + 1);
  };

  const selectedConfig = config.find(c => c.difficulty === selectedDifficulty);

  if (selectedDifficulty && selectedConfig) {
    return (
      <MemoryGame
        key={gameKey}
        difficulty={selectedDifficulty}
        config={selectedConfig}
        onBack={handleBack}
        userName={user?.name}
        userId={user?.id}
      />
    );
  }

  if (loading) {
    return <LoadingScreen message="Loading memory game..." />;
  }

  return (
    <main className="min-h-screen lg:h-auto h-[100dvh] flex flex-col px-4 py-4 overflow-hidden">
      {/* Mobile Layout */}
      <div className="w-full max-w-[420px] mx-auto flex flex-col h-full lg:hidden">
        <header className="flex items-center justify-between w-full mb-4 flex-shrink-0">
          <button onClick={() => router.back()} className="text-white/70 p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-white">Memory Match</h1>
          <div className="w-10" />
        </header>

        <div className="text-center mb-4 flex-shrink-0">
          <div className="w-14 h-14 mx-auto mb-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Choose Difficulty</h2>
        </div>

        <div className="space-y-3 flex-shrink-0">
          {config.filter(c => c.is_active).map((c) => {
            const display = difficultyDisplay[c.difficulty as Difficulty];
            const pairs = Math.floor((c.grid_cols * c.grid_rows) / 2);
            return (
              <button
                key={c.id}
                onClick={() => setSelectedDifficulty(c.difficulty as Difficulty)}
                className="w-full prize-card rounded-xl p-4 border border-white/10 text-left transition-all duration-300 hover:scale-[1.02] hover:border-white/20 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${display.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {display.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white capitalize">{c.difficulty}</h3>
                    <p className="text-white/50 text-xs">{c.time_limit_seconds}s • {pairs} pairs</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm">{c.grid_cols}×{c.grid_rows}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-4 flex-shrink-0">
          <div className="p-3 liquid-glass rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium text-sm">How to Play</span>
            </div>
            <ul className="text-white/60 text-xs space-y-1">
              <li>• Memorize cards during preview</li>
              <li>• Flip to find matching pairs</li>
              <li>• Match all before time runs out!</li>
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
          <h1 className="text-2xl font-bold text-white">Memory Match</h1>
          <div className="w-24" />
        </header>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">Choose Your Challenge</h2>
          <p className="text-white/60 text-lg">Test your memory and win rewards!</p>
        </div>

        {/* Difficulty Cards Grid */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {config.filter(c => c.is_active).map((c) => {
            const display = difficultyDisplay[c.difficulty as Difficulty];
            const pairs = Math.floor((c.grid_cols * c.grid_rows) / 2);
            return (
              <button
                key={c.id}
                onClick={() => setSelectedDifficulty(c.difficulty as Difficulty)}
                className="prize-card rounded-2xl p-6 border border-white/10 text-left transition-all duration-300 hover:scale-[1.03] hover:border-white/20 group"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${display.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {display.icon}
                </div>
                <h3 className="text-2xl font-bold text-white capitalize mb-1">{c.difficulty}</h3>
                <p className="text-white/50 text-sm mb-4">{display.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Grid Size</span>
                    <span className="text-white font-medium">{c.grid_cols}×{c.grid_rows}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Pairs</span>
                    <span className="text-white font-medium">{pairs}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Time Limit</span>
                    <span className="text-white font-medium">{c.time_limit_seconds}s</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Coins size={16} className="text-yellow-400" />
                    <span className="text-yellow-400 font-medium">+{c.coins_reward}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={16} className="text-cyan-400" />
                    <span className="text-cyan-400 font-medium">+{c.xp_reward} XP</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* How to Play */}
        <div className="max-w-2xl mx-auto p-6 liquid-glass rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-purple-400" />
            <span className="text-white font-bold text-lg">How to Play</span>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">1</div>
              <p className="text-white font-medium mb-1">Memorize</p>
              <p className="text-white/50 text-sm">Study the cards during the preview phase</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">2</div>
              <p className="text-white font-medium mb-1">Match</p>
              <p className="text-white/50 text-sm">Flip cards to find matching pairs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">3</div>
              <p className="text-white font-medium mb-1">Win</p>
              <p className="text-white/50 text-sm">Complete before time runs out!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
