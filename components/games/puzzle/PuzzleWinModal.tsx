'use client';

import { Trophy, Clock, Target, RotateCcw, Home } from 'lucide-react';

interface PuzzleWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  onBack: () => void;
  moves: number;
  time: number;
  difficulty: 'easy' | 'medium' | 'hard';
  gridSize: number;
}

export default function PuzzleWinModal({
  isOpen,
  onClose,
  onPlayAgain,
  onBack,
  moves,
  time,
  difficulty,
  gridSize,
}: PuzzleWinModalProps) {
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  
  // Calculate stars based on moves (optimal moves for sliding puzzle is complex, use approximation)
  const optimalMoves = { easy: 30, medium: 80, hard: 150 }[difficulty];
  const stars = moves <= optimalMoves ? 3 : moves <= optimalMoves * 1.5 ? 2 : 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-sm animate-in zoom-in-95 duration-300 overflow-hidden rounded-3xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Trophy className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Puzzle Solved!</h2>
          <p className="text-white/80 text-sm">{difficultyLabel} Mode • {gridSize}×{gridSize}</p>
          
          <div className="flex items-center justify-center gap-1 mt-3">
            {[1, 2, 3].map(i => (
              <span key={i} className={`text-2xl ${i <= stars ? 'drop-shadow-lg' : 'opacity-30'}`}>⭐</span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#1a1030] p-5">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <Clock className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{formatTime(time)}</p>
              <p className="text-white/50 text-xs">Time</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
              <Target className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-white font-bold text-lg">{moves}</p>
              <p className="text-white/50 text-xs">Moves</p>
            </div>
          </div>

          <p className="text-center text-white/50 text-sm mb-5">Great job solving the puzzle! 🧩</p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={onBack} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors border border-white/10">
              <Home size={18} />
              <span>Menu</span>
            </button>
            <button onClick={onPlayAgain} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity">
              <RotateCcw size={18} />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
