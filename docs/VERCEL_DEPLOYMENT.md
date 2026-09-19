# Despliegue controlado en Vercel

## Objetivo autorizado

- Team/account: `Ken Code`
- Proyecto exacto: `bufetekarlavasquez`
- Framework: Next.js
- Root Directory: `./`
- Rama: `feat/knv-final-brand-photo-phase-2-3`
- Alias: `https://bufetekarlavasquez.vercel.app`

El nombre debe comprobarse antes de crear o enlazar el proyecto. No se aceptará una variante automática. El deployment debe corresponder al SHA final ya validado y publicado de Phase 2.3; `main` no se modifica para desplegar.

## Estado actual

- Project ID: `prj_AQwGXTXY43sqirlBhOKRGo8sdKbC`
- Framework preset: Next.js
- Runtime: Node.js `22.x`
- Alias exacto: activo
- Dominio personalizado y DNS: no conectados
- Integración Git / Production Branch: no configurada deliberadamente

Los despliegues se controlan mediante Vercel CLI después de comprobar que `HEAD` coincide con `origin/feat/knv-final-brand-photo-phase-2-3` y que GitHub Actions terminó correctamente. Esta estrategia evita desplegar `main` o una fase histórica mientras no exista una política de ramas aprobada. No se usa `--force` ni se hace merge para asignar el alias.

## Variables

El runtime autenticado requiere cinco variables de configuración web pública de Firebase y las tres variables Admin server-only descritas en `.env.example`. Están configuradas en los scopes Production y Preview; Development permanece local. Los valores se transfieren desde un entorno autorizado sin imprimirlos y se verifican por nombre/scope. La clave privada nunca lleva prefijo `NEXT_PUBLIC_`. La variable de bucket no se configura mientras Firebase Storage continúe diferido por la política Spark.

## Validación posterior

La QA remota debe cubrir diez rutas y doce anchos, perfiles Chromium Android y WebKit iPhone/iPad, orientación landscape, drawer, formularios sin persistencia, las diez imágenes editoriales y el retrato real, manifest, OG/favicon, consola/hidratación, TLS, login preservado, denegación de `/panel` sin sesión, headers y ausencia de secretos en respuestas cliente.

## Fuera de alcance

No conectar `bufetekarlavasquez.com`, tocar DNS, activar Firebase Hosting, Blaze, Storage, Functions, servicios pagados ni persistencia de formularios. Phase 3 permanece bloqueada.
