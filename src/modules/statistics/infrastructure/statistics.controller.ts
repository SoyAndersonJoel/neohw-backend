import { Controller, Get, UseGuards, Request, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { Role } from '../../users/domain/enums/role.enum';
import { GET_SELLER_STATS_USE_CASE, GET_GLOBAL_STATS_USE_CASE } from '../statistics.tokens';
import type { GetSellerStatsUseCase } from '../application/use-cases/get-seller-stats.use-case';
import type { GetGlobalStatsUseCase } from '../application/use-cases/get-global-stats.use-case';

import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Statistics')
@ApiBearerAuth()
@Controller('statistics')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StatisticsController {
  constructor(
    @Inject(GET_SELLER_STATS_USE_CASE)
    private readonly getSellerStatsUseCase: GetSellerStatsUseCase,
    @Inject(GET_GLOBAL_STATS_USE_CASE)
    private readonly getGlobalStatsUseCase: GetGlobalStatsUseCase,
  ) {}

  @Get('seller')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Obtener estadísticas del vendedor actual' })
  @ApiResponse({ status: 200, description: 'Estadísticas del vendedor obtenidas' })
  @ApiResponse({ status: 403, description: 'Acceso denegado (requiere rol SELLER)' })
  async getSellerStats(@Request() req: any) {
    const stats = await this.getSellerStatsUseCase.execute(req.user.id);
    return { stats };
  }

  @Get('global')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Obtener estadísticas globales del sistema (Solo ADMIN/SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Estadísticas globales obtenidas' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async getGlobalStats() {
    const stats = await this.getGlobalStatsUseCase.execute();
    return { stats };
  }
}
