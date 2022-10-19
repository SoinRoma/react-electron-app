const {app, Tray, Menu, BrowserWindow, autoUpdater, dialog } = require('electron');
const isDev = require("electron-is-dev");
const os = require('os');
const icon = __dirname + '/Favicon.png';
const path = require('path');
const url = require('url');
let tray;
let mainWindow;

if (require('electron-squirrel-startup')) return;

// Настройки установщика
if (handleSquirrelEvent(app)) {
    return;
}

// Настройка URL для обновления программы
const platform = os.platform() + '_' + os.arch();  // usually returns darwin_64
const version = app.getVersion();
autoUpdater.setFeedURL(`https://desktop.lexivo.net/update/win64/${version}/stable`);

// Настройка для протокола глубоких ссылок
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('app', process.execPath, [path.resolve(process.argv[1])])
    }
} else {
    app.setAsDefaultProtocolClient('app')
}

const createWindow = () => {
    // Настройка стартового окна приложения
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 400,
        minHeight: 600,
        autoHideMenuBar: true,
        icon: __dirname + '/Favicon.png',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });


    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/build/index.html'),
        protocol: 'file:',
        slashes: true
    });
    mainWindow.loadURL(startUrl);

    // Для локального запуска проекта
    //mainWindow.loadURL('http://localhost:3000');


    // Действия закрыть приложения через X на свернуть приложение
    mainWindow.on('close', function (event) {
        event.preventDefault();
        mainWindow.hide();
    });

    // Иконка в трее
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Exit', click: function () {
                app.exit();
            }
        }
    ])
    tray.setToolTip('APP');
    tray.setContextMenu(contextMenu);
    tray.on('click', function () {
        mainWindow.show();
        app.focus()
    });

    // Если в режиме разработчика, то открывать режим разработчика.
    if (isDev) {
        mainWindow.webContents.openDevTools({mode: "detach"});
    }

    // Если не в режиме разработчика, то проверять наличие обновления.
    if (!isDev) {
        autoUpdater.checkForUpdates();
    }

}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
            const dialogOpts = {
                type: 'info',
                title: 'Application Update',
                message: commandLine.toString().substring(commandLine.toString().search('//') + 2),
            }
            dialog.showMessageBox(dialogOpts);
            mainWindow.webContents.send('ping', 'whoooooooh!')
        }
    })

    app.whenReady().then(()=>{
        createWindow();
    });

    app.on('open-url', (event, url) => {
        event.preventDefault();
        dialog.showErrorBox('Welcome Back', `You arrived from: ${url}`)
    })
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

autoUpdater.on("update-available", (_event) => {
    const dialogOpts = {
        type: 'info',
        title: 'Application Update',
        message: 'New update available, would you like to update now?',
        buttons: ["Yes", "No"]
    }
    dialog.showMessageBox(dialogOpts, buttonIndex => {
        if (buttonIndex === 0) {
            autoUpdater.downloadUpdate();
        }
    });
})

autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    };
    dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0){
            autoUpdater.quitAndInstall();
            app.exit();
        }
    })
});

autoUpdater.on('error', (message) => {
    console.error('There was a problem updating the application');
    console.error(message);
})

function handleSquirrelEvent() {
    if (process.argv.length === 1) {
        return false;
    }

    const path = require('path');
    const ChildProcess = require('child_process');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            app.quit();
            return true;
    }
}

