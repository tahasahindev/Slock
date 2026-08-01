const { contextBridge, ipcRenderer } = require('electron');

const slockAPI = {
  selectOpenFile: () => ipcRenderer.invoke('select-open-file'),
  selectSaveFile: (defaultName) => ipcRenderer.invoke('select-save-file', defaultName),
  readEncryptedFile: (filePath) => ipcRenderer.invoke('read-encrypted-file', filePath),
  writeEncryptedFile: (filePath, header) => ipcRenderer.invoke('write-encrypted-file', filePath, header),
  decryptContent: (header, key) => ipcRenderer.invoke('decrypt-content', header, key),
  encryptContent: (plaintext, key) => ipcRenderer.invoke('encrypt-content', plaintext, key)
};

contextBridge.exposeInMainWorld('slockAPI', slockAPI);
