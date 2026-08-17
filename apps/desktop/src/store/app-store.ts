import { create } from 'zustand';
import type { Application, InstalledApp, Task, SystemInfo, ActivityEvent, SearchFilters } from '@/lib/types';
import { applications, mockInstalledApps, categories } from '@/lib/mock-data';
import type { Category } from '@/lib/types';

export interface AppSettings {
  installDir: string;
  autoCheckUpdates: boolean;
  sendDiagnostics: boolean;
  verifyChecksums: boolean;
  updateNotifications: boolean;
  groqApiKey?: string;
}

const getInitialActivities = (): ActivityEvent[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('openstore-activities');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const getInitialSettings = (): AppSettings => {
  const defaults: AppSettings = {
    installDir: '',
    autoCheckUpdates: true,
    sendDiagnostics: false,
    verifyChecksums: true,
    updateNotifications: true,
    groqApiKey: '',
  };
  if (typeof window === 'undefined') return defaults;
  try {
    const saved = localStorage.getItem('openstore-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate legacy hardcoded Public path to personal user downloads
      if (parsed.installDir && parsed.installDir.toLowerCase().includes('public\\downloads')) {
        parsed.installDir = '';
      }
      return { ...defaults, ...parsed };
    }
    return defaults;
  } catch {
    return defaults;
  }
};

// ─── App Store State ─────────────────────────────────────────────────────────
interface AppStoreState {
  // Navigation
  currentView: 'home' | 'app-detail' | 'install' | 'my-apps' | 'updates' | 'activity' | 'settings' | 'search' | 'category';
  selectedAppSlug: string | null;
  selectedCategoryId: string | null;
  searchQuery: string;
  searchFilters: SearchFilters;

  // Data
  applications: Application[];
  categories: Category[];
  installedApps: InstalledApp[];
  activities: ActivityEvent[];

  // Settings
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;

  // Installation state
  currentInstallation: {
    appId: string | null;
    jobId: string | null;
    tasks: Task[];
    currentTaskIndex: number;
    progress: number;
    status: 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
    logs: string[];
  };

  // System
  systemInfo: SystemInfo | null;
  isElectron: boolean;

  // Theme & Layout
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Onboarding Tour
  hasCompletedTour: boolean;
  isTourActive: boolean;
  tourStep: number;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  resetTour: () => void;

  // Actions
  navigate: (view: AppStoreState['currentView'], params?: { slug?: string; categoryId?: string }) => void;
  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: SearchFilters) => void;
  startInstallation: (appId: string) => void;
  cancelInstallation: () => void;
  updateTaskStatus: (taskIndex: number, task: Partial<Task>) => void;
  setSystemInfo: (info: SystemInfo) => void;
  addActivity: (event: ActivityEvent) => void;
  addInstalledApp: (app: InstalledApp) => void;
  removeInstalledApp: (id: string) => void;
  updateInstalledAppStatus: (id: string, status: InstalledApp['status']) => void;
  updateAppVersion: (installedId: string) => void;
  updateAllApps: () => void;
}

