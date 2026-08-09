'use client';

import React, { useState, useEffect } from 'react';

export default function WindowControls() {
  const [mounted, setMounted] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow?.();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow?.();
    setIsMaximized((prev) => !prev);
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow?.();
  };

  return (
    <div className="flex items-center select-none no-drag h-11">
      {/* Minimize */}
      <button
        onClick={handleMinimize}
        className="w-11 h-11 flex items-center justify-center text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-white/[0.08] transition-colors cursor-default"
        title="Minimize"
        aria-label="Minimize"
      >
        <svg width="10" height="1" viewBox="0 0 10 1" className="fill-current">
          <rect width="10" height="1" />
        </svg>
      </button>

      {/* Maximize / Restore */}
      <button
        onClick={handleMaximize}
        className="w-11 h-11 flex items-center justify-center text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-white/[0.08] transition-colors cursor-default"
        title={isMaximized ? 'Restore' : 'Maximize'}
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
      >
        {isMaximized ? (
          <svg width="10" height="10" viewBox="0 0 10 10" className="fill-none stroke-current" strokeWidth="1">
            <path d="M2.5 2.5v-2h7v7h-2M0.5 2.5h7v7h-7z" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" className="fill-none stroke-current" strokeWidth="1">
            <rect x="0.5" y="0.5" width="9" height="9" />
          </svg>
        )}
      </button>

      {/* Close */}
      <button
        onClick={handleClose}
        className="w-11 h-11 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#e81123] transition-colors cursor-default"
        title="Close"
        aria-label="Close"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" className="stroke-current" strokeWidth="1.1">
          <line x1="1" y1="1" x2="9" y2="9" />
          <line x1="9" y1="1" x2="1" y2="9" />
        </svg>
      </button>
    </div>
  );
}
