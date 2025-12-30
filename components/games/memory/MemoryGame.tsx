'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Coins, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import MemoryCard from './MemoryCard';
import WinModal from './WinModal';
import LoseModal from './LoseModal';
import { MemoryConfigDb, fetchMemoryCards, MemoryCardDb } from '@/lib/supabase';

type Difficulty = 'easy' | 'medium' | 'hard';

interface MemoryGameProps {
  difficulty: Difficulty;
  config: MemoryConfigDb;
  onBack: () => void;
  userName?: string;
  userId?: string;
}

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Fallback icons if no cards in database
const FALLBACK_ICONS = [
  '🎮', '🎯', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧',
  '🎹', '🎸', '🎺', '🎻', '🥁', '🎲', '🎰', '🏆',
  '⚽', '🏀', '🎾', '🏈', '⚾', '🎱', '🏓', '🚀',
  '✨', '💎', '🔮', '🌟', '💫', '🎁', '🎀', '🦋',
  '🌸', '🌺', '🍀', '🌈', '☀️', '🌙'
];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function generateCards(pairs: number, cardImages: string[]): Card[] {
  // Use card images from DB, or fallback to emojis
  const availableIcons = cardImages.length >= pairs ? cardImages : FALLBACK_ICONS;
  const selectedIcons = shuffleArray(availableIcons).slice(0, pairs);
  const cards: Card[] = [];
  
  selectedIcons.forEach((icon, index) => {
    cards.push({ id: index * 2, icon, isFlipped: true, isMatched: false });
    cards.push({ id: index * 2 + 1, icon, isFlipped: true, isMatched: false });
  });
  
  return shuffleArray(cards);
}

