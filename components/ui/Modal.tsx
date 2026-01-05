'use client';

import { ModalProps } from '@/lib/types';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-gradient-to-b from-[#2a1f4e] to-[#0d0620] rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl z-[101] animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
}
