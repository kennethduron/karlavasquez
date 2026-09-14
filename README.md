# Karla Norin Vásquez — plataforma legal

Sitio público y fundación autenticada del bufete jurídico. Esta rama corresponde exclusivamente a **KNV Phase 2** y conserva intacta la infraestructura aprobada de Phase 1.

## Plataforma vigente

- Backend actual: Firebase Spark (billing deshabilitado)
- Datos: Cloud Firestore
- Identidad: Firebase Authentication
- Binarios jurídicos: diferidos por política Spark; Firestore conserva solo metadata
- Hosting: Vercel (no Firebase Hosting)
- Backend futuro: Supabase/PostgreSQL

No hay registro público. El panel usa una cookie de sesión `HttpOnly` emitida después de validar un ID token con Firebase Admin. Los formularios públicos de consulta y contacto solo validan datos en el navegador: no escriben en Firestore, no envían correo y no crean una relación abogado-cliente. La persistencia pertenece a Phase 3.

## Desarrollo

Requisitos: Node.js 22.12+, Java 21+ y npm.

```bash
npm ci
copy .env.example .env.local
npm run firebase:emulators
npm run dev
```

Los emuladores permiten validar Auth y Firestore sin credenciales reales. `test:firebase:real` crea una identidad huérfana temporal en DEV, comprueba que Rules niega acceso y elimina la cuenta en el mismo proceso. Para un proyecto Firebase real deben configurarse las variables documentadas en `.env.example`; nunca se versionan secretos. Cloud Storage y Cloud Functions no forman parte del runtime actual.

## Validación

```bash
npm run format:check
npm run typecheck
npm run lint
npm test
npm run test:rules
npm run test:e2e
npm run test:e2e:firebase
npm run test:firebase:real # manual; requiere .env.local y usa solo DEV
npm run test:firebase:real:roles # manual; límites reales de las cuatro personas
npm run test:firebase:real:session # manual; requiere Firebase Admin local
npm run firebase:seed:authorization # manual; solo DEV, Admin server-only
npm run security:check
npm run build
```

## Documentación

- [Arquitectura actual](docs/ARCHITECTURE.md)
- [Arquitectura Firebase](docs/FIREBASE_ARCHITECTURE.md)
- [Modelo Firestore](docs/DATABASE.md)
- [Autenticación](docs/AUTHENTICATION.md)
- [Autorización](docs/AUTHORIZATION.md)
- [Seguridad](docs/SECURITY.md)
- [Entornos](docs/ENVIRONMENTS.md)
- [Migración futura a Supabase](docs/FUTURE_SUPABASE_MIGRATION.md)
- [Plan](docs/IMPLEMENTATION_PLAN.md)
- [Sitio público](docs/PUBLIC_SITE.md)
- [Despliegue controlado en Vercel](docs/VERCEL_DEPLOYMENT.md)
