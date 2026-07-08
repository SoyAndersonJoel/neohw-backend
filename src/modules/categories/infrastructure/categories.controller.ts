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
import { CategoriesErrorInterceptor } from './categories-error.interceptor';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CREATE_CATEGORY_USE_CASE,
  FIND_ALL_CATEGORIES_USE_CASE,
  FIND_CATEGORY_BY_ID_USE_CASE,
  UPDATE_CATEGORY_USE_CASE,
  DELETE_CATEGORY_USE_CASE,
} from '../categories.tokens';
import { CreateCategoryUseCase } from '../application/use-cases/create-category.use-case';
import { FindAllCategoriesUseCase } from '../application/use-cases/find-all-categories.use-case';
import { FindCategoryByIdUseCase } from '../application/use-cases/find-category-by-id.use-case';
import { UpdateCategoryUseCase } from '../application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '../application/use-cases/delete-category.use-case';

import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
@UseInterceptors(CategoriesErrorInterceptor)
export class CategoriesController {
  constructor(
    @Inject(CREATE_CATEGORY_USE_CASE)
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    @Inject(FIND_ALL_CATEGORIES_USE_CASE)
    private readonly findAllCategoriesUseCase: FindAllCategoriesUseCase,
    @Inject(FIND_CATEGORY_BY_ID_USE_CASE)
    private readonly findCategoryByIdUseCase: FindCategoryByIdUseCase,
    @Inject(UPDATE_CATEGORY_USE_CASE)
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    @Inject(DELETE_CATEGORY_USE_CASE)
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una categoría (Solo ADMIN/SUPER_ADMIN)' })
  @ApiResponse({ status: 201, description: 'Categoría creada exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async create(@Body() dto: CreateCategoryDto) {
    const category = await this.createCategoryUseCase.execute(dto);
    return { message: 'Categoría creada exitosamente', category };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  @ApiResponse({ status: 200, description: 'Lista de categorías obtenida' })
  async findAll() {
    const categories = await this.findAllCategoriesUseCase.execute();
    return { data: categories, total: categories.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una categoría por ID' })
  @ApiResponse({ status: 200, description: 'Categoría encontrada' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async findById(@Param('id') id: string) {
    const category = await this.findCategoryByIdUseCase.execute(id);
    return { category };
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una categoría (Solo ADMIN/SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Categoría actualizada exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const category = await this.updateCategoryUseCase.execute({ id, ...dto });
    return { message: 'Categoría actualizada exitosamente', category };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar/desactivar una categoría (Solo ADMIN/SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Categoría desactivada exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async delete(@Param('id') id: string) {
    const category = await this.deleteCategoryUseCase.execute(id);
    return { message: 'Categoría desactivada exitosamente', category };
  }
}
