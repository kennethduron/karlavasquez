# Entornos

## Local

Firebase Emulator Suite ejecuta Auth `9099`, Firestore `8080` y Storage `9199` con project ID `knv-local`. Los scripts `firebase:emulators`, `test:rules` y `test:e2e:firebase` son reproducibles. No se configura Firebase Hosting.

## Firebase real

Estado verificado en Phase 1.1: `BLOCKED_BY_EXTERNAL_CONFIGURATION`. La cuenta autenticada en Firebase CLI no tiene un proyecto `knv-development` ni `karla-vasquez-development`; los proyectos de otros clientes no se reutilizan. No existe `.env.local`, no se recibió project ID ni credenciales y no se inventaron valores.

Región propuesta para aprobación antes de crear recursos: Firestore `nam5` (Estados Unidos central, multi-región). Honduras no dispone de una región Firestore local; `nam5` prioriza disponibilidad y durabilidad para datos jurídicos sobre el menor costo de una región única. La ubicación es inmutable después de crear la base, por lo que no debe provisionarse hasta que el propietario confirme esta decisión. Storage debe seleccionarse de forma compatible y documentarse en el momento de creación.

El propietario debe crear proyectos separados de development/staging/production y configurar:

- Firebase web app y las seis variables `NEXT_PUBLIC_FIREBASE_*`;
- Email/Password Auth, dominios autorizados y plantillas/action handler;
- Firebase Authentication with Identity Platform y registro/despliegue de `blockPublicUserCreation` como hook `beforeCreate`;
- Firestore y Storage en una región aprobada;
- service account de mínimo privilegio mediante secretos Vercel: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`;
- despliegue revisado de `firestore.rules`, `storage.rules` e índices;
- roles/permisos iniciales, primera administradora y claims;
- proveedor de correo de invitaciones, alertas de presupuesto, logs y backups.

No se debe desplegar `blockPublicUserCreation` hasta enlazar una cuenta de facturación al plan Blaze y configurar alertas/límites. Identity Platform habilita blocking functions y MFA; no se activa automáticamente como efecto de esta documentación.

## Vercel

Vercel es el único hosting previsto. Development target preferido: `bufetekarlavasquez.vercel.app`, sujeto a disponibilidad. Dominio futuro: `bufetekarlavasquez.com`. No se enlaza, despliega ni configura producción en Phase 1.

Las variables públicas y server-only se configuran por entorno en Vercel. Nunca se copian claves Admin a variables `NEXT_PUBLIC_*`.
