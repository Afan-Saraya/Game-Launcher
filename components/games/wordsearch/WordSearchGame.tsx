'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Clock, Target, Search, AlertTriangle, Check } from 'lucide-react';
import WordSearchWinModal from './WordSearchWinModal';
import WordSearchLoseModal from './WordSearchLoseModal';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWordSearchRewardTiers, getWordSearchRewardForTime, WordSearchRewardTierDb } from '@/lib/supabase';

type Difficulty = 'easy' | 'medium' | 'hard';

interface WordSearchGameProps {
  difficulty: Difficulty;
  gridSize: number;
  wordCount: number;
  timeLimit: number;
  coins: number;
  xp: number;
  onBack: () => void;
}

interface Cell {
  letter: string;
  row: number;
  col: number;
  isSelected: boolean;
  isFound: boolean;
  foundWordIndex?: number;
}

interface PlacedWord {
  word: string;
  startRow: number;
  startCol: number;
  direction: { row: number; col: number };
  found: boolean;
}

// Word lists by difficulty
const WORD_LISTS: Record<Difficulty, string[]> = {
  easy: ['CAT', 'DOG', 'SUN', 'HAT', 'RUN', 'FUN', 'BIG', 'RED', 'TOP', 'CUP', 'BOX', 'PEN', 'MAP', 'BUS', 'NET'],
  medium: ['APPLE', 'BEACH', 'CLOUD', 'DANCE', 'EAGLE', 'FLAME', 'GRAPE', 'HOUSE', 'JUICE', 'KITE', 'LEMON', 'MUSIC', 'NIGHT', 'OCEAN', 'PIANO'],
  hard: ['ADVENTURE', 'BUTTERFLY', 'CHOCOLATE', 'DISCOVERY', 'ELEPHANT', 'FANTASTIC', 'GORGEOUS', 'HAPPINESS', 'IMPORTANT', 'JELLYFISH', 'KNOWLEDGE', 'LIGHTNING'],
};

// Directions: left-to-right, top-to-bottom, and diagonals (only forward directions)
const DIRECTIONS = [
  { row: 0, col: 1 },   // right
  { row: 1, col: 0 },   // down
  { row: 1, col: 1 },   // diagonal down-right
  { row: 1, col: -1 },  // diagonal down-left
];

const FOUND_COLORS = [
  'bg-green-500/40',
  'bg-blue-500/40',
  'bg-purple-500/40',
  'bg-pink-500/40',
  'bg-yellow-500/40',
  'bg-orange-500/40',
  'bg-cyan-500/40',
  'bg-red-500/40',
  'bg-emerald-500/40',
  'bg-indigo-500/40',
  'bg-rose-500/40',
  'bg-amber-500/40',
];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function canPlaceWord(grid: string[][], word: string, startRow: number, startCol: number, direction: { row: number; col: number }, gridSize: number): boolean {
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * direction.row;
    const col = startCol + i * direction.col;
    
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return false;
    if (grid[row][col] !== '' && grid[row][col] !== word[i]) return false;
  }
  return true;
}

function placeWord(grid: string[][], word: string, startRow: number, startCol: number, direction: { row: number; col: number }): void {
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * direction.row;
    const col = startCol + i * direction.col;
    grid[row][col] = word[i];
  }
}

function generateGrid(gridSize: number, words: string[]): { grid: string[][]; placedWords: PlacedWord[] } {
  const grid: string[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
  const placedWords: PlacedWord[] = [];
  
  // Sort words by length (longest first for better placement)
  const sortedWords = [...words].sort((a, b) => b.length - a.length);
  
  for (const word of sortedWords) {
    let placed = false;
    const shuffledDirections = shuffleArray([...DIRECTIONS]);
    
    // Try random positions and directions
    for (let attempts = 0; attempts < 100 && !placed; attempts++) {
      const direction = shuffledDirections[attempts % shuffledDirections.length];
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);
      
      if (canPlaceWord(grid, word, startRow, startCol, direction, gridSize)) {
        placeWord(grid, word, startRow, startCol, direction);
        placedWords.push({ word, startRow, startCol, direction, found: false });
        placed = true;
      }
    }
  }
  
  // Fill empty cells with random letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === '') {
        grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
  
  return { grid, placedWords };
}

