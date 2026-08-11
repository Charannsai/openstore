/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, ipcMain, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { registerAgentHandlers } = require('./ipc-handlers');

// Register privileged custom scheme BEFORE app is ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      allowFirstParty: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

// ─── Configuration ───────────────────────────────────────────────────────────
const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';
const DEV_URL = 'http://localhost:3002';

function loadWindowState() {
  const statePath = path.join(app.getPath('userData'), 'window-state.json');
  try {
    if (fs.existsSync(statePath)) {
      return JSON.parse(fs.readFileSync(statePath, 'utf8'));
    }
  } catch {}
  return { width: 1400, height: 900 };
}

function saveWindowState(win) {
  if (!win) return;
  const statePath = path.join(app.getPath('userData'), 'window-state.json');
  try {
    const isMaximized = win.isMaximized();
    const bounds = win.getBounds();
    fs.writeFileSync(statePath, JSON.stringify({ ...bounds, isMaximized }), 'utf8');
  } catch {}
}

function createWindow() {
  const savedState = loadWindowState();

  mainWindow = new BrowserWindow({
    width: savedState.width || 1400,
    height: savedState.height || 900,
    x: savedState.x,
    y: savedState.y,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, '../public/icon.png'),
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#00000000',
      symbolColor: '#f4f4f5',
      height: 44,
    },
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    show: false,
  });

  if (savedState.isMaximized) {
    mainWindow.maximize();
  }

  // Show window once ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('resize', () => saveWindowState(mainWindow));
  mainWindow.on('move', () => saveWindowState(mainWindow));

  if (isDev) {
    mainWindow.loadURL(DEV_URL);
  } else {
    mainWindow.loadURL('app://localhost/index.html');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── App lifecycle ───────────────────────────────────────────────────────────
app.whenReady().then(() => {
  // Handle custom app:// scheme to correctly serve static exported Next.js app from app.asar
  protocol.handle('app', (request) => {
    try {
      let reqUrl = request.url.replace(/^app:\/\/[\w.-]+/, '');
      if (reqUrl === '' || reqUrl === '/') {
        reqUrl = '/index.html';
      }
      const safePath = path.normalize(decodeURIComponent(reqUrl)).replace(/^(\.\.[\/\\])+/, '');
      let fullPath = path.join(__dirname, '../out', safePath);

      if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
        fullPath = path.join(__dirname, '../out/index.html');
      }

      const data = fs.readFileSync(fullPath);
      let mimeType = 'text/html';
      if (fullPath.endsWith('.js')) mimeType = 'text/javascript';
      else if (fullPath.endsWith('.css')) mimeType = 'text/css';
      else if (fullPath.endsWith('.json')) mimeType = 'application/json';
      else if (fullPath.endsWith('.png')) mimeType = 'image/png';
      else if (fullPath.endsWith('.jpg') || fullPath.endsWith('.jpeg')) mimeType = 'image/jpeg';
      else if (fullPath.endsWith('.svg')) mimeType = 'image/svg+xml';
      else if (fullPath.endsWith('.woff2')) mimeType = 'font/woff2';

      return new Response(data, {
        status: 200,
        headers: { 'content-type': mimeType },
      });
    } catch (err) {
      console.error('App protocol error:', err);
      return new Response('Not Found', { status: 404 });
    }
  });

  // Register IPC handlers for desktop agent
  registerAgentHandlers(ipcMain);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ─── Security: prevent unhandled new window creation ──────────────────────────
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});
