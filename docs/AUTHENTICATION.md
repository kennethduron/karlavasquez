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

## Bloqueo de signup público

No basta con omitir una pantalla de registro porque la configuración web Firebase es pública. `firebase-functions/index.js` define `blockPublicUserCreation`, un hook `beforeUserCreated` que rechaza altas iniciadas mediante SDK/REST; el alta administrativa sigue usando Admin SDK. Para activarlo, el proyecto real debe actualizar Firebase Authentication a Identity Platform, desplegar la función y registrarla como blocking function. Sin esa configuración externa, los datos y `/panel` siguen fallando cerrado por falta de perfil/claims, pero la creación de una identidad huérfana no queda bloqueada en el servicio Auth.
