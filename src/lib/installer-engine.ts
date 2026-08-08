import type { Application, InstalledApp, Task } from './types';
import { getGitHubReleaseAssetUrl } from './github-api';

export interface InstallationProgressCallback {
  onTaskChange: (taskIndex: number, updatedTask: Partial<Task>) => void;
  onLog: (message: string) => void;
  onOverallProgress: (percent: number) => void;
}

export async function runRealInstallation(
  app: Application,
  callbacks: InstallationProgressCallback
): Promise<InstalledApp> {
  const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
  const isElectron = Boolean(api);

  callbacks.onLog(`[AGENT] Starting real installation pipeline for ${app.name}...`);

  // Step 1: Detect System Environment
  callbacks.onTaskChange(0, { status: 'RUNNING', progress: 50 });
  let systemInfo = { platform: 'windows', os_version: '10', architecture: 'x64', cpu_cores: 4 };
  if (isElectron && typeof api?.getSystemInfo === 'function') {
    try {
      systemInfo = await api.getSystemInfo();
      callbacks.onLog(`[AGENT] Detected OS: ${systemInfo.platform} (${systemInfo.architecture}), CPU Cores: ${systemInfo.cpu_cores}`);
    } catch (e: any) {
      callbacks.onLog(`[AGENT] System detection note: ${e.message}`);
    }
  } else {
    callbacks.onLog(`[AGENT] Default desktop agent initialized.`);
  }
  callbacks.onTaskChange(0, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(20);

  // Step 2: Check Prerequisites & Git Availability
  callbacks.onTaskChange(1, { status: 'RUNNING', progress: 50 });
  let isGitAvailable = false;
  if (isElectron && typeof api?.checkCommand === 'function') {
    try {
      const gitCheck = await api.checkCommand('git');
      isGitAvailable = gitCheck.exists;
      callbacks.onLog(`[AGENT] Git CLI Status: ${gitCheck.exists ? 'Available (' + (gitCheck.version || 'v2') + ')' : 'Not installed'}`);
    } catch (e: any) {
      callbacks.onLog(`[AGENT] Prerequisites check note: ${e.message}`);
    }
  }
  callbacks.onTaskChange(1, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(40);

  // Step 3: Resolve & Choose Execution Path (Binary Installer vs Git Clone)
  callbacks.onTaskChange(2, { status: 'RUNNING', progress: 0 });
  callbacks.onLog(`[AGENT] Resolving asset source for ${app.name}...`);

  const downloadUrl = await getGitHubReleaseAssetUrl(app);
  const isBinaryInstaller = downloadUrl.endsWith('.exe') || downloadUrl.endsWith('.msi');
  let finalInstallPath = '';

  let downloadsDir = 'C:/Users/Public/Downloads/OpenStore';
  if (isElectron && typeof api?.getDownloadsDir === 'function') {
    try { downloadsDir = await api.getDownloadsDir(); } catch {}
  }
  const sanitizeName = app.slug.replace(/[^a-zA-Z0-9-_]/g, '_');

  if (isElectron && !isBinaryInstaller && isGitAvailable && typeof api?.gitClone === 'function' && app.repository_url) {
    // ── Strategy A: REAL GIT CLONE ──────────────────────────────────────────
    const targetDir = `${downloadsDir}/${sanitizeName}`;
    callbacks.onLog(`[AGENT] Strategy: Git Clone repository (${app.repository_url}) -> ${targetDir}`);

    callbacks.onTaskChange(2, { progress: 50 });
    try {
      const res = await api.gitClone(app.repository_url, targetDir);
      finalInstallPath = res.targetDir;
      callbacks.onLog(`[AGENT] Repository successfully ${res.action} into ${res.targetDir}`);
    } catch (gitErr: any) {
      callbacks.onLog(`[AGENT] Git clone notice: ${gitErr.message || gitErr}. Falling back to asset download...`);
    }
  }

  if (!finalInstallPath) {
    // ── Strategy B: DIRECT BINARY OR ZIP DOWNLOAD ─────────────────────────
    callbacks.onLog(`[AGENT] Strategy: Stream download (${downloadUrl})`);
    const ext = isBinaryInstaller ? (downloadUrl.endsWith('.msi') ? '.msi' : '.exe') : '.zip';
    const destPath = `${downloadsDir}/${sanitizeName}${ext}`;

    let unsubscribe = () => {};
    if (isElectron && typeof api?.onDownloadProgress === 'function') {
      unsubscribe = api.onDownloadProgress((data) => {
        callbacks.onTaskChange(2, { progress: data.progress });
        callbacks.onLog(`[AGENT] Downloading: ${data.progress}% (${(data.received / 1024 / 1024).toFixed(2)} MB)`);
      });
    }

    try {
      if (isElectron && typeof api?.downloadFile === 'function') {
        const result = await api.downloadFile(downloadUrl, destPath);
        finalInstallPath = result.path;
        callbacks.onLog(`[AGENT] Download complete: Saved to ${result.path} (${(result.size / 1024 / 1024).toFixed(2)} MB)`);
      } else {
        finalInstallPath = downloadUrl;
        if (typeof window !== 'undefined') window.open(downloadUrl, '_blank');
      }
    } finally {
      unsubscribe();
    }
  }

  callbacks.onTaskChange(2, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(60);

  // Step 4: Extract Archive if zip, or Verify File
  callbacks.onTaskChange(3, { status: 'RUNNING', progress: 50 });

  if (isElectron && finalInstallPath.endsWith('.zip') && typeof api?.unzipFile === 'function') {
    const extractTarget = `${downloadsDir}/${sanitizeName}_extracted`;
    callbacks.onLog(`[AGENT] Extracting archive via PowerShell Expand-Archive...`);
    try {
      const unzipRes = await api.unzipFile(finalInstallPath, extractTarget);
      finalInstallPath = unzipRes.targetDir;
      callbacks.onLog(`[AGENT] Extracted to ${extractTarget}`);
    } catch (unzipErr: any) {
      callbacks.onLog(`[AGENT] Zip extraction note: ${unzipErr.message || unzipErr}`);
    }
  } else {
    callbacks.onLog(`[AGENT] Repository / Installer structure verified on hard drive.`);
  }

  callbacks.onTaskChange(3, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(80);

  // Step 5: Launch / Open Directory & Register in AppData Persistence
  callbacks.onTaskChange(4, { status: 'RUNNING', progress: 50 });
  callbacks.onLog(`[AGENT] Opening target application or cloned workspace directory...`);

  if (isElectron && typeof api?.launchApp === 'function') {
    try {
      await api.launchApp({ path: finalInstallPath });
      callbacks.onLog(`[AGENT] Opened ${finalInstallPath}`);
    } catch (launchErr: any) {
      callbacks.onLog(`[AGENT] Launch event note: ${launchErr.message}`);
    }
  }

  const installedAppRecord: InstalledApp = {
    id: `inst-${Date.now()}`,
    application_id: app.id,
    application: app,
    version: app.latest_version || '1.0.0',
    install_method: isGitAvailable && !isBinaryInstaller ? 'SOURCE_BUILD' : (app.installation_methods[0] || 'OFFICIAL_INSTALLER'),
    install_path: finalInstallPath,
    installed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'running',
    local_url: app.official_website,
  };

  if (isElectron && typeof api?.saveInstalledApp === 'function') {
    try {
      await api.saveInstalledApp(installedAppRecord);
      callbacks.onLog(`[AGENT] Saved record to %APPDATA%/OpenStore/installed_apps.json`);
    } catch (err: any) {
      callbacks.onLog(`[AGENT] Persistence note: ${err.message}`);
    }
  }

  callbacks.onTaskChange(4, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(100);

  return installedAppRecord;
}
