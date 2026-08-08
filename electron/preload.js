const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script — secure bridge between renderer (Next.js) and main process.
 * Uses contextBridge to expose a safe API without exposing Node.js internals.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // ─── System Detection ──────────────────────────────────────────────────
  getSystemInfo: () => ipcRenderer.invoke('agent:get-system-info'),
  checkCommand: (command) => ipcRenderer.invoke('agent:check-command', command),
  checkPort: (port) => ipcRenderer.invoke('agent:check-port', port),
  checkDiskSpace: (diskPath) => ipcRenderer.invoke('agent:check-disk-space', diskPath),

  // ─── Installation ──────────────────────────────────────────────────────
  startInstallation: (appId, workflow) =>
    ipcRenderer.invoke('agent:start-installation', appId, workflow),
  cancelInstallation: (jobId) =>
    ipcRenderer.invoke('agent:cancel-installation', jobId),
  resumeInstallation: (jobId) =>
    ipcRenderer.invoke('agent:resume-installation', jobId),

  // ─── Downloads ─────────────────────────────────────────────────────────
  downloadFile: (url, dest, checksum) =>
    ipcRenderer.invoke('agent:download-file', url, dest, checksum),

  // ─── App Lifecycle ─────────────────────────────────────────────────────
  launchApp: (config) => ipcRenderer.invoke('agent:launch-app', config),
  stopApp: (processId) => ipcRenderer.invoke('agent:stop-app', processId),

  // ─── Events (main → renderer) ──────────────────────────────────────────
  onInstallProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('agent:install-progress', handler);
    return () => ipcRenderer.removeListener('agent:install-progress', handler);
  },
  onTaskUpdate: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('agent:task-update', handler);
    return () => ipcRenderer.removeListener('agent:task-update', handler);
  },
  onDownloadProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('agent:download-progress', handler);
    return () => ipcRenderer.removeListener('agent:download-progress', handler);
  },

  // ─── Window Controls ──────────────────────────────────────────────────
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
});
