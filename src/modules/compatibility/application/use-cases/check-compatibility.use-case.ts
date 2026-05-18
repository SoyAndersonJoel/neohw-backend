import { CompatibilityCheckResult } from '../../domain/entities/compatibility-rule.entity';
import { CompatibilityRepository } from '../../domain/interfaces/compatibility.repository';
import { CompatibilityEngine } from '../services/compatibility-engine.service';
import { CompatibilityError } from '../errors/compatibility.error';

export type CheckCompatibilityInput = {
  productIds: string[];
};

export type CheckCompatibilityResult = {
  compatible: boolean;
  results: CompatibilityCheckResult[];
};

// Interface para obtener atributos de productos (inyectado desde fuera)
export interface ProductAttributesFetcher {
  getProductsWithAttributes(
    productIds: string[],
  ): Promise<
    Array<{
      id: string;
      name: string;
      attributes: Map<string, string>;
    }>
  >;
}

export class CheckCompatibilityUseCase {
  constructor(
    private readonly compatibilityRepository: CompatibilityRepository,
    private readonly productAttributesFetcher: ProductAttributesFetcher,
    private readonly engine: CompatibilityEngine,
  ) {}

  async execute(input: CheckCompatibilityInput): Promise<CheckCompatibilityResult> {
    if (input.productIds.length < 2) {
      throw new CompatibilityError('INSUFFICIENT_PRODUCTS', 'Se requieren al menos 2 productos');
    }

    const [rules, products] = await Promise.all([
      this.compatibilityRepository.findActiveRules(),
      this.productAttributesFetcher.getProductsWithAttributes(input.productIds),
    ]);

    if (products.length < 2) {
      throw new CompatibilityError('PRODUCT_NOT_FOUND', 'Uno o más productos no fueron encontrados');
    }

    const results = this.engine.evaluate(rules, products);
    const compatible = results.every((r) => r.status !== 'FAIL');

    return { compatible, results };
  }
}
