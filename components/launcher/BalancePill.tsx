'use client';

import { BalancePillProps } from '@/lib/types';
import { Coins, Sparkles } from 'lucide-react';

export default function BalancePill({ balance, xp }: BalancePillProps) {
  const formatNumber = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return (
    <div className="flex items-center gap-2">
      {/* Coins */}
      <div className="flex items-center gap-1.5 bg-[#2a1f4e] rounded-full px-3 py-1.5">
        <Coins className="w-4 h-4 text-yellow-400" />
        <span className="text-white font-semibold text-sm">{formatNumber(balance)}</span>
      </div>
      
      {/* XP */}
      {xp !== undefined && (
        <div className="flex items-center gap-1.5 bg-[#1f2a4e] rounded-full px-3 py-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-white font-semibold text-sm">{formatNumber(xp)}</span>
        </div>
      )}
    </div>
  );
}
