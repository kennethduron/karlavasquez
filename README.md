# Karla Norin Vásquez — Bufete Legal

Fundación de una plataforma integrada con sitio público y CRM jurídico privado para Honduras.

> Estado: **Fase 1**. Identidad, autenticación y shell privado implementados localmente. No contiene todavía el sitio público ni los módulos funcionales del CRM.

## Stack

- Next.js App Router, React, TypeScript strict y Tailwind CSS
- Supabase PostgreSQL, Auth, Storage privado y Row Level Security
- Zod, React Hook Form, Vitest y Playwright
- Zona operativa: `America/Tegucigalpa`

## Desarrollo local

Requisitos: Node.js 22.12 o superior y npm.

```bash
npm ci
copy .env.example .env.local
npm run dev
```

La aplicación compila sin credenciales para validar la fundación. Auth, formularios y datos requieren un proyecto Supabase dedicado configurado en `.env.local`.

La conexión de infraestructura y las migraciones remotas no se ejecutan sin credenciales explícitas. Consulte [Entornos](docs/ENVIRONMENTS.md) y [Autenticación](docs/AUTHENTICATION.md).

## Controles de calidad

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Las pruebas E2E requieren instalar el navegador de Playwright y se ejecutan con `npm run test:e2e`.

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [Base de datos](docs/DATABASE.md)
- [Autorización y RLS](docs/AUTHORIZATION.md)
- [Seguridad](docs/SECURITY.md)
- [Rutas](docs/ROUTES.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Plan de implementación](docs/IMPLEMENTATION_PLAN.md)
- [Entornos](docs/ENVIRONMENTS.md)
- [Autenticación](docs/AUTHENTICATION.md)

## Seguridad

No agregue secretos al repositorio. La service role de Supabase es exclusivamente server-side. Los documentos legales usan bucket privado y acceso temporal autorizado.
