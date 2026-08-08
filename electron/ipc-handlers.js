const os = require('os');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const net = require('net');
const { BrowserWindow, shell } = require('electron');

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

  // ── Robust Git Clone (Graceful Handling of Existing Folders) ─────────────
  ipcMain.handle('agent:git-clone', async (_event, repoUrl, targetDir) => {
    if (!repoUrl || typeof repoUrl !== 'string') throw new Error('Invalid repository URL');

    logAudit('git-clone', 'renderer', 'started', `${repoUrl} -> ${targetDir}`);

    if (fs.existsSync(targetDir)) {
      const gitDir = path.join(targetDir, '.git');
      if (fs.existsSync(gitDir)) {
        try {
          await execPromise(`git -C "${targetDir}" pull`, { timeout: 120000 });
          logAudit('git-clone', 'renderer', 'git-pull-success', targetDir);
          return { success: true, targetDir, action: 'pulled' };
        } catch {
          logAudit('git-clone', 'renderer', 'git-existing-used', targetDir);
          return { success: true, targetDir, action: 'existing' };
        }
      } else if (fs.readdirSync(targetDir).length > 0) {
        logAudit('git-clone', 'renderer', 'existing-dir-used', targetDir);
        return { success: true, targetDir, action: 'existing' };
      }
    }

    const parentDir = path.dirname(targetDir);
    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });

    try {
      await execPromise(`git clone "${repoUrl}" "${targetDir}"`, { timeout: 300000 });
      logAudit('git-clone', 'renderer', 'git-clone-success', targetDir);
      return { success: true, targetDir, action: 'cloned' };
    } catch (err) {
      if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
        logAudit('git-clone', 'renderer', 'git-clone-fallback', targetDir);
        return { success: true, targetDir, action: 'existing' };
      }
      throw err;
    }
  });

  // ── Universal Smart Ecosystem & Run Command Resolver ─────────────────────
  ipcMain.handle('agent:inspect-repo-ecosystem', async (_event, repoPath) => {
    if (!fs.existsSync(repoPath)) throw new Error('Repository directory does not exist');

    const result = {
      ecosystem: 'unknown',
      install_command: '',
      build_command: '',
      start_command: '',
      detected_port: 3000,
      is_web_app: true,
      has_package_json: false,
      has_requirements_txt: false,
      has_dockerfile: false,
    };

    const packageJsonPath = path.join(repoPath, 'package.json');
    const requirementsPath = path.join(repoPath, 'requirements.txt');
    const dockerComposePath = path.join(repoPath, 'docker-compose.yml');
    const dockerfilePath = path.join(repoPath, 'Dockerfile');

    // 1. Node.js Ecosystem
    if (fs.existsSync(packageJsonPath)) {
      result.has_package_json = true;
      result.ecosystem = 'node';
      result.install_command = 'npm install';

      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const scripts = pkg.scripts || {};

        if (scripts.build) result.build_command = 'npm run build';

        if (scripts.dev) {
          result.start_command = 'npm run dev';
        } else if (scripts.start) {
          result.start_command = 'npm start';
        } else if (scripts.serve) {
          result.start_command = 'npm run serve';
        } else if (scripts.preview) {
          result.start_command = 'npm run preview';
        } else {
          result.start_command = 'npx serve -p 3000';
        }

        // Port detection from Vite / Next / React config
        if (JSON.stringify(scripts).includes('vite')) result.detected_port = 5173;
        else if (JSON.stringify(scripts).includes('next')) result.detected_port = 3000;
      } catch {
        result.start_command = 'npx serve -p 3000';
      }
    }
    // 2. Python Ecosystem
    else if (fs.existsSync(requirementsPath)) {
      result.has_requirements_txt = true;
      result.ecosystem = 'python';
      result.install_command = 'pip install -r requirements.txt';

      const pyFiles = fs.readdirSync(repoPath).filter(f => f.endsWith('.py'));
      if (pyFiles.includes('app.py')) {
        result.start_command = 'python app.py';
      } else if (pyFiles.includes('main.py')) {
        result.start_command = 'python main.py';
      } else if (pyFiles.length > 0) {
        result.start_command = `python ${pyFiles[0]}`;
      } else {
        result.start_command = 'python -m http.server 8000';
        result.detected_port = 8000;
      }

      if (fs.readFileSync(requirementsPath, 'utf-8').includes('streamlit')) {
        result.start_command = 'streamlit run app.py';
        result.detected_port = 8501;
      }
    }
    // 3. Static HTML Web Page
    else if (fs.existsSync(path.join(repoPath, 'index.html'))) {
      result.ecosystem = 'static-html';
      result.start_command = 'npx serve -p 3000';
      result.detected_port = 3000;
    }
    // 4. Docker Container
    else if (fs.existsSync(dockerComposePath) || fs.existsSync(dockerfilePath)) {
      result.has_dockerfile = true;
      result.ecosystem = 'docker';
      result.install_command = fs.existsSync(dockerComposePath) ? 'docker compose build' : 'docker build -t openstore-app .';
      result.start_command = fs.existsSync(dockerComposePath) ? 'docker compose up' : 'docker run -p 3000:3000 openstore-app';
      result.detected_port = 3000;
    }

    // Inspect README for port hints
    try {
      const readmeFile = fs.readdirSync(repoPath).find(f => f.toLowerCase().startsWith('readme'));
      if (readmeFile) {
        const readmeText = fs.readFileSync(path.join(repoPath, readmeFile), 'utf-8');
        const portMatch = readmeText.match(/localhost:(\d{4,5})/i) || readmeText.match(/port\s*:?\s*(\d{4,5})/i);
        if (portMatch) {
          result.detected_port = parseInt(portMatch[1], 10);
        }
      }
    } catch {}

    logAudit('inspect-repo', 'renderer', 'success', `Ecosystem: ${result.ecosystem}, Run: "${result.start_command}" on port ${result.detected_port}`);
    return result;
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

  // ── Open Folder or URL ───────────────────────────────────────────────────
  ipcMain.handle('agent:launch-app', async (_event, config) => {
    if (!config) throw new Error('Invalid launch config');

    if (config.url) {
      shell.openExternal(config.url);
      logAudit('launch-app', 'renderer', 'opened-url', config.url);
      return 0;
    }

    if (config.path) {
      if (fs.existsSync(config.path)) {
        shell.openPath(config.path);
        logAudit('launch-app', 'renderer', 'opened-path', config.path);
        return 0;
      }
    }

    throw new Error('Target path or URL not found');
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
    if (installPath && fs.existsSync(installPath)) {
      try {
        const downloadsRoot = path.normalize(getDownloadsDir());
        const targetNorm = path.normalize(installPath);
        if (targetNorm.startsWith(downloadsRoot)) {
          fs.rmSync(installPath, { recursive: true, force: true });
        }
      } catch (err) {
        console.error('Uninstall error:', err);
      }
    }

    const file = getInstalledAppsFile();
    let list = [];
    if (fs.existsSync(file)) {
      try {
        list = JSON.parse(fs.readFileSync(file, 'utf-8'));
        list = list.filter((a) => a.id !== appId && a.application_id !== appId);
        fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf-8');
      } catch {}
    }

    return list;
  });

  ipcMain.handle('agent:get-downloads-dir', () => getDownloadsDir());
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
