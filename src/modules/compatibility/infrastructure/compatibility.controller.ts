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
  async check(@Body() dto: CheckCompatibilityDto) {
    const result = await this.checkCompatibilityUseCase.execute(dto);
    return result;
  }

  @Get('rules')
  async findAllRules() {
    const rules = await this.findAllRulesUseCase.execute();
    return { data: rules, total: rules.length };
  }

  @Post('rules')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async createRule(@Body() dto: CreateRuleDto) {
    const rule = await this.createRuleUseCase.execute(dto);
    return { message: 'Regla de compatibilidad creada exitosamente', rule };
  }

  @Delete('rules/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async deleteRule(@Param('id') id: string) {
    await this.deleteRuleUseCase.execute(id);
    return { message: 'Regla de compatibilidad desactivada exitosamente' };
  }
}