export default function WordSearchGame({ difficulty, gridSize, wordCount, timeLimit, coins, xp, onBack }: WordSearchGameProps) {
  const { user } = useAuth();
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [words, setWords] = useState<PlacedWord[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [isWon, setIsWon] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLoseModal, setShowLoseModal] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [rewardTiers, setRewardTiers] = useState<WordSearchRewardTierDb[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  // Calculate rewards based on time
  const getRewards = (timeSeconds: number) => {
    if (rewardTiers.length > 0) {
      return getWordSearchRewardForTime(rewardTiers, timeSeconds);
    }
    // Fallback to props
    return { coins, xp, tierName: 'Completed' };
  };

  const completionTime = timeLimit - timeRemaining;

  // Load reward tiers on mount
  useEffect(() => {
    const loadTiers = async () => {
      const tiers = await fetchWordSearchRewardTiers(difficulty);
      setRewardTiers(tiers);
    };
    loadTiers();
  }, [difficulty]);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    setIsLoading(true);
    
    // Select random words for this game
    const availableWords = shuffleArray([...WORD_LISTS[difficulty]]);
    const selectedWords = availableWords.slice(0, wordCount);
    
    // Generate grid with words
    const { grid: letterGrid, placedWords } = generateGrid(gridSize, selectedWords);
    
    // Convert to Cell format
    const cellGrid: Cell[][] = letterGrid.map((row, rowIndex) =>
      row.map((letter, colIndex) => ({
        letter,
        row: rowIndex,
        col: colIndex,
        isSelected: false,
        isFound: false,
      }))
    );
    
    setGrid(cellGrid);
    setWords(placedWords);
    setSelectedCells([]);
    setTimeRemaining(timeLimit);
    setIsWon(false);
    setIsLost(false);
    setShowWinModal(false);
    setShowLoseModal(false);
    setFoundCount(0);
    setIsLoading(false);
  };

  // Timer
  useEffect(() => {
    if (isWon || isLost || isLoading) return;
    
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsLost(true);
      setTimeout(() => setShowLoseModal(true), 500);
    }
  }, [timeRemaining, isWon, isLost, isLoading]);

  // Check for win
  useEffect(() => {
    if (words.length > 0 && words.every(w => w.found) && !isWon) {
      setIsWon(true);
      setTimeout(() => setShowWinModal(true), 500);
    }
  }, [words, isWon]);

  const getCellsInLine = (start: { row: number; col: number }, end: { row: number; col: number }): { row: number; col: number }[] => {
    const cells: { row: number; col: number }[] = [];
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    
    // Determine direction
    const rowDir = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1;
    const colDir = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1;
    
    // Check if it's a valid line (horizontal, vertical, or diagonal)
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);
    
    if (rowDiff !== 0 && colDiff !== 0 && absRowDiff !== absColDiff) {
      // Not a valid diagonal
      return [start];
    }
    
    const steps = Math.max(absRowDiff, absColDiff);
    
    for (let i = 0; i <= steps; i++) {
      cells.push({
        row: start.row + i * rowDir,
        col: start.col + i * colDir,
      });
    }
    
    return cells;
  };

  const handleCellMouseDown = (row: number, col: number) => {
    if (isWon || isLost) return;
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
    updateGridSelection([{ row, col }]);
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isSelecting || isWon || isLost) return;
    
    const start = selectedCells[0];
    if (!start) return;
    
    const cellsInLine = getCellsInLine(start, { row, col });
    setSelectedCells(cellsInLine);
    updateGridSelection(cellsInLine);
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);
    checkSelection();
  };

  const updateGridSelection = (cells: { row: number; col: number }[]) => {
    setGrid(prev => prev.map((row, rowIndex) =>
      row.map((cell, colIndex) => ({
        ...cell,
        isSelected: cells.some(c => c.row === rowIndex && c.col === colIndex),
      }))
    ));
  };

  const checkSelection = () => {
    if (selectedCells.length < 2) {
      clearSelection();
      return;
    }
    
    // Get selected word (only forward direction, no reverse)
    const selectedWord = selectedCells.map(c => grid[c.row][c.col].letter).join('');
    
    // Check if it matches any unfound word (no reverse matching)
    const wordIndex = words.findIndex(w => !w.found && w.word === selectedWord);
    
    if (wordIndex !== -1) {
      // Mark word as found
      setWords(prev => prev.map((w, i) => i === wordIndex ? { ...w, found: true } : w));
      
      // Mark cells as found with color
      setGrid(prev => prev.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isInSelection = selectedCells.some(c => c.row === rowIndex && c.col === colIndex);
          return {
            ...cell,
            isSelected: false,
            isFound: isInSelection ? true : cell.isFound,
            foundWordIndex: isInSelection ? wordIndex : cell.foundWordIndex,
          };
        })
      ));
      
      setFoundCount(prev => prev + 1);
    } else {
      clearSelection();
    }
    
    setSelectedCells([]);
  };

  const clearSelection = () => {
    setGrid(prev => prev.map(row =>
      row.map(cell => ({ ...cell, isSelected: false }))
    ));
    setSelectedCells([]);
  };

  const handleRestart = () => {
    initializeGame();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const difficultyColor = { easy: 'text-green-400', medium: 'text-yellow-400', hard: 'text-red-400' }[difficulty];
  const difficultyBg = { easy: 'from-green-500 to-emerald-600', medium: 'from-yellow-500 to-orange-600', hard: 'from-red-500 to-pink-600' }[difficulty];
  const isLowTime = timeRemaining <= 30;

  // Touch handlers for mobile
  const handleTouchStart = (row: number, col: number) => {
    handleCellMouseDown(row, col);
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSelecting || !gridRef.current) return;
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element) {
      const row = element.getAttribute('data-row');
      const col = element.getAttribute('data-col');
      
      if (row !== null && col !== null) {
        handleCellMouseEnter(parseInt(row), parseInt(col));
      }
    }
  }, [isSelecting, selectedCells]);

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  if (isLoading) {
    return <LoadingScreen message="Generating puzzle..." />;
  }

  const getCellSize = () => {
    if (gridSize >= 12) return 'w-6 h-6 text-xs';
    if (gridSize >= 10) return 'w-7 h-7 text-sm';
    return 'w-8 h-8 text-sm';
  };

  const getCellSizeDesktop = () => {
    if (gridSize >= 12) return 'w-9 h-9 text-base';
    if (gridSize >= 10) return 'w-10 h-10 text-lg';
    return 'w-12 h-12 text-xl';
  };

  return (
    <>
      {/* Mobile Layout */}
      <main 
        className="lg:hidden h-[100dvh] flex flex-col items-center px-3 py-3 overflow-hidden select-none"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full max-w-[500px] flex flex-col h-full">
          <header className="flex items-center justify-between w-full mb-2 flex-shrink-0">
            <button onClick={onBack} className="text-white/70 p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
              <ArrowLeft size={20} />
            </button>
            <div className="text-center">
              <h1 className="text-base font-bold text-white">Word Search</h1>
              <span className={`text-xs font-medium ${difficultyColor}`}>{difficultyLabel}</span>
            </div>
            <button onClick={handleRestart} className="text-white/70 p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
              <RotateCcw size={20} />
            </button>
          </header>

          <div className="flex items-center justify-center gap-2 mb-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <Target size={14} className="text-cyan-400" />
              <span className="text-white font-medium text-sm">{foundCount}/{words.length}</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${isLowTime ? 'bg-red-500/20 border-red-500/30 animate-pulse' : 'bg-white/5 border-white/10'}`}>
              {isLowTime ? <AlertTriangle size={14} className="text-red-400" /> : <Clock size={14} className="text-cyan-400" />}
              <span className={`font-bold text-sm ${isLowTime ? 'text-red-400' : 'text-white'}`}>{formatTime(timeRemaining)}</span>
            </div>
          </div>

          {/* Grid */}
          <div 
            ref={gridRef}
            className="flex-shrink-0 mb-2 overflow-hidden"
            onTouchMove={handleTouchMove}
          >
            <div 
              className="grid gap-0.5 mx-auto bg-white/10 p-2 rounded-xl"
              style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    data-row={rowIndex}
                    data-col={colIndex}
                    className={`${getCellSize()} flex items-center justify-center font-bold rounded cursor-pointer transition-all
                      ${cell.isSelected ? 'bg-cyan-500/60 scale-110' : ''}
                      ${cell.isFound ? FOUND_COLORS[cell.foundWordIndex! % FOUND_COLORS.length] : ''}
                      ${!cell.isSelected && !cell.isFound ? 'bg-white/5 hover:bg-white/10' : ''}
                    `}
                    onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                    onTouchStart={() => handleTouchStart(rowIndex, colIndex)}
                  >
                    <span className="text-white">{cell.letter}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Word List */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <p className="text-white/50 text-xs mb-2 text-center">Find these words:</p>
            <div className="flex flex-wrap gap-2 justify-center overflow-y-auto max-h-full p-2">
              {words.map((word, index) => (
                <div
                  key={index}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    word.found 
                      ? 'bg-green-500/20 text-green-400 line-through' 
                      : 'bg-white/5 text-white border border-white/10'
                  }`}
                >
                  {word.found && <Check size={12} className="inline mr-1" />}
                  {word.word}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Desktop Layout */}
      <main 
        className="hidden lg:flex min-h-screen flex-col items-center px-8 py-6 select-none"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="w-full max-w-6xl flex flex-col">
          <header className="flex items-center justify-between w-full mb-6">
            <button onClick={onBack} className="flex items-center gap-2 text-white/70 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${difficultyBg} flex items-center justify-center`}>
                <Search size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Word Search</h1>
                <span className={`text-sm font-medium ${difficultyColor}`}>{difficultyLabel} Mode</span>
              </div>
            </div>
            <button onClick={handleRestart} className="flex items-center gap-2 text-white/70 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
              <RotateCcw size={20} />
              <span>New Game</span>
            </button>
          </header>

          <div className="flex gap-6">
            {/* Left Side - Stats */}
            <div className="w-[260px] flex-shrink-0 space-y-4">
              <div className={`p-5 rounded-2xl border ${isLowTime ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-3 mb-2">
                  {isLowTime ? <AlertTriangle size={22} className="text-red-400" /> : <Clock size={22} className="text-cyan-400" />}
                  <span className="text-white/60">Time</span>
                </div>
                <p className={`text-4xl font-bold ${isLowTime ? 'text-red-400 animate-pulse' : 'text-white'}`}>{formatTime(timeRemaining)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Target size={20} className="text-cyan-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{foundCount}</p>
                  <p className="text-white/50 text-xs">Found</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Search size={20} className="text-purple-400 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{words.length - foundCount}</p>
                  <p className="text-white/50 text-xs">Remaining</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">Progress</span>
                  <span className="text-white font-medium">{Math.round((foundCount / words.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${(foundCount / words.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Word List */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/60 text-sm mb-3">Words to Find:</p>
                <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {words.map((word, index) => (
                    <div
                      key={index}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        word.found 
                          ? 'bg-green-500/20 text-green-400 line-through' 
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {word.found && <Check size={12} className="inline mr-1" />}
                      {word.word}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center - Grid */}
            <div className="flex-1 flex items-center justify-center">
              <div 
                className="grid gap-1 bg-white/10 p-4 rounded-2xl shadow-xl"
                style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      data-row={rowIndex}
                      data-col={colIndex}
                      className={`${getCellSizeDesktop()} flex items-center justify-center font-bold rounded-lg cursor-pointer transition-all
                        ${cell.isSelected ? 'bg-cyan-500/60 scale-110 shadow-lg' : ''}
                        ${cell.isFound ? FOUND_COLORS[cell.foundWordIndex! % FOUND_COLORS.length] : ''}
                        ${!cell.isSelected && !cell.isFound ? 'bg-white/5 hover:bg-white/15' : ''}
                      `}
                      onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                    >
                      <span className="text-white">{cell.letter}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <WordSearchWinModal
        isOpen={showWinModal}
        onClose={() => setShowWinModal(false)}
        onPlayAgain={handleRestart}
        onBack={onBack}
        wordsFound={foundCount}
        totalWords={words.length}
        time={completionTime}
        difficulty={difficulty}
        coins={getRewards(completionTime).coins}
        xp={getRewards(completionTime).xp}
        tierName={getRewards(completionTime).tierName}
        userName={user?.name}
        userId={user?.id}
      />

      <WordSearchLoseModal
        isOpen={showLoseModal}
        onClose={() => setShowLoseModal(false)}
        onTryAgain={handleRestart}
        onBack={onBack}
        wordsFound={foundCount}
        totalWords={words.length}
        difficulty={difficulty}
        timeSeconds={timeLimit}
        userId={user?.id}
        userName={user?.name}
      />
    </>
  );
}
