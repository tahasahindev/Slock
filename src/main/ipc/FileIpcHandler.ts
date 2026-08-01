import { ipcMain } from 'electron';
import { IFileService } from '../services/file/IFileService.js';
import { IDialogService } from '../services/dialog/IDialogService.js';
import { EncryptedFileHeader, Result, FileOpenResponse, FileSaveResponse } from '../../shared/types.js';

export class FileIpcHandler {
  constructor(
    private readonly fileService: IFileService,
    private readonly dialogService: IDialogService
  ) {}

  public register(): void {
    ipcMain.handle('select-open-file', async (): Promise<Result<FileOpenResponse | null>> => {
      try {
        const filePath = await this.dialogService.showOpenFileDialog();
        if (!filePath) {
          return { success: true, data: null };
        }

        const header = await this.fileService.readEncryptedFile(filePath);
        return { success: true, data: { filePath, header } };
      } catch (err: any) {
        return { success: false, error: err.message || 'Dosya seçilirken bir hata oluştu.' };
      }
    });

    ipcMain.handle('select-save-file', async (_event, defaultName?: string): Promise<Result<string | null>> => {
      try {
        const filePath = await this.dialogService.showSaveFileDialog(defaultName);
        return { success: true, data: filePath };
      } catch (err: any) {
        return { success: false, error: err.message || 'Dosya kayıt konumu seçilirken hata oluştu.' };
      }
    });

    ipcMain.handle('read-encrypted-file', async (_event, filePath: string): Promise<Result<EncryptedFileHeader>> => {
      try {
        if (typeof filePath !== 'string' || !filePath.trim()) {
          return { success: false, error: 'Geçersiz dosya yolu.' };
        }
        const header = await this.fileService.readEncryptedFile(filePath);
        return { success: true, data: header };
      } catch (err: any) {
        return { success: false, error: err.message || 'Dosya okunurken bir hata oluştu.' };
      }
    });

    ipcMain.handle('write-encrypted-file', async (_event, filePath: string, header: EncryptedFileHeader): Promise<Result<FileSaveResponse>> => {
      try {
        if (typeof filePath !== 'string' || !filePath.trim()) {
          return { success: false, error: 'Geçersiz dosya yolu.' };
        }
        await this.fileService.writeEncryptedFile(filePath, header);
        return { success: true, data: { filePath } };
      } catch (err: any) {
        return { success: false, error: err.message || 'Dosya kaydedilirken hata oluştu.' };
      }
    });
  }
}
