// ─── Core Types ──────────────────────────────────────────────────────────────
import type {
  INSTALL_STRATEGIES,
  TASK_STATES,
  TASK_TYPES,
  PLATFORMS,
  ARCHITECTURES,
} from './constants';

// ─── Application ─────────────────────────────────────────────────────────────
export interface Application {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string;
  icon_url: string;
  category_id: string;
  license: string;
  repository_url: string;
  official_website: string;
  documentation_url: string;
  developer: string;
  organization: string;
  platforms: Platform[];
  architectures: Architecture[];
  latest_version: string;
  installation_methods: InstallStrategy[];
  difficulty: 'easy' | 'moderate' | 'advanced';
  is_featured: boolean;
  download_count: number;
  star_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  screenshots?: AppScreenshot[];
  requirements?: AppRequirement[];
  releases?: Release[];
  category?: Category;
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
}

// ─── Release ─────────────────────────────────────────────────────────────────
export interface Release {
  id: string;
  application_id: string;
  version: string;
  platform: Platform;
  architecture: Architecture;
  download_url: string;
  checksum: string;
  signature: string;
  release_date: string;
  source: string;
  file_size: number;
  release_notes: string;
}

// ─── Screenshot ──────────────────────────────────────────────────────────────
export interface AppScreenshot {
  id: string;
  application_id: string;
  url: string;
  caption: string;
  order: number;
}

// ─── Requirement ─────────────────────────────────────────────────────────────
export interface AppRequirement {
  id: string;
  application_id: string;
  name: string;
  type: 'runtime' | 'tool' | 'system' | 'service';
  version: string;
  required: boolean; // true = required, false = recommended/optional
  check_command: string;
  install_url: string;
}

// ─── Installation Workflow ───────────────────────────────────────────────────
export interface InstallationWorkflow {
  id: string;
  application_id: string;
  version: string;
  platform: Platform;
  architecture: Architecture;
  steps: WorkflowStep[];
  requirements: string[];
  verification: VerificationRule[];
  rollback: RollbackStep[];
  source: string;
  generated_by: 'manual' | 'ai' | 'maintainer';
  validated: boolean;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  action: string;
  params: Record<string, unknown>;
  verification?: VerificationRule;
  rollback?: RollbackStep;
  estimated_duration: number; // seconds
  requires_user_interaction: boolean;
  requires_elevation: boolean;
  prerequisites: string[]; // step IDs
}

export interface VerificationRule {
  type: 'command' | 'http' | 'file' | 'port' | 'process' | 'service';
  target: string;
  expected: string;
  timeout: number;
}

export interface RollbackStep {
  action: string;
  params: Record<string, unknown>;
  description: string;
}

// ─── Installation Job ────────────────────────────────────────────────────────
export interface InstallationJob {
  id: string;
  application_id: string;
  workflow_id: string;
  device_id: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  current_step: number;
  started_at: string;
  completed_at?: string;
  error?: string;
  logs: LogEntry[];
}

// ─── Task ────────────────────────────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskState;
  prerequisites: string[];
  actions: TaskAction[];
  verification?: VerificationRule;
  rollback?: RollbackStep;
  estimated_duration: number;
  requires_user_interaction: boolean;
  requires_elevation: boolean;
  documentation: string;
  progress: number; // 0-100
  error?: TaskError;
}

export interface TaskAction {
  capability: string;
  params: Record<string, unknown>;
}

export interface TaskError {
  message: string;
  friendly_message: string;
  technical_details: string;
  suggestion: string;
  fix_action?: TaskAction;
}

// ─── Device ──────────────────────────────────────────────────────────────────
export interface Device {
  id: string;
  platform: Platform;
  os_version: string;
  architecture: Architecture;
  hostname: string;
  agent_version: string;
  last_seen: string;
}

// ─── System Info ─────────────────────────────────────────────────────────────
export interface SystemInfo {
  platform: Platform;
  os_version: string;
  architecture: Architecture;
  hostname: string;
  total_memory: number;
  free_memory: number;
  total_disk: number;
  free_disk: number;
  cpu_model: string;
  cpu_cores: number;
}

// ─── Run Mode ────────────────────────────────────────────────────────────────
export type RunMode = 'browser' | 'ide' | 'terminal' | 'executable' | 'folder';

