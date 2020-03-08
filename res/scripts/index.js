const ipcRenderer = require('electron').ipcRenderer;

// Async message handler
ipcRenderer.on('asynchronous-reply', (event, arg) => {
console.log(arg)
ipcRenderer.send('asynchronous-message', {change_page:true,url:'res/search.html'});
})

// Async message sender
window.setTimeout(function(){ipcRenderer.send('asynchronous-message', {change_page:true,url:'res/search.html'})},
2000)
