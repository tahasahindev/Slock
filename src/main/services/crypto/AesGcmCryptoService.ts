import crypto from 'crypto';
import { ICryptoService } from './ICryptoService.js';
import { IPbkdf2KdfService } from './IPbkdf2KdfService.js';
import { EncryptedFileHeader } from '../../../shared/types.js';
import { CRYPTO_CONSTANTS } from '../../../shared/constants.js';

export class AesGcmCryptoService implements ICryptoService {
  constructor(private readonly kdfService: IPbkdf2KdfService) {}

  public async encrypt(plaintext: string, password: string): Promise<EncryptedFileHeader> {
    if (!password || password.trim().length === 0) {
      throw new Error('Geçerli bir şifre girilmelidir.');
    }

    const salt = this.kdfService.generateSalt();
    const iv = crypto.randomBytes(CRYPTO_CONSTANTS.IV_LENGTH);
    let derivedKey: Buffer | null = null;

    try {
      derivedKey = await this.kdfService.deriveKey(password, salt);

      const cipherOptions: crypto.CipherGCMOptions = {
        authTagLength: CRYPTO_CONSTANTS.TAG_LENGTH
      };

      const cipher = crypto.createCipheriv(
        CRYPTO_CONSTANTS.ALGORITHM,
        derivedKey,
        iv,
        cipherOptions
      ) as crypto.CipherGCM;

      const encryptedBuffer = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
      ]);

      const tag = cipher.getAuthTag();
      const nowIso = new Date().toISOString();

      return {
        version: CRYPTO_CONSTANTS.VERSION,
        algorithm: CRYPTO_CONSTANTS.ALGORITHM,
        kdf: CRYPTO_CONSTANTS.KDF,
        iterations: CRYPTO_CONSTANTS.KDF_ITERATIONS,
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        ciphertext: encryptedBuffer.toString('base64'),
        createdAt: nowIso,
        updatedAt: nowIso
      };
    } finally {
      // Memory hygiene: Wipe sensitive derived key buffer immediately after usage
      if (derivedKey) {
        derivedKey.fill(0);
      }
    }
  }

  public async decrypt(header: EncryptedFileHeader, password: string): Promise<string> {
    if (!password || password.trim().length === 0) {
      throw new Error('Şifre girilmelidir.');
    }

    this.validateHeader(header);

    const salt = Buffer.from(header.salt, 'base64');
    const iv = Buffer.from(header.iv, 'base64');
    const tag = Buffer.from(header.tag, 'base64');
    const ciphertext = Buffer.from(header.ciphertext, 'base64');

    if (salt.length !== CRYPTO_CONSTANTS.SALT_LENGTH) {
      throw new Error('Geçersiz tuz (salt) verisi.');
    }
    if (iv.length !== CRYPTO_CONSTANTS.IV_LENGTH) {
      throw new Error('Geçersiz IV verisi.');
    }
    if (tag.length !== CRYPTO_CONSTANTS.TAG_LENGTH) {
      throw new Error('Geçersiz doğrulama etiketi (auth tag).');
    }

    let derivedKey: Buffer | null = null;

    try {
      derivedKey = await this.kdfService.deriveKey(password, salt, header.iterations);

      const decipherOptions: crypto.CipherGCMOptions = {
        authTagLength: CRYPTO_CONSTANTS.TAG_LENGTH
      };

      const decipher = crypto.createDecipheriv(
        CRYPTO_CONSTANTS.ALGORITHM,
        derivedKey,
        iv,
        decipherOptions
      ) as crypto.DecipherGCM;

      decipher.setAuthTag(tag);

      const plaintextBuffer = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
      ]);

      return plaintextBuffer.toString('utf8');
    } catch (err: unknown) {
      // Secure exception handling: Do not leak detailed cryptographic state
      throw new Error('Şifre çözülemedi. Şifre yanlış olabilir veya dosya bozulmuş/değiştirilmiş olabilir.');
    } finally {
      // Memory hygiene: Wipe sensitive derived key buffer immediately
      if (derivedKey) {
        derivedKey.fill(0);
      }
    }
  }

  /**
   * Validates header structure and algorithm parameters before execution.
   */
  private validateHeader(header: EncryptedFileHeader): void {
    if (!header || typeof header !== 'object') {
      throw new Error('Geçersiz dosya formatı.');
    }
    if (header.version !== CRYPTO_CONSTANTS.VERSION) {
      throw new Error(`Desteklenmeyen dosya sürümü: ${header.version}`);
    }
    if (header.algorithm !== CRYPTO_CONSTANTS.ALGORITHM) {
      throw new Error(`Desteklenmeyen şifreleme algoritması: ${header.algorithm}`);
    }
    if (header.kdf !== CRYPTO_CONSTANTS.KDF) {
      throw new Error(`Desteklenmeyen KDF algoritması: ${header.kdf}`);
    }
    if (!header.salt || !header.iv || !header.tag || !header.ciphertext) {
      throw new Error('Şifreli dosya üstbilgisi eksik alanlar içeriyor.');
    }
  }
}
