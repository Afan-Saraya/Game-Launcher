'use client';

import LauncherHeader from '@/components/launcher/LauncherHeader';
import GameCard from '@/components/launcher/GameCard';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-[420px]">
        <LauncherHeader />
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-yellow-400" size={28} />
            <h1 className="text-3xl font-bold text-white">
              Play & Win
            </h1>
            <Sparkles className="text-yellow-400" size={28} />
          </div>
          <p className="text-white/60 text-sm">
            Spin, match, and win amazing prizes!
          </p>
        </div>
        
        <div className="space-y-4">
          <GameCard
            title="Wheel of Fortune"
            description="Spin the wheel for a chance to win coins and XP!"
            icon="🎡"
            route="/wheel"
          />
          
          <GameCard
            title="Memory Match"
            description="Match pairs to win coins and XP!"
            icon="🧠"
            route="/memory"
          />
          
          <GameCard
            title="Lucky Slots"
            description="Coming soon - Match symbols to win big!"
            icon="🎰"
            route="#"
            disabled
          />
          
          <GameCard
            title="Scratch Cards"
            description="Coming soon - Scratch and reveal prizes!"
            icon="🎫"
            route="#"
            disabled
          />
        </div>
        
        <p className="text-center text-white/30 text-xs mt-8">
          © 2024 Saraya Solutions
        </p>
      </div>
    </main>
  );
}
