# Video Task

## Objetivo
Documentar todo lo que se va a hacer con el servicio de video, registrar el contexto y guardar los fragmentos clave y utilitarios asociados a la validación de blobs y generación de URLs SAS, flujo de respuesta y logging.

---

## Tareas / Roadmap

1. 
**Contexto actual del VideoService**
   - Generación de video en backend vía microservicio externo
   - Descuento de créditos
   - Generación de subtítulos (SRT)
   - Subida de blobs y validación de existencia antes de SAS
   - Respuesta JSON final detallada
   - Logging extendido en cada función del flujo

2. 
**Pendiente/resuelto por implementar**
   - [x] Crear utilitario waitForBlobAvailable con reintentos, logging por intento y error si se agota tiempo
   - [x] Actualizar VideoService para usar el utilitario antes de obtener URLs SAS
   - [x] Guardar todos los fragmentos actualizados en este archivo para referencia y restauración
   - [x] Mejorar MediaBridgeService con timeout extendido y logging de reintento/error
   - [ ] Integrar fallback de verificación de blob si el microservicio con timeout no responde pero el blob potencialmente existe
   - [ ] Validar y loguear el JSON FINAL que retorna el videoService en la respuesta al frontend

---

## Códigos actuales (antes de upgrade)

### Fragmento core generateVideo (flujo simplificado)

```typescript
async generateVideo(dto: GenerateVideoDto, userId: string): Promise<any> {
  // Descuento de créditos, generación de payload y request al microservicio
  // ...
  // Subida y generación de subtítulo, obtención de SAS
  // ...
  // Retorno final
  return {
    success: true,
    message: 'Video generado con éxito',
    data: {
      videoUrl: result.videoUrl,
      audioUrl: result.audioUrl,
      subtitleUrl: signedSubtitleUrl,
      duration: result.duration,
      script: result.script,
    }
  };
}
```

---

### Logging extendido (última versión)

```typescript
this.logger.log(`[generateVideo] INICIO - user: ${userId}, prompt: ${dto.prompt}`);
this.logger.log(`[generateVideo] Respuesta microservicio: ${JSON.stringify(result)}`);
// Por cada paso principal y error
```

---

**Pendientes por agregar**
- Utilitario waitForBlobAvailable (asincrónico, con reintentos y logs)
- Fragmento actualizado del servicio usando el utilitario
- Ejemplo de JSON final retornado al frontend y logs asociados
- Mejoras de timeout y fallback en MediaBridgeService

