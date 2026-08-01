import assert from 'assert';
import { Pbkdf2KdfService } from '../src/main/services/crypto/Pbkdf2KdfService.js';
import { AesGcmCryptoService } from '../src/main/services/crypto/AesGcmCryptoService.js';

async function runCryptoTests() {
  console.log('🧪 Running Slock Cryptographic Security Verification Tests...');

  const kdfService = new Pbkdf2KdfService();
  const cryptoService = new AesGcmCryptoService(kdfService);

  const testSecretText = 'Gizli Veri 12345 - Slock Encrypted Note';
  const validPassword = 'CorrectHorseBatteryStaple!99';
  const wrongPassword = 'WrongPassword123!';

  // 1. Test Encryption
  console.log('  [1/5] Testing AES-256-GCM Encryption...');
  const header = await cryptoService.encrypt(testSecretText, validPassword);

  assert.strictEqual(header.version, 1);
  assert.strictEqual(header.algorithm, 'AES-256-GCM');
  assert.strictEqual(header.kdf, 'PBKDF2-HMAC-SHA512');
  assert.strictEqual(header.iterations, 600000);
  assert.ok(header.salt.length > 0, 'Salt should exist');
  assert.ok(header.iv.length > 0, 'IV should exist');
  assert.ok(header.tag.length > 0, 'Auth Tag should exist');
  assert.ok(header.ciphertext.length > 0, 'Ciphertext should exist');

  // 2. Test Successful Decryption with Correct Password
  console.log('  [2/5] Testing Decryption with Correct Key...');
  const decryptedText = await cryptoService.decrypt(header, validPassword);
  assert.strictEqual(decryptedText, testSecretText, 'Decrypted text must match original plaintext exactly');

  // 3. Test Failed Decryption with Incorrect Password
  console.log('  [3/5] Testing Decryption with Incorrect Key (Must throw auth tag error)...');
  try {
    await cryptoService.decrypt(header, wrongPassword);
    assert.fail('Decryption with wrong password should have failed!');
  } catch (err: any) {
    assert.ok(err.message.includes('Şifre çözülemedi'), 'Should throw clear authentication failure error');
  }

  // 4. Test Ciphertext Tamper Detection
  console.log('  [4/5] Testing Tampered Ciphertext Detection...');
  const tamperedHeader = { ...header };
  // Corrupt one character in base64 ciphertext
  const rawBytes = Buffer.from(tamperedHeader.ciphertext, 'base64');
  rawBytes[0] ^= 0xff;
  tamperedHeader.ciphertext = rawBytes.toString('base64');

  try {
    await cryptoService.decrypt(tamperedHeader, validPassword);
    assert.fail('Decryption of tampered payload should have failed!');
  } catch (err: any) {
    assert.ok(err.message.includes('Şifre çözülemedi'), 'Should detect modified ciphertext and fail auth tag check');
  }

  // 5. Test Nonce / IV Uniqueness Per Encryption
  console.log('  [5/5] Testing Nonce (IV) Uniqueness per Operation...');
  const header2 = await cryptoService.encrypt(testSecretText, validPassword);
  assert.notStrictEqual(header.iv, header2.iv, 'IVs must be uniquely generated per encryption');
  assert.notStrictEqual(header.salt, header2.salt, 'Salts must be uniquely generated per encryption');

  console.log('✅ ALL CRYPTOGRAPHIC SECURITY TESTS PASSED SUCCESSFULLY!');
}

runCryptoTests().catch(err => {
  console.error('❌ Crypto Security Verification Failed:', err);
  process.exit(1);
});
