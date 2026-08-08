import { create } from 'zustand';
import type { Application, InstalledApp, Task, SystemInfo, ActivityEvent, SearchFilters } from '@/lib/types';
import { applications, mockInstalledApps, categories } from '@/lib/mock-data';
import type { Category } from '@/lib/types';

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
  activities: [
    {
      id: '1',
      type: 'install',
      application_name: 'VLC Media Player',
      application_icon: '🎬',
      message: 'Installed VLC Media Player v3.0.21',
      timestamp: '2025-06-10T14:30:00Z',
    },
    {
      id: '2',
      type: 'install',
      application_name: 'VS Code',
      application_icon: '💻',
      message: 'Installed Visual Studio Code v1.99.0',
      timestamp: '2025-05-20T09:15:00Z',
    },
    {
      id: '3',
      type: 'update',
      application_name: 'VS Code',
      application_icon: '💻',
      message: 'Updated VS Code from v1.98.0 to v1.99.0',
      timestamp: '2025-07-01T10:00:00Z',
    },
  ],

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

  // ─── System ──────────────────────────────────────────────────────────────
  systemInfo: null,
  isElectron: typeof window !== 'undefined' && !!window.electronAPI,

  // ─── Actions ─────────────────────────────────────────────────────────────
  navigate: (view, params) =>
    set({
      currentView: view,
      selectedAppSlug: params?.slug ?? null,
      selectedCategoryId: params?.categoryId ?? null,
    }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSearchFilters: (filters) => set({ searchFilters: filters }),

  startInstallation: (appId) =>
    set({
      currentView: 'install',
      currentInstallation: {
        appId,
        jobId: `job-${Date.now()}`,
        tasks: [],
        currentTaskIndex: 0,
        progress: 0,
        status: 'running',
        logs: [],
      },
    }),

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
    set((state) => ({
      activities: [event, ...state.activities],
    })),

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
}));
