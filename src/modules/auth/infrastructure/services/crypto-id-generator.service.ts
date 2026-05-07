import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IdGenerator } from '../../domain/interfaces/id-generator';

@Injectable()
export class CryptoIdGenerator implements IdGenerator {
  generate(): string {
    return randomUUID();
  }
}
