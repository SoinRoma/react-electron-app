const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {

    mainWindow = new BrowserWindow({width: 800, height: 600});

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true
    });
    mainWindow.loadURL(startUrl);

    // Для локального запуска проекта
    // mainWindow.loadURL('http://localhost:3000');

    mainWindow.webContents.openDevTools();


    mainWindow.on('closed', function () {
        mainWindow = null
    })
}


app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});