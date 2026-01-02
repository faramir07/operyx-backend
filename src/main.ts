import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters';
import { ResponseInterceptor } from './common/interceptors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'], // Solo mostrar logs, errores y warnings (no SQL)
  });
  const configService = app.get(ConfigService);

  // Configurar CORS para permitir requests desde la app móvil
  const nodeEnv = configService.get<string>('nodeEnv');
  const frontendUrl = configService.get<string>('frontendUrl');

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // En desarrollo, permitir todas las conexiones (incluye móvil con IP local)
      if (nodeEnv === 'development') {
        callback(null, true);
        return;
      }
      // En producción, solo permitir el frontend configurado
      if (!origin || origin === frontendUrl) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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

  // Configurar Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Operyx API')
    .setDescription(
      'API para gestión de producción de fábrica de medias. Sistema completo para administrar inventario, órdenes de producción y control de calidad.',
    )
    .setVersion('1.0')
    .addTag('threads', 'Gestión de inventario de hilos y materiales')
    .addTag('suppliers', 'Gestión de proveedores')
    .addTag('product-specs', 'Gestión de fichas técnicas de medias')
    .addTag('machines', 'Gestión de maquinaria de producción')
    .addTag('production-orders', 'Gestión de órdenes de producción')
    .addTag('finished-socks', 'Gestión de inventario de medias terminadas')
    .addTag('packaging', 'Gestión de inventario de empaques')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('port');
  await app.listen(port || 3000);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation available at: http://localhost:${port}/api/docs`,
  );
}
bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
