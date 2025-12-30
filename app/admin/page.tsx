'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, Gift, Trophy, Pencil, Upload, X, Menu,
  ChevronRight, ChevronDown, Save, Loader2, Users, RefreshCw, Database, AlertCircle, Coins, Sparkles,
  ShieldX, LogIn, LogOut, Eye, EyeOff, User, Brain, Clock, Target, Settings, Image, Star, Plus, Trash2
} from 'lucide-react';
import iconMap from '@/components/shared/IconMap';

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

interface AdminSession {
  email: string;
  name: string;
  loggedInAt: number;
}

// Wheel types
interface Prize {
  id: number;
  label: string;
  icon: string;
  description: string;
  color: string;
  image_url?: string | null;
  points_value: number;
  coins_reward: number;
  xp_reward: number;
  is_active: boolean;
  sort_order: number;
}

interface WheelAward {
  id: string;
  user_id: string;
  user_name?: string;
  prize_id: number;
  prize_label: string;
  prize_icon: string;
  prize_color: string;
  points_awarded: number;
  coins_awarded: number;
  xp_awarded: number;
  created_at: string;
}

// Memory types
interface MemoryConfig {
  id: number;
  difficulty: string;
  grid_cols: number;
  grid_rows: number;
  time_limit_seconds: number;
  preview_seconds: number;
  coins_reward: number;
  xp_reward: number;
  is_active: boolean;
}

interface MemoryAward {
  id: string;
  user_id: string;
  user_name?: string;
  difficulty: string;
  moves: number;
  time_seconds: number;
  pairs_matched: number;
  total_pairs: number;
  is_win: boolean;
  coins_awarded: number;
  xp_awarded: number;
  created_at: string;
}

