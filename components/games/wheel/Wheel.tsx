'use client';

import { WheelProps } from '@/lib/types';
import iconMap from '@/components/shared/IconMap';

interface ExtendedWheelProps extends WheelProps {
  size?: 'normal' | 'large';
}

export default function Wheel({ prizes, rotation, isSpinning, size = 'normal' }: ExtendedWheelProps) {
  const isLarge = size === 'large';
  
  // Size configurations
  const containerHeight = isLarge ? 'h-[320px]' : 'h-[220px]';
  const outerRingSize = isLarge ? 'w-[600px] h-[600px]' : 'w-[115vw] h-[115vw] max-w-[470px] max-h-[470px]';
  const innerBorderSize = isLarge ? 'w-[588px] h-[588px]' : 'w-[112vw] h-[112vw] max-w-[460px] max-h-[460px]';
  const wheelSize = isLarge ? 'w-[580px] h-[580px]' : 'w-[110vw] h-[110vw] max-w-[450px] max-h-[450px]';
  const outerTop = isLarge ? 'top-[16px]' : 'top-[12px]';
  const innerTop = isLarge ? 'top-[22px]' : 'top-[18px]';
  const wheelTop = isLarge ? 'top-[26px]' : 'top-[20px]';

  return (
    <div className="relative w-full my-6">
      {/* Pointer at top - Casino style */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
        <div className="relative">
          <div className={`w-0 h-0 border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg ${isLarge ? 'border-l-[20px] border-r-[20px] border-t-[36px]' : 'border-l-[16px] border-r-[16px] border-t-[28px]'}`} />
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-transparent border-r-transparent border-t-yellow-300 ${isLarge ? 'border-l-[15px] border-r-[15px] border-t-[28px]' : 'border-l-[12px] border-r-[12px] border-t-[22px]'}`} />
        </div>
      </div>

      {/* Wheel container - shows only top arc */}
      <div className={`relative w-full ${containerHeight} overflow-hidden`}>
        {/* Outer decorative ring */}
        <div 
          className={`absolute ${outerRingSize} left-1/2 ${outerTop} rounded-full`}
          style={{ 
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 25%, #FFD700 50%, #B8860B 75%, #FFD700 100%)',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.4), inset 0 0 20px rgba(0,0,0,0.3)',
          }}
        />
        
        {/* Inner border ring */}
        <div 
          className={`absolute ${innerBorderSize} left-1/2 ${innerTop} rounded-full`}
          style={{ 
            transform: 'translateX(-50%)',
            background: 'linear-gradient(180deg, #2a1f4e 0%, #0d0620 100%)',
            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)',
          }}
        />

        <div 
          className={`absolute ${wheelSize} left-1/2 ${wheelTop} rounded-full overflow-hidden`}
          style={{ 
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)',
          }}
        >
          {/* Wheel segments */}
          <svg viewBox="0 0 500 500" className="w-full h-full">
            <defs>
              {prizes.map((prize) => (
                <linearGradient key={`grad-${prize.id}`} id={`grad-${prize.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={prize.color} />
                  <stop offset="50%" stopColor={prize.color} />
                  <stop offset="100%" stopColor={prize.color} stopOpacity="0.7" />
                </linearGradient>
              ))}
              {/* Gold border gradient */}
              <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#FFD700" />
              </linearGradient>
            </defs>
            
            {/* Outer wheel border */}
            <circle cx="250" cy="250" r="248" fill="none" stroke="url(#goldBorder)" strokeWidth="4" />
            
            {prizes.map((prize, index) => {
              const segmentAngle = 360 / prizes.length;
              const startAngle = index * segmentAngle - 90 - segmentAngle / 2;
              const endAngle = startAngle + segmentAngle;
              
              const startRad = (startAngle * Math.PI) / 180;
              const endRad = (endAngle * Math.PI) / 180;
              
              const x1 = 250 + 245 * Math.cos(startRad);
              const y1 = 250 + 245 * Math.sin(startRad);
              const x2 = 250 + 245 * Math.cos(endRad);
              const y2 = 250 + 245 * Math.sin(endRad);
              
              const largeArc = segmentAngle > 180 ? 1 : 0;
              
              const pathD = `M 250 250 L ${x1} ${y1} A 245 245 0 ${largeArc} 1 ${x2} ${y2} Z`;
              
              // Divider line coordinates
              const divX = 250 + 245 * Math.cos(startRad);
              const divY = 250 + 245 * Math.sin(startRad);
              
              // Icon position
              const midAngle = (startAngle + endAngle) / 2;
              const midRad = (midAngle * Math.PI) / 180;
              const iconX = 250 + 155 * Math.cos(midRad);
              const iconY = 250 + 155 * Math.sin(midRad);

              const IconComponent = iconMap[prize.icon];

              return (
                <g key={prize.id}>
                  <path
                    d={pathD}
                    fill={`url(#grad-${prize.id})`}
                  />
                  {/* Gold divider line between segments */}
                  <line
                    x1="250"
                    y1="250"
                    x2={divX}
                    y2={divY}
                    stroke="#FFD700"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Icon */}
                  <foreignObject
                    x={iconX - 24}
                    y={iconY - 24}
                    width="48"
                    height="48"
                    style={{ transform: `rotate(${midAngle + 90}deg)`, transformOrigin: `${iconX}px ${iconY}px` }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      {IconComponent && <IconComponent className="w-9 h-9 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" strokeWidth={2.5} />}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
            
            {/* Center hub - casino style */}
            <circle cx="250" cy="250" r="35" fill="url(#goldBorder)" />
            <circle cx="250" cy="250" r="30" fill="#1a1030" />
            <circle cx="250" cy="250" r="25" fill="url(#goldBorder)" />
            <circle cx="250" cy="250" r="20" fill="#2a1f4e" />
            <circle cx="250" cy="250" r="8" fill="#FFD700" />
          </svg>
        </div>
      </div>

      {/* Bottom pointer/indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20">
        <div className="relative">
          <div className={`w-0 h-0 border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg ${isLarge ? 'border-l-[18px] border-r-[18px] border-b-[30px]' : 'border-l-[14px] border-r-[14px] border-b-[24px]'}`} />
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-transparent border-r-transparent border-b-yellow-300 ${isLarge ? 'border-l-[13px] border-r-[13px] border-b-[22px]' : 'border-l-[10px] border-r-[10px] border-b-[18px]'}`} />
        </div>
      </div>
    </div>
  );
}
