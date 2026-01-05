'use client';

import { useEffect, useState } from 'react';
import { Trophy, Coins, Sparkles, Clock, Target, RotateCcw, Home } from 'lucide-react';
import { saveMemoryAward } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  onBack: () => void;
  moves: number;
  time: number;
  difficulty: 'easy' | 'medium' | 'hard';
  coins: number;
  xp: number;
  userName?: string;
  userId?: string;
  pairsMatched: number;
  totalPairs: number;
}

export default function WinModal({
  isOpen,
  onClose,
  onPlayAgain,
  onBack,
  moves,
  time,
  difficulty,
  coins,
  xp,
  userName,
  userId,
  pairsMatched,
  totalPairs,
}: WinModalProps) {
  const [saved, setSaved] = useState(false);
  const { updateLocalBalance } = useAuth();

  useEffect(() => {
    if (isOpen && !saved && userId) {
      saveMemoryAward({
        userId,
        userName,
        difficulty,
        moves,
        timeSeconds: time,
        pairsMatched,
        totalPairs,
        isWin: true,
        coinsAwarded: coins,
        xpAwarded: xp,
      });
      updateLocalBalance(coins, xp);
      fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: userId, coins, xp }),
      }).catch(console.error);
      setSaved(true);
    }
  }, [isOpen, saved, userId, userName, difficulty, moves, time, pairsMatched, totalPairs, coins, xp, updateLocalBalance]);

  useEffect(() => {
    if (!isOpen) setSaved(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const optimalMoves = { easy: 12, medium: 18, hard: 28 }[difficulty];
  const stars = moves <= optimalMoves ? 3 : moves <= optimalMoves * 1.5 ? 2 : 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-sm animate-in zoom-in-95 duration-300 overflow-hidden rounded-3xl">
        {/* Header with gradient and icon */}
        <div className="bg-gradient-to-br from-yellow-500 via-orange-500 to-amber-600 p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Trophy className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Victory!</h2>
          <p className="text-white/80 text-sm">{difficultyLabel} Mode Completed</p>
          
          <div className="flex items-center justify-center gap-1 mt-3">
            {[1, 2, 3].map(i => (
              <span key={i} className={`text-2xl ${i <= stars ? 'drop-shadow-lg' : 'opacity-30'}`}>⭐</span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#1a1030] p-5">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <Target className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{moves}</p>
              <p className="text-white/50 text-xs">Moves</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{formatTime(time)}</p>
              <p className="text-white/50 text-xs">Time</p>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 mb-5 border border-yellow-500/20">
            <p className="text-white/60 text-xs text-center mb-2">Rewards Earned</p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-lg">+{coins}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 font-bold text-lg">+{xp} XP</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={onBack} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors border border-white/10">
              <Home size={18} />
              <span>Menu</span>
            </button>
            <button onClick={onPlayAgain} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
              <RotateCcw size={18} />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
