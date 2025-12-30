'use client';

import { PrizeModalProps } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import iconMap from '@/components/shared/IconMap';
import { Coins, Sparkles } from 'lucide-react';

export default function PrizeModal({ isOpen, prize, onClose }: PrizeModalProps) {
  if (!prize) return null;

  const IconComponent = iconMap[prize.icon];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center pt-4">
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
          style={{ background: `linear-gradient(135deg, ${prize.color}, ${prize.color}99)` }}
        >
          {IconComponent && <IconComponent className="w-10 h-10 text-white" strokeWidth={2} />}
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{prize.label}</h2>
        <p className="text-white/60 mb-4">{prize.description}</p>
        
        {/* Rewards */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {prize.coins_reward > 0 && (
            <div className="flex items-center gap-1.5 bg-yellow-500/20 rounded-full px-3 py-1.5">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-semibold text-sm">+{prize.coins_reward}</span>
            </div>
          )}
          {prize.xp_reward > 0 && (
            <div className="flex items-center gap-1.5 bg-cyan-500/20 rounded-full px-3 py-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-semibold text-sm">+{prize.xp_reward} XP</span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-white/40 border-t border-white/10 pt-4">
          Spin the wheel for a chance to win this prize!
        </div>
      </div>
    </Modal>
  );
}
