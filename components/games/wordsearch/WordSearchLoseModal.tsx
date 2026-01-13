'use client';

import { useEffect, useState } from 'react';
import { Clock, Target, RotateCcw, Home, XCircle } from 'lucide-react';
import { saveWordSearchAward } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface WordSearchLoseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryAgain: () => void;
  onBack: () => void;
  wordsFound: number;
  totalWords: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeSeconds: number;
  userId?: string;
  userName?: string;
}

export default function WordSearchLoseModal({
  isOpen,
  onClose,
  onTryAgain,
  onBack,
  wordsFound,
  totalWords,
  difficulty,
  timeSeconds,
  userId,
  userName,
}: WordSearchLoseModalProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen && !saved && userId) {
      saveWordSearchAward({
        userId,
        userName,
        difficulty,
        wordsFound,
        totalWords,
        timeSeconds,
        isWin: false,
        coinsAwarded: 0,
        xpAwarded: 0,
      });
      setSaved(true);
    }
  }, [isOpen, saved, userId, userName, difficulty, wordsFound, totalWords, timeSeconds]);

  useEffect(() => {
    if (!isOpen) setSaved(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const progress = Math.round((wordsFound / totalWords) * 100);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-sm animate-in zoom-in-95 duration-300 overflow-hidden rounded-3xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <XCircle className="w-9 h-9 text-white/80" />
          </div>
          <h2 className="text-2xl font-bold text-white">Time's Up!</h2>
          <p className="text-white/60 text-sm">{difficultyLabel} Mode</p>
        </div>

        {/* Content */}
        <div className="bg-[#1a1030] p-5">
          {/* Stats */}
          <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <span className="text-white/60">Words Found</span>
              </div>
              <span className="text-white font-bold">{wordsFound}/{totalWords}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-white/40 text-xs text-center mt-2">{progress}% complete</p>
          </div>

          <p className="text-white/50 text-sm text-center mb-5">
            You found {wordsFound} out of {totalWords} words. Try again to find them all!
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={onBack} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors border border-white/10">
              <Home size={18} />
              <span>Menu</span>
            </button>
            <button onClick={onTryAgain} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
              <RotateCcw size={18} />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
