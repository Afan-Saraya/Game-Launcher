'use client';

interface MemoryCardProps {
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

// Check if the string is an emoji (short string, not a URL)
const isEmoji = (str: string) => {
  return str.length <= 4 && !str.startsWith('http');
};

export default function MemoryCard({ icon, isFlipped, isMatched, onClick, size = 'md', disabled }: MemoryCardProps) {
  // Text sizes for emojis based on card size
  const emojiSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const questionMarkSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const isImageUrl = !isEmoji(icon);

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`aspect-square w-full ${disabled ? 'cursor-default' : 'cursor-pointer active:scale-95 transition-transform'}`}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped || isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Back of card (question mark) */}
        <div
          className={`absolute w-full h-full rounded-lg flex items-center justify-center overflow-hidden ${
            isMatched ? 'opacity-0' : ''
          }`}
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
          }}
        >
          <span className={`text-white/80 font-bold ${questionMarkSizes[size]}`}>?</span>
        </div>

        {/* Front of card (icon or image) */}
        <div
          className={`absolute w-full h-full rounded-lg overflow-hidden ${
            isMatched ? 'ring-2 ring-green-500/50' : ''
          }`}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {isImageUrl ? (
            <img 
              src={icon} 
              alt="card" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-white/10 border border-white/20 rounded-lg ${isMatched ? 'bg-green-500/20' : ''}`}>
              <span className={emojiSizes[size]}>{icon}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
