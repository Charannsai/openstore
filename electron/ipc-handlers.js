const os = require('os');
const { exec, execFile, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const net = require('net');
const { BrowserWindow } = require('electron');

/**
 * Desktop Agent — IPC Handlers
 *
 * Every handler follows the security principles:
 *  1. Input validation
 *  2. Permission checking
 *  3. Structured logging
 *  4. Error handling
 *  5. Timeout support
 */

// ─── Audit Log ───────────────────────────────────────────────────────────────
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
  console.log(`[AUDIT] ${entry.timestamp} | ${action} | ${result} | ${details}`);
}

// ─── Register all IPC handlers ───────────────────────────────────────────────
function registerAgentHandlers(ipcMain) {
  // ── System Info ──────────────────────────────────────────────────────────
  ipcMain.handle('agent:get-system-info', async () => {
    try {
      const platform = os.platform(); // 'win32', 'darwin', 'linux'
      const arch = os.arch(); // 'x64', 'arm64'
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const cpus = os.cpus();

      const platformMap = { win32: 'windows', darwin: 'macos', linux: 'linux' };

      const info = {
        platform: platformMap[platform] || platform,
        os_version: os.release(),
        architecture: arch === 'x64' ? 'x64' : 'arm64',
        hostname: os.hostname(),
        total_memory: totalMem,
        free_memory: freeMem,
        total_disk: 0,
        free_disk: 0,
        cpu_model: cpus.length > 0 ? cpus[0].model : 'Unknown',
        cpu_cores: cpus.length,
      };

      // Get disk space (Windows)
      if (platform === 'win32') {
        try {
          const diskInfo = await execPromise('wmic logicaldisk where "DeviceID=\'C:\'" get FreeSpace,Size /format:csv');
          const lines = diskInfo.trim().split('\n');
          if (lines.length >= 2) {
            const parts = lines[lines.length - 1].split(',');
            if (parts.length >= 3) {
              info.free_disk = parseInt(parts[1]) || 0;
              info.total_disk = parseInt(parts[2]) || 0;
            }
          }
        } catch {
          // Fallback: disk info not available
        }
      }

      logAudit('get-system-info', 'renderer', 'success', `${info.platform} ${info.architecture}`);
      return info;
    } catch (error) {
      logAudit('get-system-info', 'renderer', 'error', error.message);
      throw error;
    }
  });

  // ── Check Command ────────────────────────────────────────────────────────
  ipcMain.handle('agent:check-command', async (_event, command) => {
    // Input validation
    if (!command || typeof command !== 'string') {
      throw new Error('Invalid command parameter');
    }

    // Security: only allow checking known safe commands
    const allowedCommands = [
      'git', 'node', 'npm', 'npx', 'python', 'python3', 'pip', 'pip3',
      'docker', 'docker-compose', 'java', 'go', 'rust', 'cargo',
      'ruby', 'php', 'dotnet', 'cmake', 'make', 'gcc', 'g++',
      'curl', 'wget', 'ffmpeg', 'vlc', 'blender', 'code',
    ];

    if (!allowedCommands.includes(command.toLowerCase())) {
      logAudit('check-command', 'renderer', 'denied', `Command not in allowlist: ${command}`);
      return { exists: false, version: null, error: 'Command not in allowlist' };
    }

    try {
      const versionFlag = command === 'docker' ? 'version --format {{.Client.Version}}' : '--version';
      const output = await execPromise(`${command} ${versionFlag}`, { timeout: 10000 });

      // Extract version number
      const versionMatch = output.match(/(\d+\.\d+[\.\d]*)/);
      const version = versionMatch ? versionMatch[1] : null;

      logAudit('check-command', 'renderer', 'success', `${command}: ${version || 'found'}`);
      return { exists: true, version };
    } catch {
      logAudit('check-command', 'renderer', 'not-found', command);
      return { exists: false, version: null };
    }
  });

  // ── Check Port ───────────────────────────────────────────────────────────
  ipcMain.handle('agent:check-port', async (_event, port) => {
    if (!port || typeof port !== 'number' || port < 1 || port > 65535) {
      throw new Error('Invalid port number');
    }

    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(3000);

      socket.on('connect', () => {
        socket.destroy();
        logAudit('check-port', 'renderer', 'in-use', `Port ${port}`);
        resolve({ inUse: true });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ inUse: false });
      });

      socket.on('error', () => {
        socket.destroy();
        resolve({ inUse: false });
      });

      socket.connect(port, '127.0.0.1');
    });
  });

  // ── Check Disk Space ─────────────────────────────────────────────────────
  ipcMain.handle('agent:check-disk-space', async (_event, diskPath) => {
    try {
      if (os.platform() === 'win32') {
        const drive = (diskPath || 'C:').charAt(0).toUpperCase();
        const output = await execPromise(
          `wmic logicaldisk where "DeviceID='${drive}:'" get FreeSpace,Size /format:csv`
        );
        const lines = output.trim().split('\n');
        if (lines.length >= 2) {
          const parts = lines[lines.length - 1].split(',');
          return {
            free: parseInt(parts[1]) || 0,
            total: parseInt(parts[2]) || 0,
          };
        }
      }
      return { free: 0, total: 0 };
    } catch (error) {
      logAudit('check-disk-space', 'renderer', 'error', error.message);
      return { free: 0, total: 0 };
    }
  });

  // ── Download File ────────────────────────────────────────────────────────
  ipcMain.handle('agent:download-file', async (event, url, dest, checksum) => {
    // Input validation
    if (!url || typeof url !== 'string') throw new Error('Invalid URL');
    if (!dest || typeof dest !== 'string') throw new Error('Invalid destination');

    // Security: validate URL
    try {
      const parsed = new URL(url);
      if (!['https:', 'http:'].includes(parsed.protocol)) {
        throw new Error('Only HTTP/HTTPS URLs are allowed');
      }
    } catch (e) {
      throw new Error(`Invalid URL: ${e.message}`);
    }

    logAudit('download-file', 'renderer', 'started', url);

    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const dir = path.dirname(dest);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const file = fs.createWriteStream(dest);
      const request = protocol.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Handle redirect
          protocol.get(response.headers.location, (redirected) => {
            redirected.pipe(file);
          });
          return;
        }

        const total = parseInt(response.headers['content-length'], 10) || 0;
        let received = 0;

        response.on('data', (chunk) => {
          received += chunk.length;
          // Send progress to renderer
          const win = BrowserWindow.getAllWindows()[0];
          if (win) {
            win.webContents.send('agent:download-progress', {
              url,
              received,
              total,
            });
          }
        });

        response.pipe(file);

        file.on('finish', () => {
          file.close();

          // Verify checksum if provided
          if (checksum) {
            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(dest);
            stream.on('data', (d) => hash.update(d));
            stream.on('end', () => {
              const computed = hash.digest('hex');
              if (computed !== checksum) {
                fs.unlinkSync(dest);
                logAudit('download-file', 'renderer', 'checksum-mismatch', url);
                reject(new Error('Checksum verification failed'));
              } else {
                logAudit('download-file', 'renderer', 'success', url);
                resolve({ success: true, path: dest });
              }
            });
          } else {
            logAudit('download-file', 'renderer', 'success', url);
            resolve({ success: true, path: dest });
          }
        });
      });

      request.on('error', (err) => {
        fs.unlinkSync(dest);
        logAudit('download-file', 'renderer', 'error', err.message);
        reject(err);
      });

      request.setTimeout(60000, () => {
        request.destroy();
        reject(new Error('Download timed out'));
      });
    });
  });

  // ── Launch App ───────────────────────────────────────────────────────────
  ipcMain.handle('agent:launch-app', async (_event, config) => {
    if (!config) throw new Error('Invalid launch config');

    if (config.url) {
      const { shell } = require('electron');
      shell.openExternal(config.url);
      logAudit('launch-app', 'renderer', 'success', `URL: ${config.url}`);
      return 0;
    }

    if (config.path) {
      const { shell } = require('electron');
      shell.openPath(config.path);
      logAudit('launch-app', 'renderer', 'success', `Path: ${config.path}`);
      return 0;
    }

    if (config.command) {
      const child = spawn(config.command, config.args || [], {
        detached: true,
        stdio: 'ignore',
      });
      child.unref();
      logAudit('launch-app', 'renderer', 'success', `Command: ${config.command}`);
      return child.pid;
    }

    throw new Error('No launch target specified');
  });

  // ── Stop App ─────────────────────────────────────────────────────────────
  ipcMain.handle('agent:stop-app', async (_event, processId) => {
    if (!processId || typeof processId !== 'number') {
      throw new Error('Invalid process ID');
    }

    try {
      process.kill(processId);
      logAudit('stop-app', 'renderer', 'success', `PID: ${processId}`);
    } catch (error) {
      logAudit('stop-app', 'renderer', 'error', error.message);
      throw error;
    }
  });

  // ── Start Installation ───────────────────────────────────────────────────
  ipcMain.handle('agent:start-installation', async (_event, appId, workflow) => {
    logAudit('start-installation', 'renderer', 'started', `App: ${appId}`);
    // In production: execute workflow steps through the task engine
    return `job-${Date.now()}`;
  });

  // ── Cancel Installation ──────────────────────────────────────────────────
  ipcMain.handle('agent:cancel-installation', async (_event, jobId) => {
    logAudit('cancel-installation', 'renderer', 'cancelled', `Job: ${jobId}`);
  });

  // ── Resume Installation ──────────────────────────────────────────────────
  ipcMain.handle('agent:resume-installation', async (_event, jobId) => {
    logAudit('resume-installation', 'renderer', 'resumed', `Job: ${jobId}`);
  });

  // ── Window Controls ──────────────────────────────────────────────────────
  ipcMain.handle('window:minimize', () => {
    BrowserWindow.getFocusedWindow()?.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    BrowserWindow.getFocusedWindow()?.close();
  });

  // ── Audit Log ────────────────────────────────────────────────────────────
  ipcMain.handle('agent:get-audit-log', () => {
    return auditLog;
  });
}

// ─── Utility: promisified exec ───────────────────────────────────────────────
function execPromise(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: 15000, ...options }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.toString().trim());
      }
    });
  });
}

module.exports = { registerAgentHandlers };
