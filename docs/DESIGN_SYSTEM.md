# Design system KNV

## Dirección visual

Jurídica premium, sobria y contemporánea. La identidad se apoya en navy profundo, dorado controlado, crema y superficies blancas. El dorado señala jerarquía y acción; no se usa como fondo dominante ni texto de bajo contraste.

## Tokens iniciales

| Token         | Valor     | Uso                              |
| ------------- | --------- | -------------------------------- |
| `navy-950`    | `#031B36` | Sidebar, footer, texto principal |
| `navy-900`    | `#06264A` | Botón primario, navegación       |
| `navy-800`    | `#0A3869` | Hover/enlace                     |
| `gold-700`    | `#9A650E` | Texto/acento con contraste       |
| `gold-600`    | `#B77A16` | Bordes y controles               |
| `gold-500`    | `#CF922B` | Foco y acentos decorativos       |
| `gold-100`    | `#F7EAD0` | Fondos de acento                 |
| `cream-50`    | `#FDFAF4` | Fondo público                    |
| `neutral-700` | `#4B5563` | Texto secundario                 |
| `neutral-300` | `#D5DAE1` | Bordes                           |
| `success`     | `#237A43` | Estado favorable administrativo  |
| `warning`     | `#B36A09` | Atención                         |
| `danger`      | `#B42318` | Error/acción destructiva         |
| `info`        | `#2266A6` | Información                      |

Los estados siempre combinan color, texto e icono cuando corresponda.

## Tipografía

- Headings: Georgia/Cambria/Times como stack serif local de rendimiento inmediato. Una fuente de marca licenciada podrá sustituirla cuando exista un archivo oficial y derechos confirmados.
- UI/body: stack sans-serif del sistema para legibilidad y rendimiento.
- Escala fluida con `clamp()` en títulos; cuerpo mínimo 16 px en móvil.
- Líneas de lectura pública entre 60 y 75 caracteres.

## Espaciado y geometría

- Unidad base: 4 px; ritmo principal 8/12/16/24/32/48/64.
- Radios: 6 px para controles, 10 px para cards, 16 px para superficies destacadas.
- Sombras tenues azuladas; la separación depende primero de borde/espacio.
- Target táctil mínimo: 44 × 44 px.

## Breakpoints y comportamiento

| Rango         | Estrategia                                                   |
| ------------- | ------------------------------------------------------------ |
| `< 640px`     | Una columna, navegación/detalle en drawer, tablas como cards |
| `640–767px`   | Teléfono grande, grids de 2 cuando haya espacio real         |
| `768–1023px`  | Tablet, sidebar compacta o drawer, filtros apilables         |
| `1024–1439px` | Laptop, sidebar persistente y tablas reducidas               |
| `≥ 1440px`    | Desktop amplio con ancho máximo, sin estirar líneas          |

No se diseña una pantalla de 1920 px para reducirla después. Cada componente define primero su estado móvil.

## Tablas

- Desktop: tabla semántica, header sticky solo si mejora navegación.
- Tablet: columnas prioritarias + scroll horizontal controlado, con etiquetas accesibles.
- Móvil: lista de cards con pares etiqueta/valor; acciones en menú o drawer.
- Paginación y filtros siempre server-side.

## Componentes base

La arquitectura contempla `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, date picker, `Badge`, `Card`, `Table`, modal, drawer, dropdown, tabs, breadcrumb, tooltip, empty state, skeleton, alert, toast, pagination, search, filters, sidebar y topbar.

Phase 2.2 integra la marca oficial y una utility bar navy en el header. Los heroes fotográficos ya no se presentan como tarjetas laterales: usan imagen de fondo, overlay navy multidireccional y contenido superpuesto con contraste alto. En móvil el overlay se refuerza y el punto focal se desplaza para proteger la lectura. Se evita una dependencia de primitivas adicional mientras los controles nativos cubran correctamente semántica y teclado.

## Estados obligatorios

Cada feature debe especificar: loading/skeleton, empty, error recuperable, success, permission denied y degradación/offline cuando sea relevante. Formularios asocian errores mediante `aria-describedby`, resumen de errores y foco en el primer campo inválido.

## Accesibilidad

- Objetivo WCAG 2.2 AA.
- HTML semántico y orden de heading coherente.
- Navegación completa por teclado y skip link en CRM.
- Foco visible dorado de 3 px.
- No depender de color.
- `prefers-reduced-motion` desactiva movimiento no esencial.
- Contraste se vuelve a medir con las fuentes y estados finales.

## Assets

El isotipo oficial proviene de `assets/favicon.jpg` y sustituye el icono genérico del navbar. Se usa con fondo blanco, borde dorado y tamaños visuales de 44 px en móvil y 52 px en desktop, sin alterar su arte. `assets/opengraph.jpg` es el diseño social oficial. Los recursos editoriales mantienen la paleta navy, cream, gold y madera oscura; son ilustrativos y nunca se presentan como retratos u oficinas reales. Consulte `docs/IMAGE_ASSETS.md`.
