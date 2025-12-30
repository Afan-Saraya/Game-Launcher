'use client';

import { useRouter } from 'next/navigation';
import { GameCardProps } from '@/lib/types';
import { Play, Lock } from 'lucide-react';

export default function GameCard({ title, description, icon, route, disabled }: GameCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (disabled) return;
    router.push(route);
  };

  return (
    <div 
      onClick={handleClick}
      className={`prize-card rounded-2xl p-5 border border-white/10 transition-all duration-300 ${
        disabled 
          ? 'opacity-60 cursor-not-allowed' 
          : 'cursor-pointer hover:scale-[1.02] hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="text-4xl mb-3">{icon}</div>
        {disabled && (
          <span className="px-2 py-1 text-xs font-medium bg-white/10 text-white/50 rounded-full">
            Coming Soon
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-white/50 text-sm mb-4">{description}</p>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-opacity ${
          disabled 
            ? 'bg-white/10 text-white/40 cursor-not-allowed' 
            : 'spin-button-gradient text-white hover:opacity-90'
        }`}
      >
        {disabled ? <Lock size={16} /> : <Play size={16} />}
        {disabled ? 'Locked' : 'Play'}
      </button>
    </div>
  );
}
