import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@algo-matrix/database';
import { EncryptionService } from './encryption.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly encryptionService: EncryptionService) {
    super();
    Object.assign(this, this.$extends(this.withEncryption()));
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }

  private withEncryption() {
    const encService = this.encryptionService;
    const encryptedFields = ['metaToken', 'smtpPassword', 'apiKeys', 'refreshToken'];

    return {
      query: {
        client: {
          async $allOperations({ operation, args, query }: any) {
            
            // Encrypt on write
            if (['create', 'update', 'upsert'].includes(operation)) {
              if (args.data) {
                for (const field of encryptedFields) {
                  if (args.data[field]) {
                    args.data[field] = encService.encrypt(args.data[field]);
                  }
                }
              }
              // Handle upsert create/update nested objects
              if (operation === 'upsert') {
                if (args.create) {
                  for (const field of encryptedFields) {
                    if (args.create[field]) args.create[field] = encService.encrypt(args.create[field]);
                  }
                }
                if (args.update) {
                  for (const field of encryptedFields) {
                    if (args.update[field]) args.update[field] = encService.encrypt(args.update[field]);
                  }
                }
              }
            }

            // Execute query
            const result = await query(args);

            // Decrypt on read
            if (result) {
              const decryptObject = (obj: any) => {
                if (!obj || typeof obj !== 'object') return obj;
                for (const field of encryptedFields) {
                  if (obj[field]) {
                    obj[field] = encService.decrypt(obj[field]);
                  }
                }
                return obj;
              };

              if (Array.isArray(result)) {
                return result.map(decryptObject);
              } else {
                return decryptObject(result);
              }
            }

            return result;
          },
        },
      },
    };
  }
}
