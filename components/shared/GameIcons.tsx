'use client';

// App-style icons with rounded backgrounds - like real mobile app icons

interface IconProps {
  className?: string;
  size?: number;
}

// Wheel of Fortune Icon - App style with gradient background
export function WheelIcon({ className = '', size = 48 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      className={className}
    >
      {/* Rounded square background */}
      <rect width="64" height="64" rx="14" fill="url(#wheelBg)"/>
      
      {/* Wheel */}
      <circle cx="32" cy="32" r="18" fill="url(#wheelInner)" stroke="#fff" strokeWidth="2"/>
      
      {/* Wheel segments */}
      <path d="M32 14 L32 32 L46 20" fill="#FF6B6B"/>
      <path d="M32 32 L46 20 L50 32" fill="#4ECDC4"/>
      <path d="M32 32 L50 32 L46 44" fill="#FFE66D"/>
      <path d="M32 32 L46 44 L32 50" fill="#95E1D3"/>
      <path d="M32 32 L32 50 L18 44" fill="#FF6B6B"/>
      <path d="M32 32 L18 44 L14 32" fill="#4ECDC4"/>
      <path d="M32 32 L14 32 L18 20" fill="#FFE66D"/>
      <path d="M32 32 L18 20 L32 14" fill="#95E1D3"/>
      
      {/* Center circle */}
      <circle cx="32" cy="32" r="6" fill="#1a1a2e" stroke="#FFD700" strokeWidth="2"/>
      <circle cx="32" cy="32" r="2.5" fill="#FFD700"/>
      
      {/* Pointer */}
      <polygon points="32,8 35,14 29,14" fill="#FFD700" stroke="#fff" strokeWidth="1"/>
      
      {/* Shine effect */}
      <ellipse cx="26" cy="22" rx="6" ry="4" fill="white" opacity="0.2"/>
      
      <defs>
        <linearGradient id="wheelBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b"/>
          <stop offset="100%" stopColor="#d97706"/>
        </linearGradient>
        <linearGradient id="wheelInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Memory Game Icon - Brain/Cards style
export function MemoryIcon({ className = '', size = 48 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      className={className}
    >
      {/* Rounded square background */}
      <rect width="64" height="64" rx="14" fill="url(#memoryBg)"/>
      
      {/* Back card */}
      <rect x="12" y="14" width="20" height="28" rx="3" fill="#7c3aed" stroke="#fff" strokeWidth="1.5"/>
      <rect x="15" y="17" width="14" height="22" rx="2" fill="#8b5cf6" opacity="0.5"/>
      <text x="22" y="32" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">?</text>
      
      {/* Front card */}
      <rect x="32" y="22" width="20" height="28" rx="3" fill="#ec4899" stroke="#fff" strokeWidth="1.5"/>
      <circle cx="42" cy="36" r="6" fill="#fff"/>
      <text x="42" y="40" textAnchor="middle" fill="#ec4899" fontSize="10" fontWeight="bold">★</text>
      
      {/* Sparkle */}
      <circle cx="50" cy="16" r="2" fill="#fff"/>
      <circle cx="54" cy="20" r="1.5" fill="#fff" opacity="0.7"/>
      
      {/* Shine effect */}
      <ellipse cx="20" cy="20" rx="5" ry="3" fill="white" opacity="0.2"/>
      
      <defs>
        <linearGradient id="memoryBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Puzzle Game Icon - Jigsaw style
export function PuzzleIcon({ className = '', size = 48 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      className={className}
    >
      {/* Rounded square background */}
      <rect width="64" height="64" rx="14" fill="url(#puzzleBg)"/>
      
      {/* Puzzle pieces */}
      {/* Top-left - Orange */}
      <path 
        d="M14 14 H28 C28 14 28 18 32 18 C36 18 36 14 36 14 V14 H36 V28 C36 28 32 28 32 32 C32 36 36 36 36 36 H14 V14 Z" 
        fill="#f97316" 
        stroke="#fff" 
        strokeWidth="1.5"
      />
      
      {/* Top-right - Green */}
      <path 
        d="M36 14 C36 14 36 18 40 18 C44 18 44 14 44 14 H50 V36 H36 C36 36 36 32 32 32 C28 32 28 36 28 36 V36 H36 V14 Z" 
        fill="#22c55e" 
        stroke="#fff" 
        strokeWidth="1.5"
      />
      
      {/* Bottom-left - Blue */}
      <path 
        d="M14 36 H28 C28 36 28 40 32 40 C36 40 36 36 36 36 V50 H14 V36 Z" 
        fill="#3b82f6" 
        stroke="#fff" 
        strokeWidth="1.5"
      />
      
      {/* Bottom-right - Purple */}
      <path 
        d="M36 36 C36 36 36 40 40 40 C44 40 44 36 44 36 H50 V50 H36 V36 Z" 
        fill="#a855f7" 
        stroke="#fff" 
        strokeWidth="1.5"
      />
      
      {/* Shine effect */}
      <ellipse cx="22" cy="22" rx="5" ry="3" fill="white" opacity="0.25"/>
      
      <defs>
        <linearGradient id="puzzleBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899"/>
          <stop offset="100%" stopColor="#db2777"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Word Search Icon - Magnifying glass over letters
export function WordSearchIcon({ className = '', size = 48 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      className={className}
    >
      {/* Rounded square background */}
      <rect width="64" height="64" rx="14" fill="url(#wordBg)"/>
      
      {/* Letter grid */}
      <rect x="10" y="10" width="30" height="30" rx="4" fill="#0e7490" stroke="#fff" strokeWidth="1"/>
      
      {/* Letters */}
      <text x="15" y="22" fill="#fff" fontSize="7" fontFamily="monospace" fontWeight="bold">W I N</text>
      <text x="15" y="31" fill="#fff" fontSize="7" fontFamily="monospace" opacity="0.6">A B C</text>
      <text x="15" y="40" fill="#fff" fontSize="7" fontFamily="monospace" opacity="0.6">X Y Z</text>
      
      {/* Highlight on WIN */}
      <rect x="13" y="14" width="25" height="10" rx="2" fill="#22d3ee" opacity="0.3"/>
      
      {/* Magnifying glass */}
      <circle cx="44" cy="44" r="12" fill="#0891b2" stroke="#fff" strokeWidth="3"/>
      <circle cx="44" cy="44" r="7" fill="#06b6d4" opacity="0.5"/>
      <line x1="52" y1="52" x2="58" y2="58" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
      
      {/* Shine on magnifying glass */}
      <ellipse cx="40" cy="40" rx="3" ry="2" fill="white" opacity="0.4"/>
      
      <defs>
        <linearGradient id="wordBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4"/>
          <stop offset="100%" stopColor="#0891b2"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Pac-Man Icon - Classic arcade style
export function PacmanIcon({ className = '', size = 48 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      className={className}
    >
      {/* Rounded square background - dark blue like arcade */}
      <rect width="64" height="64" rx="14" fill="url(#pacmanBg)"/>
      
      {/* Maze hint lines */}
      <path d="M8 20 H20 V12" stroke="#1e3a5f" strokeWidth="3" fill="none"/>
      <path d="M56 44 H44 V52" stroke="#1e3a5f" strokeWidth="3" fill="none"/>
      
      {/* Pac-Man */}
      <path 
        d="M32 12 A16 16 0 1 1 32 44 A16 16 0 1 1 32 12 L32 28 L44 18 Z" 
        fill="#FFDD00"
        stroke="#FFB800"
        strokeWidth="1"
      />
      {/* Pac-Man eye */}
      <circle cx="30" cy="20" r="3" fill="#1a1a2e"/>
      
      {/* Dots */}
      <circle cx="48" cy="28" r="3" fill="#FFB800"/>
      <circle cx="56" cy="28" r="2" fill="#FFB800" opacity="0.7"/>
      
      {/* Ghost */}
      <path 
        d="M12 36 Q12 28 20 28 Q28 28 28 36 L28 48 L24 44 L20 48 L16 44 L12 48 Z" 
        fill="#FF0000"
        stroke="#CC0000"
        strokeWidth="0.5"
      />
      {/* Ghost eyes */}
      <circle cx="16" cy="34" r="3" fill="#fff"/>
      <circle cx="24" cy="34" r="3" fill="#fff"/>
      <circle cx="17" cy="35" r="1.5" fill="#1a1a2e"/>
      <circle cx="25" cy="35" r="1.5" fill="#1a1a2e"/>
      
      {/* Shine effect */}
      <ellipse cx="28" cy="18" rx="4" ry="2" fill="white" opacity="0.3"/>
      
      <defs>
        <linearGradient id="pacmanBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a"/>
          <stop offset="100%" stopColor="#1e40af"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Scratch Card Icon - For coming soon
export function ScratchIcon({ className = '', size = 48 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      className={className}
    >
      {/* Rounded square background */}
      <rect width="64" height="64" rx="14" fill="url(#scratchBg)"/>
      
      {/* Ticket shape */}
      <rect x="10" y="16" width="44" height="32" rx="4" fill="#fff"/>
      
      {/* Scratch area */}
      <rect x="14" y="20" width="36" height="16" rx="2" fill="#9ca3af"/>
      
      {/* Scratched reveal */}
      <path d="M18 24 Q24 28 30 24 Q36 20 42 26" stroke="#10b981" strokeWidth="3" fill="none"/>
      <text x="32" y="33" textAnchor="middle" fill="#10b981" fontSize="8" fontWeight="bold">WIN!</text>
      
      {/* Stars */}
      <text x="18" y="44" fill="#fbbf24" fontSize="10">★</text>
      <text x="32" y="44" fill="#fbbf24" fontSize="10">★</text>
      <text x="46" y="44" fill="#fbbf24" fontSize="10">★</text>
      
      {/* Coin hint */}
      <circle cx="52" cy="14" r="6" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/>
      <text x="52" y="17" textAnchor="middle" fill="#92400e" fontSize="8" fontWeight="bold">$</text>
      
      <defs>
        <linearGradient id="scratchBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Export all icons
export const GameIcons = {
  wheel: WheelIcon,
  memory: MemoryIcon,
  puzzle: PuzzleIcon,
  wordsearch: WordSearchIcon,
  pacman: PacmanIcon,
  scratch: ScratchIcon,
};
