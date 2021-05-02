const path = require('path');
const { app, Menu } = require('electron');
const { aboutMenuItem } = require('electron-util');
const mainWindow = require('electron-main-window').getMainWindow();


const isDev = process.env.NODE_ENV === 'development';
const isMac = process.platform === 'darwin' ? true : false

// Custom Menu Build
const menu = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      role: 'fileMenu',
      submenu: [
        {role: 'quit' },
      ]
    },
    // {
    //   role: 'editMenu',
    //   submenu: [
    //     {role: 'copy' },
    //     {role: 'cut' },
    //     {role: 'paste' },
    //   ]
    // },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'togglefullscreen' },
        { role: 'toggledevtools',
          visible: false
        },
        {
          label: "Exit full screen",
          visible: false,
          accelerator: "Esc",
          click(item, focusedWindow) {
              if (focusedWindow.isFullScreen()) {
                  focusedWindow.setFullScreen(false);
              }
          },
        },
        {
          type: "separator"
        },
        {
          label: 'Toggle Navigation',
          click: () => mainWindow.webContents.send('nav:toggle')
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Bantuan',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://github.com/Baja-Softworks/CekSpek')
          }
        },
          {
          type: 'separator'
        },
        aboutMenuItem({
          icon: path.join(__dirname, 'app','img' ,'icons.ico'),
          text: 'Published by Baja Softworks',
          copyright: 'Created by Iqbal Anggoro'
        })
        // {
        //   type: "separator"
        // },
        // {
        //   label: 'Check for Updates...',
        //   click: checkForUpdates
        // },
      ],
    },
    {
      label: 'Language',
      submenu: [
      {
          label: 'English',
          click(item, focusedWindow) {
              mainWindow.webContents.loadFile('./app/index.html');
          },
      },    
      {
          label: 'Bahasa Indonesia',
          click(item, focusedWindow) {
              mainWindow.webContents.loadFile('./app/indonesia.html');
          },
        },
      ],
    },
    ...(isDev
      ? [
          {
            label: 'Developer',
            submenu: [
              { role: 'reload' },
              { role: 'forcereload' },
              { type: 'separator' },
              { role: 'toggledevtools' },
            ],
          },
        ]
      : []),
  ]

  
module.exports = Menu.buildFromTemplate(menu);