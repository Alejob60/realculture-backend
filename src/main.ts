import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import helmet from 'helmet';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Configuración de Helmet (primero)
  // Se ajusta para que no interfiera con políticas de origen cruzado que gestionaremos nosotros.
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
    }),
  );

  // 2. Configuración de CORS (muy explícita)
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
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept',
    preflightContinue: false,
    optionsSuccessStatus: 204, // Responde con 204 a las peticiones OPTIONS (preflight)
  });

  // 3. Pipes Globales
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 4. Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('RealCulture AI API')
    .setDescription('The RealCulture AI API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 5. Assets estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // 6. Verificación de la Base de Datos
  const dataSource = app.get(DataSource);
  if (dataSource.isInitialized) {
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } else {
    console.error('❌ Fallo al conectar a la base de datos.');
  }

  // 7. Iniciar la aplicación
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend listo en http://localhost:${port}`);
  console.log(`✅ CORS habilitado para: https://misybot.com y otros orígenes configurados.`);
}

bootstrap();