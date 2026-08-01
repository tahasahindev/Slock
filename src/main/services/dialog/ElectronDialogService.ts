import { dialog, BrowserWindow } from 'electron';
import { IDialogService } from './IDialogService.js';
import { FILE_CONSTANTS } from '../../../shared/constants.js';

export class ElectronDialogService implements IDialogService {
  constructor(private readonly getParentWindow: () => BrowserWindow | null) {}

  public async showOpenFileDialog(): Promise<string | null> {
    const window = this.getParentWindow();
    const options = {
      title: 'Şifreli Dosya Seçin',
      properties: ['openFile'] as ('openFile')[],
      filters: [
        { name: FILE_CONSTANTS.FILTER_NAME, extensions: [FILE_CONSTANTS.EXTENSION] },
        { name: 'Tüm Dosyalar (*)', extensions: ['*'] }
      ]
    };

    const result = window 
      ? await dialog.showOpenDialog(window, options)
      : await dialog.showOpenDialog(options);

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  }

  public async showSaveFileDialog(defaultName: string = `belge.${FILE_CONSTANTS.EXTENSION}`): Promise<string | null> {
    const window = this.getParentWindow();
    const options = {
      title: 'Şifreli Olarak Kaydet',
      defaultPath: defaultName,
      filters: [
        { name: FILE_CONSTANTS.FILTER_NAME, extensions: [FILE_CONSTANTS.EXTENSION] }
      ]
    };

    const result = window
      ? await dialog.showSaveDialog(window, options)
      : await dialog.showSaveDialog(options);

    if (result.canceled || !result.filePath) {
      return null;
    }

    return result.filePath;
  }
}
