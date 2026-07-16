# Nébula — Guía de Sistema de Diseño

## Concepto

**Nébula** vive en una paleta de "océano profundo": tinta azul-verdosa (`#0f2d3c`, nunca negro puro) como superficie de marca, un degradado esmeralda → cian como única firma viva, y neutros fríos derivados de `#c8d2d7`. La referencia sigue siendo el minimalismo de Apple: tipografía con tracking negativo en titulares grandes, mucho espacio, sombras suaves y color usado con intención, no como decoración. Orbes difuminados con los colores de marca flotan detrás de todas las pantallas como atmósfera.

## Paleta de colores

Tokens definidos como CSS custom properties en `globals.css` y expuestos a Tailwind v4 vía `@theme inline`. Colores base de la marca:
`#0f2d3c` · `#c8d2d7` · `#005546` · `#1ebe91` · `#69d7b9` · `#005073` · `#41cff0` · `#3cdcf0` · `#41d791` · `#4ba591`

### Modo claro
| Rol | Hex | Uso |
|---|---|---|
| Fondo | `#EEF3F5` | Fondo de página — bruma fría, no blanco puro |
| Superficie | `#FFFFFF` | Cards, inputs, modales |
| Superficie elevada | `#DBE4E8` | Hover states, skeletons |
| Texto principal | `#0F2D3C` | Tinta océano |
| Texto secundario | `#52707E` | Gris azulado |
| Borde | `rgb(15 45 60 / 0.12)` | Divisores, contornos de card |

### Modo oscuro
| Rol | Hex | Uso |
|---|---|---|
| Fondo | `#081E2A` | Océano profundo, más oscuro que la superficie |
| Superficie | `#0F2D3C` | Cards, inputs, modales |
| Superficie elevada | `#16394B` | Hover states, skeletons |
| Texto principal | `#E9F1F4` | Bruma clara |
| Texto secundario | `#94ADB8` | Gris azulado claro |
| Borde | `rgb(200 210 215 / 0.14)` | Divisores, contornos de card |

El cambio de tema es explícito (botón sol/luna en la sidebar/topbar), persistido en `localStorage` (`nebula-theme`) y aplicado antes del primer render vía un script inline (`ThemeScript`) para evitar parpadeos.

### Acentos (fijos en ambos modos)
| Rol | Token | Hex | Uso |
|---|---|---|---|
| Acento primario | `--accent` | `#1EBE91` | CTAs, links, estados activos, corazón de favoritos |
| Acento primario (texto/hover) | `--accent-alt` | `#005546` | Texto de acento con contraste sobre fondos claros |
| Acento secundario | `--accent-secondary` | `#41CFF0` | Extremo frío del degradado, detalles |
| Acento secundario (texto) | `--accent-secondary-alt` | `#005073` | Versión legible sobre claro |
| Acento terciario | `--accent-tertiary` | `#3CDCF0` | Ratings, highlights sobre superficies oscuras |
| Acento terciario (texto) | `--accent-tertiary-alt` | `#005546` claro / `#41D791` oscuro | Texto de acento terciario con contraste suficiente |
| Acento suave | `--accent-soft` | `#69D7B9` | Detalles menores |
| Tinta | `--ink` | `#0F2D3C` | **Texto sobre el degradado de marca** (contraste AA; nunca blanco sobre esmeralda) |

**Degradado de marca**: `linear-gradient(135deg, #1EBE91, #41CFF0)` (`.bg-gradient-nebula`) — la única firma "viva" del sistema. Se reserva para: CTAs primarios, chips activos, la barra de sección, números de ranking, el marco del modal de tráiler y estados de éxito. El texto encima siempre es `--ink`, no blanco. Existe un degradado secundario "profundo" `linear-gradient(135deg, #005546, #005073)` (`.bg-gradient-deep`) para tarjetas de estadística con texto blanco.

### Superficie oscura fija (sidebar / hero / paneles de auth)
| Rol | Hex |
|---|---|
| `dark-surface` | `#0F2D3C` |
| `dark-surface-soft` | `#143A4D` |
| `on-dark` (texto) | `#EEF3F5` |
| `on-dark-soft` (texto secundario) | `rgb(200 210 215 / 0.72)` |

La sidebar, los heros y el panel de auth son una "barra de cine" intencionalmente oscura en ambos modos — no cambian con el tema, dan continuidad de marca.

### Orbes ambientales

`AmbientOrbs` (en `AppShell`) pinta tres círculos difuminados fijos detrás del contenido (`#1EBE91`, `#41CFF0`, `#005073`, opacidad 15–25%, `blur(80px)`). Los paneles oscuros (sidebar, auth, hero de detalle) llevan sus propios orbes locales.

## Tipografía

- **Geist Sans** (vía `next/font/google`) como única familia — funcional, geométrica, muy cercana a SF Pro.
- Titulares grandes: `font-bold`, `tracking-tight` (negativo), line-height ajustado.
- Números de ranking: `font-black`, `tracking-tighter`, rellenos con el degradado de marca (`bg-clip-text`).
- Cifras (precios, saldos, tarjetas): `tabular-nums` para alineación limpia.

## Logotipo

`src/components/Logo.tsx` — dos bloques redondeados solapados (tinta + esmeralda `#1EBE91`):

