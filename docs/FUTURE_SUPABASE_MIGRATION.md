# Migración futura a Supabase/PostgreSQL

## Estado

Supabase/PostgreSQL es un objetivo futuro, no el backend activo. La rama `feat/knv-auth-phase-1` y el commit `d9efd32dc4afb8cf5e84a3a5dd6db832198cb045` se preservan solo como referencia histórica. No deben mezclarse ni desplegarse.

Las migraciones SQL de Phase 0 permanecen en `supabase/migrations` como `FUTURE_SUPABASE_REFERENCE`. No hay dependencias ni imports Supabase en el runtime Firebase.

## Estrategia

1. Congelar DTOs e interfaces del dominio.
2. Implementar `Supabase*Repository` detrás de los mismos contratos.
3. Diseñar mapeo Firestore → PostgreSQL con checks de conteo, IDs, fechas y relaciones.
4. Portar autorización a RLS sin eliminar el `PermissionService` server-side.
5. Migrar objetos privados con checksums y política de acceso equivalente.
6. Ejecutar dual-read/verificación fuera de producción; no dual-write improvisado.
7. Planear corte, rollback y reconciliación auditada.

## Correspondencias

- Document IDs → UUID o claves técnicas persistentes.
- `Date` de dominio → `timestamptz`/`date` según semántica.
- arrays de asignación → tablas relacionales.
- perfiles/roles materializados → `profiles`, `roles`, `permissions`, asociaciones y RLS.
- contadores transaccionales → función SQL/sequence por entidad y año.
- audit logs → tabla append-only.

La decisión de migrar requiere aprobación separada, threat model, ensayo de datos y nueva fase. Este documento no autoriza activar Supabase.
