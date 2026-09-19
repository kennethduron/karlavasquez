# Assets de imagen — KNV Phase 2.3

## Fuentes oficiales

| Fuente                 | Auditoría                                              | Uso                                                             |
| ---------------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| `assets/favicon.jpg`   | 877×877 px, 1:1, JPEG 24-bit, 60,250 bytes             | Fuente inalterada del favicon, navbar y derivados Apple/Android |
| `assets/opengraph.jpg` | 1075×716 px, ratio 1.5014:1, JPEG 24-bit, 63,822 bytes | Fuente inalterada del Open Graph oficial                        |

`scripts/generate-brand-assets.mjs` recorta únicamente margen blanco, conserva proporciones y añade padding blanco seguro. Genera favicon 16/32/ICO, Apple 180, Android 192/512, navbar WebP 128 y OG 1200×630. El OG usa `contain` y padding, nunca estiramiento.

Mientras el dominio personalizado no esté conectado, `og:image` y `twitter:image` usan el alias público estable `bufetekarlavasquez.vercel.app`; el canonical permanece en `bufetekarlavasquez.com`. Al conectar el dominio se podrá cambiar solo el origen de la imagen social.

## Fotografía real autorizada de Karla

`assets/karlavasquez.jpeg` es la fotografía oficial proporcionada por el propietario para Phase 2.3. Era el único archivo nuevo sin seguimiento en el worktree inicial; se preserva intacto como fuente. La inspección del archivo real determinó JPEG sRGB de **494×494 px y 48.371 bytes**. Aunque el encargo lo describía como vertical, el archivo recibido es cuadrado. Su resolución limita el tamaño útil en pantallas de alta densidad; no se amplió artificialmente ni se reconstruyó con IA.

El derivado `public/images/knv/karla-norin-vasquez.webp` es un recorte editorial tradicional de **410×494 px y 26.548 bytes** (WebP). Se retiraron 84 px del borde derecho para excluir una placa parcialmente visible en el extremo inferior, sin modificar rostro, ropa, cuerpo ni contexto. No se detectó texto legible en los papeles o en el dispositivo dentro del recorte. No hubo retoque generativo ni blur facial. La imagen se sirve con `next/image`, dimensiones explícitas, `sizes` adaptativo y alt factual: «Karla Norin Vásquez, abogada».

Home y Sobre Karla muestran este retrato real como visual humano principal. En anchos menores de 1152 px aparece debajo del copy y CTA; desde 1152 px ocupa la columna derecha en un marco institucional discreto. Se evita un segundo derivado móvil porque el mismo recorte mantiene cabeza y manos visibles en todas las composiciones. El original ya sitúa el cabello junto al borde superior, por lo que ningún recorte adicional se aplica arriba.

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
- El hero Home y el hero principal de cada ruta editorial son candidatos LCP independientes y usan carga eager con prioridad alta; el resto conserva lazy loading predeterminado de `next/image`.
- Home, Sobre Karla, Áreas de Práctica, Familia, Divorcio, Consulta, Recursos y Contacto usan las imágenes como fondos integrados con `fill`, `sizes="100vw"`, overlays navy y altura mínima reservada.
- Los fondos son decorativos (`alt=""`) porque el título y el copy transmiten el contenido; las imágenes semánticas dentro del cuerpo mantienen texto alternativo descriptivo.
- `object-position` puede ajustarse por asset y por breakpoint sin generar variantes innecesarias.
- Los diez archivos pesan entre 76 y 182 KB aproximadamente; no se incrustan como Base64.

## Mockups

Los ocho mockups KNV solicitados (Inicio, Sobre Karla, Áreas, Familia, Divorcio, Consulta, Recursos y Contacto) no estaban presentes en el workspace ni en el adjunto de Phase 2.1. Se encontraron seis imágenes de una empresa ajena en un adjunto histórico; no se utilizaron para marca, fotografía o contenido KNV.

Phase 2.3 reutiliza los diez WebP editoriales aprobados sin regenerarlos. `home-hero-legal.webp` sigue como fondo de Home, pero con un gradiente localizado más ligero hacia la derecha; `about-professional-approach.webp` queda como fondo ambiental detrás del retrato real en Sobre Karla. `assets/favicon.jpg` y `assets/opengraph.jpg` continúan siendo las fuentes oficiales y sus derivados no cambiaron.
