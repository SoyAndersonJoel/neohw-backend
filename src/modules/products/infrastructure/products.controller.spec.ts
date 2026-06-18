import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { mock, mockClear } from 'jest-mock-extended';
import {
  CREATE_PRODUCT_USE_CASE,
  FIND_ALL_PRODUCTS_USE_CASE,
  FIND_PRODUCT_BY_ID_USE_CASE,
  UPDATE_PRODUCT_USE_CASE,
  DELETE_PRODUCT_USE_CASE,
} from '../products.tokens';

import type { CreateProductUseCase } from '../application/use-cases/create-product.use-case';
import type { FindAllProductsUseCase } from '../application/use-cases/find-all-products.use-case';
import type { FindProductByIdUseCase } from '../application/use-cases/find-product-by-id.use-case';
import type { UpdateProductUseCase } from '../application/use-cases/update-product.use-case';
import type { DeleteProductUseCase } from '../application/use-cases/delete-product.use-case';

describe('ProductsController', () => {
  let controller: ProductsController;

  const createProductUseCase = mock<CreateProductUseCase>();
  const findAllProductsUseCase = mock<FindAllProductsUseCase>();
  const findProductByIdUseCase = mock<FindProductByIdUseCase>();
  const updateProductUseCase = mock<UpdateProductUseCase>();
  const deleteProductUseCase = mock<DeleteProductUseCase>();

  beforeEach(async () => {
    mockClear(createProductUseCase);
    mockClear(findAllProductsUseCase);
    mockClear(findProductByIdUseCase);
    mockClear(updateProductUseCase);
    mockClear(deleteProductUseCase);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: CREATE_PRODUCT_USE_CASE, useValue: createProductUseCase },
        { provide: FIND_ALL_PRODUCTS_USE_CASE, useValue: findAllProductsUseCase },
        { provide: FIND_PRODUCT_BY_ID_USE_CASE, useValue: findProductByIdUseCase },
        { provide: UPDATE_PRODUCT_USE_CASE, useValue: updateProductUseCase },
        { provide: DELETE_PRODUCT_USE_CASE, useValue: deleteProductUseCase },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  describe('findAll', () => {
    it('should parse known and unknown query params correctly', async () => {
      // Simulate req.query with known keys (search, page) and unknown keys (attributes)
      const mockReq = {
        query: {
          search: 'RTX',
          page: '2',
          socket: 'AM4',
          brand: 'NVIDIA'
        }
      };

      const mockQueryDto = {
        search: 'RTX',
        page: 2,
        brand: 'NVIDIA'
      };

      const expectedResult = { data: [], total: 0, page: 2, limit: 10 };
      findAllProductsUseCase.execute.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(mockQueryDto as any, mockReq as any);

      expect(findAllProductsUseCase.execute).toHaveBeenCalledWith({
        filters: {
          search: 'RTX',
          brand: 'NVIDIA',
          category: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          attributeFilters: { socket: 'AM4' }, // Unknown key falls into attributeFilters
        },
        page: 2,
        limit: 10,
        sort: 'createdAt',
        order: 'desc',
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findById', () => {
    it('should call findProductByIdUseCase and return product', async () => {
      const mockProduct = { id: 'prod-1', name: 'Product 1' };
      findProductByIdUseCase.execute.mockResolvedValue(mockProduct as any);

      const result = await controller.findById('prod-1');

      expect(findProductByIdUseCase.execute).toHaveBeenCalledWith('prod-1');
      expect(result).toEqual({ product: mockProduct });
    });
  });
});
