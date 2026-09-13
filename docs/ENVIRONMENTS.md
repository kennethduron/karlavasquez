# Entornos

La plataforma requiere proyectos Supabase separados para desarrollo, staging y producción. Nunca se reutiliza una base con datos legales reales para pruebas.

## Variables

| Variable                        | Cliente | Propósito                                                          |
| ------------------------------- | ------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Sí      | URL del proyecto correspondiente al entorno.                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí      | Clave pública limitada por RLS. No es un secreto.                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | No      | Operaciones administrativas server-side. Nunca llega al navegador. |
| `NEXT_PUBLIC_SITE_URL`          | Sí      | Origen canónico permitido en enlaces de recuperación.              |

Las variables reales viven en `.env.local` durante desarrollo y en el almacén de secretos del proveedor para staging/producción. `.env.example` solo contiene marcadores.

## Preparación de un entorno

1. Crear un proyecto Supabase dedicado y configurar la región aprobada.
2. Deshabilitar el registro público y configurar las URL de redirección exactas.
3. Aplicar, en orden, las migraciones de `supabase/migrations` en un entorno vacío.
4. Ejecutar el bootstrap del primer administrador con variables temporales:

   ```bash
   BOOTSTRAP_ADMIN_EMAIL=administracion@example.com \
   BOOTSTRAP_ADMIN_NAME="Nombre autorizado" \
   npm run auth:bootstrap-admin
   ```

5. Borrar esas dos variables temporales, aceptar la invitación y configurar MFA.
6. Crear identidades de prueba por rol y ejecutar la matriz RLS antes de habilitar datos reales.

Las cuentas posteriores se administran con variables efímeras y
`npm run auth:manage-staff`. `STAFF_ACCOUNT_ACTION=invite` requiere nombre y
rol; `STAFF_ACCOUNT_ACTION=disable` desactiva primero el perfil (bloqueo RLS)
y después invalida futuras sesiones mediante un ban de Auth. Estos comandos se
ejecutan únicamente desde una estación administrativa autorizada.

## Estado de esta entrega

El código, migraciones y controles locales están preparados. La conexión, migración real y pruebas RLS remotas quedan bloqueadas hasta recibir proyectos y secretos de desarrollo/staging autorizados. No se realizó despliegue.
