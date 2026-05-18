import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { Role } from '../../users/domain/enums/role.enum';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { ProductsErrorInterceptor } from './products-error.interceptor';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import {
  CREATE_PRODUCT_USE_CASE,
  FIND_ALL_PRODUCTS_USE_CASE,
  FIND_PRODUCT_BY_ID_USE_CASE,
  UPDATE_PRODUCT_USE_CASE,
  DELETE_PRODUCT_USE_CASE,
} from '../products.tokens';
import { CreateProductUseCase } from '../application/use-cases/create-product.use-case';
import { FindAllProductsUseCase } from '../application/use-cases/find-all-products.use-case';
import { FindProductByIdUseCase } from '../application/use-cases/find-product-by-id.use-case';
import { UpdateProductUseCase } from '../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../application/use-cases/delete-product.use-case';
import type { AccessRequestUser } from '../../auth/infrastructure/types/auth-request-user';

@Controller('products')
@UseInterceptors(ProductsErrorInterceptor)
export class ProductsController {
  // Claves conocidas que NO son filtros de atributos dinámicos
  private static readonly KNOWN_QUERY_KEYS = new Set([
    'category', 'brand', 'search', 'minPrice', 'maxPrice',
    'page', 'limit', 'sort', 'order',
  ]);

  constructor(
    @Inject(CREATE_PRODUCT_USE_CASE)
    private readonly createProductUseCase: CreateProductUseCase,
    @Inject(FIND_ALL_PRODUCTS_USE_CASE)
    private readonly findAllProductsUseCase: FindAllProductsUseCase,
    @Inject(FIND_PRODUCT_BY_ID_USE_CASE)
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
    @Inject(UPDATE_PRODUCT_USE_CASE)
    private readonly updateProductUseCase: UpdateProductUseCase,
    @Inject(DELETE_PRODUCT_USE_CASE)
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SELLER)
  async create(
    @Body() dto: CreateProductDto,
    @Req() req: Request & { user: AccessRequestUser },
  ) {
    const product = await this.createProductUseCase.execute({
      ...dto,
      sellerId: req.user.id,
    });
    return { message: 'Producto creado exitosamente', product };
  }

  @Get()
  async findAll(@Query() query: QueryProductsDto, @Req() req: Request) {
    // Extraer filtros dinámicos de atributos (query params desconocidos)
    const attributeFilters: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.query)) {
      if (!ProductsController.KNOWN_QUERY_KEYS.has(key) && typeof value === 'string') {
        attributeFilters[key] = value;
      }
    }

    const result = await this.findAllProductsUseCase.execute({
      filters: {
        category: query.category,
        brand: query.brand,
        search: query.search,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        attributeFilters: Object.keys(attributeFilters).length > 0 ? attributeFilters : undefined,
      },
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sort: query.sort ?? 'createdAt',
      order: query.order ?? 'desc',
    });

    return result;
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const product = await this.findProductByIdUseCase.execute(id);
    return { product };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SELLER)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: Request & { user: AccessRequestUser },
  ) {
    const product = await this.updateProductUseCase.execute({
      productId: id,
      requesterId: req.user.id,
      requesterRole: req.user.role,
      ...dto,
    });
    return { message: 'Producto actualizado exitosamente', product };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async delete(@Param('id') id: string) {
    const product = await this.deleteProductUseCase.execute(id);
    return { message: 'Producto desactivado exitosamente', product };
  }
}
