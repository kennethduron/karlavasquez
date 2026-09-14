# Seguridad

## Superficie pública de Phase 2

Los formularios de consulta y contacto son demostraciones de UI con validación local. No importan adaptadores Firebase, no ejecutan `fetch`, no tienen Route Handler ni Server Action y no producen escrituras o correo. El control automatizado `security:check` falla si la UI pública incorpora SDK Firestore/Storage o primitivas de escritura. El texto visible evita simular envío, cita confirmada o relación abogado-cliente.

El contenido estructurado omite teléfono, domicilio, horario, reviews, ratings y demás propiedades no confirmadas. `/panel` y las APIs privadas conservan verificación server-side; publicar las rutas informativas no amplía permisos Firebase. Vercel recibe las credenciales Admin solo como variables server-only y la clave privada nunca se incluye en el bundle cliente.

## Secretos

Las claves administrativas usan `FIREBASE_*` sin prefijo público y solo se importan en módulos `server-only`. `FIREBASE_PRIVATE_KEY` nunca llega al navegador ni se registra. `.env.example` contiene nombres/placeholders, no valores reales.

La configuración web `NEXT_PUBLIC_FIREBASE_*` es pública por diseño; Security Rules y el servidor establecen autorización. CSP permite únicamente los endpoints Firebase necesarios y emuladores locales en desarrollo.

## Sesión y solicitudes

- ID token validado y no revocado por Admin.
- Autenticación reciente al crear sesión.
- Endpoint de sesión restringido al mismo origen.
- Cookie HttpOnly, Secure en producción, SameSite y con expiración explícita.
- Verificación server-side en toda ruta/operación privada.
- Respuestas 403/404 neutras para no filtrar existencia.

## Firestore

No existe `allow read, write: if request.auth != null`. Las reglas fallan cerrado por colección, permiso y asignación. Campos privilegiados e identificadores relacionales son inmutables o requieren permiso específico. Contadores, idempotencia y auditoría solo se escriben en servidor.

Además del Emulator, DEV real ejecuta smoke tests con fixtures aislados: identidad anónima y huérfana, Recepción limitada, Asistente asignada, Abogado asignado/no asignado y Administradora. Se comprueban escalación de roles/permisos, mutación de asignaciones/clientId, acceso horizontal y auditoría append-only; toda fixture se elimina con Admin al finalizar.

## Documentos binarios

`BINARY_DOCUMENT_STORAGE = DEFERRED_BY_FREE_TIER_POLICY`. No existe bucket, endpoint binario ni adaptador activo. Firestore solo conserva metadata y nunca bytes. La futura activación requerirá revisión separada de proveedor, acceso privado, validación de firma, nombres seguros, cuarentena, antivirus y retención.

Antes de habilitar uploads reales se deben agregar validación de firma mágica, nombre seguro, cuarentena, análisis antimalware, retención y recuperación de incidentes.

## Auditoría y logs

Los audit logs se crean server-side con request ID y metadata sanitizada. Nunca registrar contraseñas, cookies, tokens, private keys, enlaces de recuperación, contenido de notas/documentos, rutas con PII ni payloads completos. Los usuarios normales no actualizan ni eliminan auditoría.

## Supply chain y CI

CI usa lockfile, format, typecheck, lint, unit tests, emuladores, build, Playwright y secret scanning. `npm audit` se reporta honestamente; un hallazgo de tooling de desarrollo no se presenta como vulnerabilidad de runtime sin analizar su alcance.

Auditoría del 2026-09-13: 9 moderadas, 0 high y 0 critical. Siete pertenecen al árbol de `firebase-tools` usado solo en desarrollo/CI (`@opentelemetry/core`, `csv-parse`, `qs`, `stream-json` y transitivas). Dos alertas `gaxios`/`uuid` aparecen en producción por el subárbol `@google-cloud/storage` incluido transitivamente por `firebase-admin`, aunque la aplicación no importa ni inicializa Storage. No existe corrección compatible ofrecida por npm sin un downgrade mayor de `firebase-tools`; no se aplica `audit fix --force`. Se debe reevaluar al actualizar Firebase Admin/CLI.

Firebase Admin 14.4.0 incluye `jwks-rsa` 4.1.0, cuyo cargador CommonJS depende de la interoperabilidad nativa `require(esm)` de Node para abrir `jose` 6. El runtime empaquetado de Vercel no preserva esa interoperabilidad y la validación de tokens falla antes de ejecutarse. Mientras el defecto upstream siga abierto, el lockfile limita únicamente `firebase-admin > jwks-rsa > jose` a la última versión compatible de la serie 4 (`4.15.9`), que conserva las operaciones JWK utilizadas por el SDK. La CLI mantiene su propia copia de `jose` 6. Este override debe retirarse al adoptar una versión de Firebase Admin o `jwks-rsa` que resuelva el defecto y siempre debe volver a pasar `npm audit`, build y la prueba de sesión real.

## Pendiente antes de producción

- Mantener el proyecto DEV real en Spark y sin billing; staging/production requieren autorización y aislamiento propios.
- App Check: `READY_FOR_LATER`, no aplicado todavía. Registrar la app web con reCAPTCHA Enterprise, validar local/preview con debug tokens, observar métricas y solo después habilitar enforcement; nunca reemplaza Rules ni autorización server-side.
- MFA: `DEFERRED_FREE_TIER_CONSTRAINT`. La arquitectura podrá incorporar TOTP si en el futuro se autoriza Identity Platform; no se usa SMS ni se presenta MFA como activa.
- SMTP/proveedor de invitaciones y plantillas revisadas.
- Antivirus, retención, backups/exportación y simulacro de restauración.
- Monitoreo, rate limiting y respuesta a incidentes.
- Revisión legal de privacidad y tratamiento de datos.