- **`LogoSymbol`**: solo el símbolo. `tone="auto"` (default) adapta el bloque de tinta al tema vía `--logo-ink` (`#0F2D3C` en claro, `#C8D2D7` en oscuro); `tone="onDark"` fuerza la variante clara para superficies siempre oscuras (sidebar, topbar móvil).
- **`LogoLight` / `LogoDark`**: símbolo + wordmark "Nébula" para fondos claros/oscuros fijos.
- **`LogoAppIcon`**: versión con caja para app icons.

El favicon/apple-icon/og-image se generan por código (`app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`) con `next/og`: bloques **blanco puro + esmeralda** sobre caja `#0F2D3C` — legibles a 16–32px sin depender de un raster exportado a mano.

## Layout y componentes

- **Sidebar (desktop)**: flotante con margen de 16px en los cuatro lados, `rounded-3xl`, fondo `dark-surface` con orbes. Contraída a solo iconos (76px) por defecto; se expande a 256px con el mouse (`group-hover/side:`), revelando etiquetas, secciones, saldo, usuario, tema y logout. En móvil: topbar delgada + tab bar inferior.
- **Hero del catálogo**: carrusel rotativo (7s, crossfade) con las 5 tendencias del día — backdrop, chip de ranking, ficha resumida y CTAs; dots de navegación.
- **Tendencias**: el #1 es una tarjeta spotlight a lo ancho (backdrop + póster + número gigante); del #2 en adelante, fila horizontal con el número degradado asomando solo una orilla por detrás de cada card. Las filas usan `ScrollRow`: flechas ‹ › que solo aparecen cuando hay overflow y solo por el lado desplazable (scroll + `ResizeObserver`).
- **Cards de género**: tiles con degradados de la paleta, inicial fantasma gigante y conteo de títulos; enlazan a `/search?genre=X`.
- **Cards de película**: `rounded-2xl`, `shadow-card`, hover con elevación + zoom leve del póster; badges de tipo y rating; ficha con año/género, duración o temporadas·capítulos y precios. La tendencia del día se marca solo con una orilla de degradado de 4px en el borde izquierdo del póster.
- **Grilla bento**: cards del mismo tamaño con columnas alternas desplazadas 2rem hacia abajo (`translate-y-8`); el gap vertical (3.5rem) absorbe el desplazamiento para que nunca se encimen.
- **Búsqueda (`/search`)**: input grande con foco, segmentado película/serie, orden y todos los géneros como nube de chips con wrap y conteo — sin cortes.
- **Detalle de título**: hero como tarjeta flotante en web (margen + `rounded-3xl` + sombra), ficha técnica en tiles de vidrio (`bg-white/5` + blur), géneros clicables, reparto en cards con `ScrollRow` (icono de "sin foto" cuando falta imagen), reseñas y recomendaciones.
- **Modales (tráiler y checkout)**: renderizados con `createPortal` a `<body>` — los ancestros animados crean containing blocks de `position: fixed` y descentraban el modal. El tráiler lleva marco de degradado de 1.5px, barra de título y cierre con Esc/clic fuera; el checkout escala hasta 3 columnas (bancos | tarjeta 3D | formulario) en pantallas grandes para no necesitar scroll.
- **Auth (login/registro)**: layouts espejados (login: formulario a la derecha; registro: a la izquierda) con animación de deslizamiento al cambiar. El divisor entre panel y formulario es una **onda vertical hecha con `clip-path`** sobre el propio panel — la onda corta el fondo real (orbes incluidos), sin costuras de color.
- **Placeholders de póster**: degradado radial cian/esmeralda sobre `dark-surface`.
- **Estados vacíos**: mensaje + ilustración mínima + CTA, nunca solo texto plano.
- **Estados de carga**: skeletons con shimmer.
- **Footer**: logo + descripción, enlaces del sitio, orbe de fondo y línea legal con atribución a TMDB.

## Movimiento

- Entradas de sección: `fade-up` (`cubic-bezier(0.16,1,0.3,1)`), con *stagger delays* en grids.
- Auth: `slide-in-left` / `slide-in-right` al alternar login ↔ registro.
- Modales: `scale-in`. Hero: crossfade de 1s. Glow del hero: `orbit-glow` lento.
- Botones: `hover:scale-[1.02]`, `active:scale-95`.
- Todo el movimiento respeta `prefers-reduced-motion: reduce` (duración forzada a ~0 vía media query global).

## Principios

1. **Un solo acento vivo**: el degradado esmeralda-cian es la firma; todo lo demás es neutro océano.
2. **Texto tinta sobre el degradado**: nunca blanco sobre esmeralda — `--ink` garantiza contraste AA.
3. **Superficies oscuras fijas como ancla de marca**: sidebar, heros y auth no dependen del tema.
4. **Movimiento con propósito**: cada animación comunica estado (carga, éxito, jerarquía de entrada), nunca decorativa por sí sola.
5. **Los controles aparecen cuando hacen falta**: flechas de scroll solo con overflow, botones de tendencia solo como orillas, precios solo en los CTAs.
6. **Accesibilidad como piso**: foco visible, contraste AA, `aria-pressed`/`aria-current` en toggles y navegación, `prefers-reduced-motion` respetado.
