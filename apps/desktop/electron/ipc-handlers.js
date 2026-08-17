/* eslint-disable @typescript-eslint/no-require-imports */
const os = require('os');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const net = require('net');
const { app, BrowserWindow, shell, dialog } = require('electron');
const { analyzeRepositoryWithGroq, diagnoseFailureWithGroq } = require('./groq-agent');

/**
 * Desktop Agent — Hands-Free Execution & Universal Auto-Run Resolver
 */

const auditLog = [];
const managedProcesses = new Map();
const activeCommandProcesses = new Set();

function logAudit(action, source, result, details = '') {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    source,
    result,
    details,
  };
  auditLog.push(entry);
  console.log(`[AGENT AUDIT] ${entry.timestamp} | ${action} | ${result} | ${details}`);
}

function getStorageDir() {
  const base = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.local/share');
  const dir = path.join(base, 'OpenStore');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getInstalledAppsFile() {
  return path.join(getStorageDir(), 'installed_apps.json');
}

function getDownloadsDir() {
  const userHome = os.homedir();
  const dir = path.join(userHome, 'Downloads', 'OpenStore');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function registerAgentHandlers(ipcMain) {
  // ── Window Controls ──────────────────────────────────────────────────────
  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
  });

  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.handle('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
  });

  ipcMain.handle('window:set-titlebar-theme', (event, theme) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && typeof win.setTitleBarOverlay === 'function') {
      try {
        if (theme === 'light') {
          win.setTitleBarOverlay({
            color: '#00000000',
            symbolColor: '#09090b',
            height: 44,
          });
        } else {
          win.setTitleBarOverlay({
            color: '#00000000',
            symbolColor: '#f4f4f5',
            height: 44,
          });
        }
      } catch {}
    }
  });

  // ── System Info ──────────────────────────────────────────────────────────
  ipcMain.handle('agent:get-system-info', async () => {
    const platformMap = { win32: 'windows', darwin: 'macos', linux: 'linux' };
    const platform = platformMap[os.platform()] || os.platform();
    const arch = os.arch() === 'x64' ? 'x64' : 'arm64';

    let freeDisk = 0;
    let totalDisk = 0;

    if (os.platform() === 'win32') {
      try {
        const diskInfo = await execPromise('wmic logicaldisk where "DeviceID=\'C:\'" get FreeSpace,Size /format:csv');
        const lines = diskInfo.trim().split('\n');
        if (lines.length >= 2) {
          const parts = lines[lines.length - 1].split(',');
          if (parts.length >= 3) {
            freeDisk = parseInt(parts[1]) || 0;
            totalDisk = parseInt(parts[2]) || 0;
          }
        }
      } catch {}
    }

    return {
      platform,
      os_version: os.release(),
      architecture: arch,
      hostname: os.hostname(),
      total_memory: os.totalmem(),
      free_memory: os.freemem(),
      total_disk: totalDisk,
      free_disk: freeDisk,
      cpu_model: os.cpus()[0]?.model || 'Processor',
      cpu_cores: os.cpus().length,
    };
  });

  // ── Command Check ────────────────────────────────────────────────────────
  ipcMain.handle('agent:check-command', async (_event, command) => {
    if (!command || typeof command !== 'string') return { exists: false };
    try {
      const flag = command === 'docker' ? 'version' : '--version';
      const output = await execPromise(`${command} ${flag}`, { timeout: 8000 });
      const versionMatch = output.match(/(\d+\.\d+[\.\d]*)/);
      return { exists: true, version: versionMatch ? versionMatch[1] : 'installed' };
    } catch {
      return { exists: false };
    }
  });

  // ── Check Port ───────────────────────────────────────────────────────────
  ipcMain.handle('agent:check-port', async (_event, port) => {
    if (!port || typeof port !== 'number') return { inUse: false };

    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1500);
      socket.on('connect', () => { socket.destroy(); resolve({ inUse: true }); });
      socket.on('timeout', () => { socket.destroy(); resolve({ inUse: false }); });
      socket.on('error', () => { socket.destroy(); resolve({ inUse: false }); });
      socket.connect(port, '127.0.0.1');
    });
  });

  // ── Git Clone (Always ensures a valid, populated repository) ─────────────
  ipcMain.handle('agent:git-clone', async (_event, repoUrl, targetDir) => {
    if (!repoUrl || typeof repoUrl !== 'string') throw new Error('Invalid repository URL');

    logAudit('git-clone', 'renderer', 'started', `${repoUrl} -> ${targetDir}`);

    if (fs.existsSync(targetDir)) {
      const gitDir = path.join(targetDir, '.git');

      if (fs.existsSync(gitDir)) {
        // Valid git repo exists — just pull latest changes
        try {
          await execPromise(`git -C "${targetDir}" pull`, { timeout: 120000 });
          logAudit('git-clone', 'renderer', 'git-pull-success', targetDir);
          return { success: true, targetDir, action: 'pulled' };
        } catch {
          // Pull failed but repo exists — still usable
          logAudit('git-clone', 'renderer', 'git-pull-failed-using-existing', targetDir);
          return { success: true, targetDir, action: 'existing' };
        }
      } else {
        // Directory exists but is NOT a git repo (empty or stale) — delete it cleanly
        logAudit('git-clone', 'renderer', 'removing-stale-dir', targetDir);
        try {
          if (os.platform() === 'win32') {
            try { await execPromise(`attrib -R -H -S "${targetDir}\\*.*" /S /D`, { timeout: 15000 }); } catch {}
            await execPromise(`rmdir /S /Q "${targetDir}"`, { timeout: 30000 });
          } else {
            fs.rmSync(targetDir, { recursive: true, force: true });
          }
        } catch {
          try { fs.rmSync(targetDir, { recursive: true, force: true }); } catch {}
        }
      }
    }

    // Fresh clone
    const parentDir = path.dirname(targetDir);
    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });

    await execPromise(`git clone "${repoUrl}" "${targetDir}"`, { timeout: 300000 });
    logAudit('git-clone', 'renderer', 'git-clone-success', targetDir);
    return { success: true, targetDir, action: 'cloned' };
  });

  // ── Universal Smart Ecosystem & Run Command Resolver ─────────────────────
  // Handles standard repos AND monorepos (scans subdirs when root has no clear entry)
  ipcMain.handle('agent:inspect-repo-ecosystem', async (_event, repoPath) => {
    if (!fs.existsSync(repoPath)) throw new Error('Repository directory does not exist');

    const result = {
      ecosystem: 'unknown',
      install_command: '',
      build_command: '',
      start_command: '',
      detected_port: 3000,
      is_web_app: false,
      has_package_json: false,
      has_requirements_txt: false,
      has_dockerfile: false,
      run_mode: 'ide', // Default: open in IDE. Changed to 'browser' when web framework detected
      resolved_cwd: repoPath,
    };

    // Helper: Try to resolve ecosystem from a given directory
    function resolveFromDir(dir) {
      const packageJsonPath = path.join(dir, 'package.json');
      const requirementsPath = path.join(dir, 'requirements.txt');
      const dockerComposePath = path.join(dir, 'docker-compose.yml');
      const dockerfilePath = path.join(dir, 'Dockerfile');

      // ── Node.js ──────────────────────────────────────────────────────
      if (fs.existsSync(packageJsonPath)) {
        result.has_package_json = true;
        result.ecosystem = 'node';
        result.install_command = 'npm install';
        result.resolved_cwd = dir;

        try {
          const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          const scripts = pkg.scripts || {};
          const deps = { ...pkg.dependencies, ...pkg.devDependencies };
          const depsStr = JSON.stringify(deps).toLowerCase();
          const scriptStr = JSON.stringify(scripts).toLowerCase();

          if (scripts.build) result.build_command = 'npm run build';

          if (scripts.dev) {
            result.start_command = 'npm run dev';
          } else if (scripts.start) {
            result.start_command = 'npm start';
          } else if (scripts.serve) {
            result.start_command = 'npm run serve';
          } else if (scripts.preview) {
            result.start_command = 'npm run preview';
          }

          // ── Determine run_mode based on what the project actually is ──

          // Desktop app (Electron, Tauri)
          if (depsStr.includes('electron') || depsStr.includes('tauri')) {
            result.run_mode = 'executable';
            result.is_web_app = false;
          }
          // CLI tool (has bin field in package.json)
          else if (pkg.bin) {
            result.run_mode = 'terminal';
            result.is_web_app = false;
          }
          // Web framework detected → browser mode
          else if (
            depsStr.includes('next') ||
            depsStr.includes('vite') ||
            depsStr.includes('react') ||
            depsStr.includes('vue') ||
            depsStr.includes('angular') ||
            depsStr.includes('svelte') ||
            depsStr.includes('nuxt') ||
            depsStr.includes('express') ||
            depsStr.includes('koa') ||
            depsStr.includes('fastify') ||
            depsStr.includes('hono') ||
            scriptStr.includes('vite') ||
            scriptStr.includes('next') ||
            scriptStr.includes('webpack-dev-server')
          ) {
            result.run_mode = 'browser';
            result.is_web_app = true;
          }
          // Has a dev/start script but no clear web framework → IDE project
          else if (scripts.dev || scripts.start) {
            result.run_mode = 'ide';
            result.is_web_app = false;
          }
          // No runnable scripts at all → IDE project
          else {
            result.run_mode = 'ide';
            result.is_web_app = false;
            result.start_command = '';
          }

          // Port hints
          if (scriptStr.includes('vite') || depsStr.includes('vite')) result.detected_port = 5173;
          else if (scriptStr.includes('next') || depsStr.includes('next')) result.detected_port = 3000;
          else if (depsStr.includes('nuxt')) result.detected_port = 3000;
          else if (depsStr.includes('angular')) result.detected_port = 4200;
          else if (depsStr.includes('svelte')) result.detected_port = 5173;

        } catch {
          result.run_mode = 'ide';
        }

        return true;
      }

      // ── Python ───────────────────────────────────────────────────────
      if (fs.existsSync(requirementsPath)) {
        result.has_requirements_txt = true;
        result.ecosystem = 'python';
        result.install_command = 'pip install -r requirements.txt';
        result.resolved_cwd = dir;

        const pyFiles = fs.readdirSync(dir).filter(f => f.endsWith('.py'));
        if (pyFiles.includes('app.py')) result.start_command = 'python app.py';
        else if (pyFiles.includes('main.py')) result.start_command = 'python main.py';
        else if (pyFiles.includes('manage.py')) { result.start_command = 'python manage.py runserver'; result.detected_port = 8000; }
        else if (pyFiles.length > 0) result.start_command = `python ${pyFiles[0]}`;

        try {
          const reqText = fs.readFileSync(requirementsPath, 'utf-8').toLowerCase();
          if (reqText.includes('streamlit')) {
            result.start_command = 'streamlit run app.py'; result.detected_port = 8501;
            result.run_mode = 'browser'; result.is_web_app = true;
          } else if (reqText.includes('flask')) {
            result.detected_port = 5000;
            result.run_mode = 'browser'; result.is_web_app = true;
          } else if (reqText.includes('fastapi') || reqText.includes('uvicorn')) {
            result.start_command = 'uvicorn main:app --reload'; result.detected_port = 8000;
            result.run_mode = 'browser'; result.is_web_app = true;
          } else if (reqText.includes('django')) {
            result.detected_port = 8000;
            result.run_mode = 'browser'; result.is_web_app = true;
          } else {
            // Python script without web framework → run in terminal or IDE
            result.run_mode = pyFiles.length > 0 ? 'terminal' : 'ide';
          }
        } catch {
          result.run_mode = 'terminal';
        }

        return true;
      }

      // ── Static HTML ──────────────────────────────────────────────────
      if (fs.existsSync(path.join(dir, 'index.html'))) {
        result.ecosystem = 'static-html';
        result.start_command = 'npx serve -p 3000';
        result.detected_port = 3000;
        result.resolved_cwd = dir;
        result.run_mode = 'browser';
        result.is_web_app = true;
        return true;
      }

      // ── Docker ───────────────────────────────────────────────────────
      if (fs.existsSync(dockerComposePath) || fs.existsSync(dockerfilePath)) {
        result.has_dockerfile = true;
        result.ecosystem = 'docker';
        result.install_command = fs.existsSync(dockerComposePath) ? 'docker compose build' : 'docker build -t openstore-app .';
        result.start_command = fs.existsSync(dockerComposePath) ? 'docker compose up' : 'docker run -p 3000:3000 openstore-app';
        result.detected_port = 3000;
        result.resolved_cwd = dir;
        result.run_mode = 'browser';
        result.is_web_app = true;
        return true;
      }

      return false;
    }

    // 1. Try root directory first
    const foundAtRoot = resolveFromDir(repoPath);

    // 2. If root is unknown (monorepo), scan immediate subdirectories
    if (!foundAtRoot) {
      try {
        const subdirs = fs.readdirSync(repoPath, { withFileTypes: true })
          .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules')
          .map(d => d.name);

        // Prioritize common runnable subdirectory names
        const priority = ['app', 'apps', 'web', 'frontend', 'client', 'packages', 'src', 'server', 'api', 'backend'];
        const sorted = subdirs.sort((a, b) => {
          const ai = priority.indexOf(a.toLowerCase());
          const bi = priority.indexOf(b.toLowerCase());
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });

        for (const sub of sorted) {
          const subPath = path.join(repoPath, sub);
          if (resolveFromDir(subPath)) break;
        }
      } catch {}
    }

    // 3. Groq AI Agent Deep Analysis (Runs if static resolution is unknown or missing start command)
    if (result.ecosystem === 'unknown' || !result.start_command) {
      try {
        logAudit('inspect-repo', 'renderer', 'groq-agent-invoked', repoPath);
        const groqResult = await analyzeRepositoryWithGroq(repoPath);

        if (groqResult && groqResult.ecosystem !== 'unknown') {
          result.ecosystem = groqResult.ecosystem;
          result.run_mode = groqResult.run_mode;
          result.install_command = groqResult.install_commands.join(' && ') || result.install_command;
          result.build_command = groqResult.build_commands.join(' && ') || result.build_command;
          result.start_command = groqResult.start_command || result.start_command;
          result.detected_port = groqResult.detected_port || result.detected_port;
          result.is_web_app = groqResult.is_web_app;
          result.resolved_cwd = path.join(repoPath, groqResult.resolved_cwd_relative || '.');
          result.env_setup_required = groqResult.env_setup_required;
          result.env_commands = groqResult.env_commands;
          result.explanation = groqResult.explanation;
          result.resolved_by_ai = true;
          logAudit('inspect-repo', 'renderer', 'groq-agent-success', `Ecosystem: ${result.ecosystem}, Mode: ${result.run_mode}`);
        }
      } catch (err) {
        logAudit('inspect-repo', 'renderer', 'groq-agent-error', err.message);
      }
    }

    const runtimeMap = {
      node: ['git', 'node'],
      python: ['git', 'python'],
      docker: ['git', 'docker'],
      go: ['git', 'go'],
      rust: ['git', 'rust'],
      'static-html': ['git'],
    };
    result.required_runtimes = runtimeMap[result.ecosystem] || ['git'];

    logAudit('inspect-repo', 'renderer', 'success', `Ecosystem: ${result.ecosystem}, Mode: ${result.run_mode}, Run: "${result.start_command}" in "${result.resolved_cwd}" on port ${result.detected_port}`);
    return result;
  });

  // ── Explicit Groq Deep Analysis Handler ────────────────────────────────────
  ipcMain.handle('agent:groq-analyze-repo', async (_event, repoPath) => {
    if (!repoPath || !fs.existsSync(repoPath)) throw new Error('Repository directory does not exist');
    logAudit('groq-analyze-repo', 'renderer', 'started', repoPath);
    return await analyzeRepositoryWithGroq(repoPath);
  });

  // ── Groq Auto-Healing Setup Repair Handler ────────────────────────────────
  ipcMain.handle('agent:groq-auto-heal', async (_event, repoPath, failedCommand, errorOutput) => {
    logAudit('groq-auto-heal', 'renderer', 'started', `${failedCommand} in ${repoPath}`);
    return await diagnoseFailureWithGroq(repoPath, failedCommand, errorOutput);
  });

  // ── Terminal Execution with Live Output Stream ────────────────────────────
  ipcMain.handle('agent:execute-terminal-command', async (_event, command, cwd) => {
    if (!command || typeof command !== 'string') throw new Error('Invalid command');

    logAudit('execute-command', 'renderer', 'started', `${command} (cwd: ${cwd})`);

    return new Promise((resolve, reject) => {
      const isWin = os.platform() === 'win32';
      const shellCmd = isWin ? 'cmd.exe' : '/bin/sh';
      const shellArgs = isWin ? ['/c', command] : ['-c', command];

      const child = spawn(shellCmd, shellArgs, {
        cwd: cwd || getDownloadsDir(),
        env: { ...process.env },
      });

      activeCommandProcesses.add(child);

      let stdoutData = '';
      let stderrData = '';

      child.stdout.on('data', (data) => {
        const text = data.toString();
        stdoutData += text;
        const win = BrowserWindow.getAllWindows()[0];
        if (win) win.webContents.send('agent:terminal-output', { command, text, type: 'stdout' });
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        stderrData += text;
        const win = BrowserWindow.getAllWindows()[0];
        if (win) win.webContents.send('agent:terminal-output', { command, text, type: 'stderr' });
      });

      child.on('close', (code) => {
        activeCommandProcesses.delete(child);
        logAudit('execute-command', 'renderer', 'finished', `Exit code ${code}`);
        resolve({ success: code === 0, code, output: stdoutData + stderrData });
      });

      child.on('error', (err) => {
        activeCommandProcesses.delete(child);
        logAudit('execute-command', 'renderer', 'error', err.message);
        reject(err);
      });
    });
  });

  // ── Start Background Service Server Process ──────────────────────────────
  ipcMain.handle('agent:start-background-service', async (_event, command, cwd, appId) => {
    if (!command || typeof command !== 'string') throw new Error('Invalid command');

    logAudit('start-service', 'renderer', 'started', `${command} in ${cwd}`);

    const isWin = os.platform() === 'win32';
    const shellCmd = isWin ? 'cmd.exe' : '/bin/sh';
    const shellArgs = isWin ? ['/c', command] : ['-c', command];

    const child = spawn(shellCmd, shellArgs, {
      cwd: cwd || getDownloadsDir(),
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    const pid = child.pid;
    managedProcesses.set(appId, { pid, child, command, cwd });

    child.stdout.on('data', (data) => {
      const text = data.toString();
      const win = BrowserWindow.getAllWindows()[0];
      if (win) win.webContents.send('agent:service-output', { appId, text });
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      const win = BrowserWindow.getAllWindows()[0];
      if (win) win.webContents.send('agent:service-output', { appId, text });
    });

    child.unref();
    return { success: true, pid };
  });

  // ── Stop Background Service ───────────────────────────────────────────────
  ipcMain.handle('agent:stop-background-service', async (_event, appId) => {
    const processInfo = managedProcesses.get(appId);
    if (processInfo) {
      const { pid } = processInfo;
      try {
        if (os.platform() === 'win32') {
          await execPromise(`taskkill /F /PID ${pid} /T`);
        } else {
          process.kill(-pid, 'SIGKILL');
        }
      } catch {}
      managedProcesses.delete(appId);
      logAudit('stop-service', 'renderer', 'success', `App: ${appId}, PID: ${pid}`);
    }
    return { success: true };
  });

  // ── File Downloader ──────────────────────────────────────────────────────
  ipcMain.handle('agent:download-file', async (event, url, dest) => {
    if (!url || typeof url !== 'string') throw new Error('Invalid URL');

    const finalDest = dest || path.join(getDownloadsDir(), path.basename(new URL(url).pathname) || 'download.bin');
    const dir = path.dirname(finalDest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    return new Promise((resolve, reject) => {
      function downloadUrl(targetUrl, redirectCount = 0) {
        if (redirectCount > 8) return reject(new Error('Too many redirects'));

        let parsedUrl;
        try { parsedUrl = new URL(targetUrl); } catch (e) { return reject(new Error(`Invalid URL: ${targetUrl}`)); }

        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        const req = protocol.get(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
          },
        }, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, targetUrl).href;
            return downloadUrl(redirectUrl, redirectCount + 1);
          }

          if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));

          const total = parseInt(res.headers['content-length'] || '0', 10);
          let received = 0;
          const file = fs.createWriteStream(finalDest);

          res.on('data', (chunk) => {
            received += chunk.length;
            const progress = total > 0 ? Math.round((received / total) * 100) : 50;
            const win = BrowserWindow.getAllWindows()[0];
            if (win) {
              win.webContents.send('agent:download-progress', { url, received, total, progress, path: finalDest });
            }
          });

          res.pipe(file);
          file.on('finish', () => {
            file.close(() => resolve({ success: true, path: finalDest, size: received }));
          });
          file.on('error', (err) => { fs.unlink(finalDest, () => {}); reject(err); });
        });

        req.on('error', (err) => { fs.unlink(finalDest, () => {}); reject(err); });
        req.setTimeout(120000, () => { req.destroy(); reject(new Error('Download timeout')); });
      }

      downloadUrl(url);
    });
  });

  // ── Extract Archive ──────────────────────────────────────────────────────
  ipcMain.handle('agent:unzip-file', async (_event, zipPath, targetDir) => {
    if (!fs.existsSync(zipPath)) throw new Error('Zip file not found');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    if (os.platform() === 'win32') {
      await execPromise(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${targetDir}' -Force"`, { timeout: 180000 });
    } else {
      await execPromise(`unzip -o "${zipPath}" -d "${targetDir}"`, { timeout: 180000 });
    }
    return { success: true, targetDir };
  });

  // ── Smart App Launcher & Executable Resolver ──────────────────────────────
  ipcMain.handle('agent:launch-app', async (_event, config) => {
    if (!config) throw new Error('Invalid launch config');

    if (config.url) {
      shell.openExternal(config.url);
      logAudit('launch-app', 'renderer', 'opened-url', config.url);
      return 0;
    }

    if (config.path) {
      if (fs.existsSync(config.path)) {
        const stat = fs.statSync(config.path);

        if (stat.isDirectory()) {
          const dir = config.path;

          // 1. Search for built .exe binary in dist/win-unpacked, dist, out, build, release-builds
          const candidateDirs = [
            path.join(dir, 'dist', 'win-unpacked'),
            path.join(dir, 'dist'),
            path.join(dir, 'out'),
            path.join(dir, 'build'),
            path.join(dir, 'release-builds'),
            path.join(dir, 'release'),
            dir,
          ];

          for (const cand of candidateDirs) {
            if (fs.existsSync(cand)) {
              try {
                const files = fs.readdirSync(cand);
                const exeFiles = files.filter(f => f.endsWith('.exe') && !f.toLowerCase().includes('unins') && !f.toLowerCase().includes('setup'));
                if (exeFiles.length > 0) {
                  const exePath = path.join(cand, exeFiles[0]);
                  logAudit('launch-app', 'renderer', 'launching-built-exe', exePath);
                  exec(`"${exePath}"`, { cwd: dir });
                  return 0;
                }
              } catch {}
            }
          }

          // 2. Try start_command or npm start / npm run dev if package.json exists
          const pkgPath = path.join(dir, 'package.json');
          if (fs.existsSync(pkgPath)) {
            try {
              const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
              const scripts = pkg.scripts || {};
              const cmd = config.command || (scripts.start ? 'npm start' : scripts.dev ? 'npm run dev' : null);
              if (cmd) {
                logAudit('launch-app', 'renderer', 'launching-npm-command', `${cmd} in ${dir}`);
                const isWin = os.platform() === 'win32';
                const shellCmd = isWin ? 'cmd.exe' : '/bin/sh';
                const shellArgs = isWin ? ['/c', cmd] : ['-c', cmd];
                const child = spawn(shellCmd, shellArgs, { cwd: dir, detached: true, stdio: 'ignore' });
                child.unref();
                return 0;
              }
            } catch {}
          }

          // 3. Fallback: open folder in file manager
          shell.openPath(dir);
          logAudit('launch-app', 'renderer', 'opened-path', dir);
          return 0;
        } else {
          // File path provided (.exe, .app, etc.)
          shell.openPath(config.path);
          logAudit('launch-app', 'renderer', 'opened-file', config.path);
          return 0;
        }
      }
    }

    throw new Error('Target path or URL not found');
  });

  // ── Open Project in IDE (VS Code, Cursor, Zed, Sublime, or folder fallback) ──
  ipcMain.handle('agent:open-in-ide', async (_event, projectPath) => {
    if (!projectPath || !fs.existsSync(projectPath)) throw new Error('Project path not found');

    // Try IDEs in priority order
    const ideCommands = [
      { name: 'VS Code', cmd: 'code' },
      { name: 'Cursor', cmd: 'cursor' },
      { name: 'Zed', cmd: 'zed' },
      { name: 'Sublime Text', cmd: 'subl' },
    ];

    for (const ide of ideCommands) {
      try {
        await execPromise(`${ide.cmd} --version`, { timeout: 3000 });
        // IDE found — open the project
        exec(`${ide.cmd} "${projectPath}"`, { timeout: 10000 });
        logAudit('open-in-ide', 'renderer', 'success', `${ide.name} -> ${projectPath}`);
        return { success: true, ide: ide.name };
      } catch {
        // IDE not installed, try next
      }
    }

    // Fallback: open folder in system file manager
    shell.openPath(projectPath);
    logAudit('open-in-ide', 'renderer', 'fallback-folder', projectPath);
    return { success: true, ide: 'File Explorer' };
  });

  ipcMain.handle('agent:open-folder', async (_event, folderPath) => {
    try {
      if (folderPath && fs.existsSync(folderPath)) {
        await shell.openPath(folderPath);
        return { success: true };
      }
      return { success: false, error: 'Path does not exist' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('agent:select-directory', async (_event, defaultPath) => {
    try {
      const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
      const result = win
        ? await dialog.showOpenDialog(win, {
            title: 'Select OpenStore Workspace Directory',
            defaultPath: defaultPath || getDownloadsDir(),
            properties: ['openDirectory', 'createDirectory'],
          })
        : await dialog.showOpenDialog({
            title: 'Select OpenStore Workspace Directory',
            defaultPath: defaultPath || getDownloadsDir(),
            properties: ['openDirectory', 'createDirectory'],
          });

      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        const selectedDir = result.filePaths[0];
        if (!fs.existsSync(selectedDir)) {
          fs.mkdirSync(selectedDir, { recursive: true });
        }
        return { success: true, path: selectedDir };
      }
      return { success: false, canceled: true };
    } catch (err) {
      console.error('Error in agent:select-directory:', err);
      return { success: false, error: err.message };
    }
  });

  // ── App Registry Persistence ──────────────────────────────────────────────
  ipcMain.handle('agent:get-installed-apps', async () => {
    const file = getInstalledAppsFile();
    if (fs.existsSync(file)) {
      try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return []; }
    }
    return [];
  });

  ipcMain.handle('agent:save-installed-app', async (_event, appRecord) => {
    const file = getInstalledAppsFile();
    let list = [];
    if (fs.existsSync(file)) {
      try { list = JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { list = []; }
    }

    list = list.filter((a) => a.id !== appRecord.id && a.application_id !== appRecord.application_id);
    list.unshift(appRecord);

    fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf-8');
    return list;
  });

  ipcMain.handle('agent:uninstall-app', async (_event, appId, installPath) => {
    // 1. Stop any running background service first
    const processInfo = managedProcesses.get(appId);
    if (processInfo) {
      try {
        if (os.platform() === 'win32') {
          await execPromise(`taskkill /F /PID ${processInfo.pid} /T`);
        } else {
          process.kill(-processInfo.pid, 'SIGKILL');
        }
      } catch {}
      managedProcesses.delete(appId);
    }

    // 2. Kill any active spawned terminal commands & processes
    for (const child of activeCommandProcesses) {
      try {
        if (os.platform() === 'win32') {
          try { await execPromise(`taskkill /F /PID ${child.pid} /T`); } catch {}
        } else {
          try { child.kill('SIGKILL'); } catch {}
        }
      } catch {}
    }
    activeCommandProcesses.clear();

    // 3. Kill any stray git.exe on Windows that might hold open handles
    if (os.platform() === 'win32') {
      try {
        await execPromise(`taskkill /F /IM git.exe /T`);
      } catch {}
    }

    // 3. Resolve target directory
    let target = installPath ? path.resolve(installPath) : null;
    if ((!target || !fs.existsSync(target)) && appId) {
      const defaultRoot = getDownloadsDir();
      const sanitizeName = appId.replace(/[^a-zA-Z0-9-_]/g, '_');
      const fallbackTarget = path.join(defaultRoot, sanitizeName);
      if (fs.existsSync(fallbackTarget)) {
        target = fallbackTarget;
      }
    }

    if (target && fs.existsSync(target)) {
      try {
        if (os.platform() === 'win32') {
          try { await execPromise(`attrib -R -H -S /S /D "${target}\\*"`, { timeout: 15000 }); } catch {}
          try { await execPromise(`cmd /c rmdir /S /Q "${target}"`, { timeout: 30000 }); } catch {}
          try { await execPromise(`powershell -NoProfile -Command "if (Test-Path '${target}') { Remove-Item -LiteralPath '${target}' -Recurse -Force -ErrorAction SilentlyContinue }"`, { timeout: 30000 }); } catch {}
        }
        if (fs.existsSync(target)) {
          fs.rmSync(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
        }
        logAudit('uninstall-app', 'renderer', 'files-deleted', target);
      } catch (err) {
        console.error('Uninstall file deletion error:', err);
      }

      // Also clean up any lingering .zip archive
      const zipArchive = `${target}.zip`;
      if (fs.existsSync(zipArchive)) {
        try { fs.unlinkSync(zipArchive); } catch {}
      }
    }

    // Remove from registry
    const file = getInstalledAppsFile();
    let list = [];
    if (fs.existsSync(file)) {
      try {
        list = JSON.parse(fs.readFileSync(file, 'utf-8'));
        list = list.filter((a) => a.id !== appId && a.application_id !== appId);
        fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf-8');
      } catch {}
    }

    logAudit('uninstall-app', 'renderer', 'success', appId);
    return list;
  });

  ipcMain.handle('agent:get-downloads-dir', () => getDownloadsDir());

  // ── Winget Package Manager & Prerequisite Auto-Fixer ───────────────────
  ipcMain.handle('agent:check-winget', async () => {
    try {
      const output = await execPromise('winget --version', { timeout: 8000 });
      return { available: true, version: output };
    } catch {
      return { available: false };
    }
  });

  ipcMain.handle('agent:search-winget', async (_event, query) => {
    if (!query) return [];
    try {
      const output = await execPromise(`winget search "${query}" --accept-source-agreements`, { timeout: 15000 });
      const lines = output.split('\n');
      const results = [];
      let headerFound = false;
      for (const line of lines) {
        if (line.includes('---')) {
          headerFound = true;
          continue;
        }
        if (headerFound && line.trim()) {
          const parts = line.split(/\s{2,}/);
          if (parts.length >= 2) {
            results.push({ name: parts[0], id: parts[1], version: parts[2] || 'latest' });
          }
        }
      }
      return results.slice(0, 5);
    } catch (err) {
      console.error('Winget search error:', err);
      return [];
    }
  });

  ipcMain.handle('agent:install-winget', async (event, packageId) => {
    if (!packageId) return { success: false, error: 'Package ID required' };
    logAudit('install-winget', 'renderer', 'started', packageId);

    return new Promise((resolve) => {
      const sender = event.sender;
      const cmd = `winget install --id "${packageId}" --exact --silent --accept-package-agreements --accept-source-agreements --disable-interactivity`;
      
      sender.send('winget:progress', `[WINGET] Launching Windows Package Manager for ${packageId}...`);

      const child = spawn(cmd, { shell: true });

      child.stdout.on('data', (data) => {
        const text = data.toString().trim();
        if (text) {
          sender.send('winget:progress', `[WINGET] ${text}`);
        }
      });

      child.stderr.on('data', (data) => {
        const text = data.toString().trim();
        if (text) {
          sender.send('winget:progress', `[WINGET LOG] ${text}`);
        }
      });

      child.on('close', (code) => {
        if (code === 0 || code === 3010) {
          logAudit('install-winget', 'renderer', 'success', packageId);
          sender.send('winget:progress', `[WINGET] Successfully installed ${packageId}!`);
          resolve({ success: true, code });
        } else {
          logAudit('install-winget', 'renderer', 'failed', `exit code ${code}`);
          sender.send('winget:progress', `[WINGET] Winget exited with code ${code}.`);
          resolve({ success: false, code });
        }
      });
    });
  });

  // ── Reload In-Memory System PATH ─────────────────────────────────────────
  ipcMain.handle('agent:reload-path', () => {
    reloadSystemPath();
    return { success: true, path: process.env.PATH };
  });

  // ── Batch Global Runtime Auto-Installer ──────────────────────────────────
  ipcMain.handle('agent:ensure-runtimes-batch', async (event, requestedRuntimes = []) => {
    reloadSystemPath();
    const sender = event.sender;

    const runtimeConfig = {
      git: { cmd: 'git', pkgId: 'Git.Git', name: 'Git' },
      python: { cmd: 'python', pkgId: 'Python.Python.3.12', name: 'Python 3.12' },
      node: { cmd: 'node', pkgId: 'OpenJS.NodeJS', name: 'Node.js LTS' },
      rust: { cmd: 'cargo', pkgId: 'Rustlang.Rustup', name: 'Rust' },
      go: { cmd: 'go', pkgId: 'GoLang.Go', name: 'Go' },
      docker: { cmd: 'docker', pkgId: 'Docker.DockerDesktop', name: 'Docker Desktop' },
      java: { cmd: 'java', pkgId: 'EclipseAdoptium.Temurin.21.JDK', name: 'Java JDK' },
      dotnet: { cmd: 'dotnet', pkgId: 'Microsoft.DotNet.SDK.8', name: '.NET SDK' },
    };

    const results = [];
    const missing = [];

    for (const rtKey of requestedRuntimes) {
      const cfg = runtimeConfig[rtKey.toLowerCase()];
      if (!cfg) continue;

      let exists = false;
      let version = null;
      try {
        const flag = cfg.cmd === 'docker' ? 'version' : '--version';
        const out = await execPromise(`${cfg.cmd} ${flag}`, { timeout: 6000 });
        const match = out.match(/(\d+\.\d+[\.\d]*)/);
        exists = true;
        version = match ? match[1] : 'installed';
      } catch {
        exists = false;
      }

      if (exists) {
        results.push({ runtime: rtKey, installed: true, newly_installed: false, version });
      } else {
        missing.push(cfg);
      }
    }

    if (missing.length === 0) {
      return { success: true, all_installed: true, runtimes: results };
    }

    // Check Winget
    let wingetAvailable = false;
    try {
      await execPromise('winget --version', { timeout: 6000 });
      wingetAvailable = true;
    } catch {
      wingetAvailable = false;
    }

    if (!wingetAvailable) {
      return {
        success: false,
        all_installed: false,
        error: 'Windows Package Manager (winget) is required to auto-install missing runtimes.',
        missing: missing.map((m) => m.name),
        runtimes: results,
      };
    }

    // Batch install missing runtimes silently
    for (const item of missing) {
      sender.send('winget:progress', `[PROVISION] Auto-installing ${item.name} globally via Windows Package Manager...`);
      logAudit('ensure-runtime', 'agent', 'installing', `${item.name} (${item.pkgId})`);

      const installCmd = `winget install --id "${item.pkgId}" --exact --silent --accept-package-agreements --accept-source-agreements --disable-interactivity`;

      try {
        const code = await new Promise((resolve) => {
          const child = spawn(installCmd, { shell: true });
          child.stdout.on('data', (d) => sender.send('winget:progress', `[WINGET] ${d.toString().trim()}`));
          child.stderr.on('data', (d) => sender.send('winget:progress', `[WINGET LOG] ${d.toString().trim()}`));
          child.on('close', (c) => resolve(c));
          child.on('error', () => resolve(1));
        });

        reloadSystemPath();

        let installed = false;
        let version = null;
        try {
          const flag = item.cmd === 'docker' ? 'version' : '--version';
          const out = await execPromise(`${item.cmd} ${flag}`, { timeout: 8000 });
          const match = out.match(/(\d+\.\d+[\.\d]*)/);
          installed = true;
          version = match ? match[1] : 'installed';
        } catch {
          reloadSystemPath();
          try {
            const out = await execPromise(`${item.cmd} --version`, { timeout: 8000 });
            const match = out.match(/(\d+\.\d+[\.\d]*)/);
            installed = true;
            version = match ? match[1] : 'installed';
          } catch {}
        }

        if (installed || code === 0 || code === 3010) {
          sender.send('winget:progress', `[PROVISION] Successfully installed ${item.name} globally.`);
          results.push({ runtime: item.cmd, installed: true, newly_installed: true, version });
        } else {
          sender.send('winget:progress', `[PROVISION] Warning: Could not verify ${item.name} after installation.`);
          results.push({ runtime: item.cmd, installed: false, error: `Exit code ${code}` });
        }
      } catch (err) {
        results.push({ runtime: item.cmd, installed: false, error: err.message });
      }
    }

    reloadSystemPath();
    const allInstalled = results.every((r) => r.installed);
    return { success: allInstalled, all_installed: allInstalled, runtimes: results };
  });

  // ── OpenStore In-App Update Checker ──────────────────────────────────────
  ipcMain.handle('agent:check-app-update', async () => {
    return new Promise((resolve) => {
      try {
        const pkgPath = path.join(__dirname, '../package.json');
        let currentVersion = '0.2.2';
        if (fs.existsSync(pkgPath)) {
          try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            currentVersion = pkg.version || '0.2.2';
          } catch {}
        }

        const req = https.get(
          'https://api.github.com/repos/Charannsai/openstore/releases/latest',
          {
            headers: {
              'User-Agent': 'OpenStore-Desktop-App',
              Accept: 'application/vnd.github.v3+json',
            },
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => {
              data += chunk;
            });
            res.on('end', () => {
              if (res.statusCode === 200) {
                try {
                  const release = JSON.parse(data);
                  const tag = (release.tag_name || '').replace(/^v/, '');
                  const hasUpdate = compareVersions(tag, currentVersion) > 0;
                  const exeAsset = (release.assets || []).find((a) => a.name.endsWith('.exe')) || {};
                  resolve({
                    has_update: hasUpdate,
                    current_version: currentVersion,
                    latest_version: tag || currentVersion,
                    release_name: release.name || `OpenStore v${tag}`,
                    release_url: release.html_url || 'https://github.com/Charannsai/openstore/releases',
                    download_url: exeAsset.browser_download_url || release.html_url || '',
                    release_notes: release.body || '',
                    published_at: release.published_at || new Date().toISOString(),
                  });
                } catch {
                  resolve({ has_update: false, current_version: currentVersion });
                }
              } else {
                resolve({ has_update: false, current_version: currentVersion });
              }
            });
          }
        );
        req.on('error', () => resolve({ has_update: false, current_version: currentVersion }));
        req.setTimeout(8000, () => {
          req.destroy();
          resolve({ has_update: false, current_version: currentVersion });
        });
      } catch {
        resolve({ has_update: false, current_version: '0.2.2' });
      }
    });
  });

  // ── OpenStore Silent Background Downloader & Auto-Updater ──────────────────
  ipcMain.handle('agent:download-and-install-app-update', async (event, downloadUrl) => {
    if (!downloadUrl || typeof downloadUrl !== 'string' || !downloadUrl.startsWith('http')) {
      return { success: false, error: 'Invalid download URL' };
    }

    const tempDir = os.tmpdir();
    const installerPath = path.join(tempDir, 'OpenStore-Update-Setup.exe');

    const downloadWithRedirects = (url, dest) => {
      return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const requestUrl = (targetUrl) => {
          const client = targetUrl.startsWith('https') ? https : http;
          const req = client.get(
            targetUrl,
            {
              headers: {
                'User-Agent': 'OpenStore-Desktop-Updater',
                Accept: 'application/octet-stream, application/vnd.github.v3+json, */*',
              },
            },
            (res) => {
              if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return requestUrl(res.headers.location);
              }
              if (res.statusCode !== 200) {
                return reject(new Error(`Failed to download installer: HTTP ${res.statusCode}`));
              }

              const total = parseInt(res.headers['content-length'] || '0', 10);
              let received = 0;

              res.on('data', (chunk) => {
                received += chunk.length;
                const percent = total > 0 ? Math.round((received / total) * 100) : 0;
                try {
                  event.sender.send('agent:app-update-progress', {
                    percent,
                    received,
                    total,
                  });
                } catch {}
              });

              res.pipe(file);
              file.on('finish', () => {
                file.close(() => resolve(dest));
              });
            }
          );
          req.on('error', (err) => {
            try {
              fs.unlinkSync(dest);
            } catch {}
            reject(err);
          });
        };
        requestUrl(url);
      });
    };

    try {
      await downloadWithRedirects(downloadUrl, installerPath);

      // Launch the installer silently (/S) and unref so it keeps running
      const child = spawn(installerPath, ['/S'], {
        detached: true,
        stdio: 'ignore',
      });
      child.unref();

      // Exit current electron process to allow in-place file replacement
      setTimeout(() => {
        app.quit();
      }, 600);

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to download and install update' };
    }
  });

  ipcMain.handle('agent:check-prerequisites', async () => {
    reloadSystemPath();
    const check = async (cmd, flag = '--version') => {
      try {
        const out = await execPromise(`${cmd} ${flag}`, { timeout: 8000 });
        const match = out.match(/(\d+\.\d+[\.\d]*)/);
        return { installed: true, version: match ? match[1] : 'installed' };
      } catch {
        return { installed: false, version: null };
      }
    };

    const [git, node, npm, python, docker] = await Promise.all([
      check('git'),
      check('node'),
      check('npm'),
      check('python'),
      check('docker', 'version'),
    ]);

    return {
      git,
      node,
      npm,
      python,
      docker,
    };
  });
}