export default function MemoryGame({ difficulty, config, onBack, userName, userId }: MemoryGameProps) {
  const pairs = Math.floor((config.grid_cols * config.grid_rows) / 2);
  const timeLimit = config.time_limit_seconds;
  const previewTime = config.preview_seconds;
  const rewards = { coins: config.coins_reward, xp: config.xp_reward };
  
  const [cardImages, setCardImages] = useState<string[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [previewCountdown, setPreviewCountdown] = useState(previewTime);
  const [isPreviewPhase, setIsPreviewPhase] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLoseModal, setShowLoseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cards from database on mount
  useEffect(() => {
    const loadCards = async () => {
      setIsLoading(true);
      try {
        const dbCards = await fetchMemoryCards(true); // Featured only
        const images = dbCards.map((c: MemoryCardDb) => c.image_url);
        setCardImages(images);
        setCards(generateCards(pairs, images));
      } catch (error) {
        console.error('Error loading cards:', error);
        setCards(generateCards(pairs, FALLBACK_ICONS));
      }
      setIsLoading(false);
    };
    loadCards();
  }, [pairs]);

  // Preview countdown
  useEffect(() => {
    if (!isPreviewPhase || isLoading) return;
    
    if (previewCountdown > 0) {
      const timer = setTimeout(() => setPreviewCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCards(prev => prev.map(card => ({ ...card, isFlipped: false })));
      setIsPreviewPhase(false);
      setIsLocked(false);
    }
  }, [previewCountdown, isPreviewPhase, isLoading]);

  // Game timer
  useEffect(() => {
    if (isPreviewPhase || isWon || isLost || isLoading) return;
    
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsLost(true);
      setIsLocked(true);
      setTimeout(() => setShowLoseModal(true), 500);
    }
  }, [timeRemaining, isPreviewPhase, isWon, isLost, isLoading]);

  // Check for match
  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsLocked(true);
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.icon === secondCard.icon) {
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === first || card.id === second ? { ...card, isMatched: true } : card
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
          setIsLocked(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === first || card.id === second ? { ...card, isFlipped: false } : card
          ));
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards]);

  // Check for win
  useEffect(() => {
    if (matches === pairs && !isWon && !isPreviewPhase) {
      setIsWon(true);
      setIsLocked(true);
      setTimeout(() => setShowWinModal(true), 500);
    }
  }, [matches, pairs, isWon, isPreviewPhase]);

  const handleCardClick = useCallback((id: number) => {
    if (isLocked || isPreviewPhase) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));
    setFlippedCards(prev => [...prev, id]);
  }, [isLocked, isPreviewPhase, cards, flippedCards]);

  const handleRestart = () => {
    setCards(generateCards(pairs, cardImages.length >= pairs ? cardImages : FALLBACK_ICONS));
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsWon(false);
    setIsLost(false);
    setIsLocked(true);
    setPreviewCountdown(previewTime);
    setIsPreviewPhase(true);
    setTimeRemaining(timeLimit);
    setShowWinModal(false);
    setShowLoseModal(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const difficultyColor = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400' }[difficulty];
  const isLowTime = timeRemaining <= 10 && !isPreviewPhase;
  
  // Dynamic card sizing based on grid and screen
  const getCardSize = () => {
    if (config.grid_cols >= 6) return 'sm';
    if (config.grid_cols >= 5) return 'md';
    return 'lg';
  };
  const cardSize = getCardSize();
  
  // Calculate max width for grid to use more space
  const getGridMaxWidth = () => {
    if (config.grid_cols >= 6) return '100%';
    if (config.grid_cols >= 5) return '95%';
    return '90%';
  };

  if (isLoading) {
    return (
      <main className="h-[100dvh] flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading cards...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-[100dvh] flex flex-col items-center px-3 py-3 overflow-hidden">
      <div className="w-full max-w-[500px] flex flex-col h-full">
        <header className="flex items-center justify-between w-full mb-2 flex-shrink-0">
          <button onClick={onBack} className="text-white/70 p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold text-white">Memory Match</h1>
            <span className={`text-xs font-medium ${difficultyColor}`}>{difficultyLabel}</span>
          </div>
          <button onClick={handleRestart} className="text-white/70 p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
            <RotateCcw size={20} />
          </button>
        </header>

        {isPreviewPhase && (
          <div className="text-center mb-2 flex-shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <span className="text-purple-400 font-medium text-sm">Memorize!</span>
              <span className="text-white font-bold text-lg">{previewCountdown}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mb-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Trophy size={14} className="text-yellow-400" />
            <span className="text-white font-medium text-sm">{matches}/{pairs}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-white/60 text-xs">Moves:</span>
            <span className="text-white font-medium text-sm">{moves}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${isLowTime ? 'bg-red-500/20 border-red-500/30 animate-pulse' : 'bg-white/5 border-white/10'}`}>
            {isLowTime ? <AlertTriangle size={14} className="text-red-400" /> : <Clock size={14} className="text-purple-400" />}
            <span className={`font-bold text-sm ${isLowTime ? 'text-red-400' : 'text-white'}`}>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Game Grid - Takes available space */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div
            className="grid gap-1 w-full"
            style={{
              gridTemplateColumns: `repeat(${config.grid_cols}, 1fr)`,
              maxWidth: getGridMaxWidth(),
              aspectRatio: `${config.grid_cols} / ${config.grid_rows}`,
            }}
          >
            {cards.map(card => (
              <MemoryCard
                key={card.id}
                icon={card.icon}
                isFlipped={card.isFlipped}
                isMatched={card.isMatched}
                onClick={() => handleCardClick(card.id)}
                size={cardSize}
                disabled={isPreviewPhase}
              />
            ))}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-4 flex-shrink-0 pb-2">
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <Coins size={12} className="text-yellow-400" />
            <span>Win: +{rewards.coins}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <Sparkles size={12} className="text-cyan-400" />
            <span>Win: +{rewards.xp} XP</span>
          </div>
        </div>
      </div>

      <WinModal
        isOpen={showWinModal}
        onClose={() => setShowWinModal(false)}
        onPlayAgain={handleRestart}
        onBack={onBack}
        moves={moves}
        time={timeLimit - timeRemaining}
        difficulty={difficulty}
        coins={rewards.coins}
        xp={rewards.xp}
        userName={userName}
        userId={userId}
        pairsMatched={matches}
        totalPairs={pairs}
      />

      <LoseModal
        isOpen={showLoseModal}
        onClose={() => setShowLoseModal(false)}
        onTryAgain={handleRestart}
        onBack={onBack}
        moves={moves}
        matches={matches}
        totalPairs={pairs}
        difficulty={difficulty}
        userId={userId}
        userName={userName}
        timeSeconds={timeLimit}
      />
    </main>
  );
}
