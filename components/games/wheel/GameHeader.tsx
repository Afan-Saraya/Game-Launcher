'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Trophy, Coins, Sparkles, LogOut, User, ArrowLeft, ChevronDown, Gem } from 'lucide-react';
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
          <div className="flex items-center gap-2">
            <button onClick={handleBack} className="text-white/70 p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
              <ArrowLeft size={20} />
            </button>
            <button onClick={() => setIsMenuOpen(true)} className="text-white/70 p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
              <Menu size={20} />
            </button>
          </div>
          {isAuthenticated && user && (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="text-white font-medium text-sm max-w-[100px] truncate">{user.name}</span>
                <ChevronDown size={16} className={`text-white/60 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden shadow-2xl z-50 border border-white/10 bg-gradient-to-b from-[#1a1030] to-[#0d0620]">
                    {/* Profile Header */}
                    <div className="relative p-5 bg-gradient-to-br from-purple-600/30 to-pink-600/30">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-50" />
                      <div className="relative flex items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center ring-4 ring-white/20">
                            <User size={28} className="text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                            {user.level}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-lg truncate">{user.name}</p>
                          <p className="text-white/60 text-sm truncate">{user.email}</p>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-white/50">Level {user.level}</span>
                              <span className="text-white/50">{currentLevelXp}/{xpPerLevel} XP</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${levelProgress}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                          <Coins size={20} className="text-yellow-400 mx-auto mb-1" />
                          <p className="text-yellow-400 font-bold text-lg">{user.coins.toLocaleString()}</p>
                          <p className="text-white/40 text-xs">Coins</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                          <Gem size={20} className="text-purple-400 mx-auto mb-1" />
                          <p className="text-purple-400 font-bold text-lg">{user.tokens.toLocaleString()}</p>
                          <p className="text-white/40 text-xs">Tokens</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
                          <Sparkles size={20} className="text-cyan-400 mx-auto mb-1" />
                          <p className="text-cyan-400 font-bold text-lg">{user.xp.toLocaleString()}</p>
                          <p className="text-white/40 text-xs">XP</p>
                        </div>
                      </div>

                      <button
                        onClick={() => { logout(); setIsProfileOpen(false); }}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200 border border-red-500/20"
                      >
                        <LogOut size={18} />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
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
          
          {/* Sidebar Panel */}
          <div 
            className={`absolute left-0 top-0 h-full w-[300px] max-w-[85vw] bg-gradient-to-b from-[#2a1f4e] to-[#0d0620] border-r border-white/10 shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h2 className="text-white font-bold text-lg">Recent Winners</h2>
              </div>
              <button onClick={handleCloseMenu} className="text-white/60 hover:text-white p-1 hover:rotate-90 transition-all duration-200"><X size={20} /></button>
            </div>
            
            {/* User section */}
            {isAuthenticated && user && (
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-white/50 text-xs">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Coins size={14} className="text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">{balance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-cyan-400" />
                    <span className="text-cyan-400 text-sm font-medium">{xp.toLocaleString()} XP</span>
                  </div>
                  <div className="text-white/40 text-xs">Level {user.level}</div>
                </div>
              </div>
            )}
            
            <div className="overflow-y-auto h-[calc(100%-60px)] p-3 space-y-2" style={{ height: isAuthenticated ? 'calc(100% - 180px)' : 'calc(100% - 60px)' }}>
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
