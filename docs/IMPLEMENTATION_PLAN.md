# Plan de implementación

## Phase 0 — preservada

Commit aprobado `1d837ee6381c6afad32926ccbbb0b4bdf1844265`: fundación y modelo de referencia. Sus migraciones PostgreSQL se conservan para el futuro.

## Phase 1 — Firebase Auth e infraestructura (actual)

- Firebase Auth, Admin, Firestore y Emulator Suite, compatibles con Spark.
- Sesión HttpOnly validada server-side.
- Roles + permisos + custom claims compactos.
- Interfaces de repositorio y adaptadores Firebase.
- IDs humanos transaccionales e idempotentes.
- reglas e índices, pruebas de ataque y CI.
- login y shell CRM responsive de fundación.
- documentación Firebase/Vercel y ruta futura a Supabase.

Criterio de salida: gates locales y smoke tests del proyecto DEV real pasan o se reporta un bloqueo externo verificable. No incluye módulos funcionales ni deploy.

El almacenamiento binario jurídico, Cloud Functions, Identity Platform y MFA están diferidos por política de nivel gratuito. Firestore conserva únicamente metadata de documentos; no almacena PDFs, DOCX, imágenes ni otros binarios.

## Phase 2 — sitio público (implementada en esta rama)

- Diez rutas públicas, sistema visual responsive, navegación y contenido confirmado.
- SEO técnico, Metadata API, canonical, sitemap, robots, breadcrumbs, JSON-LD y OG generado.
- Formularios de consulta/contacto con React Hook Form + Zod, sin red ni persistencia.
- Playwright desktop/mobile y matriz de 10 breakpoints en todas las rutas.
- Despliegue controlado a Vercel desde el commit final de la rama Phase 2.

## Phase 3 — bloqueada hasta aprobación

Siguiente alcance recomendado: intake real de consulta/contacto hacia Firestore, auditoría y notificación segura. Después podrán planificarse como alcances separados: consultas; clientes; expedientes; documentos; agenda; CMS; administración; reportes; hardening y lanzamiento.

## Restricciones vigentes

- Backend actual Firebase Spark; Supabase/PostgreSQL futuro.
- Billing deshabilitado; no Blaze, Storage, Cloud Functions, Identity Platform, SMS ni servicios pay-as-you-go.
- Hosting Vercel; no Firebase Hosting.
- Solo despliegue controlado `.vercel.app`; sin dominio personalizado ni DNS.
- Sin merge a main.
- Sin dashboard/CRUD ni persistencia pública en esta fase.
