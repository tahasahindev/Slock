import { BrowserWindow } from 'electron';
import { Pbkdf2KdfService } from '../services/crypto/Pbkdf2KdfService.js';
import { AesGcmCryptoService } from '../services/crypto/AesGcmCryptoService.js';
import { LocalFileService } from '../services/file/LocalFileService.js';
import { ElectronDialogService } from '../services/dialog/ElectronDialogService.js';
import { FileIpcHandler } from './FileIpcHandler.js';
import { CryptoIpcHandler } from './CryptoIpcHandler.js';

export function registerIpcHandlers(getParentWindow: () => BrowserWindow | null): void {
  // Instantiate services using Dependency Injection
  const kdfService = new Pbkdf2KdfService();
  const cryptoService = new AesGcmCryptoService(kdfService);
  const fileService = new LocalFileService();
  const dialogService = new ElectronDialogService(getParentWindow);

  // Instantiate and register handlers
  const fileIpcHandler = new FileIpcHandler(fileService, dialogService);
  const cryptoIpcHandler = new CryptoIpcHandler(cryptoService);

  fileIpcHandler.register();
  cryptoIpcHandler.register();
}
