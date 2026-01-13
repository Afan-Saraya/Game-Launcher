'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Trophy, Coins, Sparkles, LogOut, User, Brain, Puzzle, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Winner {
  id: string;
  user_id: string;
  user_name?: string | null;
  difficulty: string;
  time_seconds: number;
  coins_awarded: number;
  xp_awarded: number;
  created_at: string;
}

interface RecentWinnersMenuProps {
  gameType: 'memory' | 'puzzle' | 'wordsearch';
  fetchWinners: () => Promise<Winner[]>;
  refreshTrigger?: number;
}

const timeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const generateUsername = (visitorId: string): string => {
  const adjectives = ['Lucky', 'Happy', 'Swift', 'Brave', 'Cool', 'Star', 'Gold', 'Pro'];
  const nouns = ['Player', 'Winner', 'Gamer', 'Hero', 'Champ', 'Master', 'King', 'Ace'];
  const hash = visitorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `${adjectives[hash % adjectives.length]}${nouns[(hash * 7) % nouns.length]}${(hash % 900) + 100}`;
};

const getDisplayName = (winner: Winner): string => {
  if (winner.user_name) return winner.user_name;
  return generateUsername(winner.user_id);
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const gameConfig = {
  memory: {
    icon: Brain,
    title: 'Memory Match',
    color: 'from-purple-500 to-pink-500',
    accentColor: 'purple',
  },
  puzzle: {
    icon: Puzzle,
    title: 'Puzzle Challenge',
    color: 'from-orange-500 to-red-500',
    accentColor: 'orange',
  },
  wordsearch: {
    icon: Search,
    title: 'Word Search',
    color: 'from-cyan-500 to-blue-500',
    accentColor: 'cyan',
  },
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  hard: 'bg-red-500/20 text-red-400',
};

export default function RecentWinnersMenu({ gameType, fetchWinners, refreshTrigger }: RecentWinnersMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const config = gameConfig[gameType];
  const GameIcon = config.icon;

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
    const data = await fetchWinners();
    setWinners(data);
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    handleCloseMenu();
  };

  return (
    <>
      <button 
        onClick={() => setIsMenuOpen(true)} 
        className="text-white/70 p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10"
      >
        <Menu size={20} />
      </button>

      {isMenuVisible && (
        <div className="fixed inset-0 z-50">
          <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-400 ease-out ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleCloseMenu} 
          />
          
          {/* Sidebar Panel - On the right */}
          <div 
            className={`absolute right-0 top-0 h-full w-[300px] max-w-[85vw] bg-gradient-to-b from-[#2a1f4e] to-[#0d0620] border-l border-white/10 shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <button onClick={handleCloseMenu} className="text-white/60 hover:text-white p-1 hover:-rotate-90 transition-all duration-200">
                <X size={20} />
              </button>
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
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                      <User size={20} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Coins size={14} className="text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">{user.coins.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-cyan-400" />
                    <span className="text-cyan-400 text-sm font-medium">{user.xp.toLocaleString()} XP</span>
                  </div>
                  <div className="text-white/40 text-xs">Lv.{user.level}</div>
                </div>
              </div>
            )}
            
            {/* Winners List */}
            <div 
              className="overflow-y-auto p-3 space-y-2" 
              style={{ height: isAuthenticated ? 'calc(100% - 180px)' : 'calc(100% - 60px)' }}
            >
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : winners.length > 0 ? (
                winners.map((winner) => (
                  <div 
                    key={winner.id} 
                    className="liquid-glass rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
                      <GameIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{getDisplayName(winner)}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${difficultyColors[winner.difficulty] || 'bg-white/10 text-white/60'}`}>
                          {winner.difficulty}
                        </span>
                        <span className="text-white/40 text-xs">{formatTime(winner.time_seconds)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {winner.coins_awarded > 0 && (
                          <span className="flex items-center gap-1 text-yellow-400 text-xs">
                            <Coins size={10} />+{winner.coins_awarded}
                          </span>
                        )}
                        {winner.xp_awarded > 0 && (
                          <span className="flex items-center gap-1 text-cyan-400 text-xs">
                            <Sparkles size={10} />+{winner.xp_awarded}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-white/40 text-xs flex-shrink-0">{timeAgo(winner.created_at)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white/40">
                  <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No winners yet</p>
                  <p className="text-xs mt-1">Be the first!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
