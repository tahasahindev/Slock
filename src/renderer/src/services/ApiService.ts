import { EncryptedFileHeader, Result, FileOpenResponse, FileSaveResponse, DecryptionResult } from '../../../shared/types.js';

export class ApiService {
  private static getApi() {
    if (typeof window === 'undefined' || !window.slockAPI) {
      throw new Error('Slock IPC API bağlantısı bulunamadı.');
    }
    return window.slockAPI;
  }

  public static async selectOpenFile(): Promise<Result<FileOpenResponse | null>> {
    return this.getApi().selectOpenFile();
  }

  public static async selectSaveFile(defaultName?: string): Promise<Result<string | null>> {
    return this.getApi().selectSaveFile(defaultName);
  }

  public static async readEncryptedFile(filePath: string): Promise<Result<EncryptedFileHeader>> {
    return this.getApi().readEncryptedFile(filePath);
  }

  public static async writeEncryptedFile(filePath: string, header: EncryptedFileHeader): Promise<Result<FileSaveResponse>> {
    return this.getApi().writeEncryptedFile(filePath, header);
  }

  public static async decryptContent(header: EncryptedFileHeader, key: string): Promise<Result<DecryptionResult>> {
    return this.getApi().decryptContent(header, key);
  }

  public static async encryptContent(plaintext: string, key: string): Promise<Result<EncryptedFileHeader>> {
    return this.getApi().encryptContent(plaintext, key);
  }
}
