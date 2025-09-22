# CONTEXTO DETALLADO DEL BACKEND

## Descripción General
Este proyecto está construido sobre el framework NestJS y ofrece una arquitectura modular para un backend que soporta funcionalidades de:
- Autenticación y gestión de usuarios (login, registro, Google OAuth, manejo de tokens y refresco)
- Creación y gestión de creadores, influencers y productos
- Generación y administración de contenidos multimedia: imágenes, audio y video mediante servicios de IA y microservicios externos
- Manejo avanzado de galería de usuario y créditos (monetización)
- Integración con Azure Blob Storage para subida, validación, y entrega segura de archivos mediante URLs SAS
- Utilidades específicas como generación de subtítulos SRT, validadores de blobs, y logging extendido

## Principales Módulos
- **AuthModule**: Módulo de autenticación, registro/login de usuario, OAuth con Google, manejo seguro de refresh tokens.
- **ContentModule**: Gestor principal de contenidos (CRUD), indexados por usuario y por creador.
- **MediaModule, AudioModule, VideoModule**: Cada uno orquesta la lógica y el flujo para tipos de media generados vía IA y microservicios externos.
- **GalleryModule**: Permite consultar la galería personal del usuario dentro del tiempo de suscripción, generación de previews y SAS URLs.
- **DatabaseModule**: Abstracción y configuración para los repositorios via TypeORM y conexión con Postgres.
- **AzureBlobModule**: Servicio y utilidades para interactuar con Azure Storage (upload, delete, signed URL).

## Servicios Destacados
- **AiService**: Genera audio, promocionales y subtítulos mediante IA/external API.
- **MediaBridgeService**: Encapsula integración con microservicio externo para media (video, audio, imágenes, con timeout extendido y logging de fallos/reintentos).
- **ContentService/UseCase**: La lógica de alto nivel para la persistencia y registro de contenido por usuario y tipo.
- **UserService**: Gestor de créditos, upgrades de plan, consultas por email/id.
- **GalleryService**: Orquesta la entrega de blobs mediante generación de SAS.
- **PromoImageService**: Flujo de generación y entrega de imágenes promocionales IA.
- **RagService**: Orquesta queries contextuales a Azure Search y generación AI (RAG).

## Utilidades
- Validador de blob (`waitForBlobAvailable` con reintentos y log) usado en el flujo de video para asegurar que el asset existe antes de generar URL SAS.
- Generador de subtítulos SRT para videos a partir de texto.
- Custom logging y manejo extenso de errores/fallback en media.

## Roadmap/Tareas
Documentado en `tasks.md` y `video-task.md`:
- Restaurar login/registro operativo y conectividad con frontend
- Validar flujos CORS/VNET
- Mejoras en VideoService (timeout/fallback, logging en JSON de respuesta, validador de blob, integración completa)
- Detallar fragmentos clave de media y video (ver archivo video-task.md)

## Estado General
- Backend restaurado y la autenticación está en proceso
- Flujos de generación de media operativos pero requieren mejoras de logging y validación
- VideoService y MediaBridgeService en proceso de upgrade para robustez y fallback
- Créditos, upgrades de usuario y galería funcionales
- Documentación por módulos lista para futuras consultas

---
*Este archivo resume el estado actual y la arquitectura del backend. Actualízalo cada vez que se complete o modifique un módulo importante.*
