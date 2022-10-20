const {app, Tray, Menu, BrowserWindow, autoUpdater, dialog } = require('electron');
const isDev = require("electron-is-dev");
const os = require('os');
const path = require('path');
const url = require('url');
const icon = __dirname + '/public/Favicon.png';
let tray;
let mainWindow;

const APP_NAME = 'application';

// Условия для настройки установщика
if (require('electron-squirrel-startup')) return;

if (handle_squirrel_event(app)) {
    return;
}

// Настройка URL для обновления программы
const platform = os.platform() + '_' + os.arch(); // Узнаем платформу
const version = app.getVersion(); // Узнаем версию программы
// В зависимости от платформы у нас будут разные ссылки
autoUpdater.setFeedURL(`https://desktop.lexivo.net/update/win64/${version}/stable`);

// Настройка протокола глубоких ссылок (пртокол - название вашей программы)
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient(APP_NAME, process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient(APP_NAME);
}

const createWindow = () => {
    // Настройка стартового окна приложения
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 400,
        minHeight: 600,
        autoHideMenuBar: true,
        icon: __dirname + '/public/Favicon.png',
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

    // Для продакшена запуска проекта
    //mainWindow.loadURL(startUrl);

    // Для локального запуска проекта
    mainWindow.loadURL('http://localhost:3000');


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
    ]);
    tray.setToolTip(APP_NAME);
    tray.setContextMenu(contextMenu);
    tray.on('click', function () {
        mainWindow.show();
        app.focus();
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

// Слушатель глубоких ссылок для приложения
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    // Если будет попытка заново открыть приложение, то фокусировать имеющиеся
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
            // Канал дле передачи глубокой ссылки
            const link = commandLine.toString().substring(commandLine.toString().search('//') + 2);
            mainWindow.webContents.send('ping', link);
        }
    })

    app.whenReady().then(()=>{
        createWindow();
    });

}

// Слушатель приложения (когда закрыты все окна, то выйти из приложения)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

// Слушатель приложения (когда оно готово, то создать окно)
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Слушатель обновления (когда есть обновление)
autoUpdater.on("update-available", (_event) => {
    const dialog_options = {
        type: 'info',
        buttons: ['Ok'],
        title: `${APP_NAME} Update`,
        message: 'A new update is available. Wait while the update downloads.'
    }
    dialog.showMessageBox(dialog_options);
})

// Слушатель обновления (когда скачалось обновление)
autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
    const dialog_options = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: `${APP_NAME} Update`,
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    };
    dialog.showMessageBox(dialog_options).then((returnValue) => {
        // Если нажали Restart, то перезагрузка приложения
        if (returnValue.response === 0){
            autoUpdater.quitAndInstall();
            app.exit();
        }
    })
});

// Слушатель обновления (если есть ошибка)
autoUpdater.on('error', (message) => {
    console.error('There was a problem updating the application');
    console.error(message);
})

function handle_squirrel_event() {
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

