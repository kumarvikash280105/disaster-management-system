const { app, BrowserWindow, dialog } = require('electron');
const { fork } = require('child_process');
const http = require('http');
const path = require('path');

const APP_URL = 'http://127.0.0.1:5000';
const HEALTH_URL = `${APP_URL}/api/health`;
const backendEntry = path.join(__dirname, '..', '..', 'backend', 'src', 'server.js');

let backendProcess = null;

function checkServerReady() {
  return new Promise((resolve) => {
    const request = http.get(HEALTH_URL, { timeout: 2000 }, (response) => {
      let body = '';
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        resolve(response.statusCode === 200 && body.includes('CDMS backend is running.'));
      });
    });

    request.on('error', () => resolve(false));
    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(maxAttempts = 25) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const ready = await checkServerReady();
    if (ready) return true;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

async function ensureBackendRunning() {
  const alreadyRunning = await checkServerReady();
  if (alreadyRunning) return;

  backendProcess = fork(backendEntry, [], {
    cwd: path.join(__dirname, '..', '..', 'backend'),
    silent: false,
  });

  const ready = await waitForServer();

  if (!ready) {
    throw new Error('CDMS backend could not be started for the desktop app.');
  }
}

async function createMainWindow() {
  await ensureBackendRunning();

  const win = new BrowserWindow({
    width: 1480,
    height: 920,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: '#0d2942',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await win.loadURL(APP_URL);
}

app.whenReady().then(async () => {
  try {
    await createMainWindow();
  } catch (error) {
    dialog.showErrorBox('CDMS Desktop Startup Error', error.message);
    app.quit();
  }

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
});
