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
  async create(@Body() dto: CreateAttributeDto) {
    const attribute = await this.createAttributeUseCase.execute(dto);
    return { message: 'Atributo creado exitosamente', attribute };
  }

  @Get('attributes')
  async findAll() {
    const attributes = await this.findAllAttributesUseCase.execute();
    return { data: attributes, total: attributes.length };
  }

  @Get('attributes/:id')
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
  async update(@Param('id') id: string, @Body() dto: UpdateAttributeDto) {
    const attribute = await this.updateAttributeUseCase.execute({ id, ...dto });
    return { message: 'Atributo actualizado exitosamente', attribute };
  }

  @Delete('attributes/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async delete(@Param('id') id: string) {
    await this.attributeRepository.delete(id);
    return { message: 'Atributo eliminado exitosamente' };
  }

  // ─── Category-Attribute endpoints ─────────────────────────

  @Get('categories/:id/attributes')
  async findByCategoryId(@Param('id') categoryId: string) {
    const attributes = await this.findAttributesByCategoryUseCase.execute(categoryId);
    return { data: attributes, total: attributes.length };
  }

  @Post('categories/:id/attributes')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
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
  async removeFromCategory(
    @Param('categoryId') categoryId: string,
    @Param('attributeId') attributeId: string,
  ) {
    await this.attributeRepository.removeFromCategory(categoryId, attributeId);
    return { message: 'Atributo desasignado de la categoría exitosamente' };
  }
}
