/**
 * Payload structure saved inside encrypted `.slock` files.
 */
export interface EncryptedFileHeader {
  version: number;
  algorithm: 'AES-256-GCM';
  kdf: 'PBKDF2-HMAC-SHA512';
  iterations: number;
  salt: string;        // Base64 encoded (32 bytes)
  iv: string;          // Base64 encoded (12 bytes)
  tag: string;         // Base64 encoded (16 bytes)
  ciphertext: string;  // Base64 encoded encrypted text payload
  createdAt: string;   // ISO string timestamp
  updatedAt: string;   // ISO string timestamp
}

/**
 * Standard Result envelope for IPC operations to ensure strict safety and error handling.
 */
export type Result<T, E = string> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Encrypted payload metadata returned during encryption/decryption requests.
 */
export interface EncryptionResult {
  header: EncryptedFileHeader;
}

export interface DecryptionResult {
  plaintext: string;
}

/**
 * File dialog response payload.
 */
export interface FileOpenResponse {
  filePath: string;
  header: EncryptedFileHeader;
}

export interface FileSaveResponse {
  filePath: string;
}

/**
 * Electron Preload API window bridge contract exposed to Renderer.
 */
export interface ISlockAPI {
  selectOpenFile: () => Promise<Result<FileOpenResponse | null>>;
  selectSaveFile: (defaultName?: string) => Promise<Result<string | null>>;
  readEncryptedFile: (filePath: string) => Promise<Result<EncryptedFileHeader>>;
  writeEncryptedFile: (filePath: string, header: EncryptedFileHeader) => Promise<Result<FileSaveResponse>>;
  decryptContent: (header: EncryptedFileHeader, key: string) => Promise<Result<DecryptionResult>>;
  encryptContent: (plaintext: string, key: string) => Promise<Result<EncryptedFileHeader>>;
}

declare global {
  interface Window {
    slockAPI: ISlockAPI;
  }
}
