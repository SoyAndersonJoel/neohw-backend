import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { ProductsModule } from './modules/products/products.module';
import { ProductAttributesModule } from './modules/product-attributes/product-attributes.module';
import { CompatibilityModule } from './modules/compatibility/compatibility.module';
import { McpModule } from './modules/mcp/mcp.module';
import { AiModule } from './modules/ai/ai.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { StorageModule } from './modules/storage/storage.module';
import { CartsModule } from './modules/carts/carts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    AttributesModule,
    ProductsModule,
    ProductAttributesModule,
    CompatibilityModule,
    McpModule,
    AiModule,
    OrdersModule,
    PaymentsModule,
    StorageModule,
    CartsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
