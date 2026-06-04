import { Controller, Get, UseGuards, Request, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator';
import { Role } from '../../users/domain/enums/role.enum';
import { GET_SELLER_STATS_USE_CASE, GET_GLOBAL_STATS_USE_CASE } from '../statistics.tokens';
import type { GetSellerStatsUseCase } from '../application/use-cases/get-seller-stats.use-case';
import type { GetGlobalStatsUseCase } from '../application/use-cases/get-global-stats.use-case';

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
  async getSellerStats(@Request() req: any) {
    const stats = await this.getSellerStatsUseCase.execute(req.user.id);
    return { stats };
  }

  @Get('global')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getGlobalStats() {
    const stats = await this.getGlobalStatsUseCase.execute();
    return { stats };
  }
}
