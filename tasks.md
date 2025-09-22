# Tasks: Estado y Pendientes del Backend

## Lo que está listo
- Arquitectura modular NestJS funcional
- Repositorios y servicios para usuarios, contenidos, influencers y galería
- Integración y gestión de Azure Blob (upload, delete, signed URLs)
- Generación de media por IA y microservicio externo (audio, imagen, video)
- CRUD de contenidos y usuarios
- Gestión y decremento de créditos de usuario
- Upgrade de planes de usuario (básico, creator, PRO)
- Validación de subtítulos SRT y utilitarios core para assets
- Logging extendido en media/video
- Utilitario waitForBlobAvailable (para flujo de video recomendable)

## Lo que falta / en progreso
- [ ] Restaurar 100% login/registro (verificar logs, flows y conectar front-back)
- [ ] Validar reglas CORS/VNET y conectividad entre componentes
- [ ] Integrar y robustecer fallback de MediaBridgeService para video
- [ ] Validar con logging el JSON final de respuesta en VideoService
- [ ] Pruebas end-to-end de todos los métodos de autenticación
- [ ] Pendiente documentación de endpoints y flujos para referencia rápida
- [ ] Refactor de algunos controladores para mejor reporting/fallo
- [ ] Confirmar reglas de VNET Azure en despliegue
- [ ] Revisar/expandir hooks de validación en controladores multimedia

## Referencia de contexto
- Consultar archivo CONTEXT-BACKEND.md para arquitectura y lógica central
- video-task.md para tareas y contexto específico de VideoService/media
---
*Actualiza este archivo solo con avances significativos, bloqueos o tareas nuevas. Marca con [x] lo que esté completado y mantén prioridades visibles.*

