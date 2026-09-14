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
- credenciales Admin locales: configuradas en `.env.local` ignorado por Git; cinco variables web públicas y tres variables Admin server-only configuradas en Vercel para Production y Preview;
- roles/permisos iniciales: 4 roles y 32 permisos configurados y verificados;
- dominios, plantillas/action handler, primera administradora y proveedor de invitaciones: pendientes.

La validación real confirmó login Email/Password, intercambio de ID token, cookie HttpOnly, acceso server-side a `/panel`, logout, revocación y eliminación de fixtures. También pasaron 19 denegaciones anonymous/orphan y 17 límites autorizados/denegados para Recepción, Asistente, Abogado y Administradora. Cuentas, perfiles, roles, expedientes, documentos metadata y auditoría temporales se eliminan dentro de cada test.

Staging y producción no se crean en esta fase. Cuando se autoricen deberán ser proyectos separados; nunca se reutiliza DEV ni infraestructura de otros clientes.

No se crea ni vincula cuenta de facturación. Storage, Cloud Functions, Identity Platform, SMS MFA, TTL, PITR, backups administrados, restore y clone están diferidos. La única API habilitada manualmente para esta activación fue Cloud Firestore.

## Vercel

Vercel es el único hosting. Phase 2 autoriza un despliegue controlado al proyecto exacto `bufetekarlavasquez` y alias `bufetekarlavasquez.vercel.app`, siempre desde el SHA final de `feat/knv-public-site-phase-2`. Si el nombre no está disponible, no se crea una variante. Dominio futuro: `bufetekarlavasquez.com`; no se conecta ni se modifica DNS.

El proyecto `bufetekarlavasquez` (`prj_AQwGXTXY43sqirlBhOKRGo8sdKbC`) quedó creado con preset Next.js y Root Directory `./` en la cuenta operativa Ken Code. El alias exacto está activo. Para impedir que una rama antigua o `main` se publique por accidente, la integración Git de Vercel permanece desconectada: cada despliegue se ejecuta por CLI desde un worktree limpio cuyo `HEAD` coincide con la rama remota validada. Por tanto no existe una Production Branch automática en Vercel durante esta etapa.

El runtime se fija en Node.js `22.x`, igual que CI y desarrollo. El rango abierto hacia nuevos majors no se usa: Node 24 demostró una incompatibilidad de carga ESM/CommonJS en una dependencia transitoria de Firebase Admin durante el smoke de sesión.

Las variables públicas y server-only están configuradas para Production y Preview en Vercel; Development usa `.env.local`. Nunca se copian claves Admin a variables `NEXT_PUBLIC_*`. `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` se omite deliberadamente porque Storage está diferido por la política Spark. La URL canónica permanece en el dominio final; la navegación y QA usan temporalmente el alias `.vercel.app`.
