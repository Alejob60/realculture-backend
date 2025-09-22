#!/bin/bash
# Script para probar los endpoints clave del backend en Azure
BASE_URL=https://realculture-backend-g3b9deb2fja4b8a2.canadacentral-01.azurewebsites.net

ENDPOINTS=(
  "/auth/login"
  "/auth/register"
  "/auth/google-login"
  "/auth/me"
  "/content"
  "/user/me"
  "/gallery"
  "/media"
  "/video"
  "/health"
  "/promo-image"
  "/influencer"
  "/rag"
)

for endpoint in "${ENDPOINTS[@]}"; do
  echo "\nTesting $BASE_URL$endpoint"
  curl -i --max-time 5 "$BASE_URL$endpoint"
  sleep 1
done
