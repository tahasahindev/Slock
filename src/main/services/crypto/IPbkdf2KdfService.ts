/**
 * Interface Segregation Principle (ISP): Interface dedicated solely to Key Derivation logic.
 */
export interface IPbkdf2KdfService {
  /**
   * Generates a cryptographically secure random salt of specified byte length.
   */
  generateSalt(length?: number): Buffer;

  /**
   * Derives a 256-bit key from a plaintext password and salt using PBKDF2-HMAC-SHA512.
   */
  deriveKey(password: string, salt: Buffer, iterations?: number): Promise<Buffer>;
}
