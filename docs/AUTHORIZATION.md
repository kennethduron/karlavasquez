# Autenticación y autorización

## Autenticación

- Supabase Auth administra credenciales, recuperación, sesiones y MFA futuro.
- No existe registro público.
- Usuarios internos se invitan desde Administración mediante una operación server-side.
- `src/proxy.ts` refresca la sesión y protege `/panel`.
- Toda operación sensible vuelve a verificar el usuario con `auth.getUser()`; una cookie por sí sola no se considera identidad suficiente.
- Un perfil `disabled` pierde acceso aunque su sesión todavía exista.

## Modelo de autorización

La autorización combina tres niveles:

1. PostgreSQL RLS impide leer o mutar filas no autorizadas.
2. Servicios server-side verifican permiso y validan reglas de negocio.
3. UI oculta o deshabilita acciones para mejorar UX, sin asumir que eso protege datos.

Los nombres de rol no aparecen en la lógica operativa. `roles → role_permissions → permissions` determina capacidades.

## Roles iniciales

| Rol            | Propósito         | Límites iniciales                                                       |
| -------------- | ----------------- | ----------------------------------------------------------------------- |
| Administradora | Gobierno completo | Todos los permisos sembrados                                            |
| Abogado        | Gestión jurídica  | Solo expedientes asignados; sin usuarios/roles/settings por defecto     |
| Asistente      | Operación         | Consultas, clientes y soporte de expedientes; sin auditoría ni gobierno |
| Recepción      | Intake y agenda   | Consultas, contactos y agenda; sin expedientes/documentos privados      |

La matriz exacta está en la migración de referencia y puede ajustarse por configuración controlada.

## Reglas de expedientes

- `cases.view` habilita el módulo.
- `cases.view_all` permite ver todos los expedientes.
- Sin `view_all`, el usuario debe ser responsable o tener una asignación activa.
- Hijos del expediente llaman `can_access_case(case_id)`.
- Cambiar responsable requiere `cases.assign`.

## Reglas de documentos

- `documents.view` es requisito base.
- Además, el usuario necesita acceso al expediente, permiso sobre documento de cliente o concesión explícita vigente.
- `documents.manage` y acceso al registro son necesarios para administrar metadatos/permisos.
- La lectura de `storage.objects` exige un `document_versions` autorizado.
- No existe política de upload directo desde navegador en Fase 0; el flujo futuro será server-side.

## Perfiles y gobierno

- Usuarios autenticados activos pueden leer el directorio mínimo de perfiles para mostrar responsables.
- Un usuario solo puede actualizar su propio perfil y no puede autoelevarse.
- `roles.manage` controla roles, permisos y asignaciones.
- `users.manage` controlará invitación/desactivación mediante Admin API server-only.

## Auditoría

`audit_logs` solo tiene política de lectura para `audit.view`. No hay políticas de update/delete. Los inserts ocurren mediante funciones revisadas, triggers o service role. Ningún rol de aplicación puede editar el rastro como si fuera una nota.

## Matriz resumida

| Recurso     | Read                              | Create                 | Update/especial                                   |
| ----------- | --------------------------------- | ---------------------- | ------------------------------------------------- |
| Consultas   | `consultations.view`              | `consultations.create` | `edit`, `assign`, `convert`                       |
| Clientes    | `clients.view`                    | `clients.create`       | `edit`, `archive`                                 |
| Expedientes | `cases.view` + asignación         | `cases.create`         | `edit`, `assign`, `finalize`, `archive`           |
| Documentos  | `documents.view` + acceso         | `documents.upload`     | `documents.manage`                                |
| Agenda      | `events.view`                     | `events.create`        | `events.edit`                                     |
| CMS         | público si publicado / `cms.view` | `cms.edit`             | `cms.publish`                                     |
| Gobierno    | permiso específico                | —                      | `users.manage`, `roles.manage`, `settings.manage` |

## Pruebas RLS requeridas antes de producción

- Usuario deshabilitado no accede a ninguna fila privada.
- Abogado A no lee expediente asignado solo a Abogado B.
- Recepción no lee documentos ni expedientes.
- ID manipulado en URL/API devuelve denegación sin filtrar metadatos.
- Documento sin grant o asignación no produce signed URL.
- Cambios de roles quedan auditados.
- Anon no inserta directamente en tablas de intake; solo atraviesa el endpoint protegido.
