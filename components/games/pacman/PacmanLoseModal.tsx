'use client';

import { useEffect, useState } from 'react';
import { Clock, Target, RotateCcw, Home, XCircle } from 'lucide-react';
import { savePacmanAward } from '@/lib/supabase';

interface PacmanLoseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryAgain: () => void;
  onBack: () => void;
  score: number;
  dotsEaten: number;
  totalDots: number;
  ghostsEaten: number;
  timeSeconds: number;
  difficulty: 'easy' | 'medium' | 'hard';
  userId?: string;
  userName?: string;
}

export default function PacmanLoseModal({
  isOpen,
  onClose,
  onTryAgain,
  onBack,
  score,
  dotsEaten,
  totalDots,
  ghostsEaten,
  timeSeconds,
  difficulty,
  userId,
  userName,
}: PacmanLoseModalProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen && !saved && userId) {
      savePacmanAward({
        userId,
        userName,
        difficulty,
        score,
        dotsEaten,
        totalDots,
        ghostsEaten,
        timeSeconds,
        isWin: false,
        coinsAwarded: 0,
        xpAwarded: 0,
      });
      setSaved(true);
    }
  }, [isOpen, saved, userId, userName, difficulty, score, dotsEaten, totalDots, ghostsEaten, timeSeconds]);

  useEffect(() => {
    if (!isOpen) setSaved(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const dotsRemaining = totalDots - dotsEaten;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-sm animate-in zoom-in-95 duration-300 overflow-hidden rounded-3xl">
        <div className="bg-gradient-to-br from-red-500 via-rose-600 to-pink-700 p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <XCircle className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Game Over!</h2>
          <p className="text-white/80 text-sm">{difficultyLabel} Mode</p>
        </div>

        <div className="bg-[#1a1030] p-5">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <Target className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{score}</p>
              <p className="text-white/50 text-xs">Score</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <Clock className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{dotsRemaining}</p>
              <p className="text-white/50 text-xs">Dots Left</p>
            </div>
          </div>

          <p className="text-center text-white/50 text-sm mb-5">
            {dotsRemaining > 0 ? "The ghosts got you! Try again! 👻" : "Time ran out! Be faster next time! ⏰"}
          </p>

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
