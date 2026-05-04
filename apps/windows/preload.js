const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('cdmsDesktop', {
  platform: 'windows',
});
