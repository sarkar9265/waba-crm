import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;
  private readonly logger = new Logger(EncryptionService.name);

  constructor() {
    // Requires a 32-byte hex string (64 characters)
    const rawKey = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    this.key = Buffer.from(rawKey, 'hex');

    if (this.key.length !== 32) {
      this.logger.error('ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters) for aes-256-gcm.');
    }
  }

  encrypt(text: string): string {
    if (!text) return text;
    
    try {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag().toString('hex');
      
      return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (e) {
      this.logger.error(`Encryption failed: ${e.message}`);
      throw e;
    }
  }

  decrypt(encryptedText: string): string {
    if (!encryptedText || !encryptedText.includes(':')) return encryptedText;

    try {
      const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
      if (!ivHex || !authTagHex || !encrypted) return encryptedText; // Fallback for unencrypted data

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      this.logger.warn(`Decryption failed (returning original text): ${e.message}`);
      return encryptedText; // Return original if decryption fails (e.g. legacy plain text data)
    }
  }
}
