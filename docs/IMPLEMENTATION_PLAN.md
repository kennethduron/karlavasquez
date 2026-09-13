# Plan de implementación

## Phase 0 — preservada

Commit aprobado `1d837ee6381c6afad32926ccbbb0b4bdf1844265`: fundación y modelo de referencia. Sus migraciones PostgreSQL se conservan para el futuro.

## Phase 1 — Firebase Auth e infraestructura (actual)

- Firebase Auth, Admin, Firestore, Storage y Emulator Suite.
- Sesión HttpOnly validada server-side.
- Roles + permisos + custom claims compactos.
- Interfaces de repositorio y adaptadores Firebase.
- IDs humanos transaccionales e idempotentes.
- reglas e índices, pruebas de ataque y CI.
- login y shell CRM responsive de fundación.
- documentación Firebase/Vercel y ruta futura a Supabase.

Criterio de salida: gates locales pasan o se reporta un bloqueo externo real. No requiere proyecto Firebase real para completar arquitectura/emuladores. No incluye módulos funcionales ni deploy.

## Phase 2 — requiere aprobación explícita

El siguiente trabajo recomendado es el sitio público esencial y su sistema visual final, pero **no debe comenzar** sin revisión y aprobación de esta Phase 1.

Después podrán planificarse, cada uno como alcance separado: intake; consultas; clientes; expedientes; documentos; agenda; CMS; administración; reportes; hardening y lanzamiento.

## Restricciones vigentes

- Backend actual Firebase; Supabase/PostgreSQL futuro.
- Hosting Vercel; no Firebase Hosting.
- Sin deploy de producción ni conexión de dominio.
- Sin merge a main.
- Sin Home/dashboard/CRUD completos en esta fase.
