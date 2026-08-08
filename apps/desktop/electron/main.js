/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { registerAgentHandlers } = require('./ipc-handlers');

// ─── Configuration ───────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';
const DEV_URL = 'http://localhost:3002';

const fs = require('fs');

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
    titleBarStyle: 'hidden',
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
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── App lifecycle ───────────────────────────────────────────────────────────
app.whenReady().then(() => {
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