// ─── Installed App ───────────────────────────────────────────────────────────
export interface InstalledApp {
  id: string;
  application_id: string;
  application: Application;
  version: string;
  install_method: InstallStrategy;
  install_path: string;
  installed_at: string;
  updated_at: string;
  status: 'running' | 'stopped' | 'error' | 'updating';
  run_mode: RunMode;
  start_command?: string;
  local_url?: string;
  process_id?: number;
}

// ─── Log Entry ───────────────────────────────────────────────────────────────
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'security' | 'user_action' | 'system';
  message: string;
  details?: string;
}

// ─── Activity ────────────────────────────────────────────────────────────────
export interface ActivityEvent {
  id: string;
  type: 'install' | 'update' | 'uninstall' | 'launch' | 'stop' | 'error';
  application_name: string;
  application_icon: string;
  message: string;
  timestamp: string;
  details?: string;
}

// ─── Search ──────────────────────────────────────────────────────────────────
export interface SearchResult {
  applications: Application[];
  total: number;
  query: string;
  filters: SearchFilters;
}

export interface SearchFilters {
  category?: string;
  platform?: Platform;
  difficulty?: 'easy' | 'moderate' | 'advanced';
  license?: string;
  sort?: 'relevance' | 'popular' | 'newest' | 'name';
}

// ─── Electron IPC ────────────────────────────────────────────────────────────
export interface ElectronAPI {
  // System
  getSystemInfo: () => Promise<SystemInfo>;
  checkCommand: (command: string) => Promise<{ exists: boolean; version?: string }>;
  checkPort: (port: number) => Promise<{ inUse: boolean; process?: string }>;

  // Git, Terminal & Ecosystem Orchestrator
  gitClone: (repoUrl: string, targetDir: string) => Promise<{ success: boolean; targetDir: string; action: string }>;
  inspectRepoEcosystem: (repoPath: string) => Promise<{
    ecosystem: string;
    install_command: string;
    build_command: string;
    start_command: string;
    detected_port: number;
    is_web_app: boolean;
    has_package_json: boolean;
    has_requirements_txt: boolean;
    has_dockerfile: boolean;
    run_mode: RunMode;
    resolved_cwd: string;
  }>;
  executeTerminalCommand: (command: string, cwd?: string) => Promise<{ success: boolean; output: string; code?: number }>;
  startBackgroundService: (command: string, cwd: string, appId: string) => Promise<{ success: boolean; pid: number }>;
  stopBackgroundService: (appId: string) => Promise<{ success: boolean }>;

  // Downloads & Files
  downloadFile: (
    url: string,
    dest?: string,
    checksum?: string
  ) => Promise<{ success: boolean; path: string; size: number }>;
  unzipFile: (zipPath: string, targetDir: string) => Promise<{ success: boolean; targetDir: string }>;
  getDownloadsDir: () => Promise<string>;

  // App lifecycle
  launchApp: (config: { path?: string; url?: string; command?: string }) => Promise<number>;
  openInIDE: (projectPath: string) => Promise<{ success: boolean; ide: string }>;

  // Installed Registry
  getInstalledApps: () => Promise<InstalledApp[]>;
  saveInstalledApp: (appRecord: InstalledApp) => Promise<InstalledApp[]>;
  uninstallApp: (appId: string, installPath?: string) => Promise<InstalledApp[]>;

  // Events
  onDownloadProgress: (
    callback: (data: { url: string; received: number; total: number; progress: number; path: string }) => void
  ) => () => void;
  onTerminalOutput: (
    callback: (data: { command: string; text: string; type: 'stdout' | 'stderr' }) => void
  ) => () => void;
  onServiceOutput: (
    callback: (data: { appId: string; text: string }) => void
  ) => () => void;
}

// ─── Literal Types ───────────────────────────────────────────────────────────
export type InstallStrategy = (typeof INSTALL_STRATEGIES)[number];
export type TaskState = (typeof TASK_STATES)[number];
export type TaskType = (typeof TASK_TYPES)[number];
export type Platform = (typeof PLATFORMS)[number];
export type Architecture = (typeof ARCHITECTURES)[number];

// ─── Window augmentation ─────────────────────────────────────────────────────
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
