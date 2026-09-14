# Assets de imagen — KNV Phase 2.1

## Fuentes oficiales

| Fuente                 | Auditoría                                              | Uso                                                             |
| ---------------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| `assets/favicon.jpg`   | 877×877 px, 1:1, JPEG 24-bit, 60,250 bytes             | Fuente inalterada del favicon, navbar y derivados Apple/Android |
| `assets/opengraph.jpg` | 1075×716 px, ratio 1.5014:1, JPEG 24-bit, 63,822 bytes | Fuente inalterada del Open Graph oficial                        |

`scripts/generate-brand-assets.mjs` recorta únicamente margen blanco, conserva proporciones y añade padding blanco seguro. Genera favicon 16/32/ICO, Apple 180, Android 192/512, navbar WebP 128 y OG 1200×630. El OG usa `contain` y padding, nunca estiramiento.

Mientras el dominio personalizado no esté conectado, `og:image` y `twitter:image` usan el alias público estable `bufetekarlavasquez.vercel.app`; el canonical permanece en `bufetekarlavasquez.com`. Al conectar el dominio se podrá cambiar solo el origen de la imagen social.

## Imágenes editoriales generadas

Se generaron diez composiciones 1536×1024 y se optimizaron a WebP (calidad 82). Lenguaje compartido: fotografía hiperrealista editorial para firma legal premium, luz natural cinematográfica, navy profundo, crema, oro discreto y madera oscura; sin texto legible, logos, sellos, datos personales, marcas de agua ni rostros identificables.

| Archivo                            | Uso y concepto                                               | Texto alternativo principal                                               |
| ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `home-hero-legal.webp`             | Escritorio elegante, documentos y balanza; espacio editorial | Escritorio jurídico preparado con documentos y balanza de justicia        |
| `about-professional-approach.webp` | Sala privada, mesa, dos sillas, carpeta y pluma              | Espacio profesional preparado para una consulta jurídica privada          |
| `practice-areas-legal.webp`        | Libros, balanza y documentos                                 | Libros y documentos jurídicos organizados sobre un escritorio profesional |
| `family-law-guidance.webp`         | Conversación respetuosa entre adultos, sin rostros           | Conversación respetuosa entre adultos en un espacio jurídico privado      |
| `divorce-legal-guidance.webp`      | Dos grupos documentales separados de forma sutil             | Documentos organizados para una orientación jurídica sobre divorcio       |
| `legal-consultation.webp`          | Consulta organizada, manos, documentos y laptop              | Consulta jurídica organizada con documentos y equipo de trabajo           |
| `legal-resources.webp`             | Libros, notas, laptop y lámpara                              | Libros, notas y herramientas para investigación jurídica                  |
| `legal-office-contact.webp`        | Recepción premium sin personas ni señalización               | Recepción sobria y profesional para atención jurídica                     |
| `notarial-civil-services.webp`     | Documentos genéricos, carpeta, pluma y llaves                | Documentación civil organizada con pluma y carpeta profesional            |
| `commercial-law.webp`              | Sala de juntas, contratos y manos genéricas                  | Reunión de trabajo para revisión de asuntos mercantiles                   |

## Prompts finales

Cada prompt combinó el lenguaje compartido anterior con el concepto específico de la tabla. Las restricciones comunes fueron: formato horizontal 3:2, materiales realistas, composición limpia, sin afirmar que una persona sea Karla, sin niños, drama, texto, información identificable, firmas, logos o símbolos gubernamentales. Home reservó aire editorial alrededor del escritorio; About no incluyó personas; Familia mostró solo adultos sin rostros; Divorcio evitó metáforas dramáticas; Consulta y Mercantil limitaron personas a manos o cuerpos fuera de cuadro.

## Política editorial y performance

- Son imágenes ilustrativas. Nunca se describen como instalaciones reales ni como fotografía de Karla Norin Vásquez.
- El hero Home es candidato LCP y usa preload; el resto conserva lazy loading predeterminado de `next/image`.
- Todos los contenedores reservan espacio con aspect ratio o altura mínima. `object-position` puede ajustarse por asset sin generar variantes innecesarias.
- Los diez archivos pesan entre 76 y 182 KB aproximadamente; no se incrustan como Base64.

## Mockups

Los ocho mockups KNV solicitados (Inicio, Sobre Karla, Áreas, Familia, Divorcio, Consulta, Recursos y Contacto) no estaban presentes en el workspace ni en el adjunto de Phase 2.1. Se encontraron seis imágenes de una empresa ajena en un adjunto histórico; no se utilizaron para marca, fotografía o contenido KNV.
