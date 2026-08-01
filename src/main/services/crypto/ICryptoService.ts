import { EncryptedFileHeader } from '../../../shared/types.js';

/**
 * Interface contract for encryption and decryption services.
 * Allows substitution (Liskov Substitution Principle / Open-Closed Principle).
 */
export interface ICryptoService {
  /**
   * Encrypts plaintext string with user password using AES-256-GCM and PBKDF2.
   */
  encrypt(plaintext: string, password: string): Promise<EncryptedFileHeader>;

  /**
   * Decrypts encrypted file header payload using user password.
   * Throws explicit generic error if authentication tag verification fails (wrong password or corrupted file).
   */
  decrypt(header: EncryptedFileHeader, password: string): Promise<string>;
}
