'use client';

import React, { useState } from 'react';
import { MinusIcon, MaximizeTileIcon, SquareIcon, XIcon } from '@/components/ui/hugeicons';

export default function WindowControls() {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isElectron) return null;

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow?.();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow?.();
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow?.();
  };

  return (
    <div className="flex items-center gap-1 select-none no-drag">
      {/* Minimize Button */}
      <button
        onClick={handleMinimize}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-white/10 transition-all cursor-pointer group"
        title="Minimize"
      >
        <MinusIcon className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
      </button>

      {/* Maximize / Restore Button */}
      <button
        onClick={handleMaximize}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-white/10 transition-all cursor-pointer group"
        title={isMaximized ? 'Restore Down' : 'Maximize'}
      >
        {isMaximized ? (
          <SquareIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
        ) : (
          <MaximizeTileIcon className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-rose-500 transition-all cursor-pointer group"
        title="Close"
      >
        <XIcon className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
