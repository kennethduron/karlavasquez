# Seguridad

## Identidad

- No existe registro público; toda identidad nace invitada y sin acceso operativo.
- El perfil debe estar activo y cada página privada revalida usuario, roles y permisos en el servidor.
- Administradores y perfiles marcados con `mfa_required` necesitan una sesión AAL2.
- La recuperación no revela si un correo existe y solo redirige hacia rutas internas.
- El cliente recibe un DTO mínimo; la service role permanece exclusivamente server-side.

## Modelo de amenazas resumido

Activos críticos: identidad de usuarios, datos de contacto, notas, expedientes, documentos y auditoría. Amenazas principales: acceso horizontal, elevación de privilegio, filtración de URLs, credenciales expuestas, upload malicioso, spam, doble submit y logs con información sensible.

## Secretos

- `.env*` está ignorado y `.env.example` es la única excepción versionada.
- `SUPABASE_SERVICE_ROLE_KEY` se importa exclusivamente desde módulos `server-only`.
- Ningún secreto usa prefijo `NEXT_PUBLIC_`.
- El anon key sí es público por diseño; RLS limita su capacidad.
- Secretos de Vercel/Supabase se configuran fuera de Git y se rotan si se sospecha exposición.

## Sesiones y rutas

- Proxy renueva cookies y bloquea `/panel` sin usuario verificado.
- Las páginas privadas vuelven a consultar datos en servidor bajo RLS.
- Cookies son administradas por `@supabase/ssr`; producción exige HTTPS.
- MFA queda preparado para activación por política de rol.
- Usuarios deshabilitados fallan `is_active_user()` aunque conserven una sesión.

## Formularios públicos

El endpoint futuro para consulta/contacto aplicará, en este orden:

1. límite de tamaño de request;
2. Content-Type permitido;
3. honeypot;
4. rate limit por hash de IP y señal de dispositivo;
5. verificación anti-bot cuando el riesgo lo requiera;
6. Zod server-side;
7. normalización sin perder valor original;
8. insert con service role;
9. auditoría redactada;
10. respuesta genérica e idempotente.

No se almacenará IP en texto claro. El hash será rotatorio/salado y solo se conservará el tiempo requerido contra abuso.

## Documentos privados

- Bucket: `private-legal-documents`, explícitamente `public = false`.
- Límite inicial: 25 MiB por versión; debe revisarse antes de producción.
- MIME inicial: PDF, JPEG, PNG y DOCX.
- El servidor valida extensión, MIME declarado, firma mágica, tamaño y nombre seguro.
- Se recomienda análisis antimalware antes de marcar una versión como disponible.
- El nombre físico será aleatorio; el original vive como metadata.
- Descarga mediante signed URL de corta duración después de `can_access_document()`.
- Nunca se registra URL firmada, token ni contenido del documento.
- Versiones son inmutables; reemplazar crea una nueva fila.

## Logging y auditoría

Application logs contienen request ID, tipo de error, ruta y contexto mínimo. Audit logs contienen actor, acción, entidad, ID, resultado y metadata segura.

Nunca registrar:

- contraseñas, cookies, JWT, API keys;
- cuerpo completo de notas o documentos;
- payload completo de formularios;
- URLs firmadas;
- datos nacionales o bancarios.

Los errores al usuario no incluyen stack traces, SQL, nombres internos de buckets ni existencia de filas no autorizadas.

## Headers

`next.config.ts` establece CSP base, `nosniff`, `DENY`, Referrer Policy, Permissions Policy y COOP. La CSP permite los orígenes Supabase necesarios. Antes de analítica, mapas o anti-bot se deberá ampliar solo la directiva mínima requerida.

La CSP actual usa `unsafe-inline` porque Next.js lo requiere para el modo estático adoptado. Si cumplimiento futuro exige nonces estrictos, se evaluará el costo: renderizado dinámico y pérdida de caché CDN para las rutas afectadas.

## Dependencias y supply chain

- Lockfile versionado.
- Instalación con `npm ci` en CI.
- `npm audit` se ejecuta como control complementario, no como prueba total de seguridad.
- Renovaciones se hacen en PR aislado con typecheck, tests y build.
- No se usan `eval`, HTML sin sanitizar ni paquetes para capacidades simples.

## Checklist preproducción

- [ ] Proyecto Supabase dedicado y backups configurados.
- [ ] Migraciones aplicadas primero en entorno no productivo.
- [ ] Tests de RLS por cada rol.
- [ ] MFA obligatorio para administradores.
- [ ] Rate limit y anti-bot activos.
- [ ] Escaneo de archivos y retención aprobados.
- [ ] Secret scanning en CI/GitHub.
- [ ] Headers verificados en URL desplegada.
- [ ] Logs con redacción comprobada.
- [ ] Política de privacidad y aviso legal aprobados por el bufete.
- [ ] Proceso documentado de alta/baja de usuarios y respuesta a incidentes.

## Límites de Fase 0

No se ejecutaron migraciones externas, no se creó bucket real, no se configuró email ni se desplegó. Estas acciones requieren credenciales y autorización posterior.
