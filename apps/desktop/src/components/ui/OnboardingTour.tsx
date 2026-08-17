'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  XIcon,
  SparklesIcon,
  CheckCircleIcon,
  FolderOpenIcon,
  CompassIcon,
  SearchIcon,
  DownloadIcon,
} from '@/components/ui/hugeicons';

interface TourStepConfig {
  targetSelector: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  nextLabel: string;
}

const steps: TourStepConfig[] = [
  {
    targetSelector: '[data-tour="settings-storage-path"]',
    badge: 'Step 1 of 5',
    title: 'Default Installation Path',
    description:
      'Welcome to OpenStore! By default, all cloned repositories and open-source applications are saved into your Downloads/OpenStore directory. You can customize this storage location anytime here in Settings.',
    icon: FolderOpenIcon,
    nextLabel: 'Next: Explore Repos →',
  },
  {
    targetSelector: '[data-tour="nav-explore"]',
    badge: 'Step 2 of 5',
    title: 'Explore Tab',
    description:
      'Click on Explore to discover over 100M+ open-source software tools, GitHub repositories, and developer tools curated for Windows.',
    icon: CompassIcon,
    nextLabel: 'Next: Search Projects →',
  },
  {
    targetSelector: '[data-tour="explore-search"]',
    badge: 'Step 3 of 5',
    title: 'Search Any Repository',
    description:
      'Type any project name or topic (e.g. "obs-studio", "ollama", "vscode") into the search bar to search GitHub in real-time.',
    icon: SearchIcon,
    nextLabel: 'Next: 1-Click Install →',
  },
  {
    targetSelector: '[data-tour="app-card-first"]',
    badge: 'Step 4 of 5',
    title: '1-Click Clone & Setup',
    description:
      'Click on any repository card to view source details, release builds, and run 1-click installations directly on your Windows PC.',
    icon: DownloadIcon,
    nextLabel: 'Next: Get Started →',
  },
  {
    targetSelector: '',
    badge: 'Step 5 of 5',
    title: 'You\'re All Set!',
    description:
      'You are ready to explore, build, and run open-source software locally with OpenStore. Enjoy your experience! You can replay this tour anytime from Settings.',
    icon: SparklesIcon,
    nextLabel: 'Finish & Start Exploring',
  },
];

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function OnboardingTour() {
  const { isTourActive, tourStep, nextTourStep, prevTourStep, skipTour, completeTour } = useAppStore();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);

  const currentStepConfig = steps[tourStep] || steps[0];
  const isLastStep = tourStep === steps.length - 1;

  const updateTargetRect = useCallback(() => {
    if (!isTourActive) return;

    if (!currentStepConfig.targetSelector) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(currentStepConfig.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setTargetRect(null);
    }
  }, [isTourActive, currentStepConfig]);

  useEffect(() => {
    updateTargetRect();

    // Retry finding element if page rendered dynamically
    const timer = setTimeout(updateTargetRect, 200);
    const timer2 = setTimeout(updateTargetRect, 500);

    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [updateTargetRect, tourStep]);

  if (!isTourActive) return null;

  const StepIcon = currentStepConfig.icon;

  // Compute popover location
  let popoverStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };

  if (targetRect) {
    const spaceBelow = window.innerHeight - (targetRect.top + targetRect.height);
    const cardHeightEstimate = 240;

    if (spaceBelow >= cardHeightEstimate + 20) {
      popoverStyle = {
        position: 'fixed',
        top: Math.min(window.innerHeight - cardHeightEstimate - 20, targetRect.top + targetRect.height + 16),
        left: Math.max(16, Math.min(window.innerWidth - 340, targetRect.left + targetRect.width / 2 - 160)),
      };
    } else if (targetRect.top >= cardHeightEstimate + 20) {
      popoverStyle = {
        position: 'fixed',
        top: Math.max(16, targetRect.top - cardHeightEstimate - 16),
        left: Math.max(16, Math.min(window.innerWidth - 340, targetRect.left + targetRect.width / 2 - 160)),
      };
    } else {
      popoverStyle = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] overflow-hidden select-none pointer-events-auto">
        {/* Spotlight Dimming Mask */}
        {targetRect ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              top: Math.max(0, targetRect.top - 8),
              left: Math.max(0, targetRect.left - 8),
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
            className="fixed z-[9992] rounded-2xl pointer-events-none ring-2 ring-emerald-500/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.72),0_0_25px_rgba(16,185,129,0.35)] transition-all duration-300 ease-out"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[9992]"
          />
        )}

        {/* Floating Glassmorphic Tour Card */}
        <motion.div
          key={`tour-step-${tourStep}`}
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: -10 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={popoverStyle}
          className="z-[9999] w-84 max-w-[calc(100vw-32px)] bg-zinc-950/95 dark:bg-[#121215]/95 backdrop-blur-2xl border border-zinc-700/80 dark:border-white/20 text-white rounded-2xl p-5 shadow-2xl space-y-4"
        >
          {/* Header & Progress Dots */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                <StepIcon className="w-3 h-3" />
                {currentStepConfig.badge}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Step indicator dots */}
              <div className="flex items-center gap-1">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === tourStep
                        ? 'w-4 bg-emerald-400'
                        : i < tourStep
                        ? 'w-1.5 bg-emerald-400/50'
                        : 'w-1.5 bg-zinc-700'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={skipTour}
                className="text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer rounded-lg hover:bg-white/10"
                title="Skip Tour"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
              {currentStepConfig.title}
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed font-normal">
              {currentStepConfig.description}
            </p>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <button
              onClick={skipTour}
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer px-2 py-1"
            >
              Skip Tour
            </button>

            <div className="flex items-center gap-2">
              {tourStep > 0 && (
                <button
                  onClick={prevTourStep}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={isLastStep ? completeTour : nextTourStep}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
              >
                {isLastStep ? (
                  <>
                    <span>Finish</span>
                    <CheckCircleIcon className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
