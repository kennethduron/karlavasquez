# Rollback de infraestructura

## Supabase API keys

La aplicación de producción usa exclusivamente las API keys modernas:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` para el cliente sujeto a RLS.
- `SUPABASE_SECRET_KEY` únicamente en servicios server-side.
- `NEXT_PUBLIC_SUPABASE_URL` para identificar el proyecto.

Las API keys legacy `anon` y `service_role` están deshabilitadas en Supabase y
sus variables antiguas fueron retiradas de Vercel Production. No se modificaron
las claves de firma JWT de Supabase Auth.

Un deployment histórico que dependa de `NEXT_PUBLIC_SUPABASE_ANON_KEY` o
`SUPABASE_SERVICE_ROLE_KEY` no puede restaurarse sin cambios. Todo rollback debe
usar un commit compatible con las variables modernas anteriores o adaptar el
commit histórico antes de desplegarlo. Nunca se debe reactivar una key legacy
como atajo de rollback.

Antes de promover un rollback, validar Auth, autorización server-side, RLS,
Storage privado y las rutas de suscripción FCM con el entorno moderno.