function reloadSystemPath() {
  if (os.platform() !== 'win32') return;
  try {
    const currentPathSet = new Set(
      (process.env.PATH || '')
        .split(';')
        .filter(Boolean)
        .map((p) => path.normalize(p.trim().toLowerCase()))
    );

    const extraDirs = [];

    // Local AppData programs (Python, etc.)
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    const pyProgramsDir = path.join(localAppData, 'Programs', 'Python');
    if (fs.existsSync(pyProgramsDir)) {
      try {
        const pyDirs = fs.readdirSync(pyProgramsDir);
        for (const d of pyDirs) {
          const fullPy = path.join(pyProgramsDir, d);
          const fullScripts = path.join(fullPy, 'Scripts');
          if (fs.existsSync(fullPy)) extraDirs.push(fullPy);
          if (fs.existsSync(fullScripts)) extraDirs.push(fullScripts);
        }
      } catch {}
    }

    // Standard Program Files candidates
    const progFiles = process.env.ProgramFiles || 'C:\\Program Files';
    const standardCandidates = [
      path.join(progFiles, 'Git', 'cmd'),
      path.join(progFiles, 'Git', 'bin'),
      path.join(progFiles, 'nodejs'),
      path.join(progFiles, 'Go', 'bin'),
      path.join(os.homedir(), '.cargo', 'bin'),
      path.join(localAppData, 'Microsoft', 'WindowsApps'),
    ];

    for (const cand of standardCandidates) {
      if (fs.existsSync(cand)) extraDirs.push(cand);
    }

    // Query Registry User and Machine PATH
    try {
      const userPathOut = require('child_process').execSync('reg query "HKCU\\Environment" /v Path', {
        encoding: 'utf-8',
        timeout: 3000,
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const match = userPathOut.match(/REG_(?:SZ|EXPAND_SZ)\s+(.*)/i);
      if (match && match[1]) {
        match[1].split(';').filter(Boolean).forEach((p) => extraDirs.push(p.trim()));
      }
    } catch {}

    try {
      const sysPathOut = require('child_process').execSync(
        'reg query "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment" /v Path',
        { encoding: 'utf-8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] }
      );
      const match = sysPathOut.match(/REG_(?:SZ|EXPAND_SZ)\s+(.*)/i);
      if (match && match[1]) {
        match[1].split(';').filter(Boolean).forEach((p) => extraDirs.push(p.trim()));
      }
    } catch {}

    const newSegments = [];
    for (const dir of extraDirs) {
      if (!dir) continue;
      const normalized = path.normalize(dir.toLowerCase());
      if (!currentPathSet.has(normalized) && fs.existsSync(dir)) {
        currentPathSet.add(normalized);
        newSegments.push(dir);
      }
    }

    if (newSegments.length > 0) {
      process.env.PATH = `${newSegments.join(';')};${process.env.PATH}`;
      logAudit('reload-path', 'agent', 'success', `Added ${newSegments.length} directory segments to process.env.PATH`);
    }
  } catch (err) {
    console.error('Error reloading system PATH:', err);
  }
}

function compareVersions(v1, v2) {
  if (!v1 || !v2) return 0;
  const p1 = v1.split('.').map((n) => parseInt(n, 10) || 0);
  const p2 = v2.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

function execPromise(command, options = {}) {
  reloadSystemPath();
  return new Promise((resolve, reject) => {
    exec(command, { timeout: 300000, ...options }, (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout.toString().trim());
    });
  });
}

module.exports = { registerAgentHandlers };
