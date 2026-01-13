'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Trophy, Coins, Sparkles, LogOut, User, ArrowLeft, Gem } from 'lucide-react';
import { useRouter } from 'next/navigation';
import iconMap from '@/components/shared/IconMap';
import { fetchRecentWinners, DbAward } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface GameHeaderProps {
  balance: number;
  xp: number;
  refreshTrigger?: number;
}

const timeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};

const generateUsername = (visitorId: string): string => {
  const adjectives = ['Lucky', 'Happy', 'Swift', 'Brave', 'Cool', 'Star', 'Gold', 'Pro'];
  const nouns = ['Player', 'Winner', 'Spinner', 'Gamer', 'Hero', 'Champ', 'Master', 'King'];
  const hash = visitorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `${adjectives[hash % adjectives.length]}${nouns[(hash * 7) % nouns.length]}${(hash % 900) + 100}`;
};

const getDisplayName = (winner: DbAward): string => {
  if (winner.user_name) return winner.user_name;
  return generateUsername(winner.user_id);
};

export default function GameHeader({ balance, xp, refreshTrigger }: GameHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [winners, setWinners] = useState<DbAward[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Calculate level progress
  const xpPerLevel = 1000;
  const currentLevelXp = user ? user.xp % xpPerLevel : 0;
  const levelProgress = user ? (currentLevelXp / xpPerLevel) * 100 : 0;

  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuVisible(true);
      loadWinners();
    }
  }, [isMenuOpen, refreshTrigger]);

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
    setTimeout(() => setIsMenuVisible(false), 400);
  };

  const loadWinners = async () => {
    setLoading(true);
    const data = await fetchRecentWinners(15);
    setWinners(data);
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    handleCloseMenu();
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <header className="w-full mb-8">
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="text-white/70 p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg lg:text-2xl font-bold text-white">Wheel of Fortune</h1>
          <button onClick={() => setIsMenuOpen(true)} className="text-white/70 p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar Menu */}
      {isMenuVisible && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-400 ease-out ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleCloseMenu} 
          />
          
          {/* Sidebar Panel - Now on the right */}
          <div 
            className={`absolute right-0 top-0 h-full w-[300px] max-w-[85vw] bg-gradient-to-b from-[#2a1f4e] to-[#0d0620] border-l border-white/10 shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <button onClick={handleCloseMenu} className="text-white/60 hover:text-white p-1 hover:-rotate-90 transition-all duration-200"><X size={20} /></button>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h2 className="text-white font-bold text-lg">Recent Winners</h2>
              </div>
            </div>
            
            {/* User section */}
            {isAuthenticated && user && (
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleLogout}
                    className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={18} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-white/50 text-xs">{user.email}</p>
                    </div>
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white">
                        {user.level}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Level Progress */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/50">Level {user.level}</span>
                    <span className="text-white/50">{currentLevelXp}/{xpPerLevel} XP</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${levelProgress}%` }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5">
                    <Coins size={14} className="text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">{user.coins.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Gem size={14} className="text-purple-400" />
                    <span className="text-purple-400 text-sm font-medium">{user.tokens.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-cyan-400" />
                    <span className="text-cyan-400 text-sm font-medium">{user.xp.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="overflow-y-auto p-3 space-y-2" style={{ height: isAuthenticated ? 'calc(100% - 200px)' : 'calc(100% - 60px)' }}>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : winners.length > 0 ? (
                winners.map((winner) => {
                  const IconComponent = iconMap[winner.prize_icon];
                  return (
                    <div 
                      key={winner.id} 
                      className="liquid-glass rounded-xl p-3 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${winner.prize_color}, ${winner.prize_color}99)` }}>
                        {IconComponent && <IconComponent className="w-5 h-5 text-white" strokeWidth={2.5} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{getDisplayName(winner)}</p>
                        <p className="text-white/60 text-xs">won {winner.prize_label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {(winner.coins_awarded || 0) > 0 && (
                            <span className="flex items-center gap-1 text-yellow-400 text-xs">
                              <Coins size={10} />+{winner.coins_awarded}
                            </span>
                          )}
                          {(winner.xp_awarded || 0) > 0 && (
                            <span className="flex items-center gap-1 text-cyan-400 text-xs">
                              <Sparkles size={10} />+{winner.xp_awarded}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-white/40 text-xs flex-shrink-0">{timeAgo(winner.created_at)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-white/40">
                  <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No winners yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
