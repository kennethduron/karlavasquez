# Arquitectura KNV

## Decisión vigente

| Responsabilidad           | Tecnología actual               | Objetivo futuro                |
| ------------------------- | ------------------------------- | ------------------------------ |
| Aplicación web y hosting  | Next.js en Vercel               | Vercel                         |
| Autenticación             | Firebase Authentication         | Por evaluar en migración       |
| Datos                     | Cloud Firestore                 | Supabase/PostgreSQL            |
| Archivos jurídicos        | Firebase Storage + servidor     | Storage privado compatible     |
| Operaciones privilegiadas | Firebase Admin SDK, server-only | Adaptador Supabase server-only |

`CURRENT_BACKEND = Firebase`. `FUTURE_BACKEND = Supabase/PostgreSQL`. Las migraciones de Phase 0 se conservan como referencia histórica y no participan del runtime actual.

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
Auth / Firestore / Storage / Admin SDK
```

- `src/domain` contiene entidades y contratos sin tipos Firebase.
- `src/services` implementa autorización y casos de uso server-side.
- `src/infrastructure/firebase` encapsula SDKs y adaptadores.
- `src/app` y `src/features` consumen servicios, nunca distribuyen consultas Firestore por los componentes.
- Los tipos públicos usan `string`, `Date` y DTOs del dominio; no exponen `DocumentSnapshot`, `DocumentReference` ni `Timestamp`.

Esta frontera permite crear adaptadores `Supabase*Repository` futuros sin reconstruir la UI o la lógica del dominio.

## Superficies de Phase 1

- Login, recuperación, cambio de contraseña y logout reales con Firebase Auth.
- Intercambio de ID token por cookie de sesión segura.
- Panel protegido en servidor y shell responsive de fundación.
- Repositorios para usuarios, consultas, clientes, expedientes, notas, documentos, tareas, eventos, roles y auditoría.
- Reglas e índices de Firestore; reglas privadas de Storage.
- Emulator Suite y pruebas de ataques por rol.

No incluye dashboard funcional, Home completa ni módulos CRUD. No se despliega ni conecta dominio en esta fase.

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
- Reglas Firestore/Storage, emuladores y pruebas de ataque.

No se hizo cherry-pick ni merge del commit Supabase.
