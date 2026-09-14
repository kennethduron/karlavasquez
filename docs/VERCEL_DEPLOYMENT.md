# Despliegue controlado en Vercel

## Objetivo autorizado

- Team/account: `Ken Code`
- Proyecto exacto: `bufetekarlavasquez`
- Framework: Next.js
- Root Directory: `./`
- Rama: `feat/knv-public-site-phase-2`
- Alias: `https://bufetekarlavasquez.vercel.app`

El nombre debe comprobarse antes de crear o enlazar el proyecto. No se aceptará una variante automática. El deployment debe corresponder al SHA final ya validado y publicado de Phase 2; `main` no se modifica para desplegar.

## Variables

El runtime autenticado requiere la configuración web pública de Firebase y las tres variables Admin server-only descritas en `.env.example`. Los valores se transfieren desde un entorno autorizado sin imprimirlos y se verifican por nombre/scope. La clave privada nunca lleva prefijo `NEXT_PUBLIC_`.

## Validación posterior

La QA remota debe cubrir diez rutas y diez anchos, drawer, formularios sin persistencia, metadata, OG/favicon, consola/hidratación, TLS, login preservado, denegación de `/panel` sin sesión, headers y ausencia de secretos en respuestas cliente.

## Fuera de alcance

No conectar `bufetekarlavasquez.com`, tocar DNS, activar Firebase Hosting, Blaze, Storage, Functions, servicios pagados ni persistencia de formularios. Phase 3 permanece bloqueada.
