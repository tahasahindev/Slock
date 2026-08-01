import crypto from 'crypto';
import { IPbkdf2KdfService } from './IPbkdf2KdfService.js';
import { CRYPTO_CONSTANTS } from '../../../shared/constants.js';

export class Pbkdf2KdfService implements IPbkdf2KdfService {
  public generateSalt(length: number = CRYPTO_CONSTANTS.SALT_LENGTH): Buffer {
    return crypto.randomBytes(length);
  }

  public deriveKey(
    password: string,
    salt: Buffer,
    iterations: number = CRYPTO_CONSTANTS.KDF_ITERATIONS
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        iterations,
        CRYPTO_CONSTANTS.KEY_LENGTH,
        CRYPTO_CONSTANTS.KDF_HASH,
        (err, derivedKey) => {
          if (err) {
            return reject(new Error('Anahtar türetme işlemi başarısız oldu.'));
          }
          resolve(derivedKey);
        }
      );
    });
  }
}
