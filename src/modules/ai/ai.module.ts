import { Module } from '@nestjs/common';
import { AiController } from './infrastructure/ai.controller';
import { AiAgentService } from './application/services/ai-agent.service';
import { ProductsModule } from '../products/products.module';
import { CompatibilityModule } from '../compatibility/compatibility.module';

@Module({
  imports: [ProductsModule, CompatibilityModule],
  controllers: [AiController],
  providers: [AiAgentService],
})
export class AiModule {}
