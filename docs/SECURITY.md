# Seguridad

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

## Storage

Documentos viven bajo IDs técnicos, sin nombres sensibles. Acceso requiere usuario activo, permiso y expediente autorizado. La política inicial admite PDF, JPEG, PNG y DOCX hasta 25 MiB. Las versiones no se actualizan in-place. La aplicación sirve bytes mediante Admin después de autorizar y no entrega URLs públicas persistentes.

Antes de habilitar uploads reales se deben agregar validación de firma mágica, nombre seguro, cuarentena, análisis antimalware, retención y recuperación de incidentes.

## Auditoría y logs

Los audit logs se crean server-side con request ID y metadata sanitizada. Nunca registrar contraseñas, cookies, tokens, private keys, enlaces de recuperación, contenido de notas/documentos, rutas con PII ni payloads completos. Los usuarios normales no actualizan ni eliminan auditoría.

## Supply chain y CI

CI usa lockfile, format, typecheck, lint, unit tests, emuladores, build, Playwright y secret scanning. `npm audit` se reporta honestamente; un hallazgo de tooling de desarrollo no se presenta como vulnerabilidad de runtime sin analizar su alcance.

## Pendiente antes de producción

- Proyecto Firebase real separado por entorno y presupuesto/alertas.
- App Check donde aporte defensa adicional; nunca reemplaza Rules.
- MFA para administradoras y política de reautenticación.
- SMTP/proveedor de invitaciones y plantillas revisadas.
- Antivirus, retención, backups/exportación y simulacro de restauración.
- Monitoreo, rate limiting y respuesta a incidentes.
- Revisión legal de privacidad y tratamiento de datos.
