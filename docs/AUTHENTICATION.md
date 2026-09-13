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

### Decisión Phase 1.1

- **Opción A — blocking function:** es la seleccionada para cumplir estrictamente “sin creación pública de usuarios”. Firebase exige Authentication with Identity Platform para `beforeUserCreated`. El despliegue de Cloud Functions exige plan Blaze; se deben vincular facturación, alertas de presupuesto y límites antes de desplegar.
- **Opción B — sin UI/API de signup + Admin SDK:** sigue siendo defensa complementaria y el único flujo administrativo de alta, pero por sí sola no impide que alguien invoque el endpoint público de creación de Firebase Auth. Una identidad huérfana no obtendría perfil, claims, cookie de sesión ni acceso a datos, pero su creación incumpliría el requisito estricto.

Identity Platform no se activa silenciosamente. La activación queda pendiente de un proyecto Firebase DEV aislado y aprobación consciente de la vinculación de facturación necesaria para desplegar la función. Para email/password, Identity Platform mantiene una franja gratuita de MAU; los costos potenciales proceden del uso que exceda cuotas y de Cloud Functions/servicios Blaze.

## Primera administradora

Karla Norin Vásquez se provisionará únicamente cuando el propietario proporcione el correo real. Un proceso server-only usará Firebase Admin para crear/invitar la cuenta, asignar el rol `Administradora`, materializar perfil/permisos y claims compactos, y emitir un enlace de establecimiento/recuperación de contraseña mediante el proveedor de correo. Ninguna contraseña se almacena en código, Firestore, Git o logs.
