import { FindProductByIdUseCase } from './find-product-by-id.use-case';
import { ProductRepository } from '../../domain/interfaces/product.repository';
import { ProductsError } from '../errors/products.error';
import { mock, mockClear } from 'jest-mock-extended';

describe('FindProductByIdUseCase', () => {
  const productRepository = mock<ProductRepository>();
  let useCase: FindProductByIdUseCase;

  beforeEach(() => {
    mockClear(productRepository);
    useCase = new FindProductByIdUseCase(productRepository);
  });

  it('should throw ProductsError if product is not found', async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid-id'))
      .rejects.toThrow(new ProductsError('PRODUCT_NOT_FOUND'));
  });

  it('should return the product if found', async () => {
    const mockProduct = { id: 'prod-1', name: 'RTX 3060' };
    productRepository.findById.mockResolvedValue(mockProduct as any);

    const result = await useCase.execute('prod-1');

    expect(productRepository.findById).toHaveBeenCalledWith('prod-1');
    expect(result).toEqual(mockProduct);
  });
});
