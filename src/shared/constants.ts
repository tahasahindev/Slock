export const CRYPTO_CONSTANTS = {
  VERSION: 1,
  ALGORITHM: 'AES-256-GCM' as const,
  KDF: 'PBKDF2-HMAC-SHA512' as const,
  KDF_HASH: 'sha512',
  KDF_ITERATIONS: 600000, // OWASP recommended iteration count for PBKDF2-HMAC-SHA512
  KEY_LENGTH: 32,         // 256 bits for AES-256
  SALT_LENGTH: 32,        // 256 bits random salt
  IV_LENGTH: 12,          // 96 bits standard for GCM
  TAG_LENGTH: 16,         // 128 bits authentication tag
  MIN_PASSWORD_LENGTH: 6
} as const;

export const FILE_CONSTANTS = {
  EXTENSION: 'slock',
  FILTER_NAME: 'Slock Şifreli Dosya (*.slock)',
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024 // 50MB protection limit for text files
} as const;
