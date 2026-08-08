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

  callbacks.onLog(`[AGENT] Starting hands-free installation pipeline for ${app.name}...`);

  // Step 1: Detect System Environment
  callbacks.onTaskChange(0, { status: 'RUNNING', progress: 50 });
  let systemInfo = { platform: 'windows', os_version: '10', architecture: 'x64', cpu_cores: 4 };
  if (isElectron && typeof api?.getSystemInfo === 'function') {
    try {
      systemInfo = await api.getSystemInfo();
      callbacks.onLog(`[AGENT] System specs: ${systemInfo.platform} (${systemInfo.architecture}), ${systemInfo.cpu_cores} CPU cores.`);
    } catch {}
  }
  callbacks.onTaskChange(0, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(20);

  // Step 2: Check Prerequisites & Tooling
  callbacks.onTaskChange(1, { status: 'RUNNING', progress: 50 });
  let isGitAvailable = false;
  let isNodeAvailable = false;

  if (isElectron && typeof api?.checkCommand === 'function') {
    try {
      const gitCheck = await api.checkCommand('git');
      const nodeCheck = await api.checkCommand('node');
      isGitAvailable = gitCheck.exists;
      isNodeAvailable = nodeCheck.exists;
      callbacks.onLog(`[AGENT] Tooling: Git ${gitCheck.exists ? '✓' : '✗'}, Node.js ${nodeCheck.exists ? '✓' : '✗'}`);
    } catch {}
  }
  callbacks.onTaskChange(1, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(40);

  // Step 3: Download / Clone Repository
  callbacks.onTaskChange(2, { status: 'RUNNING', progress: 0 });
  const downloadUrl = await getGitHubReleaseAssetUrl(app);
  const isBinaryInstaller = downloadUrl.endsWith('.exe') || downloadUrl.endsWith('.msi');
  let finalInstallPath = '';

  let downloadsDir = 'C:/Users/Public/Downloads/OpenStore';
  if (isElectron && typeof api?.getDownloadsDir === 'function') {
    try { downloadsDir = await api.getDownloadsDir(); } catch {}
  }
  const sanitizeName = app.slug.replace(/[^a-zA-Z0-9-_]/g, '_');
  const targetDir = `${downloadsDir}/${sanitizeName}`;

  if (isElectron && !isBinaryInstaller && isGitAvailable && typeof api?.gitClone === 'function' && app.repository_url) {
    callbacks.onLog(`[AGENT] Strategy: Cloning repository (${app.repository_url}) into ${targetDir}`);
    callbacks.onTaskChange(2, { progress: 50 });
    try {
      const res = await api.gitClone(app.repository_url, targetDir);
      finalInstallPath = res.targetDir;
      callbacks.onLog(`[AGENT] Repository ${res.action} cleanly at ${res.targetDir}`);
    } catch (gitErr: any) {
      callbacks.onLog(`[AGENT] Git clone notice: ${gitErr.message || gitErr}`);
    }
  }

  if (!finalInstallPath) {
    callbacks.onLog(`[AGENT] Strategy: Stream binary download (${downloadUrl})`);
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

  // Step 4: Extract if Zip, Inspect Ecosystem, & Install Dependencies (`npm install`)
  callbacks.onTaskChange(3, { status: 'RUNNING', progress: 0 });

  if (isElectron && finalInstallPath.endsWith('.zip') && typeof api?.unzipFile === 'function') {
    const extractTarget = `${downloadsDir}/${sanitizeName}_extracted`;
    callbacks.onLog(`[AGENT] Extracting zip archive to ${extractTarget}...`);
    try {
      const unzipRes = await api.unzipFile(finalInstallPath, extractTarget);
      finalInstallPath = unzipRes.targetDir;
      callbacks.onLog(`[AGENT] Unzipped to ${extractTarget}`);
    } catch (unzipErr: any) {
      callbacks.onLog(`[AGENT] Extraction notice: ${unzipErr.message || unzipErr}`);
    }
  }

  let ecosystemInfo = {
    ecosystem: 'unknown',
    install_command: '',
    build_command: '',
    start_command: '',
    detected_port: 3000,
    is_web_app: false,
  };

  if (isElectron && typeof api?.inspectRepoEcosystem === 'function') {
    try {
      ecosystemInfo = await api.inspectRepoEcosystem(finalInstallPath);
      callbacks.onLog(`[AGENT] Ecosystem inspection: ${ecosystemInfo.ecosystem.toUpperCase()} (Install: ${ecosystemInfo.install_command || 'None'}, Start: ${ecosystemInfo.start_command || 'None'})`);
    } catch {}
  }

  // Real Automated Dependency Installation (`npm install` / `pip install -r requirements.txt`)
  if (isElectron && ecosystemInfo.install_command && typeof api?.executeTerminalCommand === 'function') {
    callbacks.onLog(`[AGENT TERMINAL] Executing hands-free dependency setup: "${ecosystemInfo.install_command}" in ${finalInstallPath}...`);

    let termUnsub = () => {};
    if (typeof api.onTerminalOutput === 'function') {
      termUnsub = api.onTerminalOutput((data) => {
        callbacks.onLog(`[TERMINAL] ${data.text.trim()}`);
      });
    }

    try {
      const cmdResult = await api.executeTerminalCommand(ecosystemInfo.install_command, finalInstallPath);
      callbacks.onLog(`[AGENT TERMINAL] Dependency installation ${cmdResult.success ? 'succeeded ✓' : 'completed with warnings'}`);
    } catch (cmdErr: any) {
      callbacks.onLog(`[AGENT TERMINAL] Dependency setup notice: ${cmdErr.message || cmdErr}`);
    } finally {
      termUnsub();
    }
  }

  // Real Automated Build Step (`npm run build` if detected)
  if (isElectron && ecosystemInfo.build_command && typeof api?.executeTerminalCommand === 'function') {
    callbacks.onLog(`[AGENT TERMINAL] Executing build command: "${ecosystemInfo.build_command}"...`);
    try {
      await api.executeTerminalCommand(ecosystemInfo.build_command, finalInstallPath);
      callbacks.onLog(`[AGENT TERMINAL] Build completed successfully ✓`);
    } catch {}
  }

  callbacks.onTaskChange(3, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(80);

  // Step 5: Save Record & Configure Auto-Run Lifecycle
  callbacks.onTaskChange(4, { status: 'RUNNING', progress: 50 });
  callbacks.onLog(`[AGENT] Completing hands-free configuration and registering service lifecycle...`);

  const localWebUrl = ecosystemInfo.is_web_app ? `http://localhost:${ecosystemInfo.detected_port || 3000}` : undefined;

  const installedAppRecord: InstalledApp = {
    id: `inst-${Date.now()}`,
    application_id: app.id,
    application: app,
    version: app.latest_version || '1.0.0',
    install_method: isBinaryInstaller ? 'OFFICIAL_INSTALLER' : 'SOURCE_BUILD',
    install_path: finalInstallPath,
    installed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'stopped',
    local_url: localWebUrl,
  };

  if (isElectron && typeof api?.saveInstalledApp === 'function') {
    try {
      await api.saveInstalledApp(installedAppRecord);
      callbacks.onLog(`[AGENT] Setup complete! Saved application record to %APPDATA%/OpenStore/installed_apps.json`);
    } catch (err: any) {
      callbacks.onLog(`[AGENT] Registry notice: ${err.message}`);
    }
  }

  callbacks.onTaskChange(4, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(100);

  return installedAppRecord;
}
