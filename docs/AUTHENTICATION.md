# Autenticación

## Flujo

1. `/iniciar-sesion` autentica correo y contraseña en Supabase Auth.
2. El servidor exige un registro `profiles` activo; un mensaje genérico evita revelar si una cuenta existe o está deshabilitada.
3. Si hay un factor TOTP verificado, `/verificar-mfa` eleva la sesión a AAL2.
4. Los administradores y los perfiles con `mfa_required = true` no acceden a módulos privados sin AAL2.
5. Cada página privada consulta la identidad validada por Supabase, el perfil, roles y permisos. El proxy solo hace una redirección optimista; no sustituye la autorización de datos.

No existe registro público. El trigger de `auth.users` crea perfiles con estado `invited`; únicamente una operación administrativa server-side puede activarlos y asignar roles.

## Recuperación

`/recuperar-acceso` siempre devuelve el mismo mensaje, exista o no el correo. Supabase envía un enlace PKCE hacia `/auth/callback`, que solo acepta destinos internos y establece una sesión temporal antes de abrir `/actualizar-contrasena`.

La contraseña nueva exige 12 caracteres, mayúscula, minúscula, número y símbolo. Tras cambiarla se registra el evento y se cierran las sesiones globales.

## MFA

`/panel/seguridad` permite vincular una aplicación TOTP. El QR y el secreto se muestran únicamente durante el alta; el repositorio y la base de datos de aplicación no almacenan el secreto. Supabase Auth conserva el factor.

Un factor obligatorio no puede eliminarse desde la interfaz. La recuperación de un administrador sin dispositivo requiere el procedimiento de soporte autorizado de Supabase y un registro manual del incidente.

## Auditoría

La función `record_auth_event` acepta una lista cerrada de acciones y escribe en `audit_logs` mediante `security definer`. No recibe metadatos arbitrarios ni secretos. Los intentos fallidos se registrarán en observabilidad server-side al conectar el entorno, sin almacenar contraseñas o códigos MFA.

## Validación pendiente de infraestructura

- Entrega de recuperación por correo y vencimiento del enlace.
- Invitación, activación y desactivación contra identidades reales.
- AAL1/AAL2 y eliminación/recuperación de factores.
- Matriz automatizada RLS con usuarios por cada rol.
- Revisión de plantillas de correo, URLs permitidas y política de sesiones.
