# Autorización

## Capas

La autorización requiere concordancia entre:

1. custom claims compactos (`roleKeys`, `permissionVersion`);
2. perfil Firestore activo con permisos efectivos;
3. documentos de roles y permisos;
4. `PermissionService` server-side;
5. Firestore y Storage Security Rules.

La UI solo representa capacidades; no es una barrera.

## Roles iniciales

| Rol            | Alcance inicial                                                        |
| -------------- | ---------------------------------------------------------------------- |
| Administradora | Gobierno y acceso completo                                             |
| Abogado        | Expedientes asignados y trabajo jurídico autorizado                    |
| Asistente      | Operación autorizada, sin gobierno                                     |
| Recepción      | Intake y funciones expresamente permitidas, sin expedientes/documentos |

El código operativo pregunta por permisos (`cases.view`, `documents.read`, `roles.manage`, etc.), no solo `role === admin`.

## Expedientes y documentos

Tener permiso general de lectura no basta: salvo `cases.view_all`, el UID debe ser responsable o figurar en `assignedUserIds`. Cambiar responsable/asignaciones exige `cases.assign`. Hijos como notas y documentos heredan el control del expediente y no pueden cambiar su `caseId` o `clientId` mediante un update.

## Gobierno

Roles y permisos exigen `roles.manage`. Los clientes no pueden alterar sus propios role keys, permisos efectivos, versión, estado ni UID. Auditoría no acepta escrituras cliente. Operaciones administrativas usan Admin SDK y deben auditar éxito o fallo.

## Pruebas de ataque

Las suites de emulador cubren:

- anónimo sin clientes, expedientes, metadatos, notas, auditoría o administración;
- Recepción limitada a consultas autorizadas;
- Asistente y Abogado limitados por permiso/asignación;
- Administradora con gobierno permitido;
- cambio malicioso de `caseId`, `clientId`, responsable, asignaciones, roles, permisos e IDs humanos;
- lectura directa por SDK de expediente ajeno;
- update/delete de auditoría;
- uploads, reads y deletes no autorizados, MIME/tamaño y rutas seguras.
