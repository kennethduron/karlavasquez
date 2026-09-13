# Datos: Cloud Firestore actual

## Relación del negocio

La relación canónica se preserva como `Consultation → Client → Multiple Cases`. Los IDs técnicos son documentos Firestore y los IDs humanos son campos únicos generados en servidor.

Firestore favorece documentos agregados y duplicación controlada. Por eso el diseño no replica literalmente las 41 tablas de PostgreSQL:

- asignaciones activas de un expediente se guardan como UID arrays acotados, útiles para Rules y consultas;
- permisos efectivos se materializan de forma controlada en el perfil;
- notas y documentos guardan `caseId`/`clientId` técnicos para autorización;
- cambios sensibles se acompañan de auditoría append-only server-side;
- catálogos pequeños permanecen en colecciones dedicadas.

La lista y el conteo de colecciones están en `FIREBASE_ARCHITECTURE.md`.

## Integridad

- Servicios validan DTOs y reglas de negocio antes de persistir.
- Security Rules validan campos privilegiados, asignaciones y relaciones conocidas.
- Transacciones asignan IDs humanos e idempotencia.
- `createdBy`, asignaciones, roles, permisos y auditoría no son editables libremente por el cliente.
- Toda fecha cruza la frontera del dominio como `Date`; el adaptador traduce `Timestamp` internamente.

## Índices

`firestore.indexes.json` define los compuestos iniciales. No se crean índices especulativos para los módulos aún no implementados. El despliegue futuro debe aplicar reglas e índices primero en un proyecto no productivo.

## Referencia PostgreSQL futura

Las tres migraciones de Phase 0 permanecen intactas en `supabase/migrations` como `FUTURE_SUPABASE_REFERENCE`. No se ejecutan, no se importan y no controlan Auth, permisos o Storage actuales. Sus constraints, normalización y RLS servirán de insumo al diseñar la migración futura, no como estado operativo.
