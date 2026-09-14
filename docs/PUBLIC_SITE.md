# Sitio público — KNV Phase 2.1

## Alcance

Phase 2.1 conserva las diez rutas documentadas en `docs/ROUTES.md` y completa su identidad visual. La arquitectura usa Server Components por defecto. Solo el drawer móvil, el filtro de recursos y los formularios requieren hidratación.

El contenido repetido vive en `src/content`: configuración de marca/contacto, áreas, servicios, recursos y preguntas frecuentes. Los datos desconocidos son `null` y no se renderizan. No se inventan credenciales, domicilio, horarios, teléfono, email, resultados, testimonios ni estadísticas.

## Assets y referencias

- `assets/favicon.jpg` y `assets/opengraph.jpg` son fuentes oficiales, se conservan sin alteración y generan derivados web reproducibles.
- Diez imágenes editoriales generadas para KNV se sirven como WebP optimizados desde `public/images/knv/`; ninguna representa a Karla ni afirma mostrar oficinas reales.
- Los ocho mockups KNV solicitados no estaban disponibles. Las seis capturas localizadas pertenecen a otra marca y no se usaron como identidad ni contenido visual.
- La procedencia, prompts, dimensiones, textos alternativos y política de uso se documentan en `docs/IMAGE_ASSETS.md`.

## Formularios

React Hook Form y Zod proporcionan etiquetas, errores asociados, honeypot, estados y validación. Al completar un formulario se aclara que el bufete todavía no ha recibido la información. No hay `fetch`, Route Handler, Server Action, SDK Firebase, email ni mensaje falso de éxito.

## SEO y accesibilidad

- Metadata por ruta, template de título, descripciones y canonical final.
- `robots.txt`, `sitemap.xml`, breadcrumbs semánticos y JSON-LD `LegalService` solo con propiedades confirmadas.
- OG oficial derivado a 1200×630 sin deformar el diseño original, Twitter card, favicon multiformato, Apple touch icon y manifest Android mínimo sin service worker.
- Objetivo WCAG 2.2 AA: regiones semánticas, jerarquía de headings, skip link, labels, foco visible, drawer por teclado, targets de 44 px y reduced motion.

## Rendimiento y cuota

Las rutas son estáticas cuando no necesitan sesión; no hay listeners, consultas Firestore ni polling. El hero usa preload por ser candidato LCP; las imágenes restantes se cargan de forma diferida mediante `next/image`, con `sizes`, dimensiones estables y archivos WebP entre aproximadamente 75 y 182 KB. El sitio público no consume cuota Firebase.
