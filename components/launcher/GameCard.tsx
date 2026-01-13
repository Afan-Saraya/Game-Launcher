'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameCardProps } from '@/lib/types';
import { Play, Lock, Info, X, Coins, Sparkles, Target, Clock, CheckCircle2 } from 'lucide-react';

export default function GameCard({ title, description, icon, route, disabled, gradient, gameInfo }: GameCardProps) {
  const router = useRouter();
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handlePlay = () => {
    if (disabled) return;
    router.push(route);
  };

  const defaultGradient = 'from-purple-600/20 to-pink-600/20';
  const cardGradient = gradient || defaultGradient;

  // Render icon - supports both string (emoji) and React components
  const renderIcon = (size: 'small' | 'large' = 'small') => {
    const sizeClass = size === 'large' ? 'w-12 h-12 lg:w-14 lg:h-14' : 'w-12 h-12';
    
    // For string icons (emojis), keep the wrapper
    if (typeof icon === 'string') {
      return (
        <div className={`${sizeClass} rounded-xl bg-white/10 flex items-center justify-center text-2xl lg:text-3xl backdrop-blur-sm border border-white/10`}>
          {icon}
        </div>
      );
    }
    
    // For React components (SVG icons), render directly without wrapper
    return (
      <div className={`${sizeClass} flex items-center justify-center`}>
        {icon}
      </div>
    );
  };

  return (
    <>
      <div 
        className={`relative overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 ${
          disabled 
            ? 'opacity-60 cursor-not-allowed' 
            : 'hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/10'
        }`}
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${cardGradient} opacity-50`} />
        
        {/* Glass Effect Overlay */}
        <div className="absolute inset-0 bg-[#0a0a1a]/60 backdrop-blur-sm" />
        
        {/* Content */}
        <div className="relative p-4 lg:p-5 text-center">
          {/* Header */}
          <div className="flex flex-col items-center mb-3">
            {renderIcon('large')}
            {disabled && (
              <span className="mt-2 px-2 py-1 text-[10px] lg:text-xs font-medium bg-white/10 text-white/50 rounded-full">
                Soon
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h3 className="text-sm lg:text-lg font-bold text-white mb-1 line-clamp-1">{title}</h3>
          <p className="text-white/50 text-xs lg:text-sm mb-4 line-clamp-2 min-h-[2rem] lg:min-h-[2.5rem]">{description}</p>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePlay}
              disabled={disabled}
              className={`flex-1 flex items-center justify-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl font-semibold text-xs lg:text-sm transition-all ${
                disabled 
                  ? 'bg-white/5 text-white/40 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 hover:scale-[1.02]'
              }`}
            >
              {disabled ? <Lock size={14} /> : <Play size={14} />}
              {disabled ? 'Locked' : 'Play'}
            </button>
            
            {gameInfo && !disabled && (
              <button 
                onClick={() => setShowInfoModal(true)}
                className="p-2 lg:p-2.5 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all border border-white/10"
              >
                <Info size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && gameInfo && (
        <GameInfoModal 
          title={title}
          icon={icon}
          gameInfo={gameInfo}
          onClose={() => setShowInfoModal(false)}
        />
      )}
    </>
  );
}


function GameInfoModal({ title, icon, gameInfo, onClose }: { title: string; icon: string | React.ReactNode; gameInfo: NonNullable<GameCardProps['gameInfo']>; onClose: () => void }) {
  const renderIcon = () => {
    // For string icons (emojis), keep the wrapper
    if (typeof icon === 'string') {
      return (
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
          {icon}
        </div>
      );
    }
    // For React components (SVG icons), render directly without wrapper
    return (
      <div className="w-12 h-12 flex items-center justify-center">
        {icon}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden rounded-2xl bg-[#12121f] border border-white/10">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {renderIcon()}
              <div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
                <p className="text-white/50 text-sm">Game Information</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X size={20} className="text-white/70" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Rewards Section */}
          <div>
            <h4 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
              <Target size={16} className="text-purple-400" />
              Rewards
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Coins size={18} className="text-yellow-400" />
                  <span className="text-white/60 text-sm">Coins</span>
                </div>
                <p className="text-white font-bold text-lg">
                  {gameInfo.rewards.coins.min} - {gameInfo.rewards.coins.max}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={18} className="text-cyan-400" />
                  <span className="text-white/60 text-sm">XP</span>
                </div>
                <p className="text-white font-bold text-lg">
                  {gameInfo.rewards.xp.min} - {gameInfo.rewards.xp.max}
                </p>
              </div>
            </div>
          </div>

          {/* Difficulties */}
          {gameInfo.difficulties && gameInfo.difficulties.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-orange-400" />
                Difficulties
              </h4>
              <div className="flex flex-wrap gap-2">
                {gameInfo.difficulties.map((diff, i) => (
                  <span 
                    key={i} 
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      diff.toLowerCase() === 'easy' ? 'bg-green-500/20 text-green-400' :
                      diff.toLowerCase() === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {diff}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* How to Play */}
          <div>
            <h4 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-400" />
              How to Play
            </h4>
            <ul className="space-y-2">
              {gameInfo.howToPlay.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          {gameInfo.features && gameInfo.features.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white/70 mb-3">Features</h4>
              <div className="flex flex-wrap gap-2">
                {gameInfo.features.map((feature, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-sm border border-white/10">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
