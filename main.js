const path = require('path')
const { app, Menu, ipcMain, BrowserWindow, dialog } = require('electron')
const Store = require('./app/js/Store')
const log = require('electron-log');
const { autoUpdater } = require("electron-updater");


// Set env
process.env.NODE_ENV = 'production'
const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

// Init Store & defaults
const store = new Store({
  configName: 'user-settings',
  defaults: {
    settings: {
      cpuOverload: 100,
      // Minutes
      alertFrequency: 5,
    }
  }
})

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'CekSpek',
    width: isDev ? 800 : 500,
    height: 600,
    icon: 'app/img/icons.ico',
    backgroundColor: '#034694',
    resizable: isDev ? true : false,
    show: true,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  // Custom Menu Build
  const mainMenu = require('./menu')
  Menu.setApplicationMenu(mainMenu)


  // Hide/Minimize electron when closing apps, so update still can rolling
  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
    //mainWindow.minimize();
    //return false;
  })


  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.loadFile('./app/indonesia.html')
}

// prevent multiple instances of a window after closing / open electron app
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized() || mainWindow.hide) mainWindow.restore()
      mainWindow.focus()
      mainWindow.show() // show after win.hide()
    }
  })

  app.on('activate', () => {
    mainWindow.show()
  }) // show after win.hide()

  // Create mainWindow, load the rest of the app, etc...
  app.on('ready', () => {
    createMainWindow();

    // if not "production" dont checkForupdates
    if (!isDev) {
      // Auto checkForUpdates
      autoUpdater.checkForUpdates();
    }

    app.setAppUserModelId("CekSpek - Aplikasi Desktop untuk Cek Spesifikasi PC");
    mainWindow.webContents.on('dom-ready', () => {
      mainWindow.webContents.send('settings:get', store.get('settings'))
    })

  })
}


//-------------------------------------------------------------------
// Auto updates - Option 2 - More control
//
// For details about these events, see the Wiki:
// https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events
//
// The app doesn't need to listen to any events except `update-downloaded`
//
// Uncomment any of the below events to listen for them.  Also,
// look in the previous section to see them being used.
//-------------------------------------------------------------------

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.allowDowngrade = false
log.info('App starting...');

// handles asynchronous and synchronous messages sent from a renderer process (web page)
function sendStatusToWindow(text) {
  // log.info(text);
  mainWindow.webContents.send('message', text);
}

// Memeriksa pembaruan ... 
autoUpdater.on('checking-for-update', () => {
  // sendStatusToWindow('Checking for update...');
})

// Update Tersedia!
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})

// Update tidak tersedia
autoUpdater.on('update-not-available', (info) => {
  // dialog.showMessageBox({
  //   type: 'info',
  //   title: 'No Updates',
  //   message: 'Versi saat ini adalah yang terbaru.'
  // })
  sendStatusToWindow('Update not available.');
})

// Menampilkan Error di auto-updater
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})

// Proses Mendownload File Update!
autoUpdater.on('download-progress', (progressObj) => {
  let progressValue = progressObj.percent.toFixed(2) + '%';
    sendStatusToWindow(progressValue);
})

// Update telah diunduh, Silahkan tutup aplikasi untuk Update Terbaru!
autoUpdater.on('update-downloaded', (info) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'New Updates',
    message: 'Update telah diunduh, aplikasi akan menginstal Update baru  ...'
  })
  autoUpdater.quitAndInstall()
  sendStatusToWindow(`Updates downloaded, application will be quit for update...`);
});

// Set Settings
ipcMain.on('settings:set', (e, value) => {
  store.set('settings', value)
  mainWindow.webContents.send('settings:get', store.get('settings'))
})

// app.on('window-all-closed', () => {
//   if (!isMac) {
//     app.quit()
//   }
// })

// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createMainWindow()
//   }
// })


app.allowRendererProcessReuse = true
