-- KNV Phase 0: confirmed reference data only. No fictitious clients or cases.

insert into public.permissions (key, description) values
  ('dashboard.view', 'Ver el resumen operativo'),
  ('consultations.view', 'Ver consultas'),
  ('consultations.create', 'Crear consultas'),
  ('consultations.edit', 'Editar y dar seguimiento a consultas'),
  ('consultations.assign', 'Asignar consultas'),
  ('consultations.convert', 'Convertir consultas en clientes'),
  ('clients.view', 'Ver clientes'),
  ('clients.create', 'Crear clientes'),
  ('clients.edit', 'Editar clientes'),
  ('clients.archive', 'Archivar clientes'),
  ('cases.view', 'Ver expedientes asignados'),
  ('cases.view_all', 'Ver todos los expedientes'),
  ('cases.create', 'Crear expedientes'),
  ('cases.edit', 'Editar expedientes accesibles'),
  ('cases.assign', 'Asignar expedientes'),
  ('cases.finalize', 'Finalizar expedientes'),
  ('cases.archive', 'Archivar expedientes'),
  ('documents.view', 'Ver documentos autorizados'),
  ('documents.upload', 'Cargar documentos'),
  ('documents.manage', 'Administrar documentos y accesos'),
  ('tasks.view', 'Ver tareas'),
  ('tasks.create', 'Crear tareas'),
  ('tasks.edit', 'Editar tareas'),
  ('events.view', 'Ver agenda'),
  ('events.create', 'Crear eventos'),
  ('events.edit', 'Editar eventos'),
  ('reports.view', 'Ver reportes'),
  ('cms.view', 'Ver contenido no publicado'),
  ('cms.edit', 'Editar contenido del sitio'),
  ('cms.publish', 'Publicar contenido del sitio'),
  ('users.manage', 'Administrar usuarios'),
  ('roles.manage', 'Administrar roles y permisos'),
  ('settings.manage', 'Administrar configuración'),
  ('audit.view', 'Ver auditoría')
on conflict (key) do update set description = excluded.description;

insert into public.roles (key, name, description, is_system) values
  ('administrator', 'Administradora', 'Acceso completo autorizado al sistema.', true),
  ('lawyer', 'Abogado', 'Gestión jurídica según permisos y asignaciones.', true),
  ('assistant', 'Asistente', 'Apoyo operativo con acceso limitado.', true),
  ('reception', 'Recepción', 'Consultas, contactos y agenda permitida.', true)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  is_system = excluded.is_system;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.key = 'administrator'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key = any(array[
  'dashboard.view', 'consultations.view', 'consultations.create',
  'consultations.edit', 'consultations.convert', 'clients.view',
  'clients.create', 'clients.edit', 'cases.view', 'cases.create', 'cases.edit',
  'cases.finalize', 'documents.view', 'documents.upload', 'documents.manage',
  'tasks.view', 'tasks.create', 'tasks.edit', 'events.view', 'events.create',
  'events.edit', 'reports.view'
])
where r.key = 'lawyer'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key = any(array[
  'dashboard.view', 'consultations.view', 'consultations.create',
  'consultations.edit', 'consultations.assign', 'clients.view', 'clients.create',
  'clients.edit', 'cases.view', 'cases.create', 'cases.edit', 'documents.view',
  'documents.upload', 'tasks.view', 'tasks.create', 'tasks.edit', 'events.view',
  'events.create', 'events.edit'
])
where r.key = 'assistant'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key = any(array[
  'dashboard.view', 'consultations.view', 'consultations.create',
  'consultations.edit', 'clients.view', 'tasks.view', 'tasks.create',
  'tasks.edit', 'events.view', 'events.create', 'events.edit'
])
where r.key = 'reception'
on conflict do nothing;

insert into public.consultation_statuses
  (key, name, sort_order, color_token, is_terminal, is_system) values
  ('new', 'Nueva', 10, 'info', false, true),
  ('contacted', 'Contactada', 20, 'success', false, true),
  ('scheduled', 'Programada', 30, 'warning', false, true),
  ('followup', 'En seguimiento', 40, 'info', false, true),
  ('converted', 'Convertida', 50, 'success', true, true),
  ('closed', 'Cerrada', 60, 'neutral', true, true)
on conflict (key) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  color_token = excluded.color_token,
  is_terminal = excluded.is_terminal;

