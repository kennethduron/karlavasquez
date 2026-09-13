# Arquitectura Firebase

## SDKs y aislamiento

El cliente Firebase se inicializa desde variables `NEXT_PUBLIC_FIREBASE_*`; estos identificadores son configuración pública, no credenciales administrativas. Auth usa persistencia en memoria: la autorización durable reside en la cookie de sesión del servidor.

Firebase Admin vive en módulos `server-only`. En Vercel usa `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` y `FIREBASE_PRIVATE_KEY`; en emuladores admite credenciales de aplicación locales. `getApps()` evita inicializaciones duplicadas durante hot reload y en procesos serverless.

## Flujo de sesión

```text
email/password → Firebase ID token → POST /api/auth/session
→ verifyIdToken(revoked=true) → perfil/claims válidos
→ createSessionCookie → cookie HttpOnly → validación server-side en /panel
```

La cookie `knv_session` es `HttpOnly`, `SameSite=Lax`, `Secure` en producción y expira en cinco días. El endpoint exige origen propio y autenticación reciente. Cada acceso privado verifica firma, revocación, cuenta activa, roles y versión de permisos. El proxy solo hace una redirección optimista por presencia de cookie; nunca sustituye la verificación del servidor.

Logout revoca refresh tokens y elimina la cookie. Cuentas deshabilitadas fallan tanto en Auth como por el estado del perfil.

## Claims y documentos de autorización

Los custom claims contienen únicamente:

- `roleKeys`: lista corta de roles;
- `permissionVersion`: versión de la política.

La matriz completa vive en documentos `roles`. El perfil guarda un espejo `effectivePermissions` para Security Rules. El servicio server-side recompone permisos desde roles, exige que versión y espejo coincidan y falla cerrado. Los claims están muy por debajo del límite documentado de 1,000 bytes y nunca guardan PII ni una matriz extensa.

Al cambiar roles se deben actualizar perfil y claims, incrementar la versión cuando cambie la política y revocar tokens. Así Auth, Rules y el servidor convergen sin convertir los claims en fuente única de verdad.

## Firestore y repositorios

Firestore se usa con agregados propios del documento, no como traducción de las 41 tablas SQL. Hay 21 colecciones raíz de aplicación, además de dos colecciones internas de infraestructura:

1. `users`
2. `roles`
3. `permissions`
4. `consultations`
5. `clients`
6. `cases`
7. `notes`
8. `documents`
9. `tasks`
10. `events`
11. `reminders`
12. `notifications`
13. `auditLogs`
14. `practiceAreas`
15. `legalServices`
16. `articles`
17. `siteSettings`
18. `notificationPreferences`
19. `contactSubmissions`
20. `documentCategories`
21. `consents`

Auxiliares: `counters` y `idempotencyKeys`. Por ello `FIRESTORE_COLLECTION_COUNT = 21 application + 2 infrastructure`.

Los índices compuestos versionados cubren listados por estado/fecha, responsables, cliente, asignaciones, agenda, notificaciones, artículos y auditoría. Se añadirán índices solo al implementar consultas reales de fases posteriores.

## IDs humanos

Consulta `CON-YYYY-NNNN`, cliente `CLI-YYYY-NNNN` y expediente `KNV-YYYY-NNNN` se asignan en servidor dentro de una transacción Firestore. La misma transacción incrementa un contador anual y registra una clave de idempotencia con hash SHA-256. Reintentos devuelven el mismo documento; concurrencia serializa el contador. El navegador nunca usa `count() + 1`.

## Auditoría

`FirebaseAuditRepository` usa Admin SDK y escribe actor UID, acción, tipo/ID de entidad, timestamp de servidor, resultado, request ID y metadata sanitizada. Las reglas deniegan create/update/delete directo; usuarios con `audit.view` solo leen. Metadata no debe incluir tokens, contenido jurídico ni datos personales innecesarios.

## Archivos privados

La ruta técnica es `private-legal-documents/{caseId}/{documentId}/{versionId}` sin nombres personales. Las reglas requieren usuario activo, permisos, relación de expediente y metadata consistente; limitan a PDF/JPEG/PNG/DOCX y 25 MiB.

El flujo preferente de lectura es `GET /api/documents/{id}/content`: sesión HttpOnly → PermissionService → expediente asignado → Admin Storage → streaming `private, no-store`. No se usa `getDownloadURL()` ni un token público persistente. El upload completo, validación de firma mágica y antivirus pertenecen a la fase de documentos.

## Vercel

No existe configuración Firebase Hosting. Next.js es compatible con Vercel, con objetivo temporal deseado `bufetekarlavasquez.vercel.app` si está disponible y dominio futuro `bufetekarlavasquez.com`. Esta fase no crea ni despliega esos recursos.

Una blocking function de Identity Platform se versiona exclusivamente para impedir self-signup directo. No aloja Next.js ni reemplaza Vercel; requiere activación y despliegue explícitos en el proyecto Firebase real.
