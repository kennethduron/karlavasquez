# Mapa de rutas

Las rutas son objetivo arquitectónico. En Fase 1 están implementados el acceso y el shell protegido; los módulos operativos siguen pendientes.

## Identidad y acceso

| Ruta                     | Acceso                                 | Estado             |
| ------------------------ | -------------------------------------- | ------------------ |
| `/iniciar-sesion`        | Público                                | Implementada       |
| `/recuperar-acceso`      | Público                                | Implementada       |
| `/auth/callback`         | Enlace firmado de Supabase             | Implementada       |
| `/actualizar-contrasena` | Sesión de recuperación                 | Implementada       |
| `/verificar-mfa`         | Sesión AAL1 con factor registrado      | Implementada       |
| `/panel`                 | Perfil activo; AAL2 cuando corresponde | Shell implementado |
| `/panel/seguridad`       | Perfil activo                          | Implementada       |

## Sitio público

| Ruta                                             | Propósito                   | Render futuro                              |
| ------------------------------------------------ | --------------------------- | ------------------------------------------ |
| `/`                                              | Inicio                      | Público, SEO, cacheable                    |
| `/sobre-karla`                                   | Perfil profesional y bufete | Público, SEO                               |
| `/areas-de-practica`                             | Índice de áreas             | Público, CMS                               |
| `/areas-de-practica/[area]`                      | Área jurídica               | Público, CMS                               |
| `/areas-de-practica/[area]/[servicio]`           | Servicio confirmado         | Público, CMS                               |
| `/areas-de-practica/derecho-de-familia`          | Familia                     | Alias canónico generado por CMS            |
| `/areas-de-practica/derecho-de-familia/divorcio` | Divorcio                    | Servicio, sin inventar asesoría automática |
| `/solicitar-consulta`                            | Intake inicial              | Público, dinámico y anti-spam              |
| `/recursos`                                      | Recursos jurídicos          | Público, SEO                               |
| `/recursos/[slug]`                               | Artículo/recurso            | Público si publicado                       |
| `/contacto`                                      | Contacto general            | Público, anti-spam                         |
| `/privacidad`                                    | Política de privacidad      | Público                                    |
| `/aviso-legal`                                   | Aviso legal                 | Público                                    |

## Autenticación

| Ruta                     | Propósito                          |
| ------------------------ | ---------------------------------- |
| `/iniciar-sesion`        | Login interno, sin registro        |
| `/recuperar-acceso`      | Solicitud de recuperación          |
| `/actualizar-contrasena` | Completar recuperación autenticada |
| `/auth/callback`         | Intercambio seguro de código Auth  |

## CRM

| Ruta                                | Permiso base                        |
| ----------------------------------- | ----------------------------------- |
| `/panel`                            | `dashboard.view`                    |
| `/panel/consultas`                  | `consultations.view`                |
| `/panel/consultas/[consultationId]` | `consultations.view` + RLS          |
| `/panel/clientes`                   | `clients.view`                      |
| `/panel/clientes/[clientId]`        | `clients.view` + RLS                |
| `/panel/expedientes`                | `cases.view`                        |
| `/panel/expedientes/[caseId]`       | `cases.view` + asignación/RLS       |
| `/panel/agenda`                     | `events.view`                       |
| `/panel/tareas`                     | `tasks.view`                        |
| `/panel/documentos`                 | `documents.view` + RLS              |
| `/panel/reportes`                   | `reports.view`                      |
| `/panel/sitio`                      | `cms.view`                          |
| `/panel/sitio/articulos`            | `cms.view`                          |
| `/panel/administracion`             | permiso de gobierno correspondiente |
| `/panel/administracion/usuarios`    | `users.manage`                      |
| `/panel/administracion/roles`       | `roles.manage`                      |
| `/panel/administracion/auditoria`   | `audit.view`                        |

## Endpoints auxiliares previstos

| Endpoint                           | Uso                       | Protección                                           |
| ---------------------------------- | ------------------------- | ---------------------------------------------------- |
| `POST /api/public/consultations`   | Crear consulta web        | Zod, honeypot, rate limit, anti-bot, service role    |
| `POST /api/public/contact`         | Crear contacto general    | Mismos controles; no inserción anon directa          |
| `POST /api/documents/upload`       | Preparar/finalizar upload | Auth, permiso, acceso al caso, validación de archivo |
| `GET /api/documents/[id]/download` | Signed URL temporal       | Auth + `can_access_document`                         |
| `POST /api/auth/logout`            | Cerrar sesión             | Auth y cookies server-side                           |

Server Actions se preferirán para formularios propios de páginas. Route Handlers se reservan para endpoints públicos, webhooks, uploads y descargas donde HTTP sea el contrato adecuado.

## Identificadores en URL

El CRM puede mostrar IDs humanos en enlaces, pero resuelve a UUID en servidor y aplica RLS. Nunca se confía en que un identificador sea difícil de adivinar. Slugs públicos son canónicos y se validan contra contenido publicado.

## SEO

- Metadata por ruta, canonical desde origen confiable, breadcrumbs y JSON-LD apropiado.
- `sitemap.ts` incluye solo contenido publicado.
- `robots.ts` excluye `/panel`, auth y endpoints.
- El CRM envía `noindex` y no comparte metadata sensible.
