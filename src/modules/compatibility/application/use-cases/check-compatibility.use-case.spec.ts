import { CheckCompatibilityUseCase, ProductAttributesFetcher } from './check-compatibility.use-case';
import { CompatibilityRepository } from '../../domain/interfaces/compatibility.repository';
import { CompatibilityEngine } from '../services/compatibility-engine.service';
import { CompatibilityError } from '../errors/compatibility.error';
import { CompatibilityCheckResult } from '../../domain/entities/compatibility-rule.entity';
import { mock, mockClear } from 'jest-mock-extended';

describe('CheckCompatibilityUseCase', () => {
  const compatibilityRepository = mock<CompatibilityRepository>();
  const productAttributesFetcher = mock<ProductAttributesFetcher>();
  const engine = mock<CompatibilityEngine>();

  let useCase: CheckCompatibilityUseCase;

  beforeEach(() => {
    mockClear(compatibilityRepository);
    mockClear(productAttributesFetcher);
    mockClear(engine);
    useCase = new CheckCompatibilityUseCase(
      compatibilityRepository,
      productAttributesFetcher,
      engine,
    );
  });

  it('should throw CompatibilityError if less than 2 products are provided', async () => {
    await expect(useCase.execute({ productIds: ['prod-1'] }))
      .rejects.toThrow(new CompatibilityError('INSUFFICIENT_PRODUCTS', 'Se requieren al menos 2 productos'));
  });

  it('should throw CompatibilityError if one or more products are not found', async () => {
    compatibilityRepository.findActiveRules.mockResolvedValue([]);
    // Simulate that only 1 product is returned from DB instead of the 2 requested
    productAttributesFetcher.getProductsWithAttributes.mockResolvedValue([
      { id: 'prod-1', name: 'CPU', attributes: new Map() },
    ]);

    await expect(useCase.execute({ productIds: ['prod-1', 'prod-2'] }))
      .rejects.toThrow(new CompatibilityError('PRODUCT_NOT_FOUND', 'Uno o más productos no fueron encontrados'));
  });

  it('should return compatible=true if all evaluations pass or warn', async () => {
    const mockProducts = [
      { id: 'prod-1', name: 'CPU', attributes: new Map() },
      { id: 'prod-2', name: 'Motherboard', attributes: new Map() },
    ];
    
    compatibilityRepository.findActiveRules.mockResolvedValue([]);
    productAttributesFetcher.getProductsWithAttributes.mockResolvedValue(mockProducts);
    
    // Simular resultados de evaluación del Engine
    const mockResults: CompatibilityCheckResult[] = [
      {
        ruleId: 'rule-1',
        ruleName: 'Socket Match',
        status: 'PASS',
        message: 'Sockets coinciden',
      },
      {
        ruleId: 'rule-2',
        ruleName: 'Wattage Check',
        status: 'WARN',
        message: 'Poder justo',
      }
    ];
    engine.evaluate.mockReturnValue(mockResults);

    const result = await useCase.execute({ productIds: ['prod-1', 'prod-2'] });

    expect(result.compatible).toBe(true);
    expect(result.results).toEqual(mockResults);
    expect(engine.evaluate).toHaveBeenCalledWith([], mockProducts);
  });

  it('should return compatible=false if at least one evaluation fails', async () => {
    const mockProducts = [
      { id: 'prod-1', name: 'CPU Intel', attributes: new Map() },
      { id: 'prod-2', name: 'Motherboard AMD', attributes: new Map() },
    ];
    
    compatibilityRepository.findActiveRules.mockResolvedValue([]);
    productAttributesFetcher.getProductsWithAttributes.mockResolvedValue(mockProducts);
    
    // Simular resultados de evaluación del Engine con un fallo
    const mockResults: CompatibilityCheckResult[] = [
      {
        ruleId: 'rule-1',
        ruleName: 'Socket Match',
        status: 'FAIL',
        message: 'Sockets incompatibles',
      }
    ];
    engine.evaluate.mockReturnValue(mockResults);

    const result = await useCase.execute({ productIds: ['prod-1', 'prod-2'] });

    expect(result.compatible).toBe(false);
    expect(result.results).toEqual(mockResults);
  });
});