insert into public.case_statuses
  (key, name, sort_order, color_token, is_terminal, is_system) values
  ('evaluation', 'En evaluación', 10, 'warning', false, true),
  ('active', 'Activo', 20, 'success', false, true),
  ('pending', 'Pendiente', 30, 'warning', false, true),
  ('followup', 'En seguimiento', 40, 'info', false, true),
  ('paused', 'Pausado', 50, 'neutral', false, true),
  ('finished', 'Finalizado', 60, 'success', true, true),
  ('archived', 'Archivado', 70, 'neutral', true, true)
on conflict (key) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  color_token = excluded.color_token,
  is_terminal = excluded.is_terminal;

insert into public.practice_areas (slug, name, sort_order) values
  ('derecho-de-familia', 'Derecho de Familia', 10),
  ('derecho-civil', 'Derecho Civil', 20),
  ('derecho-penal', 'Derecho Penal', 30),
  ('derecho-mercantil', 'Derecho Mercantil', 40),
  ('derecho-notarial', 'Derecho Notarial', 50)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

with confirmed_services(area_slug, service_slug, service_name, sort_order) as (
  values
    ('derecho-de-familia', 'matrimonio', 'Matrimonio', 10),
    ('derecho-de-familia', 'divorcio', 'Divorcio', 20),
    ('derecho-de-familia', 'suspension-patria-potestad', 'Suspensión de patria potestad', 30),
    ('derecho-de-familia', 'demandas-alimentos', 'Demandas de alimentos', 40),
    ('derecho-de-familia', 'regimen-comunicacion', 'Régimen de comunicación', 50),
    ('derecho-de-familia', 'otros-asuntos-familiares', 'Otros asuntos familiares', 60),
    ('derecho-civil', 'pago-extrajudicial', 'Demandas de pago extrajudicial', 10),
    ('derecho-civil', 'declaratoria-herencias', 'Declaratoria de herencias', 20),
    ('derecho-civil', 'reivindicacion-dominio', 'Reivindicación de dominio', 30),
    ('derecho-civil', 'cesacion-comunidad-bienes', 'Cesación de comunidad de bienes', 40),
    ('derecho-civil', 'prescripcion-adquisitiva-terrenos', 'Prescripción adquisitiva de posesión sobre terrenos', 50),
    ('derecho-civil', 'otros-asuntos-civiles', 'Otros asuntos civiles', 60),
    ('derecho-penal', 'defensa-privada', 'Defensa privada', 10),
    ('derecho-mercantil', 'representaciones-sociedades', 'Representaciones de sociedades', 10),
    ('derecho-notarial', 'escrituras-traspaso-dominio', 'Escrituras de traspaso de dominio', 10),
    ('derecho-notarial', 'comerciante-individual', 'Escrituras de comerciante individual', 20),
    ('derecho-notarial', 'sociedades-civiles', 'Escrituras de sociedades civiles', 30),
    ('derecho-notarial', 'sociedades-mercantiles', 'Escrituras de sociedades mercantiles', 40),
    ('derecho-notarial', 'poderes', 'Poderes', 50),
    ('derecho-notarial', 'traspaso-vehiculos', 'Traspaso de propietario de vehículos', 60),
    ('derecho-notarial', 'testamentos', 'Testamentos', 70),
    ('derecho-notarial', 'autorizacion-salida-pais', 'Autorización de salida del país', 80),
    ('derecho-notarial', 'autorizacion-emision-pasaporte', 'Autorización para emisión de pasaporte', 90),
    ('derecho-notarial', 'otros-actos-notariales', 'Otros actos notariales', 100)
)
insert into public.legal_services (practice_area_id, slug, name, sort_order)
select pa.id, cs.service_slug, cs.service_name, cs.sort_order
from confirmed_services cs
join public.practice_areas pa on pa.slug = cs.area_slug
on conflict (practice_area_id, slug) do update set
  name = excluded.name,
  sort_order = excluded.sort_order;

insert into public.document_categories (key, name, sort_order) values
  ('identification', 'Identificación', 10),
  ('client_documentation', 'Documentación del cliente', 20),
  ('legal_filings', 'Escritos', 30),
  ('contracts', 'Contratos', 40),
  ('evidence', 'Evidencia', 50),
  ('resolutions', 'Resoluciones', 60),
  ('powers', 'Poderes', 70),
  ('communications', 'Comunicaciones', 80),
  ('other', 'Otros', 90)
on conflict (key) do update set name = excluded.name, sort_order = excluded.sort_order;
