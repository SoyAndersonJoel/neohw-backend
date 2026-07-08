import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { Role } from '../../users/domain/enums/role.enum';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { ProductAttributesErrorInterceptor } from './product-attributes-error.interceptor';
import { SetProductAttributesDto } from './dto/set-product-attributes.dto';
import {
  SET_PRODUCT_ATTRIBUTES_USE_CASE,
  UPDATE_PRODUCT_ATTRIBUTES_USE_CASE,
  FIND_PRODUCT_ATTRIBUTES_USE_CASE,
} from '../product-attributes.tokens';
import { FIND_PRODUCT_BY_ID_USE_CASE } from '../../products/products.tokens';
import { SetProductAttributesUseCase } from '../application/use-cases/set-product-attributes.use-case';
import { UpdateProductAttributesUseCase } from '../application/use-cases/update-product-attributes.use-case';
import { FindProductAttributesUseCase } from '../application/use-cases/find-product-attributes.use-case';
import { FindProductByIdUseCase } from '../../products/application/use-cases/find-product-by-id.use-case';
import type { AccessRequestUser } from '../../auth/infrastructure/types/auth-request-user';

import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Product Attributes')
@Controller('products/:productId/attributes')
@UseInterceptors(ProductAttributesErrorInterceptor)
export class ProductAttributesController {
  constructor(
    @Inject(SET_PRODUCT_ATTRIBUTES_USE_CASE)
    private readonly setProductAttributesUseCase: SetProductAttributesUseCase,
    @Inject(UPDATE_PRODUCT_ATTRIBUTES_USE_CASE)
    private readonly updateProductAttributesUseCase: UpdateProductAttributesUseCase,
    @Inject(FIND_PRODUCT_ATTRIBUTES_USE_CASE)
    private readonly findProductAttributesUseCase: FindProductAttributesUseCase,
    @Inject(FIND_PRODUCT_BY_ID_USE_CASE)
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener los atributos de un producto' })
  @ApiResponse({ status: 200, description: 'Atributos obtenidos exitosamente' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async findAll(@Param('productId') productId: string) {
    const attributes = await this.findProductAttributesUseCase.execute(productId);
    return { productId, attributes, total: attributes.length };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Asignar valores de atributos a un producto' })
  @ApiResponse({ status: 201, description: 'Atributos asignados exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async set(
    @Param('productId') productId: string,
    @Body() dto: SetProductAttributesDto,
    @Req() req: Request & { user: AccessRequestUser },
  ) {
    const product = await this.findProductByIdUseCase.execute(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const attributes = await this.setProductAttributesUseCase.execute({
      productId,
      requesterId: req.user.id,
      requesterRole: req.user.role,
      productSellerId: product.sellerId,
      attributes: dto.attributes,
    });
    return { message: 'Atributos asignados exitosamente', productId, attributes };
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SELLER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar los valores de los atributos de un producto' })
  @ApiResponse({ status: 200, description: 'Atributos actualizados exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async update(
    @Param('productId') productId: string,
    @Body() dto: SetProductAttributesDto,
    @Req() req: Request & { user: AccessRequestUser },
  ) {
    const product = await this.findProductByIdUseCase.execute(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const attributes = await this.updateProductAttributesUseCase.execute({
      productId,
      requesterId: req.user.id,
      requesterRole: req.user.role,
      productSellerId: product.sellerId,
      attributes: dto.attributes,
    });
    return { message: 'Atributos actualizados exitosamente', productId, attributes };
  }
}
