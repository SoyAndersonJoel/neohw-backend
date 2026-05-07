export interface HashService {
  hash(value: string): Promise<string>;
  verify(hash: string, plain: string): Promise<boolean>;
}
