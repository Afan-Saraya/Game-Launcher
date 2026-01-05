'use client';

import { useEffect, useState } from 'react';
import { Clock, Target, RotateCcw, Home, XCircle } from 'lucide-react';
import { saveMemoryAward } from '@/lib/supabase';

interface LoseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryAgain: () => void;
  onBack: () => void;
  moves: number;
  matches: number;
  totalPairs: number;
  difficulty: 'easy' | 'medium' | 'hard';
  userId?: string;
  userName?: string;
  timeSeconds: number;
}

export default function LoseModal({
  isOpen,
  onClose,
  onTryAgain,
  onBack,
  moves,
  matches,
  totalPairs,
  difficulty,
  userId,
  userName,
  timeSeconds,
}: LoseModalProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen && !saved && userId) {
      saveMemoryAward({
        userId,
        userName,
        difficulty,
        moves,
        timeSeconds,
        pairsMatched: matches,
        totalPairs,
        isWin: false,
        coinsAwarded: 0,
        xpAwarded: 0,
      });
      setSaved(true);
    }
  }, [isOpen, saved, userId, userName, difficulty, moves, timeSeconds, matches, totalPairs]);

  useEffect(() => {
    if (!isOpen) setSaved(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const progress = Math.round((matches / totalPairs) * 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-sm animate-in zoom-in-95 duration-300 overflow-hidden rounded-3xl">
        {/* Header with gradient and icon */}
        <div className="bg-gradient-to-br from-red-500 via-rose-600 to-pink-700 p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <XCircle className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Time's Up!</h2>
          <p className="text-white/80 text-sm">{difficultyLabel} Mode</p>
        </div>

        {/* Content */}
        <div className="bg-[#1a1030] p-5">
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Progress</span>
              <span className="text-white font-medium">{matches}/{totalPairs} pairs</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-white/40 text-xs text-center mt-2">{progress}% complete</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <Target className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{moves}</p>
              <p className="text-white/50 text-xs">Moves</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <Clock className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{totalPairs - matches}</p>
              <p className="text-white/50 text-xs">Remaining</p>
            </div>
          </div>

          <p className="text-center text-white/50 text-sm mb-5">Don't give up! Try again! 💪</p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={onBack} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors border border-white/10">
              <Home size={18} />
              <span>Menu</span>
            </button>
            <button onClick={onTryAgain} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
              <RotateCcw size={18} />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
