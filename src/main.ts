import * as appInsights from 'applicationinsights';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

// Inicialización Azure Application Insights
appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY || '<TU-INSTRUMENTATION-KEY>')
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectDependencies(true)
  .setAutoCollectExceptions(true)
  .setSendLiveMetrics(true)
  .setUseDiskRetryCaching(true)
  .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
  .start();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
    }),
  );

  // Enhanced CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4200',
      'https://misybot.com',
      'https://www.misybot.com',
      'https://realculture.misybot.com',
      'https://realculture-app.azurewebsites.net',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    exposedHeaders: 'Authorization',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('RealCulture AI API')
    .setDescription('API documentation for the RealCulture AI platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('user', 'User management endpoints')
    .addTag('media', 'Media generation and management endpoints')
    .addTag('content', 'Content management endpoints')
    .addTag('health', 'Health check endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Verificación conexión DB
  const dataSource = app.get(DataSource);
  if (dataSource.isInitialized) {
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } else {
    console.error('❌ Fallo al conectar a la base de datos.');
  }

  // Mostrar rutas disponibles
  const httpAdapter = app.getHttpAdapter();
  const server = httpAdapter.getInstance();
  const availableRoutes: { path: string; methods: string[] }[] = [];
  if (server && server._router && Array.isArray(server._router.stack)) {
    server._router.stack.forEach((layer) => {
      if (layer.route && layer.route.path) {
        availableRoutes.push({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods),
        });
      }
    });
    console.log('Available backend endpoints:', availableRoutes);
  } else {
    console.log('No routes detected (Express _router not found)!');
  }

  // Puerto dinámico para evitar conflictos
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend listo en http://localhost:${port}`);
  console.log(`📚 Swagger UI disponible en http://localhost:${port}/api/docs`);
  console.log(`✅ CORS habilitado para: https://misybot.com y otros orígenes configurados.`);
}

// Solo una vez
bootstrap();