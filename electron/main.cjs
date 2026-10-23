const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { startStandaloneServer } = require('./server.cjs');

// Ensure system bin & virtualenv paths are included in PATH
const homeDir = os.homedir();
const extraPaths = [
  path.join(process.cwd(), '.venv', 'bin'),
  path.join(__dirname, '..', '.venv', 'bin'),
  path.join(homeDir, '.TinyTeX', 'bin', 'x86_64-linux'),
  path.join(homeDir, '.venv', 'bin'),
  path.join(homeDir, '.local', 'bin'),
  '/usr/local/bin',
  '/usr/bin',
  '/bin',
];
const validExtra = extraPaths.filter(p => fs.existsSync(p));
process.env.PATH = Array.from(new Set([...validExtra, ...(process.env.PATH || '').split(':')])).filter(Boolean).join(':');

let mainWindow = null;
let serverInstance = null;
let activeServerPort = null;

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Yuta!LaTeX Math Studio - Browser Automation',
    backgroundColor: '#ffffff',
    icon: path.join(__dirname, '..', 'icon.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      plugins: true,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${port}`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServerAndWindow() {
  if (serverInstance && activeServerPort) {
    createWindow(activeServerPort);
    return;
  }

  const distDir = path.join(__dirname, '..', 'dist');
  serverInstance = startStandaloneServer({
    port: 0,
    host: '0.0.0.0',
    distDir,
    onReady: (port) => {
      activeServerPort = port;
      createWindow(port);
    },
  });
}

app.whenReady().then(() => {
  startServerAndWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      startServerAndWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverInstance) {
    try {
      serverInstance.close();
    } catch {}
    serverInstance = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
