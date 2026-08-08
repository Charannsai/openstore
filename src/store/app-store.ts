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
    installDir: 'C:\\Users\\Public\\Downloads\\OpenStore',
    autoCheckUpdates: true,
    sendDiagnostics: false,
    verifyChecksums: true,
    updateNotifications: true,
  };
  if (typeof window === 'undefined') return defaults;
  try {
    const saved = localStorage.getItem('openstore-settings');
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
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

  // ─── Actions ─────────────────────────────────────────────────────────────
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('dark', 'light');
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
      localStorage.setItem('openstore-theme', theme);
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
