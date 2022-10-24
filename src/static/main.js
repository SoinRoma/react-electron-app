const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

function deep_link_param() {
    ipcRenderer.on('ping', (event, message) => {
        const url = new URL(message);
        const pathname = url.pathname.replace(new RegExp('/', 'gi'), '');
        const param = url.searchParams.get('to');
        console.log(pathname);
        console.log(param);
    })
}

deep_link_param();



