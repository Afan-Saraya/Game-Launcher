'use client';

import { SpinButtonProps } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function SpinButton({ cost, balance, isSpinning, onSpin }: SpinButtonProps) {
  const isDisabled = (cost > 0 && balance < cost) || isSpinning;

  return (
    <button
      onClick={onSpin}
      disabled={isDisabled}
      className={`
        w-full max-w-xs mx-auto py-3.5 px-6 rounded-full font-semibold text-base
        flex items-center justify-center gap-3
        transition-all duration-200
        ${isDisabled 
          ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60' 
          : 'spin-button-gradient text-white hover:opacity-90 active:scale-95'
        }
      `}
    >
      {isSpinning ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={18} />
          Spinning...
        </span>
      ) : cost > 0 ? (
        <>
          <span>Spin for</span>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
            <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
              <span className="text-[8px] font-bold text-yellow-900">●</span>
            </div>
            <span className="font-bold">{cost}</span>
          </div>
        </>
      ) : (
        <span>🎡 Spin the Wheel!</span>
      )}
    </button>
  );
}
