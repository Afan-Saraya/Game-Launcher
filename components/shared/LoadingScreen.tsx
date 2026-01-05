'use client';

import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
          {/* Inner glow */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse" />
        </div>
        <p className="text-white/70 text-lg font-medium">{message}</p>
        <div className="flex items-center justify-center gap-1 mt-3">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
