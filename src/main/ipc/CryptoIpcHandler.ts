import { ipcMain } from 'electron';
import { ICryptoService } from '../services/crypto/ICryptoService.js';
import { EncryptedFileHeader, Result, DecryptionResult } from '../../shared/types.js';

export class CryptoIpcHandler {
  constructor(private readonly cryptoService: ICryptoService) {}

  public register(): void {
    ipcMain.handle('decrypt-content', async (_event, header: EncryptedFileHeader, key: string): Promise<Result<DecryptionResult>> => {
      try {
        if (!key || typeof key !== 'string') {
          return { success: false, error: 'Şifre anahtarı zorunludur.' };
        }
        const plaintext = await this.cryptoService.decrypt(header, key);
        return { success: true, data: { plaintext } };
      } catch (err: any) {
        return { success: false, error: err.message || 'Şifre çözme başarısız oldu.' };
      }
    });

    ipcMain.handle('encrypt-content', async (_event, plaintext: string, key: string): Promise<Result<EncryptedFileHeader>> => {
      try {
        if (typeof plaintext !== 'string') {
          return { success: false, error: 'Geçersiz metin verisi.' };
        }
        if (!key || typeof key !== 'string') {
          return { success: false, error: 'Şifre anahtarı zorunludur.' };
        }
        const header = await this.cryptoService.encrypt(plaintext, key);
        return { success: true, data: header };
      } catch (err: any) {
        return { success: false, error: err.message || 'Metin şifrelenirken hata oluştu.' };
      }
    });
  }
}
