import { contextBridge, ipcRenderer } from 'electron';
import { EncryptedFileHeader, ISlockAPI } from '../shared/types.js';

const slockAPI: ISlockAPI = {
  selectOpenFile: () => ipcRenderer.invoke('select-open-file'),
  selectSaveFile: (defaultName?: string) => ipcRenderer.invoke('select-save-file', defaultName),
  readEncryptedFile: (filePath: string) => ipcRenderer.invoke('read-encrypted-file', filePath),
  writeEncryptedFile: (filePath: string, header: EncryptedFileHeader) => ipcRenderer.invoke('write-encrypted-file', filePath, header),
  decryptContent: (header: EncryptedFileHeader, key: string) => ipcRenderer.invoke('decrypt-content', header, key),
  encryptContent: (plaintext: string, key: string) => ipcRenderer.invoke('encrypt-content', plaintext, key)
};

contextBridge.exposeInMainWorld('slockAPI', slockAPI);
