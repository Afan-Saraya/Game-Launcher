'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Zap, Clock, Trophy, Loader2 } from 'lucide-react';
import Link from 'next/link';
import MemoryGame from '@/components/games/memory/MemoryGame';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMemoryConfig, MemoryConfigDb } from '@/lib/supabase';

type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultyDisplay {
  icon: React.ReactNode;
  color: string;
}

const difficultyDisplay: Record<Difficulty, DifficultyDisplay> = {
  easy: {
    icon: <Brain className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-600',
  },
  medium: {
    icon: <Zap className="w-5 h-5" />,
    color: 'from-yellow-500 to-orange-600',
  },
  hard: {
    icon: <Trophy className="w-5 h-5" />,
    color: 'from-red-500 to-pink-600',
  },
};

export default function MemoryPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [config, setConfig] = useState<MemoryConfigDb[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
    return (
      <main className="h-[100dvh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </main>
    );
  }

  return (
    <main className="h-[100dvh] flex flex-col px-4 py-4 overflow-hidden">
      <div className="w-full max-w-[420px] mx-auto flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between w-full mb-4 flex-shrink-0">
          <Link href="/" className="text-white/70 p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-white">Memory Match</h1>
          <div className="w-10" />
        </header>

        {/* Title - Compact */}
        <div className="text-center mb-4 flex-shrink-0">
          <div className="w-14 h-14 mx-auto mb-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Choose Difficulty</h2>
        </div>

        {/* Difficulty Cards - Flexible */}
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

        {/* Info - Takes remaining space */}
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
    </main>
  );
}
