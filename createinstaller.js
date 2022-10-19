const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller;
const path = require('path');
const rootPath = path.join('./');
const outPath = path.join(rootPath, 'release');

getInstallerConfig()
    .then(createWindowsInstaller)
    .catch((error) => {
        console.error(error.message || error);
        process.exit(1);
    });

function getInstallerConfig () {

    return Promise.resolve({
        iconUrl: 'https://lexivo.net/static/images/logos/Favicon.ico',
        appDirectory: path.join(outPath, 'app-win32-ia32/'),
        authors: 'Soin Roman',
        loadingGif: path.join(rootPath,'loader.gif'),
        noMsi: true,
        outputDirectory: path.join(outPath, 'windows-installer'),
        exe: 'app.exe',
        setupExe: 'appInstaller.exe',
        setupIcon: path.join(rootPath,'Favicon.ico')
    })
}



