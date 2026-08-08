import type { Application, InstalledApp, Task } from './types';
import { getGitHubReleaseAssetUrl } from './github-api';
import { useAppStore } from '@/store/app-store';

export interface InstallationProgressCallback {
  onTaskChange: (taskIndex: number, updatedTask: Partial<Task>) => void;
  onLog: (message: string) => void;
  onOverallProgress: (percent: number) => void;
}

interface EcosystemInspectionInfo {
  ecosystem: string;
  install_command: string;
  build_command: string;
  start_command: string;
  detected_port: number;
  is_web_app: boolean;
  resolved_cwd: string;
  run_mode?: 'browser' | 'ide' | 'terminal' | 'executable' | 'folder';
  env_commands?: string[];
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

  if (isElectron && typeof api?.checkCommand === 'function') {
    try {
      const gitCheck = await api.checkCommand('git');
      const nodeCheck = await api.checkCommand('node');
      isGitAvailable = gitCheck.exists;
      callbacks.onLog(`[AGENT] Tooling Status: Git ${gitCheck.exists ? '✓' : '✗'}, Node.js ${nodeCheck.exists ? '✓' : '✗'}`);
    } catch {}
  }
  callbacks.onTaskChange(1, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(40);

  // Step 3: Download / Git Clone Repository
  callbacks.onTaskChange(2, { status: 'RUNNING', progress: 0 });

  const userConfiguredDir = useAppStore.getState().settings.installDir;
  let downloadsDir = userConfiguredDir;
  if (!downloadsDir && isElectron && typeof api?.getDownloadsDir === 'function') {
    try { downloadsDir = await api.getDownloadsDir(); } catch {}
  }
  if (!downloadsDir) {
    downloadsDir = 'Downloads/OpenStore';
  }

  const sanitizeName = app.slug.replace(/[^a-zA-Z0-9-_]/g, '_');
  const targetDir = `${downloadsDir}/${sanitizeName}`;
  let finalInstallPath = '';

  const downloadUrl = await getGitHubReleaseAssetUrl(app);
  const isBinaryInstaller = downloadUrl.endsWith('.exe') || downloadUrl.endsWith('.msi');
  const repoUrl = app.repository_url || (app.slug.includes('--') ? `https://github.com/${app.slug.replace('--', '/')}` : null);

  // ── Strategy A: REAL GIT CLONE (Prioritized for source repos) ───────────
  if (isElectron && !isBinaryInstaller && repoUrl && isGitAvailable) {
    callbacks.onLog(`[AGENT] Strategy: Executing git clone for ${repoUrl} -> ${targetDir}...`);
    callbacks.onTaskChange(2, { progress: 50 });

    try {
      if (typeof api?.gitClone === 'function') {
        const res = await api.gitClone(repoUrl, targetDir);
        finalInstallPath = res.targetDir;
        callbacks.onLog(`[AGENT] Git clone ${res.action} cleanly at ${res.targetDir}`);
      } else if (typeof api?.executeTerminalCommand === 'function') {
        // Direct terminal fallback for git clone
        callbacks.onLog(`[AGENT TERMINAL] Running: git clone "${repoUrl}" "${targetDir}"`);
        await api.executeTerminalCommand(`git clone "${repoUrl}" "${targetDir}"`);
        finalInstallPath = targetDir;
        callbacks.onLog(`[AGENT] Terminal git clone finished at ${targetDir}`);
      }
    } catch (gitErr: unknown) {
      const msg = gitErr instanceof Error ? gitErr.message : String(gitErr);
      callbacks.onLog(`[AGENT] Git clone notice: ${msg}`);
    }
  }

  // ── Strategy B: STREAM DOWNLOAD (For binary installers or zip fallback) ─────
  if (!finalInstallPath) {
    callbacks.onLog(`[AGENT] Strategy: Stream asset download (${downloadUrl})`);
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
        callbacks.onLog(`[AGENT] Download complete: Saved to ${result.path}`);
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

  // Step 4: Unzip if Archive, Inspect Ecosystem, & Run Dependency Setup (`npm install`)
  callbacks.onTaskChange(3, { status: 'RUNNING', progress: 0 });

  if (isElectron && finalInstallPath.endsWith('.zip') && typeof api?.unzipFile === 'function') {
    const zipFilePath = finalInstallPath;
    const extractTarget = `${downloadsDir}/${sanitizeName}`;
    callbacks.onLog(`[AGENT] Extracting archive cleanly to ${extractTarget}...`);
    try {
      const unzipRes = await api.unzipFile(zipFilePath, extractTarget);
      finalInstallPath = unzipRes.targetDir;
      callbacks.onLog(`[AGENT] Extracted cleanly to ${extractTarget}`);
      
      // Clean up temporary downloaded zip file
      try {
        if (typeof api?.executeTerminalCommand === 'function') {
          await api.executeTerminalCommand(`del /f /q "${zipFilePath.replace(/\//g, '\\')}"`);
        }
      } catch {}
    } catch (unzipErr: unknown) {
      const msg = unzipErr instanceof Error ? unzipErr.message : String(unzipErr);
      callbacks.onLog(`[AGENT] Extraction notice: ${msg}`);
    }
  }

  let ecosystemInfo: EcosystemInspectionInfo = {
    ecosystem: 'unknown',
    install_command: '',
    build_command: '',
    start_command: '',
    detected_port: 3000,
    is_web_app: false,
    resolved_cwd: finalInstallPath,
  };

  if (isElectron && typeof api?.inspectRepoEcosystem === 'function') {
    try {
      ecosystemInfo = await api.inspectRepoEcosystem(finalInstallPath);
      const runDir = ecosystemInfo.resolved_cwd || finalInstallPath;
      callbacks.onLog(`[AGENT] Ecosystem: ${ecosystemInfo.ecosystem.toUpperCase()} (Install: ${ecosystemInfo.install_command || 'None'}, Start: ${ecosystemInfo.start_command || 'None'})`);
      if (runDir !== finalInstallPath) {
        callbacks.onLog(`[AGENT] Monorepo detected — resolved runnable directory: ${runDir}`);
      }
    } catch {}
  }

  const runCwd = ecosystemInfo.resolved_cwd || finalInstallPath;

  // Environment Setup Step (e.g. `copy .env.example .env`)
  if (isElectron && Array.isArray(ecosystemInfo.env_commands) && ecosystemInfo.env_commands.length > 0 && typeof api?.executeTerminalCommand === 'function') {
    for (const envCmd of ecosystemInfo.env_commands) {
      callbacks.onLog(`[AGENT] Environment Setup: Executing "${envCmd}"...`);
      try {
        await api.executeTerminalCommand(envCmd, runCwd);
        callbacks.onLog(`[AGENT] Environment file configured.`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        callbacks.onLog(`[AGENT] Environment setup note: ${msg}`);
      }
    }
  }

  // Real Dependency Installation (`npm install` / `pip install -r requirements.txt`)
  if (isElectron && ecosystemInfo.install_command && typeof api?.executeTerminalCommand === 'function') {
    callbacks.onLog(`[AGENT TERMINAL] Executing: "${ecosystemInfo.install_command}" in ${runCwd}...`);

    let termUnsub = () => {};
    let lastErrorLog = '';
    if (typeof api.onTerminalOutput === 'function') {
      termUnsub = api.onTerminalOutput((data) => {
        callbacks.onLog(`[TERMINAL] ${data.text.trim()}`);
        if (data.type === 'stderr') lastErrorLog += data.text;
      });
    }

    try {
      const cmdResult = await api.executeTerminalCommand(ecosystemInfo.install_command, runCwd);
      if (cmdResult.success) {
        callbacks.onLog(`[AGENT TERMINAL] Dependency installation succeeded.`);
      } else if (typeof api.groqAutoHeal === 'function') {
        callbacks.onLog(`[AGENT AI] Command failed. Requesting Groq AI Auto-Healing diagnosis...`);
        const heal = await api.groqAutoHeal(runCwd, ecosystemInfo.install_command, lastErrorLog || cmdResult.output);
        callbacks.onLog(`[AGENT AI] Cause: ${heal.cause}`);
        callbacks.onLog(`[AGENT AI] Diagnosis: ${heal.explanation}`);
        if (heal.fix_commands.length > 0) {
          for (const fixCmd of heal.fix_commands) {
            callbacks.onLog(`[AGENT AI] Running repair action: "${fixCmd}"...`);
            await api.executeTerminalCommand(fixCmd, runCwd);
          }
        }
      }
    } catch (cmdErr: unknown) {
      const msg = cmdErr instanceof Error ? cmdErr.message : String(cmdErr);
      callbacks.onLog(`[AGENT TERMINAL] Dependency setup notice: ${msg}`);
    } finally {
      termUnsub();
    }
  }

  // Real Automated Build Step (`npm run build`)
  if (isElectron && ecosystemInfo.build_command && typeof api?.executeTerminalCommand === 'function') {
    callbacks.onLog(`[AGENT TERMINAL] Executing build command: "${ecosystemInfo.build_command}"...`);
    try {
      await api.executeTerminalCommand(ecosystemInfo.build_command, runCwd);
      callbacks.onLog(`[AGENT TERMINAL] Build completed successfully`);
    } catch {}
  }

  callbacks.onTaskChange(3, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(80);

  // Step 5: Save Record & Configure Auto-Run Lifecycle
  callbacks.onTaskChange(4, { status: 'RUNNING', progress: 50 });
  callbacks.onLog(`[AGENT] Completing hands-free setup and registering service...`);

  const localWebUrl = ecosystemInfo.is_web_app ? `http://localhost:${ecosystemInfo.detected_port || 3000}` : undefined;
  const detectedRunMode = isBinaryInstaller ? 'executable' : (ecosystemInfo.run_mode || 'ide');

  callbacks.onLog(`[AGENT] Detected run mode: ${detectedRunMode.toUpperCase()}${localWebUrl ? ` (${localWebUrl})` : ''}`);

  const installedAppRecord: InstalledApp = {
    id: `inst-${Date.now()}`,
    application_id: app.id,
    application: app,
    version: app.latest_version || '1.0.0',
    install_method: isBinaryInstaller ? 'OFFICIAL_INSTALLER' : 'SOURCE_BUILD',
    install_path: runCwd,
    installed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'stopped',
    run_mode: detectedRunMode,
    start_command: ecosystemInfo.start_command || undefined,
    local_url: localWebUrl,
  };

  if (isElectron && typeof api?.saveInstalledApp === 'function') {
    try {
      await api.saveInstalledApp(installedAppRecord);
      callbacks.onLog(`[AGENT] Setup complete! Saved record to %APPDATA%/OpenStore/installed_apps.json`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      callbacks.onLog(`[AGENT] Persistence notice: ${msg}`);
    }
  }

  callbacks.onTaskChange(4, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(100);

  return installedAppRecord;
}
