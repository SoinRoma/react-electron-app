<h1 align="center">Electron with React</h1>

Наглядный пример приложения Electron с использованием React
(create-react-app).

С подробной инструкцией по настройке React и Electron вы можете ознакомиться на этом 
[сайте](https://www.freecodecamp.org/news/building-an-electron-application-with-create-react-app-97945861647c/)
и на этом [сайте](https://polyakovdmitriy.ru/create-react-app-electron/).

### Предварительные настройки, которые нужно изменить

##### Обновите ваши икнонки для приложения
В папке `public` находятся иконки и gif для установки, 
их вы можете заменить на свои (названия не трогать)

##### Обновите ваши даныые в `package.json`
```javascript
{
    "name": "Your Application Name",
    "version": "Your Version App (1.0.0)",
    "author": "Your Company Name", 
    "description": "Your Application Description",
    "repository": {
        "type": "git",
        "url": "Your Repository Url"
    }
}
```

Также в `package.json` нужно заменить `scripts.package-windows` на ваш
(вместо `application` поставить название вашего приложения).

Название вашего приложения (вместо `application`) также нужно поставить в
`config.forge.makers.config.name`.

Для автоматического обновления вашей программы нужно будет указать
URL к вашему серверу а также логин и пароль
`config.forge.publishers.config`.

##### Обновите данные в `electron-start.js`

Нужно указать URL, откуда приложение будет проверять автообновление.
Ссылки должны быть для всех систем (Window, MacOc, Linux)
```javascript
autoUpdater.setFeedURL(`https://your_url/${version}/stable`);
```

Также необходимо указать название вашего приложение 
```javascript
const APP_NAME = 'application';
```

##### Обновите ваши данные в `electron-installer.js`
Здесь вам нужно будет заменить эти данные
```javascript
const APP_NAME = 'application';
const AUTHOR = 'Your Company Name';
const ICON_URL = 'Your URL';
```

ВАЖНО! Там где вы меняете `application`, 
должно быть одинако везде.

### Команды по запуску приложения

#### Для локального запуска приложения

Сначала запустите React приложение,
```
npm start
```
а затем пропишите следующую команду в `electron-start.js`.
```javascript
mainWindow.loadURL('http://localhost:3000');
```
и запустите Electron

```
npm run electron
```

#### Сборка проекта

Собрать сборку приложения React
```
npm run build
```
а затем пропишите следующую команду в `electron-start.js`.
```javascript
mainWindow.loadURL(startUrl);
```
В итоге в папке проекта появится папка `build`. 
Затем нужно собрать приложение под установщик.
```
npm run package-windows
```
В итоге появится папка `release` в которой будет 
папка `app-win32-ia32` со сборкой вашего приложения.
Затем нужно создать установщик от этой сборки (обновления работают)
```
npm run windows-installer
```
Установшик появится в папке `release/installer`. Файл 
с расширением `.nupkg` нужен для обновлений.
