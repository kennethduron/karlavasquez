# Autenticación

## Funciones de Phase 1

- Email/password con Firebase Authentication.
- Login accesible con mostrar/ocultar contraseña, loading y errores neutros.
- Recuperación sin revelar si una cuenta existe.
- Actualización mediante `oobCode` de Firebase.
- Logout con revocación y eliminación de cookie.
- Sin signup público.
- Invitación administrativa preparada server-side mediante Firebase Admin y un `InvitationMailer` inyectable.

## Protección real

`onAuthStateChanged()` no protege `/panel`. El cliente obtiene un ID token solo para intercambiarlo en `/api/auth/session`; Firebase Admin lo valida y crea una cookie `HttpOnly`. Layouts, handlers y servicios privados llaman la validación server-side. La mera presencia de la cookie en el proxy solo mejora la navegación.

La sesión máxima es cinco días. Se verifican tokens revocados, usuario activo, claims compactos, documento de perfil y permisos efectivos. La cuenta deshabilitada se bloquea aunque conserve una cookie anterior.

## Configuración de correo

En el proyecto Firebase real se debe:

1. habilitar Email/Password;
2. autorizar dominios de Vercel y el dominio final;
3. personalizar remitente/plantillas;
4. configurar el action handler para que recuperación llegue a `/actualizar-contrasena` y conserve `oobCode`;
5. conectar un proveedor de correo transaccional al adaptador de invitaciones.

No se inventan credenciales ni se registran enlaces de invitación.

## Signup público y autorización fail-closed

La aplicación no expone pantalla, botón ni endpoint propio de registro. Los usuarios internos se crean únicamente mediante una operación administrativa server-only con Firebase Admin SDK. No se usan `beforeUserCreated`, Cloud Functions ni Identity Platform porque el proyecto debe permanecer en Spark sin billing.

La API pública de Firebase Auth puede permitir que alguien cree una identidad directamente mientras Email/Password esté habilitado. Esa identidad no equivale a un usuario del CRM: para emitir una cookie y acceder a datos se exige un perfil existente con `status = active`, rol autorizado, permisos efectivos y `permissionVersion` válida. Si falta cualquiera de estos controles, `/api/auth/session` responde `403`, `/panel` permanece cerrado y las reglas de Firestore rechazan lecturas y escrituras.

Los tests de ataque incluyen una cuenta Auth huérfana, sin perfil, rol ni permisos, e intentos contra `/panel`, clientes, consultas, expedientes, auditoría y administración. El resultado obligatorio es `DENIED`.

Esta es la decisión explícita de Phase 1.1: el alta legítima es administrativa y la autorización siempre falla cerrado. Impedir incluso la creación de identidades huérfanas en el servicio Auth requeriría capacidades fuera de la política Spark y queda fuera de alcance.

## Primera administradora

Karla Norin Vásquez se provisionará únicamente cuando el propietario proporcione el correo real. Un proceso server-only usará Firebase Admin para crear/invitar la cuenta, asignar el rol `Administradora`, materializar perfil/permisos y claims compactos, y emitir un enlace de establecimiento/recuperación de contraseña mediante el proveedor de correo. Ninguna contraseña se almacena en código, Firestore, Git o logs.
