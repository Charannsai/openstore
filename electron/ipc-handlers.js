/* eslint-disable @typescript-eslint/no-require-imports */
const os = require('os');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const net = require('net');
const { BrowserWindow, shell } = require('electron');
const { analyzeRepositoryWithGroq, diagnoseFailureWithGroq } = require('./groq-agent');

/**
 * Desktop Agent — Hands-Free Execution & Universal Auto-Run Resolver
 */

const auditLog = [];
const managedProcesses = new Map();

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
        logAudit('execute-command', 'renderer', 'finished', `Exit code ${code}`);
        resolve({ success: code === 0, code, output: stdoutData + stderrData });
      });

      child.on('error', (err) => {
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
    // Stop any running background service first
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

    // Delete project files
    if (installPath && fs.existsSync(installPath)) {
      try {
        const downloadsRoot = path.normalize(getDownloadsDir());
        const targetNorm = path.normalize(installPath);
        if (targetNorm.startsWith(downloadsRoot)) {
          if (os.platform() === 'win32') {
            // Windows: clear read-only attributes on .git files before deleting
            try {
              await execPromise(`attrib -R -H -S "${installPath}\\*.*" /S /D`, { timeout: 30000 });
            } catch {}
            await execPromise(`rmdir /S /Q "${installPath}"`, { timeout: 60000 });
          } else {
            fs.rmSync(installPath, { recursive: true, force: true });
          }
          logAudit('uninstall-app', 'renderer', 'files-deleted', installPath);
        }
      } catch (err) {
        console.error('Uninstall file deletion error:', err);
        // Final fallback: try PowerShell
        try {
          await execPromise(`powershell -Command "Remove-Item -Path '${installPath}' -Recurse -Force -ErrorAction SilentlyContinue"`, { timeout: 60000 });
        } catch {}
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

  ipcMain.handle('agent:check-prerequisites', async () => {
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

function execPromise(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: 300000, ...options }, (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout.toString().trim());
    });
  });
}

module.exports = { registerAgentHandlers };
