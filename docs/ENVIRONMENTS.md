# Entornos

## Local

Firebase Emulator Suite ejecuta Auth `9099` y Firestore `8080` con project ID `knv-local`. Los scripts `firebase:emulators`, `test:rules` y `test:e2e:firebase` son reproducibles. No se configura Firebase Hosting, Storage ni Functions.

## Firebase real

Proyecto DEV aislado: `knv-development` (`Karla Vasquez - Development`). `CURRENT_PLAN = Firebase Spark only`; `BILLING = Disabled`. No se reutiliza ningún proyecto de otro cliente.

Región Firestore aprobada: `nam5` (Estados Unidos central, multi-región). Honduras no dispone de una región Firestore local; `nam5` prioriza disponibilidad y durabilidad para datos jurídicos. Solo se crea la primera base Standard elegible para cuota gratuita, con PITR deshabilitado.

Estado real de DEV:

- app web Firebase y cinco variables públicas locales: configuradas;
- Email/Password Auth: habilitado;
- Firestore Standard `freeTier: true`: creado en `nam5`, PITR deshabilitado y delete protection habilitada;
- `firestore.rules` e índices: desplegados;
- credenciales Admin locales: configuradas en `.env.local` ignorado por Git; secretos Vercel: pendientes;
- dominios, plantillas/action handler, roles/permisos iniciales, primera administradora y proveedor de invitaciones: pendientes.

La validación real confirmó login Email/Password, intercambio de ID token, cookie HttpOnly, acceso server-side a `/panel`, logout, revocación y eliminación de fixtures. La cuenta temporal, su perfil, rol y auditoría se eliminan dentro del mismo test.

Staging y producción no se crean en esta fase. Cuando se autoricen deberán ser proyectos separados; nunca se reutiliza DEV ni infraestructura de otros clientes.

No se crea ni vincula cuenta de facturación. Storage, Cloud Functions, Identity Platform, SMS MFA, TTL, PITR, backups administrados, restore y clone están diferidos. La única API habilitada manualmente para esta activación fue Cloud Firestore.

## Vercel

Vercel es el único hosting previsto. Development target preferido: `bufetekarlavasquez.vercel.app`, sujeto a disponibilidad. Dominio futuro: `bufetekarlavasquez.com`. No se enlaza, despliega ni configura producción en Phase 1.

Las variables públicas y server-only se configuran por entorno en Vercel. Nunca se copian claves Admin a variables `NEXT_PUBLIC_*`.
