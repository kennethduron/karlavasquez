# Arquitectura KNV

## Decisión vigente

| Responsabilidad           | Tecnología actual               | Objetivo futuro          |
| ------------------------- | ------------------------------- | ------------------------ |
| Aplicación web y hosting  | Next.js en Vercel               | Vercel                   |
| Autenticación             | Firebase Authentication         | Supabase Auth            |
| Datos                     | Cloud Firestore                 | Supabase/PostgreSQL      |
| Metadata de documentos    | Cloud Firestore                 | Supabase/PostgreSQL      |
| Binarios jurídicos        | Diferidos por política Spark    | Supabase Storage privado |
| Media pública             | Assets estáticos                | Cloudinary               |
| Notificaciones push       | No activas                      | Firebase Cloud Messaging |
| Email transaccional       | Diferido                        | Resend                   |
| Backups externos          | Diferidos                       | Backblaze B2 privado     |
| Operaciones privilegiadas | Firebase Admin SDK, server-only | Adaptadores server-only  |

`CURRENT_BACKEND = Firebase Spark`. `BILLING = DISABLED`. `FUTURE_BACKEND = Supabase/PostgreSQL`. Las migraciones de Phase 0 se conservan como referencia histórica y no participan del runtime actual. Firebase Storage y Cloud Functions no se usan.

Phase 2.4A prepara contratos y configuración, pero no activa ningún proveedor
nuevo en el runtime. Los puertos de Auth, base de datos, documentos privados,
media pública, push, email y backups están centralizados en
`src/domain/integration-ports.ts`. Véase
`docs/INFRASTRUCTURE_PHASE_2_4A.md` para el inventario y los límites de fase.

## Capas obligatorias

```text
React / Route Handlers
          ↓
Application services
          ↓
Domain repository interfaces
          ↓
Firebase adapters
          ↓
Auth / Firestore / Admin SDK
```

- `src/domain` contiene entidades y contratos sin tipos Firebase.
- `src/services` implementa autorización y casos de uso server-side.
- `src/infrastructure/firebase` encapsula SDKs y adaptadores.
- `src/app` y `src/features` consumen servicios, nunca distribuyen consultas Firestore por los componentes.
- Los tipos públicos usan `string`, `Date` y DTOs del dominio; no exponen `DocumentSnapshot`, `DocumentReference` ni `Timestamp`.

Esta frontera permite crear adaptadores `Supabase*Repository` futuros sin reconstruir la UI o la lógica del dominio.

## Superficies vigentes

- Login, recuperación, cambio de contraseña y logout reales con Firebase Auth.
- Intercambio de ID token por cookie de sesión segura.
- Panel protegido en servidor y shell responsive de fundación.
- Repositorios para usuarios, consultas, clientes, expedientes, notas, documentos, tareas, eventos, roles y auditoría.
- Reglas e índices de Firestore compatibles con Spark.
- Metadata conceptual de documentos; almacenamiento binario diferido.
- Emulator Suite y pruebas de ataques por rol.
- Sitio público estático por defecto, con contenido centralizado y Metadata API.
- Componentes cliente limitados al drawer, filtros y validación local de formularios.
- Vercel como único hosting; Firebase Hosting continúa ausente.

No incluye dashboard funcional, módulos CRUD ni persistencia de formularios públicos. El despliegue de validación autorizado usa `bufetekarlavasquez.vercel.app`; el dominio personalizado no se conecta.

## Reutilización auditada de la Phase 1 Supabase

### A. Reutilizado por ser backend-agnostic

- Base visual del login y shell CRM.
- CSS responsive, accesibilidad y estados loading/error/forbidden.
- Esquemas Zod de credenciales y sus pruebas.
- Configuración genérica de Playwright y CI, adaptada a emuladores.

### B. No reutilizado por ser específico de Supabase

- Clientes browser/server/admin de Supabase.
- Supabase Auth SSR, refresco de sesión, callback PKCE y MFA específico.
- Runtime RLS, service-role, acceso a Storage y migración activa de Phase 1.
- Dependencias `@supabase/ssr` y `@supabase/supabase-js`.

### C. Reimplementado para Firebase

- Login/logout/recuperación, sesión server-side y guardas.
- Roles, permisos, custom claims y estado de cuenta.
- Repositorios, IDs humanos, auditoría y documentos privados.
- Reglas Firestore, emuladores Auth/Firestore y pruebas de ataque.

No se hizo cherry-pick ni merge del commit Supabase.
