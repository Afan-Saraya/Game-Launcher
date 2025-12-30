'use client';

import { PrizeListProps } from '@/lib/types';
import { ChevronRight, Info, Coins, Sparkles } from 'lucide-react';
import iconMap from '@/components/shared/IconMap';

export default function PrizeList({ prizes, onPrizeClick }: PrizeListProps) {
  return (
    <div className="mt-8 w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Possible Prizes</h3>
        <Info className="w-5 h-5 text-white/40" />
      </div>
      <div className="liquid-glass rounded-3xl overflow-hidden">
        {prizes.map((prize) => {
          const IconComponent = iconMap[prize.icon];
          return (
            <button
              key={prize.id}
              onClick={() => onPrizeClick(prize)}
              className="liquid-glass-item w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${prize.color}, ${prize.color}99)` }}
                >
                  {IconComponent && <IconComponent className="w-5 h-5 text-white" strokeWidth={2.5} />}
                </div>
                <div className="text-left">
                  <span className="text-white font-medium block">{prize.label}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {prize.coins_reward > 0 && (
                      <span className="flex items-center gap-1 text-yellow-400 text-xs">
                        <Coins size={10} />+{prize.coins_reward}
                      </span>
                    )}
                    {prize.xp_reward > 0 && (
                      <span className="flex items-center gap-1 text-cyan-400 text-xs">
                        <Sparkles size={10} />+{prize.xp_reward}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="text-white/30" size={20} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
