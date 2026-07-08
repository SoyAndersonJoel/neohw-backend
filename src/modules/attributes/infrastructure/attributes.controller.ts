import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../../users/domain/enums/role.enum';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { AttributesErrorInterceptor } from './attributes-error.interceptor';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { AssignCategoryAttributeDto } from './dto/assign-category-attribute.dto';
import {
  CREATE_ATTRIBUTE_USE_CASE,
  FIND_ALL_ATTRIBUTES_USE_CASE,
  FIND_ATTRIBUTES_BY_CATEGORY_USE_CASE,
  UPDATE_ATTRIBUTE_USE_CASE,
  ASSIGN_ATTRIBUTE_TO_CATEGORY_USE_CASE,
  ATTRIBUTE_REPOSITORY,
} from '../attributes.tokens';
import { CreateAttributeUseCase } from '../application/use-cases/create-attribute.use-case';
import { FindAllAttributesUseCase } from '../application/use-cases/find-all-attributes.use-case';
import { FindAttributesByCategoryUseCase } from '../application/use-cases/find-attributes-by-category.use-case';
import { UpdateAttributeUseCase } from '../application/use-cases/update-attribute.use-case';
import { AssignAttributeToCategoryUseCase } from '../application/use-cases/assign-attribute-to-category.use-case';
import type { AttributeRepository } from '../domain/interfaces/attribute.repository';

import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Attributes')
@Controller()
@UseInterceptors(AttributesErrorInterceptor)
export class AttributesController {
  constructor(
    @Inject(CREATE_ATTRIBUTE_USE_CASE)
    private readonly createAttributeUseCase: CreateAttributeUseCase,
    @Inject(FIND_ALL_ATTRIBUTES_USE_CASE)
    private readonly findAllAttributesUseCase: FindAllAttributesUseCase,
    @Inject(FIND_ATTRIBUTES_BY_CATEGORY_USE_CASE)
    private readonly findAttributesByCategoryUseCase: FindAttributesByCategoryUseCase,
    @Inject(UPDATE_ATTRIBUTE_USE_CASE)
    private readonly updateAttributeUseCase: UpdateAttributeUseCase,
    @Inject(ASSIGN_ATTRIBUTE_TO_CATEGORY_USE_CASE)
    private readonly assignAttributeToCategoryUseCase: AssignAttributeToCategoryUseCase,
    @Inject(ATTRIBUTE_REPOSITORY)
    private readonly attributeRepository: AttributeRepository,
  ) {}

  @Post('attributes')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un atributo (Solo ADMIN/SUPER_ADMIN)' })
  @ApiResponse({ status: 201, description: 'Atributo creado exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async create(@Body() dto: CreateAttributeDto) {
    const attribute = await this.createAttributeUseCase.execute(dto);
    return { message: 'Atributo creado exitosamente', attribute };
  }

  @Get('attributes')
  @ApiOperation({ summary: 'Obtener todos los atributos' })
  @ApiResponse({ status: 200, description: 'Lista de atributos obtenida' })
  async findAll() {
    const attributes = await this.findAllAttributesUseCase.execute();
    return { data: attributes, total: attributes.length };
  }

  @Get('attributes/:id')
  @ApiOperation({ summary: 'Obtener un atributo por ID' })
  @ApiResponse({ status: 200, description: 'Atributo encontrado' })
  @ApiResponse({ status: 404, description: 'Atributo no encontrado' })
  async findById(@Param('id') id: string) {
    const attribute = await this.attributeRepository.findById(id);
    if (!attribute) {
      throw new Error('ATTRIBUTE_NOT_FOUND');
    }
    return { attribute };
  }

  @Patch('attributes/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un atributo (Solo ADMIN/SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Atributo actualizado exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async update(@Param('id') id: string, @Body() dto: UpdateAttributeDto) {
    const attribute = await this.updateAttributeUseCase.execute({ id, ...dto });
    return { message: 'Atributo actualizado exitosamente', attribute };
  }

  @Delete('attributes/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un atributo (Solo ADMIN/SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Atributo eliminado exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async delete(@Param('id') id: string) {
    await this.attributeRepository.delete(id);
    return { message: 'Atributo eliminado exitosamente' };
  }

  // ─── Category-Attribute endpoints ─────────────────────────

  @Get('categories/:id/attributes')
  @ApiOperation({ summary: 'Obtener atributos asignados a una categoría' })
  @ApiResponse({ status: 200, description: 'Lista de atributos obtenida' })
  async findByCategoryId(@Param('id') categoryId: string) {
    const attributes = await this.findAttributesByCategoryUseCase.execute(categoryId);
    return { data: attributes, total: attributes.length };
  }

  @Post('categories/:id/attributes')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Asignar un atributo a una categoría (Solo ADMIN/SUPER_ADMIN)' })
  @ApiResponse({ status: 201, description: 'Atributo asignado a la categoría' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async assignToCategory(
    @Param('id') categoryId: string,
    @Body() dto: AssignCategoryAttributeDto,
  ) {
    await this.assignAttributeToCategoryUseCase.execute(categoryId, dto.attributeId);
    return { message: 'Atributo asignado a la categoría exitosamente' };
  }

  @Delete('categories/:categoryId/attributes/:attributeId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desasignar un atributo de una categoría (Solo ADMIN/SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Atributo desasignado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async removeFromCategory(
    @Param('categoryId') categoryId: string,
    @Param('attributeId') attributeId: string,
  ) {
    await this.attributeRepository.removeFromCategory(categoryId, attributeId);
    return { message: 'Atributo desasignado de la categoría exitosamente' };
  }
}