export const useAppStore = create<AppStoreState>((set) => ({
  // ─── Navigation ──────────────────────────────────────────────────────────
  currentView: 'home',
  selectedAppSlug: null,
  selectedCategoryId: null,
  searchQuery: '',
  searchFilters: {},

  // ─── Data ────────────────────────────────────────────────────────────────
  applications,
  categories,
  installedApps: mockInstalledApps,
  activities: getInitialActivities(),
  settings: getInitialSettings(),

  updateSetting: (key, value) =>
    set((state) => {
      const newSettings = { ...state.settings, [key]: value };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('openstore-settings', JSON.stringify(newSettings));
          if ((key as string) === 'theme' && window.electronAPI?.setTitlebarTheme) {
            window.electronAPI.setTitlebarTheme(value as string);
          }
        } catch {}
      }
      return { settings: newSettings };
    }),

  // ─── Installation state ──────────────────────────────────────────────────
  currentInstallation: {
    appId: null,
    jobId: null,
    tasks: [],
    currentTaskIndex: 0,
    progress: 0,
    status: 'idle',
    logs: [],
  },

  // ─── System, Theme & Layout ──────────────────────────────────────────────
  systemInfo: null,
  isElectron: typeof window !== 'undefined' && !!window.electronAPI,
  theme: 'dark',
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  // ─── Onboarding Tour ──────────────────────────────────────────────────────
  hasCompletedTour: typeof window !== 'undefined' ? Boolean(localStorage.getItem('openstore-tour-completed')) : false,
  isTourActive: false,
  tourStep: 0,

  startTour: () =>
    set((state) => {
      state.navigate('settings');
      return { isTourActive: true, tourStep: 0 };
    }),

  nextTourStep: () =>
    set((state) => {
      const nextStep = state.tourStep + 1;
      if (nextStep === 1) {
        // Step 1 -> Step 2: Highlight Explore Tab
        state.navigate('settings');
      } else if (nextStep === 2) {
        // Step 2 -> Step 3: Search Repos
        state.navigate('search');
      } else if (nextStep >= 5) {
        // Completed
        if (typeof window !== 'undefined') {
          localStorage.setItem('openstore-tour-completed', 'true');
        }
        return { isTourActive: false, hasCompletedTour: true, tourStep: 0 };
      }
      return { tourStep: nextStep };
    }),

  prevTourStep: () =>
    set((state) => {
      const prevStep = Math.max(0, state.tourStep - 1);
      if (prevStep === 0) {
        state.navigate('settings');
      } else if (prevStep === 1 || prevStep === 2 || prevStep === 3) {
        state.navigate('search');
      }
      return { tourStep: prevStep };
    }),

  skipTour: () =>
    set(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('openstore-tour-completed', 'true');
      }
      return { isTourActive: false, hasCompletedTour: true };
    }),

  completeTour: () =>
    set(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('openstore-tour-completed', 'true');
      }
      return { isTourActive: false, hasCompletedTour: true, tourStep: 0 };
    }),

  resetTour: () =>
    set((state) => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('openstore-tour-completed');
      }
      state.navigate('settings');
      return { hasCompletedTour: false, isTourActive: true, tourStep: 0 };
    }),

  // ─── Actions ─────────────────────────────────────────────────────────────
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('dark', 'light');
      let effectiveTheme = theme;
      if (theme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      root.classList.add(effectiveTheme);
      localStorage.setItem('openstore-theme', theme);
      if (window.electronAPI?.setTitlebarTheme) {
        window.electronAPI.setTitlebarTheme(effectiveTheme);
      }
    }
    set({ theme });
  },

  navigate: (view, params) =>
    set({
      currentView: view,
      selectedAppSlug: params?.slug ?? null,
      selectedCategoryId: params?.categoryId ?? null,
    }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSearchFilters: (filters) => set({ searchFilters: filters }),

  startInstallation: (appId) =>
    set((state) => ({
      currentInstallation: {
        appId,
        jobId: `job-${Date.now()}`,
        tasks: [],
        currentTaskIndex: 0,
        progress: 0,
        status: 'running',
        logs: [],
      },
    })),

  cancelInstallation: () =>
    set((state) => ({
      currentInstallation: {
        ...state.currentInstallation,
        status: 'cancelled',
      },
    })),

  updateTaskStatus: (taskIndex, task) =>
    set((state) => {
      const tasks = [...state.currentInstallation.tasks];
      tasks[taskIndex] = { ...tasks[taskIndex], ...task };
      const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
      return {
        currentInstallation: {
          ...state.currentInstallation,
          tasks,
          currentTaskIndex: taskIndex,
          progress: Math.round((completed / tasks.length) * 100),
        },
      };
    }),

  setSystemInfo: (info) => set({ systemInfo: info }),

  addActivity: (event) =>
    set((state) => {
      const updated = [event, ...state.activities];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('openstore-activities', JSON.stringify(updated.slice(0, 50)));
        } catch {}
      }
      return { activities: updated };
    }),

  addInstalledApp: (app) =>
    set((state) => ({
      installedApps: [...state.installedApps, app],
    })),

  removeInstalledApp: (id) =>
    set((state) => ({
      installedApps: state.installedApps.filter((a) => a.id !== id),
    })),

  updateInstalledAppStatus: (id, status) =>
    set((state) => ({
      installedApps: state.installedApps.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    })),

  updateAppVersion: (installedId) =>
    set((state) => ({
      installedApps: state.installedApps.map((a) =>
        a.id === installedId
          ? {
              ...a,
              version: a.application.latest_version,
              updated_at: new Date().toISOString(),
            }
          : a
      ),
    })),

  updateAllApps: () =>
    set((state) => ({
      installedApps: state.installedApps.map((a) => ({
        ...a,
        version: a.application.latest_version,
        updated_at: new Date().toISOString(),
      })),
    })),
}));
