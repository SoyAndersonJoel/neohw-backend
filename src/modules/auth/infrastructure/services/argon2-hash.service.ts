import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { HashService } from '../../domain/interfaces/hash.service';

@Injectable()
export class Argon2HashService implements HashService {
  private readonly options: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  };

  async hash(value: string): Promise<string> {
    return argon2.hash(value, this.options);
  }

  async verify(hash: string, plain: string): Promise<boolean> {
    return argon2.verify(hash, plain);
  }
}
