import fs from 'fs/promises';
import { IFileService } from './IFileService.js';
import { EncryptedFileHeader } from '../../../shared/types.js';
import { FILE_CONSTANTS } from '../../../shared/constants.js';

export class LocalFileService implements IFileService {
  public async readEncryptedFile(filePath: string): Promise<EncryptedFileHeader> {
    if (!filePath) {
      throw new Error('Dosya yolu belirtilmedi.');
    }

    const stat = await fs.stat(filePath);
    if (stat.size > FILE_CONSTANTS.MAX_FILE_SIZE_BYTES) {
      throw new Error(`Dosya boyutu çok büyük (${(stat.size / (1024 * 1024)).toFixed(1)}MB). Maksimum izin verilen: 50MB.`);
    }

    const rawData = await fs.readFile(filePath, 'utf-8');
    let parsed: unknown;

    try {
      parsed = JSON.parse(rawData);
    } catch {
      throw new Error('Dosya geçerli bir JSON formatında değil veya bozulmuş.');
    }

    return parsed as EncryptedFileHeader;
  }

  public async writeEncryptedFile(filePath: string, header: EncryptedFileHeader): Promise<void> {
    if (!filePath) {
      throw new Error('Kaydedilecek dosya yolu belirtilmedi.');
    }

    const jsonContent = JSON.stringify(header, null, 2);
    await fs.writeFile(filePath, jsonContent, { encoding: 'utf-8', mode: 0o600 });
  }
}
