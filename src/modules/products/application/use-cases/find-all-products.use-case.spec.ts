import { FindAllProductsUseCase } from './find-all-products.use-case';
import { ProductRepository } from '../../domain/interfaces/product.repository';
import { mock, mockClear } from 'jest-mock-extended';

describe('FindAllProductsUseCase', () => {
  const productRepository = mock<ProductRepository>();
  let useCase: FindAllProductsUseCase;

  beforeEach(() => {
    mockClear(productRepository);
    useCase = new FindAllProductsUseCase(productRepository);
  });

  it('should call productRepository.findAll with options and return paginated results', async () => {
    const mockOptions = {
      page: 2,
      limit: 5,
      filters: { search: 'RTX' },
    };

    const mockResult = {
      data: [{ id: 'prod-1', name: 'RTX 3060' } as any],
      total: 1,
      page: 2,
      limit: 5,
    };

    productRepository.findAll.mockResolvedValue(mockResult);

    const result = await useCase.execute(mockOptions);

    expect(productRepository.findAll).toHaveBeenCalledWith(mockOptions);
    expect(result).toEqual(mockResult);
  });
});
