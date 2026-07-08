import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NeoHW API')
    .setDescription(
      'Documentación completa de la API REST de NeoHW — plataforma de e-commerce especializada en hardware y componentes de PC.\n\n' +
      '**Autenticación:**\n' +
      '- Bearer Token (JWT) para la mayoría de endpoints protegidos.\n' +
      '- Cookie `refresh_token` para refrescar y cerrar sesión.\n\n' +
      '**Stripe Webhook:** `/api/v1/payments/stripe/webhook` — usado por Stripe para notificar pagos completados.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refresh_token')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/api-docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;

  await app.listen(port);
}

void bootstrap();
