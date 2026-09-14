# Rutas de Phase 1

## Implementadas

| Ruta                                                                                                   | Propósito                             | Protección              |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------- | ----------------------- |
| `/iniciar-sesion`                                                                                      | Login interno Firebase                | Pública, sin signup     |
| `/recuperar-acceso`                                                                                    | Enviar recuperación                   | Respuesta no enumerable |
| `/actualizar-contrasena`                                                                               | Confirmar `oobCode`                   | Código Firebase válido  |
| `/panel`                                                                                               | Shell privado, no dashboard funcional | Sesión server-side      |
| `/panel/seguridad`                                                                                     | Información de sesión                 | Sesión server-side      |
| `/panel/sin-permiso`                                                                                   | Estado forbidden                      | Privada                 |
| `POST/DELETE /api/auth/session`                                                                        | Crear/cerrar cookie                   | Origin + Admin SDK      |
| El endpoint de contenido binario está diferido por la política Spark y no existe en el runtime actual. |

El proxy redirige de forma optimista cuando falta la cookie, pero el layout y endpoints hacen la comprobación criptográfica real. Los IDs enviados por URL nunca otorgan acceso por sí mismos.

## Futuras

Rutas de Home, consultas, clientes, expedientes, agenda, documentos, CMS y administración no se implementan funcionalmente en Phase 1. La navegación del shell es una fundación visual y puede mostrar destinos aún planificados.
