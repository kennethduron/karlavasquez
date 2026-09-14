# Rutas vigentes

## Sitio público — Phase 2

| Ruta                                    | Propósito                                   | Persistencia               |
| --------------------------------------- | ------------------------------------------- | -------------------------- |
| `/`                                     | Inicio corporativo                          | Ninguna                    |
| `/sobre-karla`                          | Filosofía, enfoque y valores confirmados    | Ninguna                    |
| `/areas-de-practica`                    | Cinco áreas y servicios confirmados         | Ninguna                    |
| `/areas-de-practica/derecho-de-familia` | Información general de familia              | Ninguna                    |
| `/servicios/divorcio`                   | Orientación prudente sobre divorcio         | Ninguna                    |
| `/solicitar-consulta`                   | Formulario accesible de tres pasos          | Validación local solamente |
| `/recursos`                             | Recursos, filtros y guías informativas      | Filtro local solamente     |
| `/contacto`                             | Información y formulario de contacto        | Validación local solamente |
| `/privacidad`                           | Borrador prudente sujeto a aprobación legal | Ninguna                    |
| `/aviso-legal`                          | Condiciones informativas y de contacto      | Ninguna                    |

Los slugs solicitados se conservaron sin cambios. `robots.txt` y `sitemap.xml` se generan con convenciones de metadata de Next.js. Los canonical apuntan al dominio final futuro `https://bufetekarlavasquez.com`, aunque la validación actual se sirve desde Vercel.

## Autenticación y CRM preservados

| Ruta                            | Propósito                   | Protección                    |
| ------------------------------- | --------------------------- | ----------------------------- |
| `/iniciar-sesion`               | Login interno Firebase      | Pública, sin signup           |
| `/recuperar-acceso`             | Recuperación no enumerable  | Pública                       |
| `/actualizar-contrasena`        | Confirmar código Firebase   | Código válido                 |
| `/panel` y subrutas             | Shell interno, no dashboard | Sesión verificada server-side |
| `POST/DELETE /api/auth/session` | Crear o cerrar cookie       | Origin + Admin SDK            |

No existe endpoint público de consulta/contacto ni endpoint de binarios.
