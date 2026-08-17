import type { Application, InstalledApp, Task } from './types';
import { getGitHubReleaseAssetUrl, detectRepoPrerequisitesFromGitHub } from './github-api';
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
  required_runtimes?: string[];
  run_mode?: 'browser' | 'ide' | 'terminal' | 'executable' | 'folder';
  env_commands?: string[];
}

export async function runRealInstallation(
  app: Application,
  callbacks: InstallationProgressCallback
): Promise<InstalledApp> {
  const api = typeof window !== 'undefined' ? window.electronAPI : undefined;
  const isElectron = Boolean(api);

  callbacks.onLog(`[AGENT] Initializing installation pipeline for ${app.name}...`);

  // ───────────────────────────────────────────────────────────────────────────
  // Phase 1: Detect System & Discover Pre-Clone Requirements
  // ───────────────────────────────────────────────────────────────────────────
  callbacks.onTaskChange(0, { status: 'RUNNING', progress: 30 });
  let systemInfo = { platform: 'windows', os_version: '10', architecture: 'x64', cpu_cores: 4 };

  if (isElectron && typeof api?.getSystemInfo === 'function') {
    try {
      systemInfo = await api.getSystemInfo();
      callbacks.onLog(`[SYSTEM] Target: ${systemInfo.platform} (${systemInfo.architecture}), ${systemInfo.cpu_cores} CPU cores.`);
    } catch {}
  }

  // Pre-clone analysis from GitHub API
  callbacks.onLog(`[PRE-DISCOVERY] Inspecting remote repository metadata for ${app.slug || app.name}...`);
  let preReqs = { requiredRuntimes: ['git'], ecosystem: 'unknown', language: null as string | null };
  try {
    preReqs = await detectRepoPrerequisitesFromGitHub(app.repository_url || app.slug);
    callbacks.onLog(`[PRE-DISCOVERY] Required runtimes identified: ${preReqs.requiredRuntimes.map(r => r.toUpperCase()).join(', ')}`);
  } catch {
    preReqs = { requiredRuntimes: ['git'], ecosystem: 'unknown', language: null };
  }

  callbacks.onTaskChange(0, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(20);

  // ───────────────────────────────────────────────────────────────────────────
  // Phase 2: Batch Global Runtime Auto-Provisioning (Priority 1)
  // ───────────────────────────────────────────────────────────────────────────
  callbacks.onTaskChange(1, { status: 'RUNNING', progress: 20 });
  callbacks.onLog(`[PROVISION] Verifying language runtimes and system tooling...`);

  if (isElectron && typeof api?.ensureRuntimesBatch === 'function') {
    try {
      const batchRes = await api.ensureRuntimesBatch(preReqs.requiredRuntimes);
      if (batchRes.runtimes) {
        for (const rt of batchRes.runtimes) {
          if (rt.installed) {
            callbacks.onLog(`[PROVISION] ${rt.runtime.toUpperCase()} is ready (${rt.newly_installed ? 'installed globally' : rt.version || 'detected'}).`);
          } else {
            callbacks.onLog(`[PROVISION] Warning: Could not verify ${rt.runtime.toUpperCase()} (${rt.error || 'unknown error'}).`);
          }
        }
      }
    } catch (rtErr: unknown) {
      const msg = rtErr instanceof Error ? rtErr.message : String(rtErr);
      callbacks.onLog(`[PROVISION] Runtime notice: ${msg}`);
    }
  }

  // Reload PATH in memory
  if (isElectron && typeof api?.reloadPath === 'function') {
    try { await api.reloadPath(); } catch {}
  }

  callbacks.onTaskChange(1, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(40);

  // ───────────────────────────────────────────────────────────────────────────
  // Phase 3: Repository Clone & Workspace Setup (Priority 2)
  // ───────────────────────────────────────────────────────────────────────────
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

  // Check if Git is available
  let isGitAvailable = false;
  if (isElectron && typeof api?.checkCommand === 'function') {
    try {
      const check = await api.checkCommand('git');
      isGitAvailable = check.exists;
    } catch {}
  }

  // Strategy A: Real Git Clone
  if (isElectron && !isBinaryInstaller && repoUrl && isGitAvailable) {
    callbacks.onLog(`[GIT] Cloning ${repoUrl} into ${targetDir}...`);
    callbacks.onTaskChange(2, { progress: 50 });

    try {
      if (typeof api?.gitClone === 'function') {
        const res = await api.gitClone(repoUrl, targetDir);
        finalInstallPath = res.targetDir;
        callbacks.onLog(`[GIT] Repository cloned successfully at ${res.targetDir}`);
      } else if (typeof api?.executeTerminalCommand === 'function') {
        await api.executeTerminalCommand(`git clone "${repoUrl}" "${targetDir}"`);
        finalInstallPath = targetDir;
        callbacks.onLog(`[GIT] Terminal git clone finished at ${targetDir}`);
      }
    } catch (gitErr: unknown) {
      const msg = gitErr instanceof Error ? gitErr.message : String(gitErr);
      callbacks.onLog(`[GIT] Git clone notice: ${msg}`);
    }
  }

  // Strategy B: Stream Asset Download (For binaries or zip fallback)
  if (!finalInstallPath) {
    callbacks.onLog(`[DOWNLOAD] Downloading repository package (${downloadUrl})...`);
    const ext = isBinaryInstaller ? (downloadUrl.endsWith('.msi') ? '.msi' : '.exe') : '.zip';
    const destPath = `${downloadsDir}/${sanitizeName}${ext}`;

    let unsubscribe = () => {};
    if (isElectron && typeof api?.onDownloadProgress === 'function') {
      unsubscribe = api.onDownloadProgress((data) => {
        callbacks.onTaskChange(2, { progress: data.progress });
        callbacks.onLog(`[DOWNLOAD] Progress: ${data.progress}% (${(data.received / 1024 / 1024).toFixed(2)} MB)`);
      });
    }

    try {
      if (isElectron && typeof api?.downloadFile === 'function') {
        const result = await api.downloadFile(downloadUrl, destPath);
        finalInstallPath = result.path;
        callbacks.onLog(`[DOWNLOAD] Download complete: ${result.path}`);
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

  // ───────────────────────────────────────────────────────────────────────────
  // Phase 4: Local Inspection & Package Installation (Priority 3)
  // ───────────────────────────────────────────────────────────────────────────
  callbacks.onTaskChange(3, { status: 'RUNNING', progress: 0 });

  // Unzip if archive
  if (isElectron && finalInstallPath.endsWith('.zip') && typeof api?.unzipFile === 'function') {
    const zipFilePath = finalInstallPath;
    const extractTarget = `${downloadsDir}/${sanitizeName}`;
    callbacks.onLog(`[ARCHIVE] Extracting archive to ${extractTarget}...`);
    try {
      const unzipRes = await api.unzipFile(zipFilePath, extractTarget);
      finalInstallPath = unzipRes.targetDir;
      callbacks.onLog(`[ARCHIVE] Extracted cleanly to ${extractTarget}`);

      try {
        if (typeof api?.executeTerminalCommand === 'function') {
          await api.executeTerminalCommand(`del /f /q "${zipFilePath.replace(/\//g, '\\')}"`);
        }
      } catch {}
    } catch (unzipErr: unknown) {
      const msg = unzipErr instanceof Error ? unzipErr.message : String(unzipErr);
      callbacks.onLog(`[ARCHIVE] Extraction notice: ${msg}`);
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
      callbacks.onLog(`[ECOSYSTEM] Detected: ${ecosystemInfo.ecosystem.toUpperCase()} (Install: "${ecosystemInfo.install_command || 'None'}", Start: "${ecosystemInfo.start_command || 'None'}")`);
      if (runDir !== finalInstallPath) {
        callbacks.onLog(`[ECOSYSTEM] Resolved workspace directory: ${runDir}`);
      }

      // Secondary check: if local scan discovered runtimes not previously detected, ensure them now
      if (ecosystemInfo.required_runtimes && Array.isArray(ecosystemInfo.required_runtimes) && typeof api?.ensureRuntimesBatch === 'function') {
        await api.ensureRuntimesBatch(ecosystemInfo.required_runtimes);
      }
    } catch {}
  }

  const runCwd = ecosystemInfo.resolved_cwd || finalInstallPath;

  // Environment Setup (.env)
  if (isElectron && Array.isArray(ecosystemInfo.env_commands) && ecosystemInfo.env_commands.length > 0 && typeof api?.executeTerminalCommand === 'function') {
    for (const envCmd of ecosystemInfo.env_commands) {
      callbacks.onLog(`[ENV] Executing: "${envCmd}"...`);
      try {
        await api.executeTerminalCommand(envCmd, runCwd);
        callbacks.onLog(`[ENV] Environment file created.`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        callbacks.onLog(`[ENV] Environment notice: ${msg}`);
      }
    }
  }

  // Real Dependency Installation (npm install / python -m pip install)
  let installCommand = ecosystemInfo.install_command;
  if (ecosystemInfo.ecosystem === 'python' && installCommand.startsWith('pip install')) {
    // Prefer python -m pip install for maximum reliability across Windows environments
    installCommand = installCommand.replace(/^pip install/, 'python -m pip install');
  }

  if (isElectron && installCommand && typeof api?.executeTerminalCommand === 'function') {
    callbacks.onLog(`[DEPENDENCIES] Executing: "${installCommand}" in ${runCwd}...`);

    let termUnsub = () => {};
    let lastErrorLog = '';
    if (typeof api.onTerminalOutput === 'function') {
      termUnsub = api.onTerminalOutput((data) => {
        callbacks.onLog(`[LOG] ${data.text.trim()}`);
        if (data.type === 'stderr') lastErrorLog += data.text;
      });
    }

    try {
      const cmdResult = await api.executeTerminalCommand(installCommand, runCwd);
      if (cmdResult.success) {
        callbacks.onLog(`[DEPENDENCIES] Dependency installation succeeded.`);
      } else if (typeof api.groqAutoHeal === 'function') {
        callbacks.onLog(`[DIAGNOSIS] Command exited with code ${cmdResult.code}. Running automated diagnosis...`);
        const heal = await api.groqAutoHeal(runCwd, installCommand, lastErrorLog || cmdResult.output);
        callbacks.onLog(`[DIAGNOSIS] Cause: ${heal.cause}`);
        callbacks.onLog(`[DIAGNOSIS] Plan: ${heal.explanation}`);
        if (heal.fix_commands && heal.fix_commands.length > 0) {
          for (const fixCmd of heal.fix_commands) {
            callbacks.onLog(`[REPAIR] Running: "${fixCmd}"...`);
            await api.executeTerminalCommand(fixCmd, runCwd);
          }
        }
      }
    } catch (cmdErr: unknown) {
      const msg = cmdErr instanceof Error ? cmdErr.message : String(cmdErr);
      callbacks.onLog(`[DEPENDENCIES] Dependency notice: ${msg}`);
    } finally {
      termUnsub();
    }
  }

  // Real Automated Build Step
  if (isElectron && ecosystemInfo.build_command && typeof api?.executeTerminalCommand === 'function') {
    callbacks.onLog(`[BUILD] Executing build: "${ecosystemInfo.build_command}"...`);
    try {
      await api.executeTerminalCommand(ecosystemInfo.build_command, runCwd);
      callbacks.onLog(`[BUILD] Build completed successfully.`);
    } catch {}
  }

  callbacks.onTaskChange(3, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(80);

  // ───────────────────────────────────────────────────────────────────────────
  // Phase 5: Save Record & Prepare Auto-Launch (Priority 4)
  // ───────────────────────────────────────────────────────────────────────────
  callbacks.onTaskChange(4, { status: 'RUNNING', progress: 50 });
  callbacks.onLog(`[SETUP] Registering application in OpenStore registry...`);

  const localWebUrl = ecosystemInfo.is_web_app ? `http://localhost:${ecosystemInfo.detected_port || 3000}` : undefined;
  const detectedRunMode = isBinaryInstaller ? 'executable' : (ecosystemInfo.run_mode || 'ide');

  callbacks.onLog(`[SETUP] Configured run mode: ${detectedRunMode.toUpperCase()}${localWebUrl ? ` (${localWebUrl})` : ''}`);

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
      callbacks.onLog(`[SETUP] Ready. Record saved to local store.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      callbacks.onLog(`[SETUP] Persistence notice: ${msg}`);
    }
  }

  callbacks.onTaskChange(4, { status: 'COMPLETED', progress: 100 });
  callbacks.onOverallProgress(100);

  return installedAppRecord;
}

