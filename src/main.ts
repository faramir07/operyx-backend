import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters';
import { ResponseInterceptor } from './common/interceptors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
bootstrap();
