import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../../users/domain/enums/role.enum';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { CompatibilityErrorInterceptor } from './compatibility-error.interceptor';
import { CheckCompatibilityDto } from './dto/check-compatibility.dto';
import { CreateRuleDto } from './dto/create-rule.dto';
import {
  CHECK_COMPATIBILITY_USE_CASE,
  CREATE_COMPATIBILITY_RULE_USE_CASE,
  FIND_ALL_RULES_USE_CASE,
  DELETE_RULE_USE_CASE,
} from '../compatibility.tokens';
import { CheckCompatibilityUseCase } from '../application/use-cases/check-compatibility.use-case';
import { CreateCompatibilityRuleUseCase } from '../application/use-cases/create-compatibility-rule.use-case';
import { FindAllRulesUseCase } from '../application/use-cases/find-all-rules.use-case';
import { DeleteRuleUseCase } from '../application/use-cases/delete-rule.use-case';

import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Compatibility')
@Controller('compatibility')
@UseInterceptors(CompatibilityErrorInterceptor)
export class CompatibilityController {
  constructor(
    @Inject(CHECK_COMPATIBILITY_USE_CASE)
    private readonly checkCompatibilityUseCase: CheckCompatibilityUseCase,
    @Inject(CREATE_COMPATIBILITY_RULE_USE_CASE)
    private readonly createRuleUseCase: CreateCompatibilityRuleUseCase,
    @Inject(FIND_ALL_RULES_USE_CASE)
    private readonly findAllRulesUseCase: FindAllRulesUseCase,
    @Inject(DELETE_RULE_USE_CASE)
    private readonly deleteRuleUseCase: DeleteRuleUseCase,
  ) {}

  @Post('check')
  @ApiOperation({ summary: 'Verificar la compatibilidad de una lista de productos' })
  @ApiResponse({ status: 200, description: 'Resultado de la verificación de compatibilidad' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o productos no encontrados' })
  async check(@Body() dto: CheckCompatibilityDto) {
    const result = await this.checkCompatibilityUseCase.execute(dto);
    return result;
  }

  @Get('rules')
  @ApiOperation({ summary: 'Obtener todas las reglas de compatibilidad' })
  @ApiResponse({ status: 200, description: 'Lista de reglas obtenida' })
  async findAllRules() {
    const rules = await this.findAllRulesUseCase.execute();
    return { data: rules, total: rules.length };
  }

  @Post('rules')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva regla de compatibilidad (Solo ADMIN/SUPER_ADMIN)' })
  @ApiResponse({ status: 201, description: 'Regla creada exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async createRule(@Body() dto: CreateRuleDto) {
    const rule = await this.createRuleUseCase.execute(dto);
    return { message: 'Regla de compatibilidad creada exitosamente', rule };
  }

  @Delete('rules/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una regla de compatibilidad (Solo ADMIN/SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Regla eliminada exitosamente' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async deleteRule(@Param('id') id: string) {
    await this.deleteRuleUseCase.execute(id);
    return { message: 'Regla de compatibilidad desactivada exitosamente' };
  }
}
