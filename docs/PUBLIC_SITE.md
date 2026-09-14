# Sitio público — KNV Phase 2

## Alcance

Phase 2 implementa las diez rutas documentadas en `docs/ROUTES.md`. La arquitectura usa Server Components por defecto. Solo el drawer móvil, el filtro de recursos y los formularios requieren hidratación.

El contenido repetido vive en `src/content`: configuración de marca/contacto, áreas, servicios, recursos y preguntas frecuentes. Los datos desconocidos son `null` y no se renderizan. No se inventan credenciales, domicilio, horarios, teléfono, email, resultados, testimonios ni estadísticas.

## Assets y referencias

- Referencias encontradas: seis capturas raster de otra marca, usadas solo para estudiar composición, jerarquía, cards, formularios, secciones y CTAs.
- No encontrados: dos mockups públicos indicados, logo/isotipo oficial KNV, retrato profesional y datos de contacto confirmados.
- Decisión: identidad tipográfica temporal, paleta KNV aprobada y composiciones propias. No se reutiliza la marca ajena ni se genera una persona ficticia.
- Sustitución futura: `Brand` y los contenedores de media permiten integrar SVG/PNG y fotografía autorizada sin cambiar la estructura de las páginas.

## Formularios

React Hook Form y Zod proporcionan etiquetas, errores asociados, honeypot, estados y validación. Al completar un formulario se informa de forma expresa que los datos se validaron localmente y no se enviaron. No hay `fetch`, Route Handler, Server Action, SDK Firebase, email ni mensaje falso de éxito.

## SEO y accesibilidad

- Metadata por ruta, template de título, descripciones y canonical final.
- `robots.txt`, `sitemap.xml`, breadcrumbs semánticos y JSON-LD `LegalService` solo con propiedades confirmadas.
- OG 1200×630 generado en servidor con identidad gráfica, sin fotografía falsa.
- Objetivo WCAG 2.2 AA: regiones semánticas, jerarquía de headings, skip link, labels, foco visible, drawer por teclado, targets de 44 px y reduced motion.

## Rendimiento y cuota

Las rutas son estáticas cuando no necesitan sesión, no hay listeners, consultas Firestore, polling ni assets fotográficos pesados. Phase 2 no consume cuota Firebase desde el sitio público.
