import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters';
import { ResponseInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configurar CORS para permitir requests desde la app móvil
  app.enableCors({
    origin: configService.get<string>('frontendUrl'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configurar interceptors globales
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Configurar exception filters globales
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = configService.get<number>('port');
  await app.listen(port || 3000);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
