const create_windows_installer = require('electron-winstaller').createWindowsInstaller;
const path = require('path');
const root_path = path.join('./');
const out_path = path.join(root_path, 'release');

const APP_NAME = 'application';
const AUTHOR = 'Your Company Name';
const ICON_URL = 'https://lexivo.net/static/images/logos/Favicon.ico';

get_installer()
    .then(create_windows_installer)
    .catch((error) => {
        console.error(error.message || error);
        process.exit(1);
    });

function get_installer () {

    return Promise.resolve({
        appDirectory: path.join(out_path, `${APP_NAME}-win32-ia32/`), // Папка, где лежит сборка приложения
        outputDirectory: path.join(out_path, 'installer'), // Папка для установки приложения
        exe: `${APP_NAME}.exe`, // Название приложения
        setupExe: `${APP_NAME}_installer.exe`, // Название установщика для приложения
        iconUrl: ICON_URL, // Иконка для приложения по URL
        setupIcon: path.join(root_path,'public/Favicon.ico'), // Иконка для установщика
        authors: AUTHOR, // Автор приложения
        noMsi: true, // Нужна ли MSI установка (нет)
        loadingGif: path.join(root_path,'public/loader.gif') // Путь для гифки во время установки
    })
}



