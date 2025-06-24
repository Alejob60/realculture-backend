import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  // Cargar variables de entorno
  dotenv.config();

  // Crear la aplicación
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Seguridad con cabeceras HTTP
  app.use(helmet());

  // Habilitar CORS de forma controlada (ajusta esto en producción)
  app.enableCors({
    origin: ['http://localhost:3000'], // Cambiar por dominio de frontend en producción
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.use(cookieParser());

  // Protección contra abuso con rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // Máximo 100 peticiones por IP
      message: '⚠️ Demasiadas solicitudes. Intenta nuevamente en unos minutos.',
    }),
  );

  // Servir archivos estáticos desde la carpeta public
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Verificar conexión a base de datos
  const dataSource = app.get(DataSource);
  if (dataSource.isInitialized) {
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } else {
    console.error('❌ Fallo al conectar a la base de datos.');
  }

  // Levantar el servidor en el puerto especificado
  await app.listen(process.env.PORT || 3001);
  console.log(
    `🚀 Backend listo en http://localhost:${process.env.PORT || 3001}`,
  );
}

bootstrap();
