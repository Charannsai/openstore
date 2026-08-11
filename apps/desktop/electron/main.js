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
const isDev = process.env.NODE_ENV !== 'production';
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
  // Handle custom app:// scheme to correctly serve static exported Next.js app
  protocol.handle('app', (request) => {
    let reqUrl = request.url.replace(/^app:\/\/[\w.-]+/, '');
    if (reqUrl === '' || reqUrl === '/') {
      reqUrl = '/index.html';
    }
    const safePath = path.normalize(decodeURIComponent(reqUrl)).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(__dirname, '../out', safePath);

    return net.fetch(`file://${fullPath}`);
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
