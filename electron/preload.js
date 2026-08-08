const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ─── System Detection ──────────────────────────────────────────────────
  getSystemInfo: () => ipcRenderer.invoke('agent:get-system-info'),
  checkCommand: (command) => ipcRenderer.invoke('agent:check-command', command),
  checkPort: (port) => ipcRenderer.invoke('agent:check-port', port),

  // ─── Git & File Operations ──────────────────────────────────────────────
  gitClone: (repoUrl, targetDir) => ipcRenderer.invoke('agent:git-clone', repoUrl, targetDir),
  downloadFile: (url, dest, checksum) =>
    ipcRenderer.invoke('agent:download-file', url, dest, checksum),
  unzipFile: (zipPath, targetDir) =>
    ipcRenderer.invoke('agent:unzip-file', zipPath, targetDir),
  getDownloadsDir: () => ipcRenderer.invoke('agent:get-downloads-dir'),

  // ─── App Lifecycle & Folder Opening ────────────────────────────────────
  launchApp: (config) => ipcRenderer.invoke('agent:launch-app', config),
  stopApp: (processId) => ipcRenderer.invoke('agent:stop-app', processId),

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

  // ─── Window Controls ──────────────────────────────────────────────────
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
});
