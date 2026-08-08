/* eslint-disable @typescript-eslint/no-require-imports */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ─── System Detection ──────────────────────────────────────────────────
  getSystemInfo: () => ipcRenderer.invoke('agent:get-system-info'),
  checkCommand: (command) => ipcRenderer.invoke('agent:check-command', command),
  checkPort: (port) => ipcRenderer.invoke('agent:check-port', port),
  checkPrerequisites: () => ipcRenderer.invoke('agent:check-prerequisites'),

  // ─── Winget Package Manager Integration ────────────────────────────────
  checkWinget: () => ipcRenderer.invoke('agent:check-winget'),
  searchWinget: (query) => ipcRenderer.invoke('agent:search-winget', query),
  installWingetPackage: (packageId) => ipcRenderer.invoke('agent:install-winget', packageId),

  // ─── Git, Terminal & Ecosystem Orchestrator ────────────────────────────
  gitClone: (repoUrl, targetDir) => ipcRenderer.invoke('agent:git-clone', repoUrl, targetDir),
  inspectRepoEcosystem: (repoPath) => ipcRenderer.invoke('agent:inspect-repo-ecosystem', repoPath),
  groqAnalyzeRepo: (repoPath) => ipcRenderer.invoke('agent:groq-analyze-repo', repoPath),
  groqAutoHeal: (repoPath, failedCommand, errorOutput) => ipcRenderer.invoke('agent:groq-auto-heal', repoPath, failedCommand, errorOutput),
  executeTerminalCommand: (command, cwd) => ipcRenderer.invoke('agent:execute-terminal-command', command, cwd),
  startBackgroundService: (command, cwd, appId) => ipcRenderer.invoke('agent:start-background-service', command, cwd, appId),
  stopBackgroundService: (appId) => ipcRenderer.invoke('agent:stop-background-service', appId),

  // ─── Downloads & Files ──────────────────────────────────────────────────
  downloadFile: (url, dest, checksum) => ipcRenderer.invoke('agent:download-file', url, dest, checksum),
  unzipFile: (zipPath, targetDir) => ipcRenderer.invoke('agent:unzip-file', zipPath, targetDir),
  getDownloadsDir: () => ipcRenderer.invoke('agent:get-downloads-dir'),

  // ─── App Lifecycle ─────────────────────────────────────────────────────
  launchApp: (config) => ipcRenderer.invoke('agent:launch-app', config),
  openInIDE: (projectPath) => ipcRenderer.invoke('agent:open-in-ide', projectPath),

  // ─── Registry & Persistence ────────────────────────────────────────────
  getInstalledApps: () => ipcRenderer.invoke('agent:get-installed-apps'),
  saveInstalledApp: (appRecord) => ipcRenderer.invoke('agent:save-installed-app', appRecord),
  uninstallApp: (appId, installPath) => ipcRenderer.invoke('agent:uninstall-app', appId, installPath),

  // ─── Events (main → renderer) ──────────────────────────────────────────
  onDownloadProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('agent:download-progress', handler);
    return () => ipcRenderer.removeListener('agent:download-progress', handler);
  },
  onTerminalOutput: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('agent:terminal-output', handler);
    return () => ipcRenderer.removeListener('agent:terminal-output', handler);
  },
  onServiceOutput: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('agent:service-output', handler);
    return () => ipcRenderer.removeListener('agent:service-output', handler);
  },
  onWingetProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('winget:progress', handler);
    return () => ipcRenderer.removeListener('winget:progress', handler);
  },

  // ─── Window Controls ──────────────────────────────────────────────────
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  setTitlebarTheme: (theme) => ipcRenderer.invoke('window:set-titlebar-theme', theme),
});
