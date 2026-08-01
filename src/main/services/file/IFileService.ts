import { EncryptedFileHeader } from '../../../shared/types.js';

export interface IFileService {
  readEncryptedFile(filePath: string): Promise<EncryptedFileHeader>;
  writeEncryptedFile(filePath: string, header: EncryptedFileHeader): Promise<void>;
}
