'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Clock, Target, Trophy, Puzzle, Check } from 'lucide-react';
import PuzzleWinModal from './PuzzleWinModal';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';
import { fetchPuzzleConfig, getRandomPuzzleImage, fetchPuzzleRewardTiers, getRewardForTime, PuzzleConfigDb, PuzzleImageDb, PuzzleRewardTierDb } from '@/lib/supabase';

type Difficulty = 'easy' | 'medium' | 'hard';

interface PuzzleGameProps {
  difficulty: Difficulty;
  gridSize: number;
  onBack: () => void;
}

interface PuzzlePiece {
  id: number;
  correctPosition: number;
  currentPosition: number | null;
}

// Default puzzle image fallback
const DEFAULT_PUZZLE_IMAGE = 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=600&fit=crop';

const DEFAULT_CONFIG: Record<Difficulty, { coins: number; xp: number; preview: number }> = {
  easy: { coins: 50, xp: 25, preview: 5 },
  medium: { coins: 100, xp: 50, preview: 4 },
  hard: { coins: 200, xp: 100, preview: 3 },
};

export default function PuzzleGame({ difficulty, gridSize, onBack }: PuzzleGameProps) {
  const { user } = useAuth();
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [board, setBoard] = useState<(number | null)[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Preview phase states
  const [isPreviewPhase, setIsPreviewPhase] = useState(true);
  const [previewCountdown, setPreviewCountdown] = useState(3);

  // Database config and image
  const [config, setConfig] = useState<PuzzleConfigDb | null>(null);
  const [puzzleImage, setPuzzleImage] = useState<PuzzleImageDb | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [rewardTiers, setRewardTiers] = useState<PuzzleRewardTierDb[]>([]);

  const totalPieces = gridSize * gridSize;

  // Get rewards based on time from tiers, or fallback to config/defaults
  const getRewards = (timeSeconds: number) => {
    if (rewardTiers.length > 0) {
      return getRewardForTime(rewardTiers, timeSeconds);
    }
    // Fallback to config or defaults
    return {
      coins: config?.coins_reward ?? DEFAULT_CONFIG[difficulty].coins,
      xp: config?.xp_reward ?? DEFAULT_CONFIG[difficulty].xp,
      tierName: 'Completed',
    };
  };

  const previewTime = config?.preview_seconds ?? DEFAULT_CONFIG[difficulty].preview;

  // Fetch config, random image, and reward tiers on mount - then auto-start
  useEffect(() => {
    const loadData = async () => {
      const [configs, randomImage, tiers] = await Promise.all([
        fetchPuzzleConfig(),
        getRandomPuzzleImage(),
        fetchPuzzleRewardTiers(difficulty),
      ]);
      
      const diffConfig = configs.find(c => c.difficulty === difficulty);
      if (diffConfig) {
        setConfig(diffConfig);
        setPreviewCountdown(diffConfig.preview_seconds ?? DEFAULT_CONFIG[difficulty].preview);
      } else {
        setPreviewCountdown(DEFAULT_CONFIG[difficulty].preview);
      }
      
      if (randomImage) {
        setPuzzleImage(randomImage);
        setCurrentImageUrl(randomImage.image_url);
      } else {
        // Use fallback if no images in database
        setCurrentImageUrl(DEFAULT_PUZZLE_IMAGE);
      }
      
      setRewardTiers(tiers);
      setDataLoaded(true);
    };
    loadData();
  }, [difficulty]);

  // Preload image only after data is loaded
  useEffect(() => {
    if (!dataLoaded || !currentImageUrl) return;
    
    setImageLoaded(false);
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => {
      // Fallback to default if image fails to load
      if (currentImageUrl !== DEFAULT_PUZZLE_IMAGE) {
        setCurrentImageUrl(DEFAULT_PUZZLE_IMAGE);
      } else {
        setImageLoaded(true);
      }
    };
    img.src = currentImageUrl;
  }, [dataLoaded, currentImageUrl]);

  // Preview countdown
  useEffect(() => {
    if (!isPreviewPhase || !imageLoaded || !dataLoaded) return;
    
    if (previewCountdown > 0) {
      const timer = setTimeout(() => setPreviewCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsPreviewPhase(false);
      initializePuzzle();
    }
  }, [previewCountdown, isPreviewPhase, imageLoaded, dataLoaded]);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isWon) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isWon]);

  const initializePuzzle = () => {
    const newPieces: PuzzlePiece[] = [];
    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({
        id: i,
        correctPosition: i,
        currentPosition: null,
      });
    }
    
    // Shuffle
    for (let i = newPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPieces[i], newPieces[j]] = [newPieces[j], newPieces[i]];
    }
    
    setPieces(newPieces);
    setBoard(Array(totalPieces).fill(null));
  };

  const restartGame = async () => {
    setDataLoaded(false);
    setImageLoaded(false);
    
    // Get a new random image for restart
    const randomImage = await getRandomPuzzleImage();
    if (randomImage) {
      setPuzzleImage(randomImage);
      setCurrentImageUrl(randomImage.image_url);
    } else {
      setCurrentImageUrl(DEFAULT_PUZZLE_IMAGE);
    }
    
    setIsPreviewPhase(true);
    setPreviewCountdown(previewTime);
    setMoves(0);
    setTime(0);
    setIsRunning(false);
    setIsWon(false);
    setShowWinModal(false);
    setSelectedPiece(null);
    setPieces([]);
    setBoard([]);
    setDataLoaded(true);
  };

  const checkWin = useCallback((currentBoard: (number | null)[]) => {
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] !== i) return false;
    }
    return true;
  }, []);

  const handleSelectPiece = (pieceId: number) => {
    if (!isRunning) setIsRunning(true);
    
    if (selectedPiece === pieceId) {
      setSelectedPiece(null);
    } else {
      setSelectedPiece(pieceId);
    }
  };

  const handlePlaceOnBoard = (position: number) => {
    if (selectedPiece === null) return;
    
    const piece = pieces.find(p => p.id === selectedPiece);
    if (!piece) return;

    const existingPieceId = board[position];
    const newBoard = [...board];
    
    const newPieces = pieces.map(p => {
      if (p.id === selectedPiece) {
        if (p.currentPosition !== null) {
          newBoard[p.currentPosition] = null;
        }
        return { ...p, currentPosition: position };
      }
      if (existingPieceId !== null && p.id === existingPieceId) {
        if (piece.currentPosition !== null) {
          newBoard[piece.currentPosition] = existingPieceId;
          return { ...p, currentPosition: piece.currentPosition };
        }
        return { ...p, currentPosition: null };
      }
      return p;
    });

    newBoard[position] = selectedPiece;
    
    setBoard(newBoard);
    setPieces(newPieces);
    setMoves(prev => prev + 1);
    setSelectedPiece(null);

    if (checkWin(newBoard)) {
      setIsWon(true);
      setIsRunning(false);
      setTimeout(() => setShowWinModal(true), 500);
    }
  };

  const handleSelectBoardPiece = (pieceId: number) => {
    if (selectedPiece === pieceId) {
      setSelectedPiece(null);
    } else if (selectedPiece !== null) {
      const selectedPieceData = pieces.find(p => p.id === selectedPiece);
      const targetPieceData = pieces.find(p => p.id === pieceId);
      
      if (!selectedPieceData || !targetPieceData) return;
      
      const newBoard = [...board];
      const newPieces = pieces.map(p => {
        if (p.id === selectedPiece) {
          if (selectedPieceData.currentPosition !== null) {
            newBoard[selectedPieceData.currentPosition] = pieceId;
          }
          return { ...p, currentPosition: targetPieceData.currentPosition };
        }
        if (p.id === pieceId) {
          if (targetPieceData.currentPosition !== null) {
            newBoard[targetPieceData.currentPosition] = selectedPiece;
          }
          return { ...p, currentPosition: selectedPieceData.currentPosition };
        }
        return p;
      });

      setBoard(newBoard);
      setPieces(newPieces);
      setMoves(prev => prev + 1);
      setSelectedPiece(null);

      if (checkWin(newBoard)) {
        setIsWon(true);
        setIsRunning(false);
        setTimeout(() => setShowWinModal(true), 500);
      }
    } else {
      setSelectedPiece(pieceId);
    }
  };

  const handleRemoveFromBoard = (pieceId: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece || piece.currentPosition === null) return;

    const newBoard = [...board];
    newBoard[piece.currentPosition] = null;
    
    const newPieces = pieces.map(p => 
      p.id === pieceId ? { ...p, currentPosition: null } : p
    );

    setBoard(newBoard);
    setPieces(newPieces);
    setSelectedPiece(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const difficultyColor = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400' }[difficulty];
  const difficultyBg = { easy: 'from-green-500 to-emerald-600', medium: 'from-yellow-500 to-orange-600', hard: 'from-red-500 to-pink-600' }[difficulty];

  const piecesInTray = pieces.filter(p => p.currentPosition === null);
  const placedCount = pieces.filter(p => p.currentPosition !== null).length;

  const renderPiece = (pieceId: number, isSelected: boolean = false, isCorrect: boolean = false) => {
    const row = Math.floor(pieceId / gridSize);
    const col = pieceId % gridSize;
    
    return (
      <div
        className={`w-full h-full overflow-hidden rounded transition-all ${
          isSelected ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-[#1a1030] scale-105' : ''
        } ${isCorrect ? 'ring-2 ring-green-500' : ''}`}
        style={{
          backgroundImage: `url(${currentImageUrl})`,
          backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
          backgroundPosition: `${(col / (gridSize - 1)) * 100}% ${(row / (gridSize - 1)) * 100}%`,
        }}
      />
    );
  };

  // Loading state - wait for both data and image to load
  if (!dataLoaded || !imageLoaded || !currentImageUrl) {
    return <LoadingScreen message="Loading puzzle..." />;
  }

  // Preview countdown phase - shows immediately after selecting difficulty
  if (isPreviewPhase) {
    return (
      <main className="h-[100dvh] lg:min-h-screen flex flex-col items-center justify-center px-4 py-6">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/30 mb-4">
              <span className="text-orange-400 font-medium">Memorize the image!</span>
            </div>
            <div className="text-6xl font-bold text-white mb-2">{previewCountdown}</div>
            <p className="text-white/50">Splitting into pieces...</p>
          </div>

          <div className="rounded-2xl overflow-hidden border-2 border-orange-500/50 shadow-2xl animate-pulse">
            <img src={currentImageUrl} alt="Puzzle" className="w-full aspect-square object-cover" />
          </div>
        </div>
      </main>
    );
  }

  // Main game
  return (
    <>
      {/* Mobile Layout */}
      <main className="lg:hidden h-[100dvh] flex flex-col items-center px-3 py-3 overflow-hidden">
        <div className="w-full max-w-[500px] flex flex-col h-full">
          <header className="flex items-center justify-between w-full mb-2 flex-shrink-0">
            <button onClick={onBack} className="text-white/70 p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
              <ArrowLeft size={20} />
            </button>
            <div className="text-center">
              <h1 className="text-base font-bold text-white">Puzzle Challenge</h1>
              <span className={`text-xs font-medium ${difficultyColor}`}>{difficultyLabel}</span>
            </div>
            <button onClick={restartGame} className="text-white/70 p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
              <RotateCcw size={20} />
            </button>
          </header>

          <div className="flex items-center justify-center gap-2 mb-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Clock size={14} className="text-orange-400" />
              <span className="text-white font-bold text-sm">{formatTime(time)}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Target size={14} className="text-purple-400" />
              <span className="text-white font-medium text-sm">{placedCount}/{totalPieces}</span>
            </div>
          </div>

          {/* Puzzle Board */}
          <div className="flex-shrink-0 mb-2">
            <div
              className="grid gap-1 mx-auto bg-white/10 p-2 rounded-xl shadow-lg"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                width: 'min(380px, 95vw)',
                aspectRatio: '1',
              }}
            >
              {board.map((pieceId, position) => {
                const isCorrect = pieceId !== null && pieceId === position;
                return (
                  <div
                    key={position}
                    className={`aspect-square rounded transition-all cursor-pointer ${
                      pieceId === null 
                        ? `bg-white/5 border-2 border-dashed ${selectedPiece !== null ? 'border-orange-500/50 hover:bg-orange-500/10' : 'border-white/20'}` 
                        : ''
                    }`}
                    onClick={() => {
                      if (pieceId === null && selectedPiece !== null) {
                        handlePlaceOnBoard(position);
                      } else if (pieceId !== null) {
                        handleSelectBoardPiece(pieceId);
                      }
                    }}
                  >
                    {pieceId !== null && (
                      <div className="relative w-full h-full">
                        {renderPiece(pieceId, selectedPiece === pieceId, isCorrect)}
                        {isCorrect && (
                          <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Piece Tray */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-white/50 text-xs">Select a piece to place</p>
              {selectedPiece !== null && pieces.find(p => p.id === selectedPiece)?.currentPosition !== null && (
                <button 
                  onClick={() => handleRemoveFromBoard(selectedPiece)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove from board
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-4 gap-2 p-2 bg-white/5 rounded-xl">
                {piecesInTray.map((piece) => (
                  <div
                    key={piece.id}
                    className={`aspect-square rounded-lg cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                      selectedPiece === piece.id ? 'ring-2 ring-orange-500 scale-105' : ''
                    }`}
                    onClick={() => handleSelectPiece(piece.id)}
                  >
                    {renderPiece(piece.id, selectedPiece === piece.id)}
                  </div>
                ))}
                {piecesInTray.length === 0 && (
                  <div className="col-span-4 text-center py-4 text-white/40">
                    <Check className="w-8 h-8 mx-auto mb-1 text-green-500" />
                    <p className="text-sm">All pieces placed!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Desktop Layout */}
      <main className="hidden lg:flex min-h-screen flex-col items-center px-8 py-6">
        <div className="w-full max-w-6xl flex flex-col">
          <header className="flex items-center justify-between w-full mb-6">
            <button onClick={onBack} className="flex items-center gap-2 text-white/70 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${difficultyBg} flex items-center justify-center`}>
                <Puzzle size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Puzzle Challenge</h1>
                <span className={`text-sm font-medium ${difficultyColor}`}>{difficultyLabel} Mode</span>
              </div>
            </div>
            <button onClick={restartGame} className="flex items-center gap-2 text-white/70 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
              <RotateCcw size={20} />
              <span>New Game</span>
            </button>
          </header>

          <div className="flex gap-6">
            {/* Left Side - Stats & Preview */}
            <div className="w-[260px] flex-shrink-0 space-y-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <Clock size={22} className="text-orange-400" />
                  <span className="text-white/60">Time</span>
                </div>
                <p className="text-4xl font-bold text-white">{formatTime(time)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Target size={20} className="text-purple-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{moves}</p>
                  <p className="text-white/50 text-xs">Moves</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Trophy size={20} className="text-yellow-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{placedCount}/{totalPieces}</p>
                  <p className="text-white/50 text-xs">Placed</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">Progress</span>
                  <span className="text-white font-medium">{Math.round((placedCount / totalPieces) * 100)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300"
                    style={{ width: `${(placedCount / totalPieces) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Center - Puzzle Board */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className="grid gap-1.5 bg-white/10 p-4 rounded-2xl shadow-xl"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  width: 'min(550px, 50vw)',
                  aspectRatio: '1',
                }}
              >
                {board.map((pieceId, position) => {
                  const isCorrect = pieceId !== null && pieceId === position;
                  return (
                    <div
                      key={position}
                      className={`aspect-square rounded-lg transition-all cursor-pointer ${
                        pieceId === null 
                          ? `bg-white/5 border-2 border-dashed ${selectedPiece !== null ? 'border-orange-500/50 hover:bg-orange-500/20 hover:border-orange-500' : 'border-white/20 hover:border-white/40'}` 
                          : 'hover:brightness-110'
                      }`}
                      onClick={() => {
                        if (pieceId === null && selectedPiece !== null) {
                          handlePlaceOnBoard(position);
                        } else if (pieceId !== null) {
                          handleSelectBoardPiece(pieceId);
                        }
                      }}
                    >
                      {pieceId !== null && (
                        <div className="relative w-full h-full">
                          {renderPiece(pieceId, selectedPiece === pieceId, isCorrect)}
                          {isCorrect && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {selectedPiece !== null && pieces.find(p => p.id === selectedPiece)?.currentPosition !== null && (
                <button 
                  onClick={() => handleRemoveFromBoard(selectedPiece)}
                  className="mt-4 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Remove selected piece from board
                </button>
              )}
            </div>

            {/* Right Side - Piece Tray */}
            <div className="w-[280px] flex-shrink-0">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-white/60 text-sm mb-3 text-center">
                  {piecesInTray.length > 0 ? 'Click a piece to select it' : 'All pieces placed!'}
                </p>
                <div className="grid grid-cols-3 gap-2 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
                  {piecesInTray.map((piece) => (
                    <div
                      key={piece.id}
                      className={`aspect-square rounded-lg cursor-pointer transition-all hover:scale-105 ${
                        selectedPiece === piece.id ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-[#1a1030] scale-105' : 'hover:ring-2 hover:ring-white/30'
                      }`}
                      onClick={() => handleSelectPiece(piece.id)}
                    >
                      {renderPiece(piece.id, selectedPiece === piece.id)}
                    </div>
                  ))}
                </div>
                {piecesInTray.length === 0 && (
                  <div className="text-center py-8 text-white/40">
                    <Check className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>All pieces on the board!</p>
                    <p className="text-xs mt-1">Check if they're in the right spots</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PuzzleWinModal
        isOpen={showWinModal}
        onClose={() => setShowWinModal(false)}
        onPlayAgain={restartGame}
        onBack={onBack}
        moves={moves}
        time={time}
        difficulty={difficulty}
        gridSize={gridSize}
        coins={getRewards(time).coins}
        xp={getRewards(time).xp}
        tierName={getRewards(time).tierName}
        userName={user?.name}
        userId={user?.id}
        puzzleImageId={puzzleImage?.id}
      />
    </>
  );
}
