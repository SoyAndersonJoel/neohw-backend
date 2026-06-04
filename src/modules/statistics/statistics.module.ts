import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { StatisticsController } from './infrastructure/statistics.controller';
import { GetSellerStatsUseCase } from './application/use-cases/get-seller-stats.use-case';
import { GetGlobalStatsUseCase } from './application/use-cases/get-global-stats.use-case';
import { GET_SELLER_STATS_USE_CASE, GET_GLOBAL_STATS_USE_CASE } from './statistics.tokens';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [StatisticsController],
  providers: [
    {
      provide: GET_SELLER_STATS_USE_CASE,
      useClass: GetSellerStatsUseCase,
    },
    {
      provide: GET_GLOBAL_STATS_USE_CASE,
      useClass: GetGlobalStatsUseCase,
    },
  ],
})
export class StatisticsModule {}
