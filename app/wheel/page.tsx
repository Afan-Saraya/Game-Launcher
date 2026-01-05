'use client';

import { useState, useCallback, useEffect } from 'react';
import GameHeader from '@/components/games/wheel/GameHeader';
import Wheel from '@/components/games/wheel/Wheel';
import SpinButton from '@/components/games/wheel/SpinButton';
import PrizeList from '@/components/games/wheel/PrizeList';
import WinModal from '@/components/games/wheel/WinModal';
import PrizeModal from '@/components/games/wheel/PrizeModal';
import AuthModal from '@/components/shared/AuthModal';
import { PRIZES as DEFAULT_PRIZES, GAME_CONFIG, calculateSpinRotation, selectRandomPrize } from '@/lib/config';
import { Prize } from '@/lib/types';
import { saveAward, fetchPrizes, getTodaySpinCount, getTimeUntilReset } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogIn, Clock, Trophy, Coins, Sparkles } from 'lucide-react';
import LoadingScreen from '@/components/shared/LoadingScreen';

const MAX_DAILY_SPINS = 3;

export default function WheelGame() {
  const { user, isAuthenticated, isLoading: authLoading, updateLocalBalance } = useAuth();
  
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [viewingPrize, setViewingPrize] = useState<Prize | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [spinsUsed, setSpinsUsed] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const balance = user?.coins ?? GAME_CONFIG.initialBalance;
  const xp = user?.xp ?? GAME_CONFIG.initialXp;
  const spinsRemaining = MAX_DAILY_SPINS - spinsUsed;

  useEffect(() => {
    loadPrizes();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadSpinCount();
    }
  }, [user?.id]);

  useEffect(() => {
    const updateTimer = () => {
      setTimeUntilReset(getTimeUntilReset());
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadPrizes = async () => {
    setLoading(true);
    const dbPrizes = await fetchPrizes();
    if (dbPrizes.length > 0) {
      setPrizes(dbPrizes);
    } else {
      setPrizes(DEFAULT_PRIZES);
    }
    setLoading(false);
  };

  const loadSpinCount = async () => {
    if (!user?.id) return;
    const count = await getTodaySpinCount(user.id);
    setSpinsUsed(count);
  };

  const handleSpin = useCallback(async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (spinsRemaining <= 0 || isSpinning || prizes.length === 0) return;

    setIsSpinning(true);
    setSpinsUsed(prev => prev + 1);

    const prize = selectRandomPrize(prizes);
    const prizeIndex = prizes.findIndex(p => p.id === prize.id);
    
    const newRotation = rotation + calculateSpinRotation(prizeIndex, prizes.length);
    setRotation(newRotation);
    setSelectedPrize(prize);

    await saveAward({
      visitorId: user?.id || 'anonymous',
      userName: user?.name,
      prizeId: prize.id,
      prizeLabel: prize.label,
      prizeIcon: prize.icon,
      prizeColor: prize.color,
      coinsAwarded: prize.coins_reward,
      xpAwarded: prize.xp_reward,
    });

    if (user?.id) {
      try {
        await fetch('/api/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: user.id,
            coins: prize.coins_reward,
            xp: prize.xp_reward,
          }),
        });
      } catch (error) {
        console.error('Failed to award to central account:', error);
      }
    }

    setTimeout(() => {
      setIsSpinning(false);
      setIsWinModalOpen(true);
      updateLocalBalance(prize.coins_reward, prize.xp_reward);
      setRefreshTrigger(prev => prev + 1);
    }, GAME_CONFIG.spinDuration);
  }, [spinsRemaining, isSpinning, rotation, user, prizes, isAuthenticated, updateLocalBalance]);

  const handlePrizeClick = (prize: Prize) => {
    if (isWinModalOpen) return;
    setViewingPrize(prize);
    setIsPrizeModalOpen(true);
  };

  if (loading || authLoading) {
    return <LoadingScreen message="Loading wheel..." />;
  }

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <main className="min-h-screen flex flex-col items-center overflow-x-hidden">
      {/* Mobile Layout */}
      <div className="w-full lg:hidden">
        <div className="w-full max-w-[420px] mx-auto px-4 py-6">
          <GameHeader balance={balance} xp={xp} refreshTrigger={refreshTrigger} />
          <h1 className="text-2xl font-bold text-white text-center mb-4">Win Prizes!</h1>
        </div>

        <div className="w-full max-w-[420px] mx-auto">
          <Wheel prizes={prizes} rotation={rotation} isSpinning={isSpinning} size="normal" />
        </div>

        <div className="w-full max-w-[420px] mx-auto px-4 pb-8">
          {isAuthenticated && (
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <div className="flex gap-1">
                  {[...Array(MAX_DAILY_SPINS)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i < spinsRemaining ? 'bg-green-400' : 'bg-white/20'}`} />
                  ))}
                </div>
                <span className="text-white/70 text-sm ml-1">{spinsRemaining} spin{spinsRemaining !== 1 ? 's' : ''} left</span>
              </div>
              {spinsRemaining === 0 && (
                <div className="flex items-center gap-1.5 text-white/50 text-sm">
                  <Clock size={14} />
                  <span>{formatTime(timeUntilReset.hours)}:{formatTime(timeUntilReset.minutes)}:{formatTime(timeUntilReset.seconds)}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center mt-2 mb-2">
            {!isAuthenticated ? (
              <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg">
                <LogIn size={20} />Sign in to Play
              </button>
            ) : spinsRemaining > 0 ? (
              <SpinButton cost={0} balance={999999} isSpinning={isSpinning} onSpin={handleSpin} />
            ) : (
              <div className="flex flex-col items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl">
                <span className="text-white/60 font-medium">No spins remaining</span>
                <span className="text-white/40 text-sm flex items-center gap-1"><Clock size={14} />Resets at 00:00 CET</span>
              </div>
            )}
          </div>
          <PrizeList prizes={prizes} onPrizeClick={handlePrizeClick} />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col w-full max-w-7xl px-8 py-6">
        <GameHeader balance={balance} xp={xp} refreshTrigger={refreshTrigger} />
        
        <div className="flex gap-12 mt-8">
          {/* Left Side - Wheel */}
          <div className="flex-1 flex flex-col items-center">
            <h1 className="text-4xl font-bold text-white text-center mb-6">Wheel of Fortune</h1>
            
            <div className="w-full max-w-[600px]">
              <Wheel prizes={prizes} rotation={rotation} isSpinning={isSpinning} size="large" />
            </div>

            {/* Spin Controls */}
            <div className="mt-6 flex flex-col items-center gap-4">
              {isAuthenticated && (
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex gap-1.5">
                      {[...Array(MAX_DAILY_SPINS)].map((_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-full transition-colors ${i < spinsRemaining ? 'bg-green-400' : 'bg-white/20'}`} />
                      ))}
                    </div>
                    <span className="text-white/70 text-base ml-2">{spinsRemaining} spin{spinsRemaining !== 1 ? 's' : ''} remaining</span>
                  </div>
                  {spinsRemaining === 0 && (
                    <div className="flex items-center gap-2 text-white/50">
                      <Clock size={18} />
                      <span className="text-lg">{formatTime(timeUntilReset.hours)}:{formatTime(timeUntilReset.minutes)}:{formatTime(timeUntilReset.seconds)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-2">
                {!isAuthenticated ? (
                  <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg hover:scale-105">
                    <LogIn size={24} />Sign in to Play
                  </button>
                ) : spinsRemaining > 0 ? (
                  <SpinButton cost={0} balance={999999} isSpinning={isSpinning} onSpin={handleSpin} />
                ) : (
                  <div className="flex flex-col items-center gap-2 px-10 py-5 bg-white/5 border border-white/10 rounded-2xl">
                    <span className="text-white/60 font-medium text-lg">No spins remaining</span>
                    <span className="text-white/40 flex items-center gap-2"><Clock size={16} />Resets at 00:00 CET</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Prizes & Info */}
          <div className="w-[380px] flex flex-col">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-white font-bold text-xl">{prizes.length}</p>
                <p className="text-white/50 text-sm">Prizes</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-white font-bold text-xl">{Math.max(...prizes.map(p => p.coins_reward))}</p>
                <p className="text-white/50 text-sm">Max Coins</p>
              </div>
            </div>

            {/* Prize List */}
            <div className="flex-1 overflow-hidden">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="text-purple-400" size={20} />
                Available Prizes
              </h2>
              <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <PrizeList prizes={prizes} onPrizeClick={handlePrizeClick} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <WinModal isOpen={isWinModalOpen} prize={selectedPrize} onClose={() => { setIsWinModalOpen(false); setSelectedPrize(null); }} />
      <PrizeModal isOpen={isPrizeModalOpen} prize={viewingPrize} onClose={() => { setIsPrizeModalOpen(false); setViewingPrize(null); }} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </main>
  );
}
