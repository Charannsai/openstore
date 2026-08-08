const os = require('os');
const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const net = require('net');
const { BrowserWindow, shell } = require('electron');

/**
 * Desktop Agent — Real End-to-End Local Execution with Git Clone Support
 */

const auditLog = [];

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
    try {
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
    } catch (error) {
      logAudit('get-system-info', 'renderer', 'error', error.message);
      throw error;
    }
  });

  // ── Check Command ────────────────────────────────────────────────────────
  ipcMain.handle('agent:check-command', async (_event, command) => {
    if (!command || typeof command !== 'string') return { exists: false };

    const allowedCommands = [
      'git', 'node', 'npm', 'npx', 'python', 'python3', 'pip', 'pip3',
      'docker', 'docker-compose', 'java', 'go', 'rust', 'cargo',
      'code', 'curl', 'wget', 'ffmpeg', 'vlc', 'blender',
    ];

    if (!allowedCommands.includes(command.toLowerCase())) {
      return { exists: false, error: 'Command not allowed' };
    }

    try {
      const flag = command === 'docker' ? 'version' : '--version';
      const output = await execPromise(`${command} ${flag}`, { timeout: 8000 });
      const versionMatch = output.match(/(\d+\.\d+[\.\d]*)/);
      return { exists: true, version: versionMatch ? versionMatch[1] : 'installed' };
    } catch {
      return { exists: false };
    }
  });

  // ── Real Git Clone ───────────────────────────────────────────────────────
  ipcMain.handle('agent:git-clone', async (_event, repoUrl, targetDir) => {
    if (!repoUrl || typeof repoUrl !== 'string') throw new Error('Invalid repository URL');
    if (!targetDir || typeof targetDir !== 'string') throw new Error('Invalid target directory');

    logAudit('git-clone', 'renderer', 'started', `${repoUrl} -> ${targetDir}`);

    // If target directory already exists with a git repo, pull updates
    if (fs.existsSync(targetDir)) {
      const gitDir = path.join(targetDir, '.git');
      if (fs.existsSync(gitDir)) {
        await execPromise(`git -C "${targetDir}" pull`, { timeout: 120000 });
        logAudit('git-clone', 'renderer', 'git-pull-success', targetDir);
        return { success: true, targetDir, action: 'pulled' };
      } else {
        fs.rmSync(targetDir, { recursive: true, force: true });
      }
    }

    const parentDir = path.dirname(targetDir);
    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });

    await execPromise(`git clone "${repoUrl}" "${targetDir}"`, { timeout: 300000 });
    logAudit('git-clone', 'renderer', 'git-clone-success', targetDir);
    return { success: true, targetDir, action: 'cloned' };
  });

  // ── Real File Downloader ─────────────────────────────────────────────────
  ipcMain.handle('agent:download-file', async (event, url, dest, checksum) => {
    if (!url || typeof url !== 'string') throw new Error('Invalid URL');

    const finalDest = dest || path.join(getDownloadsDir(), path.basename(new URL(url).pathname) || 'download.bin');
    const dir = path.dirname(finalDest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    logAudit('download-file', 'renderer', 'started', `${url} -> ${finalDest}`);

    return new Promise((resolve, reject) => {
      function downloadUrl(targetUrl, redirectCount = 0) {
        if (redirectCount > 5) return reject(new Error('Too many redirects'));

        const parsedUrl = new URL(targetUrl);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        const req = protocol.get(targetUrl, {
          headers: { 'User-Agent': 'OpenStore-Desktop-Agent/1.0' },
        }, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, targetUrl).href;
            return downloadUrl(redirectUrl, redirectCount + 1);
          }

          if (res.statusCode !== 200) {
            return reject(new Error(`Server returned HTTP ${res.statusCode}`));
          }

          const total = parseInt(res.headers['content-length'] || '0', 10);
          let received = 0;
          const file = fs.createWriteStream(finalDest);

          res.on('data', (chunk) => {
            received += chunk.length;
            const progress = total > 0 ? Math.round((received / total) * 100) : 0;

            const win = BrowserWindow.getAllWindows()[0];
            if (win) {
              win.webContents.send('agent:download-progress', {
                url,
                received,
                total,
                progress,
                path: finalDest,
              });
            }
          });

          res.pipe(file);

          file.on('finish', () => {
            file.close(() => {
              logAudit('download-file', 'renderer', 'success', finalDest);
              resolve({ success: true, path: finalDest, size: received });
            });
          });

          file.on('error', (err) => {
            fs.unlink(finalDest, () => {});
            reject(err);
          });
        });

        req.on('error', (err) => {
          fs.unlink(finalDest, () => {});
          reject(err);
        });

        req.setTimeout(120000, () => {
          req.destroy();
          reject(new Error('Download timeout'));
        });
      }

      downloadUrl(url);
    });
  });

  // ── Extract Archive (.zip) ───────────────────────────────────────────────
  ipcMain.handle('agent:unzip-file', async (_event, zipPath, targetDir) => {
    if (!fs.existsSync(zipPath)) throw new Error('Zip file not found');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    logAudit('unzip-file', 'renderer', 'started', `${zipPath} -> ${targetDir}`);

    if (os.platform() === 'win32') {
      const cmd = `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${targetDir}' -Force"`;
      await execPromise(cmd, { timeout: 180000 });
    } else {
      await execPromise(`unzip -o "${zipPath}" -d "${targetDir}"`, { timeout: 180000 });
    }

    logAudit('unzip-file', 'renderer', 'success', targetDir);
    return { success: true, targetDir };
  });

  // ── Real Launch App / Installer / Open Folder ────────────────────────────
  ipcMain.handle('agent:launch-app', async (_event, config) => {
    if (!config) throw new Error('Invalid launch config');

    if (config.path) {
      const targetPath = config.path;
      if (fs.existsSync(targetPath)) {
        shell.openPath(targetPath);
        logAudit('launch-app', 'renderer', 'opened-path', targetPath);
        return 0;
      }
    }

    if (config.url) {
      shell.openExternal(config.url);
      logAudit('launch-app', 'renderer', 'opened-url', config.url);
      return 0;
    }

    throw new Error('Target path or URL not found');
  });

  // ── App Registry Persistence ──────────────────────────────────────────────
  ipcMain.handle('agent:get-installed-apps', async () => {
    const file = getInstalledAppsFile();
    if (fs.existsSync(file)) {
      try {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
      } catch {
        return [];
      }
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
    logAudit('save-installed-app', 'renderer', 'success', appRecord.application?.name || appRecord.id);
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
        console.error('Failed to remove install directory:', err);
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

    logAudit('uninstall-app', 'renderer', 'success', appId);
    return list;
  });

  ipcMain.handle('agent:stop-app', async (_event, processId) => {
    if (processId && typeof processId === 'number') {
      try { process.kill(processId); } catch {}
    }
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
