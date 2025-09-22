# RealCulture Backend — Prueba de Endpoints con cURL

_Usa la URL base ya en despliegue en Azure:_

> **https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net**

## Endpoints por módulo y ejemplo de cURL

---

## AUTH
### Registro
```bash
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan","email":"juan@email.com","password":"12345678"}'
```

### Login
```bash
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@email.com","password":"12345678"}'
```

### Login Google
```bash
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/auth/google-login" \
  -H "Content-Type: application/json" \
  -d '{"token":"GOOGLE_ID_TOKEN"}'
```

### Refresh y Logout (requiere JWT en Authorization)
```bash
# Refresh
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/auth/refresh" \
  -H "Authorization: Bearer TOKEN" 
# Logout
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/auth/logout" \
  -H "Authorization: Bearer TOKEN" 
```

### Perfil usuario (requiere JWT)
```bash
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/auth/me" \
  -H "Authorization: Bearer TOKEN" 
```

---
## USER

### Cr7ditos disponibles
```bash
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/user/credits" \
  -H "Authorization: Bearer TOKEN"
```
### Perfil
```bash
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/user/me" \
  -H "Authorization: Bearer TOKEN"
```
### Im7genes
```bash
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/user/images" \
  -H "Authorization: Bearer TOKEN"
```
### Actualizar cr7ditos (admin)
```bash
curl -X PATCH "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/user/admin/set-credits" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"credits":30}'
```
### Decrementar cr7ditos
```bash
curl -X PATCH "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/user/decrement-credits" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount":5}'
```
### Upgrade plan
```bash
curl -X PATCH "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/user/upgrade" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"newPlan":"PRO"}'
```

---
## CONTENT
```bash
# Crear contenido
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/content" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Mi Contenido","description":"..."}'
# Listar todo
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/content" -H "Authorization: Bearer TOKEN"
# Buscar por id
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/content/CONTENT_ID" -H "Authorization: Bearer TOKEN"
# Editar
curl -X PUT "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/content/CONTENT_ID" -H "Authorization: Bearer TOKEN" -d '{"title":"Nuevo Título"}'
# Eliminar
curl -X DELETE "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/content/CONTENT_ID" -H "Authorization: Bearer TOKEN"
```

---
## CREDITS
```bash
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/credits/buy" -H "Authorization: Bearer TOKEN" -d '{"amount":50}'
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/credits/available" -H "Authorization: Bearer TOKEN"
```
---
## GALLERY
```bash
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/gallery" -H "Authorization: Bearer TOKEN"
```
---
## RAG (Retrieval Augmented Generation)
```bash
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/rag/respond" -H "Content-Type: application/json" -d '{"prompt":"¿Qué hace el backend?"}'
```
---
## AI
```bash
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/ai/generate-promo" -H "Content-Type: application/json" -d '{"prompt":"Texto para IA promo"}'
```
---
## INFLUENCERS
```bash
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/influencers" -d '{"name":"Influencer X","extra":"..."}'
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/influencers"
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/influencers/INFLUENCER_ID"
```
---
## CREATORS
```bash
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/creators" -d '{"name":"CreatorX","email":"creator@email.com","password":"abcdef"}'
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/creators"
```
---
## HEALTH
```bash
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/health/ping"
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/health/db"
```
---
## PROMO-IMAGE (requiere JWT, descuenta créditos)
```bash
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/promo-image" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Promo para el producto X"}'
```

#repuesta
aleja@Daniela MINGW64 /c/MisyBot/RealCulture AI/backend (main)
$ curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/api/promo-image" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMGJjZDM0MC04YTA2LTRhMmYtYmU4Ny1mY2U0ZmQ2YjMxOGMiLCJlbWFpbCI6ImRlc2Fycm9sbG9AbWlzeWJvdC5jb20iLCJuYW1lIjoiQWxlamFuZHJvIiwicm9sZSI6IlBSTyIsImlhdCI6MTc1NjkwMzIyNCwiZXhwIjoxNzU2OTg5NjI0fQ.t3Jb5P4k_3MNiY0dNZMX4xPPYguUkvHur69fllNTRS4" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Diseña una imagen promocional de alta calidad para un producto tecnológico premium. El producto debe estar en el centro con iluminación suave y fondo minimalista en tonos claros. Añadir un estilo moderno tipo campaña publicitaria de Apple, con reflejos sutiles y enfoque profesional. La composición debe transmitir innovación, co  }'"plan": "PRO"vidad.",
{"success":true,"message":"✅ Imagen generada correctamente","result":{"imageUrl":"https://realculturestorage.blob.core.windows.net/images/promo_20250903124600921.png","prompt":"Diseña una imagen promocional de alta calidad para un producto tecnológico premium. El producto debe estar centrado en la composición, con simetría perfecta y líneas de fuga que dirijan la mirada hacia él. Utiliza un estilo visual minimalista y moderno, inspirado en campañas publicitarias de Apple, con una paleta de tonos claros y fondo urbano ligeramente desenfocado para aportar sofisticación. La iluminación debe ser suave pero intensa sobre el producto, generando reflejos sutiles y sombras delicadas que resalten sus detalles. El conjunto debe transmitir innovación, confianza y exclusividad, con un enfoque profesional y elegante.","imagePath":null,"filename":"promo_20250903124600921.png"},"credits":29440}
---
## MEDIA (requiere JWT, multi contenido)
```bash
# Image
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/media/image" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"prompt":"Describe una imagen divertida"}'
# Video
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/media/video" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"prompt":"Describe un video educativo"}'
# Voice
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/media/voice" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"prompt":"Texto para generar voz"}'
# Music
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/media/music" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"prompt":"Genera música para promo"}'
```
---
## AUDIO
```bash
# Generar audio
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/audio/generate" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"prompt":"Guion para audio IA","duration":"30s"}'
# Registrar audio generado
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/audio/complete" \
  -H "Content-Type: application/json" \
  -d '{"userId":"id_user","prompt":"Guion","audioUrl":"url_audio","duration":30}'
```
---
## VIDEO (requiere JWT, descuenta créditos)
```bash
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/video/generate" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"prompt":"Crea un video sobre cultura"}'
```

## PROMPT-JSON (requiere JWT, descuenta créditos)
```bash
curl -X POST "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/prompt-json" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create a JSON structure for a product catalog"}'
```

---
## OTROS ENDPOINTS ÚTILES
```bash
# Imágenes de usuario (galería)
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/media/images" -H "Authorization: Bearer TOKEN"
# Preview audio
y proxy
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/media/preview/NOMBRE_AUDIO"
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/media/proxy-image?url=https://URL_REMOTA"
# Imagen firmada (descarga segura)
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/media/signed-image/NOMBRE_IMAGEN"

# Consultar mis imágenes
y mi galería personal
data requiere paginación si hay muchas imágenes.
curl -X GET "https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net/media/my-images" -H "Authorization: Bearer TOKEN"
```
---

# ¿Están todos los endpoints?

- Revisar en "src/interfaces/controllers/*.ts" y documentar nuevos si aparecen.
- Revisar DTO requeridos para cada endpoint y probar con datos válidos.
- Faltaría documentar endpoints de WOMPI si están activos.