interface MemoryCard {
  id: number;
  name: string;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

type GameSection = 'wheel' | 'memory';
type WheelTab = 'dashboard' | 'prizes' | 'awards';
type MemoryTab = 'dashboard' | 'cards' | 'config' | 'history';

export default function AdminPage() {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<GameSection>('wheel');
  const [wheelTab, setWheelTab] = useState<WheelTab>('dashboard');
  const [memoryTab, setMemoryTab] = useState<MemoryTab>('dashboard');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ wheel: true, memory: true });
  
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string } | null>(null);
  
  // Wheel state
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [wheelAwards, setWheelAwards] = useState<WheelAward[]>([]);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [isPrizeModalOpen, setIsPrizeModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Memory state
  const [memoryConfig, setMemoryConfig] = useState<MemoryConfig[]>([]);
  const [memoryAwards, setMemoryAwards] = useState<MemoryAward[]>([]);
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [editingConfig, setEditingConfig] = useState<MemoryConfig | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<MemoryCard | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardUploading, setCardUploading] = useState(false);

  const getSupabaseClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  };

  // Auth check
  useEffect(() => {
    const stored = sessionStorage.getItem('admin_session');
    if (stored) {
      try {
        const session = JSON.parse(stored) as AdminSession;
        if (ADMIN_EMAILS.includes(session.email.toLowerCase())) {
          setAdminSession(session);
        } else {
          sessionStorage.removeItem('admin_session');
        }
      } catch {
        sessionStorage.removeItem('admin_session');
      }
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (adminSession) fetchAllData();
  }, [adminSession]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      if (!ADMIN_EMAILS.includes(loginEmail.toLowerCase())) {
        setLoginError('This email is not authorized for admin access');
        setLoginLoading(false);
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (data.success && data.account) {
        const session: AdminSession = {
          email: data.account.email,
          name: data.account.name || loginEmail.split('@')[0],
          loggedInAt: Date.now(),
        };
        sessionStorage.setItem('admin_session', JSON.stringify(session));
        setAdminSession(session);
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Login failed. Please try again.');
    }
    setLoginLoading(false);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('admin_session');
    setAdminSession(null);
  };

  const fetchAllData = async () => {
    setLoading(true);
    const supabase = getSupabaseClient();
    if (!supabase) {
      setDbStatus({ connected: false, message: 'No database connection' });
      setLoading(false);
      return;
    }

    try {
      // Fetch wheel data
      const [prizesRes, wheelAwardsRes] = await Promise.all([
        supabase.from('wheel_prizes').select('*').order('sort_order'),
        supabase.from('wheel_awards').select('*').order('created_at', { ascending: false }).limit(100),
      ]);

      if (prizesRes.data) setPrizes(prizesRes.data);
      if (wheelAwardsRes.data) setWheelAwards(wheelAwardsRes.data);

      // Fetch memory data
      const [configRes, memoryAwardsRes, memoryCardsRes] = await Promise.all([
        supabase.from('memory_config').select('*').order('difficulty'),
        supabase.from('memory_awards').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('memory_cards').select('*').order('sort_order'),
      ]);

      if (configRes.data) setMemoryConfig(configRes.data);
      if (memoryAwardsRes.data) setMemoryAwards(memoryAwardsRes.data);
      if (memoryCardsRes.data) setMemoryCards(memoryCardsRes.data);

      setDbStatus({ connected: true, message: 'Connected to database' });
    } catch (error) {
      setDbStatus({ connected: false, message: `Error: ${error}` });
    }
    setLoading(false);
  };

  // Wheel functions
  const savePrize = async () => {
    if (!editingPrize) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('wheel_prizes').upsert({
        id: editingPrize.id,
        label: editingPrize.label,
        icon: editingPrize.icon,
        description: editingPrize.description,
        color: editingPrize.color,
        points_value: editingPrize.points_value,
        coins_reward: editingPrize.coins_reward,
        xp_reward: editingPrize.xp_reward,
        is_active: editingPrize.is_active,
        sort_order: editingPrize.sort_order,
        image_url: editingPrize.image_url,
      });

      if (error) throw error;
      setPrizes(prev => prev.map(p => p.id === editingPrize.id ? editingPrize : p));
      setIsPrizeModalOpen(false);
      setEditingPrize(null);
    } catch (error) {
      console.error('Error saving prize:', error);
    }
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, prizeId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `prize-${prizeId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('bucket')
        .upload(`prizes/${fileName}`, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('bucket')
        .getPublicUrl(`prizes/${fileName}`);

      await supabase.from('wheel_prizes').update({ image_url: publicUrl }).eq('id', prizeId);
      setPrizes(prev => prev.map(p => p.id === prizeId ? { ...p, image_url: publicUrl } : p));
    } catch (error) {
      console.error('Upload error:', error);
    }
    setUploading(false);
  };

  // Memory functions
  const saveMemoryConfig = async () => {
    if (!editingConfig) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('memory_config').update({
        time_limit_seconds: editingConfig.time_limit_seconds,
        preview_seconds: editingConfig.preview_seconds,
        coins_reward: editingConfig.coins_reward,
        xp_reward: editingConfig.xp_reward,
        is_active: editingConfig.is_active,
      }).eq('id', editingConfig.id);

      if (error) throw error;
      setMemoryConfig(prev => prev.map(c => c.id === editingConfig.id ? editingConfig : c));
      setIsConfigModalOpen(false);
      setEditingConfig(null);
    } catch (error) {
      console.error('Error saving config:', error);
    }
    setSaving(false);
  };

  // Memory card functions
  const saveMemoryCard = async () => {
    if (!editingCard) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSaving(true);
    try {
      if (editingCard.id === 0) {
        // New card
        const { data, error } = await supabase.from('memory_cards').insert({
          name: editingCard.name,
          image_url: editingCard.image_url,
          is_featured: editingCard.is_featured,
          is_active: editingCard.is_active,
          sort_order: editingCard.sort_order,
        }).select().single();

        if (error) throw error;
        if (data) setMemoryCards(prev => [...prev, data]);
      } else {
        // Update existing
        const { error } = await supabase.from('memory_cards').update({
          name: editingCard.name,
          image_url: editingCard.image_url,
          is_featured: editingCard.is_featured,
          is_active: editingCard.is_active,
          sort_order: editingCard.sort_order,
        }).eq('id', editingCard.id);

        if (error) throw error;
        setMemoryCards(prev => prev.map(c => c.id === editingCard.id ? editingCard : c));
      }
      setIsCardModalOpen(false);
      setEditingCard(null);
    } catch (error) {
      console.error('Error saving card:', error);
    }
    setSaving(false);
  };

  const deleteMemoryCard = async (cardId: number) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error } = await supabase.from('memory_cards').delete().eq('id', cardId);
      if (error) throw error;
      setMemoryCards(prev => prev.filter(c => c.id !== cardId));
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, cardId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const supabase = getSupabaseClient();
    if (!supabase) {
      alert('Database connection not available');
      return;
    }

    setCardUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `memory-card-${cardId}-${Date.now()}.${fileExt}`;
      const filePath = `memory-cards/${fileName}`;
      
      console.log('Uploading to:', filePath);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bucket')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        alert(`Upload failed: ${uploadError.message}`);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('bucket')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      const { error: updateError } = await supabase.from('memory_cards').update({ image_url: publicUrl }).eq('id', cardId);
      
      if (updateError) {
        console.error('Database update error:', updateError);
        alert(`Failed to update database: ${updateError.message}`);
        throw updateError;
      }

      setMemoryCards(prev => prev.map(c => c.id === cardId ? { ...c, image_url: publicUrl } : c));
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
    }
    setCardUploading(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Stats calculations
  const wheelStats = {
    totalSpins: wheelAwards.length,
    todaySpins: wheelAwards.filter(a => a.created_at.startsWith(new Date().toISOString().split('T')[0])).length,
    uniqueUsers: new Set(wheelAwards.map(a => a.user_id)).size,
  };

  const memoryStats = {
    totalGames: memoryAwards.length,
    wins: memoryAwards.filter(a => a.is_win).length,
    todayGames: memoryAwards.filter(a => a.created_at.startsWith(new Date().toISOString().split('T')[0])).length,
    uniqueUsers: new Set(memoryAwards.map(a => a.user_id)).size,
  };

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Login form
  if (!adminSession) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center">
              <ShieldX size={40} className="text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-gray-400">Sign in with your admin credentials</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {loginError && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{loginError}</div>}
            <button type="submit" disabled={loginLoading} className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {loginLoading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a0a1a]/95 backdrop-blur-lg border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-lg"><Menu size={24} /></button>
          <h1 className="font-bold text-lg">Play & Win CMS</h1>
          <button onClick={fetchAllData} className="p-2 hover:bg-white/10 rounded-lg"><RefreshCw size={20} /></button>
        </div>
      </div>

      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-[#12121f] border-r border-white/10 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Play & Win CMS</h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded"><X size={20} /></button>
          </div>

          <nav className="space-y-2 flex-1 overflow-y-auto">
            {/* Wheel of Fortune Section */}
            <div>
              <button onClick={() => toggleSection('wheel')} className="w-full flex items-center justify-between px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎡</span>
                  <span className="font-medium">Wheel of Fortune</span>
                </div>
                {expandedSections.wheel ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {expandedSections.wheel && (
                <div className="ml-4 mt-1 space-y-1">
                  <NavButton active={activeGame === 'wheel' && wheelTab === 'dashboard'} onClick={() => { setActiveGame('wheel'); setWheelTab('dashboard'); setSidebarOpen(false); }} icon={LayoutDashboard} label="Dashboard" />
                  <NavButton active={activeGame === 'wheel' && wheelTab === 'prizes'} onClick={() => { setActiveGame('wheel'); setWheelTab('prizes'); setSidebarOpen(false); }} icon={Gift} label="Prizes" />
                  <NavButton active={activeGame === 'wheel' && wheelTab === 'awards'} onClick={() => { setActiveGame('wheel'); setWheelTab('awards'); setSidebarOpen(false); }} icon={Trophy} label="Awards" />
                </div>
              )}
            </div>

            {/* Memory Game Section */}
            <div>
              <button onClick={() => toggleSection('memory')} className="w-full flex items-center justify-between px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧠</span>
                  <span className="font-medium">Memory Game</span>
                </div>
                {expandedSections.memory ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {expandedSections.memory && (
                <div className="ml-4 mt-1 space-y-1">
                  <NavButton active={activeGame === 'memory' && memoryTab === 'dashboard'} onClick={() => { setActiveGame('memory'); setMemoryTab('dashboard'); setSidebarOpen(false); }} icon={LayoutDashboard} label="Dashboard" />
                  <NavButton active={activeGame === 'memory' && memoryTab === 'cards'} onClick={() => { setActiveGame('memory'); setMemoryTab('cards'); setSidebarOpen(false); }} icon={Image} label="Cards" />
                  <NavButton active={activeGame === 'memory' && memoryTab === 'config'} onClick={() => { setActiveGame('memory'); setMemoryTab('config'); setSidebarOpen(false); }} icon={Settings} label="Configuration" />
                  <NavButton active={activeGame === 'memory' && memoryTab === 'history'} onClick={() => { setActiveGame('memory'); setMemoryTab('history'); setSidebarOpen(false); }} icon={Trophy} label="Game History" />
                </div>
              )}
            </div>
          </nav>

          {/* Admin info */}
          <div className="pt-4 border-t border-white/10">
            <div className="px-3 py-2 mb-2">
              <p className="text-sm text-gray-400 truncate">{adminSession?.email}</p>
            </div>
            <button onClick={handleAdminLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut size={20} /><span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {/* DB Status */}
          {dbStatus && (
            <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${dbStatus.connected ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              {dbStatus.connected ? <Database className="text-green-400" /> : <AlertCircle className="text-red-400" />}
              <span className={dbStatus.connected ? 'text-green-400' : 'text-red-400'}>{dbStatus.message}</span>
            </div>
          )}

          {/* Refresh button */}
          <div className="hidden lg:flex justify-end mb-4">
            <button onClick={fetchAllData} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
          ) : (
            <>
              {/* WHEEL OF FORTUNE CONTENT */}
              {activeGame === 'wheel' && (
                <>
                  {wheelTab === 'dashboard' && <WheelDashboard stats={wheelStats} awards={wheelAwards} />}
                  {wheelTab === 'prizes' && <WheelPrizes prizes={prizes} onEdit={(p) => { setEditingPrize(p); setIsPrizeModalOpen(true); }} onUpload={handleImageUpload} uploading={uploading} />}
                  {wheelTab === 'awards' && <WheelAwards awards={wheelAwards} />}
                </>
              )}

              {/* MEMORY GAME CONTENT */}
              {activeGame === 'memory' && (
                <>
                  {memoryTab === 'dashboard' && <MemoryDashboard stats={memoryStats} awards={memoryAwards} />}
                  {memoryTab === 'cards' && <MemoryCards cards={memoryCards} onEdit={(c) => { setEditingCard(c); setIsCardModalOpen(true); }} onUpload={handleCardImageUpload} onDelete={deleteMemoryCard} uploading={cardUploading} onAddNew={() => { setEditingCard({ id: 0, name: '', image_url: '', is_featured: true, is_active: true, sort_order: memoryCards.length + 1 }); setIsCardModalOpen(true); }} />}
                  {memoryTab === 'config' && <MemoryConfiguration config={memoryConfig} onEdit={(c) => { setEditingConfig(c); setIsConfigModalOpen(true); }} />}
                  {memoryTab === 'history' && <MemoryHistory awards={memoryAwards} />}
                </>
              )}
            </>
          )}
        </div>
      </main>

      {/* Prize Edit Modal */}
      {isPrizeModalOpen && editingPrize && (
        <PrizeModal prize={editingPrize} onChange={setEditingPrize} onSave={savePrize} onClose={() => setIsPrizeModalOpen(false)} saving={saving} />
      )}

      {/* Memory Config Modal */}
      {isConfigModalOpen && editingConfig && (
        <ConfigModal config={editingConfig} onChange={setEditingConfig} onSave={saveMemoryConfig} onClose={() => setIsConfigModalOpen(false)} saving={saving} />
      )}

      {/* Memory Card Modal */}
      {isCardModalOpen && editingCard && (
        <CardModal card={editingCard} onChange={setEditingCard} onSave={saveMemoryCard} onClose={() => setIsCardModalOpen(false)} saving={saving} />
      )}
    </div>
  );
}

// Navigation Button Component
function NavButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof LayoutDashboard; label: string }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${active ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
      <Icon size={16} /><span>{label}</span>
    </button>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    purple: 'from-purple-600 to-purple-800',
    pink: 'from-pink-600 to-pink-800',
    blue: 'from-blue-600 to-blue-800',
    green: 'from-green-600 to-green-800',
    yellow: 'from-yellow-600 to-yellow-800',
  };
  return (
    <div className="bg-[#12121f] rounded-2xl border border-white/10 p-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-gray-400 text-sm">{title}</p>
    </div>
  );
}

// WHEEL COMPONENTS
function WheelDashboard({ stats, awards }: { stats: { totalSpins: number; todaySpins: number; uniqueUsers: number }; awards: WheelAward[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🎡 Wheel of Fortune Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Spins" value={stats.totalSpins} icon={<Gift className="w-5 h-5" />} color="purple" />
        <StatCard title="Today" value={stats.todaySpins} icon={<LayoutDashboard className="w-5 h-5" />} color="blue" />
        <StatCard title="Unique Users" value={stats.uniqueUsers} icon={<Users className="w-5 h-5" />} color="green" />
      </div>
      <div className="bg-[#12121f] rounded-2xl border border-white/10 p-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {awards.slice(0, 5).map(award => {
            const IconComponent = iconMap[award.prize_icon];
            return (
              <div key={award.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: award.prize_color }}>
                  {IconComponent ? <IconComponent className="w-5 h-5 text-white" /> : <Gift className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{award.user_name || 'Anonymous'} won {award.prize_label}</p>
                  <p className="text-sm text-gray-400">{new Date(award.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {(award.coins_awarded || 0) > 0 && <span className="text-yellow-400 text-sm">+{award.coins_awarded}</span>}
                  {(award.xp_awarded || 0) > 0 && <span className="text-cyan-400 text-sm">+{award.xp_awarded} XP</span>}
                </div>
              </div>
            );
          })}
          {awards.length === 0 && <p className="text-gray-400 text-center py-8">No activity yet</p>}
        </div>
      </div>
    </div>
  );
}

function WheelPrizes({ prizes, onEdit, onUpload, uploading }: { prizes: Prize[]; onEdit: (p: Prize) => void; onUpload: (e: React.ChangeEvent<HTMLInputElement>, id: number) => void; uploading: boolean }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🎁 Wheel Prizes ({prizes.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {prizes.map(prize => {
          const IconComponent = iconMap[prize.icon];
          return (
            <div key={prize.id} className={`bg-[#12121f] rounded-2xl border ${prize.is_active ? 'border-white/10' : 'border-red-500/30 opacity-60'} p-5`}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: prize.color }}>
                  {prize.image_url ? <img src={prize.image_url} alt={prize.label} className="w-8 h-8 object-contain" /> : IconComponent ? <IconComponent className="w-7 h-7 text-white" /> : <Gift className="w-7 h-7 text-white" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{prize.label}</h3>
                  <p className="text-gray-400 text-sm">{prize.description}</p>
                  <div className="flex gap-2 mt-1">
                    {prize.coins_reward > 0 && <span className="text-yellow-400 text-xs flex items-center gap-1"><Coins size={12} />+{prize.coins_reward}</span>}
                    {prize.xp_reward > 0 && <span className="text-cyan-400 text-xs flex items-center gap-1"><Sparkles size={12} />+{prize.xp_reward}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
                  <Upload size={16} /><span className="text-sm">{uploading ? '...' : 'Image'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e, prize.id)} disabled={uploading} />
                </label>
                <button onClick={() => onEdit(prize)} className="px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10"><Pencil size={16} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WheelAwards({ awards }: { awards: WheelAward[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🏆 Wheel Awards ({awards.length})</h2>
      <div className="bg-[#12121f] rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 font-semibold text-gray-400">User</th>
                <th className="text-left p-4 font-semibold text-gray-400">Prize</th>
                <th className="text-left p-4 font-semibold text-gray-400 hidden md:table-cell">Rewards</th>
                <th className="text-left p-4 font-semibold text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {awards.map(award => {
                const IconComponent = iconMap[award.prize_icon];
                return (
                  <tr key={award.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><User size={14} /></div>
                        <span className="font-medium">{award.user_name || 'Anonymous'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: award.prize_color }}>
                          {IconComponent ? <IconComponent className="w-4 h-4 text-white" /> : <Gift className="w-4 h-4 text-white" />}
                        </div>
                        <span>{award.prize_label}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex gap-2">
                        {award.coins_awarded > 0 && <span className="text-yellow-400">+{award.coins_awarded}</span>}
                        {award.xp_awarded > 0 && <span className="text-cyan-400">+{award.xp_awarded} XP</span>}
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">{new Date(award.created_at).toLocaleString()}</td>
                  </tr>
                );
              })}
              {awards.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">No awards yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// MEMORY COMPONENTS
function MemoryDashboard({ stats, awards }: { stats: { totalGames: number; wins: number; todayGames: number; uniqueUsers: number }; awards: MemoryAward[] }) {
  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🧠 Memory Game Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Games" value={stats.totalGames} icon={<Brain className="w-5 h-5" />} color="purple" />
        <StatCard title="Wins" value={stats.wins} icon={<Trophy className="w-5 h-5" />} color="green" />
        <StatCard title="Win Rate" value={winRate} icon={<Target className="w-5 h-5" />} color="yellow" />
        <StatCard title="Unique Users" value={stats.uniqueUsers} icon={<Users className="w-5 h-5" />} color="blue" />
      </div>
      <div className="bg-[#12121f] rounded-2xl border border-white/10 p-6">
        <h3 className="font-semibold mb-4">Recent Games</h3>
        <div className="space-y-3">
          {awards.slice(0, 5).map(award => (
            <div key={award.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${award.is_win ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {award.is_win ? <Trophy className="w-5 h-5 text-green-400" /> : <Clock className="w-5 h-5 text-red-400" />}
              </div>
              <div className="flex-1">
                <p className="font-medium">{award.user_name || 'Anonymous'} - {award.difficulty}</p>
                <p className="text-sm text-gray-400">{award.moves} moves, {award.time_seconds}s</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${award.is_win ? 'text-green-400' : 'text-red-400'}`}>
                  {award.is_win ? 'Won' : 'Lost'}
                </span>
                {award.is_win && (
                  <p className="text-xs text-gray-400">+{award.coins_awarded} / +{award.xp_awarded} XP</p>
                )}
              </div>
            </div>
          ))}
          {awards.length === 0 && <p className="text-gray-400 text-center py-8">No games yet</p>}
        </div>
      </div>
    </div>
  );
}

function MemoryConfiguration({ config, onEdit }: { config: MemoryConfig[]; onEdit: (c: MemoryConfig) => void }) {
  const difficultyColors: Record<string, string> = {
    easy: 'from-green-500 to-emerald-600',
    medium: 'from-yellow-500 to-orange-600',
    hard: 'from-red-500 to-pink-600',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">⚙️ Memory Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {config.map(c => (
          <div key={c.id} className={`bg-[#12121f] rounded-2xl border ${c.is_active ? 'border-white/10' : 'border-red-500/30 opacity-60'} p-5`}>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${difficultyColors[c.difficulty]} flex items-center justify-center mb-4`}>
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-lg capitalize mb-4">{c.difficulty}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Grid Size</span>
                <span className="font-medium">{c.grid_cols}×{c.grid_rows}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time Limit</span>
                <span className="font-medium">{c.time_limit_seconds}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Preview Time</span>
                <span className="font-medium">{c.preview_seconds}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Coins Reward</span>
                <span className="font-medium text-yellow-400">+{c.coins_reward}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">XP Reward</span>
                <span className="font-medium text-cyan-400">+{c.xp_reward}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className={`font-medium ${c.is_active ? 'text-green-400' : 'text-red-400'}`}>{c.is_active ? 'Active' : 'Disabled'}</span>
              </div>
            </div>
            <button onClick={() => onEdit(c)} className="w-full mt-4 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 flex items-center justify-center gap-2">
              <Pencil size={16} /> Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemoryHistory({ awards }: { awards: MemoryAward[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📜 Memory Game History ({awards.length})</h2>
      <div className="bg-[#12121f] rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 font-semibold text-gray-400">User</th>
                <th className="text-left p-4 font-semibold text-gray-400">Difficulty</th>
                <th className="text-left p-4 font-semibold text-gray-400 hidden md:table-cell">Stats</th>
                <th className="text-left p-4 font-semibold text-gray-400">Result</th>
                <th className="text-left p-4 font-semibold text-gray-400 hidden sm:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {awards.map(award => (
                <tr key={award.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"><User size={14} /></div>
                      <span className="font-medium">{award.user_name || 'Anonymous'}</span>
                    </div>
                  </td>
                  <td className="p-4 capitalize">{award.difficulty}</td>
                  <td className="p-4 hidden md:table-cell text-gray-400 text-sm">
                    {award.pairs_matched}/{award.total_pairs} pairs • {award.moves} moves • {award.time_seconds}s
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${award.is_win ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {award.is_win ? 'Won' : 'Lost'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm hidden sm:table-cell">{new Date(award.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {awards.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">No games yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// MODALS
function PrizeModal({ prize, onChange, onSave, onClose, saving }: { prize: Prize; onChange: (p: Prize) => void; onSave: () => void; onClose: () => void; saving: boolean }) {
  const ICON_OPTIONS = ['gift', 'sparkles', 'rotateCcw', 'diamond', 'box', 'crown', 'clock', 'zap'];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#12121f] rounded-2xl border border-white/10 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Edit Prize</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Label</label>
            <input type="text" value={prize.label} onChange={(e) => onChange({ ...prize, label: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea value={prize.description} onChange={(e) => onChange({ ...prize, description: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white resize-none" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Icon</label>
            <div className="grid grid-cols-4 gap-2">
              {ICON_OPTIONS.map(iconName => {
                const IconComp = iconMap[iconName];
                return (
                  <button key={iconName} onClick={() => onChange({ ...prize, icon: iconName })} className={`p-3 rounded-xl ${prize.icon === iconName ? 'bg-purple-600' : 'bg-white/5 hover:bg-white/10'}`}>
                    {IconComp && <IconComp size={20} />}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Coins</label>
              <input type="number" value={prize.coins_reward} onChange={(e) => onChange({ ...prize, coins_reward: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">XP</label>
              <input type="number" value={prize.xp_reward} onChange={(e) => onChange({ ...prize, xp_reward: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Color</label>
            <div className="flex gap-2">
              <input type="color" value={prize.color} onChange={(e) => onChange({ ...prize, color: e.target.value })} className="w-12 h-12 rounded-lg cursor-pointer" />
              <input type="text" value={prize.color} onChange={(e) => onChange({ ...prize, color: e.target.value })} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_active" checked={prize.is_active} onChange={(e) => onChange({ ...prize, is_active: e.target.checked })} className="w-5 h-5 rounded" />
            <label htmlFor="is_active">Active</label>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10">Cancel</button>
          <button onClick={onSave} disabled={saving} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfigModal({ config, onChange, onSave, onClose, saving }: { config: MemoryConfig; onChange: (c: MemoryConfig) => void; onSave: () => void; onClose: () => void; saving: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#12121f] rounded-2xl border border-white/10 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold capitalize">Edit {config.difficulty} Mode</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Time Limit (seconds)</label>
            <input type="number" value={config.time_limit_seconds} onChange={(e) => onChange({ ...config, time_limit_seconds: parseInt(e.target.value) || 30 })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Preview Time (seconds)</label>
            <input type="number" value={config.preview_seconds} onChange={(e) => onChange({ ...config, preview_seconds: parseInt(e.target.value) || 5 })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Coins Reward</label>
              <input type="number" value={config.coins_reward} onChange={(e) => onChange({ ...config, coins_reward: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">XP Reward</label>
              <input type="number" value={config.xp_reward} onChange={(e) => onChange({ ...config, xp_reward: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="config_active" checked={config.is_active} onChange={(e) => onChange({ ...config, is_active: e.target.checked })} className="w-5 h-5 rounded" />
            <label htmlFor="config_active">Active</label>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10">Cancel</button>
          <button onClick={onSave} disabled={saving} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

// Memory Cards Component
function MemoryCards({ cards, onEdit, onUpload, onDelete, uploading, onAddNew }: { cards: MemoryCard[]; onEdit: (c: MemoryCard) => void; onUpload: (e: React.ChangeEvent<HTMLInputElement>, id: number) => void; onDelete: (id: number) => void; uploading: boolean; onAddNew: () => void }) {
  const featuredCount = cards.filter(c => c.is_featured && c.is_active).length;
  const activeCount = cards.filter(c => c.is_active).length;
  
  const isEmoji = (str: string) => {
    // Check if string is short and doesn't start with http (not a URL)
    return str.length <= 4 && !str.startsWith('http');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">🃏 Memory Cards ({cards.length})</h2>
          <p className="text-gray-400 text-sm mt-1">{featuredCount} featured, {activeCount} active</p>
        </div>
        <button onClick={onAddNew} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:opacity-90">
          <Plus size={18} /> Add Card
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {cards.map(card => (
          <div key={card.id} className={`bg-[#12121f] rounded-2xl border ${card.is_active ? 'border-white/10' : 'border-red-500/30 opacity-60'} p-4 relative group`}>
            {card.is_featured && (
              <div className="absolute top-2 right-2 z-10">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
              </div>
            )}
            <div className="w-full aspect-square rounded-xl bg-white/5 flex items-center justify-center mb-3 overflow-hidden">
              {isEmoji(card.image_url) ? (
                <span className="text-4xl">{card.image_url}</span>
              ) : (
                <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
              )}
            </div>
            <p className="font-medium text-sm text-center truncate mb-3">{card.name}</p>
            <div className="flex gap-1">
              <label className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 text-xs">
                <Upload size={12} />
                <span>{uploading ? '...' : 'Img'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e, card.id)} disabled={uploading} />
              </label>
              <button onClick={() => onEdit(card)} className="px-2 py-1.5 bg-white/5 rounded-lg hover:bg-white/10">
                <Pencil size={12} />
              </button>
              <button onClick={() => onDelete(card.id)} className="px-2 py-1.5 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-400">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {cards.length === 0 && (
        <div className="text-center py-12 bg-[#12121f] rounded-2xl border border-white/10">
          <Image size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No cards yet. Add your first card!</p>
        </div>
      )}
    </div>
  );
}

// Card Modal
function CardModal({ card, onChange, onSave, onClose, saving }: { card: MemoryCard; onChange: (c: MemoryCard) => void; onSave: () => void; onClose: () => void; saving: boolean }) {
  const isNew = card.id === 0;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#12121f] rounded-2xl border border-white/10 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">{isNew ? 'Add New Card' : 'Edit Card'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
            <input type="text" value={card.name} onChange={(e) => onChange({ ...card, name: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" placeholder="Card name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Image URL or Emoji</label>
            <input type="text" value={card.image_url} onChange={(e) => onChange({ ...card, image_url: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" placeholder="https://... or 🎮" />
            <p className="text-xs text-gray-500 mt-1">Enter an emoji or upload an image after saving</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Sort Order</label>
            <input type="number" value={card.sort_order} onChange={(e) => onChange({ ...card, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="card_featured" checked={card.is_featured} onChange={(e) => onChange({ ...card, is_featured: e.target.checked })} className="w-5 h-5 rounded" />
              <label htmlFor="card_featured" className="flex items-center gap-2">
                <Star size={16} className={card.is_featured ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'} />
                Featured
              </label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="card_active" checked={card.is_active} onChange={(e) => onChange({ ...card, is_active: e.target.checked })} className="w-5 h-5 rounded" />
              <label htmlFor="card_active">Active</label>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-3 bg-white/5 rounded-xl hover:bg-white/10">Cancel</button>
          <button onClick={onSave} disabled={saving || !card.name || !card.image_url} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} {isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
