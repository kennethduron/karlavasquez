# Entornos

## Local

Firebase Emulator Suite ejecuta Auth `9099`, Firestore `8080` y Storage `9199` con project ID `knv-local`. Los scripts `firebase:emulators`, `test:rules` y `test:e2e:firebase` son reproducibles. No se configura Firebase Hosting.

## Firebase real

Estado actual: `BLOCKED_BY_EXTERNAL_CONFIGURATION`. No se recibió project ID ni credenciales y no se inventaron valores.

El propietario debe crear proyectos separados de development/staging/production y configurar:

- Firebase web app y las seis variables `NEXT_PUBLIC_FIREBASE_*`;
- Email/Password Auth, dominios autorizados y plantillas/action handler;
- Firebase Authentication with Identity Platform y registro/despliegue de `blockPublicUserCreation` como hook `beforeCreate`;
- Firestore y Storage en una región aprobada;
- service account de mínimo privilegio mediante secretos Vercel: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`;
- despliegue revisado de `firestore.rules`, `storage.rules` e índices;
- roles/permisos iniciales, primera administradora y claims;
- proveedor de correo de invitaciones, alertas de presupuesto, logs y backups.

## Vercel

Vercel es el único hosting previsto. Development target preferido: `bufetekarlavasquez.vercel.app`, sujeto a disponibilidad. Dominio futuro: `bufetekarlavasquez.com`. No se enlaza, despliega ni configura producción en Phase 1.

Las variables públicas y server-only se configuran por entorno en Vercel. Nunca se copian claves Admin a variables `NEXT_PUBLIC_*`.
