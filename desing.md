# Nébula — Guía de Sistema de Diseño

## Concepto

**Nébula** toma su identidad literal del nombre: un acento de marca en degradado violeta → magenta que evoca el núcleo y el borde de una nebulosa, sobre un sistema por lo demás muy calmado y neutro — hueso cálido en modo claro, ink profundo (nunca negro puro) en modo oscuro. La referencia es el minimalismo de Apple: tipografía con tracking negativo en titulares grandes, mucho espacio en blanco, sombras suaves y color usado con intención, no como decoración.

## Paleta de colores

### Modo claro
| Rol | Hex | Uso |
|---|---|---|
| Fondo | `#F7F3EC` | Fondo de página — hueso cálido, no blanco puro |
| Superficie | `#FFFFFF` | Cards, inputs, modales |
| Superficie elevada | `#EFE9DF` | Hover states, skeletons |
| Texto principal | `#17151F` | Ink casi negro con matiz violeta |
| Texto secundario | `#6E6A78` | Gris cálido |
| Borde | `rgb(23 21 31 / 0.10)` | Divisores, contornos de card |

### Modo oscuro
| Rol | Hex | Uso |
|---|---|---|
| Fondo | `#0D0B12` | Ink profundo, no negro puro |
| Superficie | `#1A1721` | Cards, inputs, modales |
| Superficie elevada | `#221E2C` | Hover states, skeletons |
| Texto principal | `#F5F1EA` | Hueso cálido |
| Texto secundario | `#A79FB3` | Gris violeta claro |
| Borde | `rgb(245 241 234 / 0.12)` | Divisores, contornos de card |

El cambio de tema es explícito (botón sol/luna en el header), persistido en `localStorage` (`nebula-theme`) y aplicado antes del primer render vía un script inline (`ThemeScript`) para evitar parpadeos.

### Acentos (fijos en ambos modos)
| Rol | Hex | Uso |
|---|---|---|
| Acento primario | `#6C4CF5` | CTAs, links, estados activos |
| Acento primario (hover/pressed) | `#5636C9` | Hover de botones secundarios, texto sobre tintas claras |
| Acento secundario | `#E94E92` | Extremo cálido del degradado de marca, detalles |
| Acento terciario | `#22D3C5` | Ratings, éxito, hover en superficies oscuras |
| Acento terciario (texto) | `#0F8F85` | Texto de acento terciario con contraste suficiente en fondos claros |

**Degradado de marca**: `linear-gradient(135deg, #6C4CF5, #E94E92)` — es la única firma "viva" del sistema. Se reserva para: el isotipo, el CTA primario, el foco del checkout, el glow atmosférico del hero y estados de éxito. No se usa como fondo general de bloques de contenido.

### Superficie oscura fija (header / hero / footer)
| Rol | Hex |
|---|---|
| `dark-surface` | `#14121C` |
| `dark-surface-soft` | `#1D1A28` |
| `on-dark` (texto) | `#F5F1EA` |
| `on-dark-soft` (texto secundario) | `rgb(245 241 234 / 0.68)` |

Header y footer son una "barra de cine" intencionalmente oscura en ambos modos — no cambian con el tema, dan continuidad de marca.

## Tipografía

- **Geist Sans** (ya integrada vía `next/font/google`) como única familia — funcional, geométrica, muy cercana a SF Pro.
- Titulares grandes: `font-bold`, `tracking-tight` (negativo), line-height ajustado (`leading-[1.1]`).
- Cuerpo: `font-normal`, line-height relajado.
- Cifras (precios, saldos, tarjetas): `tabular-nums` para alineación limpia.

## Logotipo

`NebulaOrb` / `NebulaGlyph` (`src/components/Logo.tsx`): un círculo con degradado radial violeta → magenta y dos motas ("estrellas") blancas, sin caja contenedora en el uso inline (header/footer), con caja `#14121C` redondeada para el favicon/app icon (más legible a 16–32px). El wordmark es "Nébula" en minúsculas, `currentColor`, para heredar el color del contexto sin variantes claras/oscuras separadas.

El favicon/app icon/apple-icon/og-image se generan por código (`app/icon.tsx`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`) con `next/og` — nítidos en cualquier resolución, sin depender de un archivo raster exportado a mano.

## Layout y componentes

- **Header**: sticky, translúcido con blur, fondo `dark-surface`. Nav de escritorio en línea; en móvil colapsa a un menú hamburguesa animado.
- **Hero**: bloque `dark-surface` con un glow de degradado difuminado (posición asimétrica, animación `orbit-glow` muy lenta y sutil), titular con una palabra resaltada en degradado de texto.
- **Cards de película**: `rounded-2xl`, `shadow-card`, hover con elevación (`-translate-y-1`) + zoom leve del poster + halo de acento — nunca solo un cambio de color plano.
- **Placeholders de póster**: degradado radial violeta/magenta sobre `dark-surface` (reemplaza el rayado diagonal "wireframe" del sistema anterior).
- **Estados vacíos**: mensaje + un pequeño círculo de degradado, nunca solo texto plano.
- **Estados de carga**: skeletons con shimmer, no solo texto "Cargando…".
- **Checkout / pasarela de pago (demo)**: modal con tarjeta 3D que gira al enfocar el CVC, formateo en vivo del número de tarjeta, detección de marca (Visa/Mastercard/Amex), validación Luhn, selector de banco que retematiza el color de la tarjeta (BBVA azul, Santander rojo, HSBC un rojo distinto, Mercado Pago negro, Rappi Card otro negro, DiDi Card naranja), tarjetas guardadas (solo últimos 4 dígitos en `localStorage`, nunca el número completo) y accesos directos de Google Pay / Apple Pay / Samsung Pay que saltan el formulario. Etiqueta permanente de "pago simulado" en todo momento.
- **Catálogo TMDB**: películas y series en la misma parrilla, con segmentado Película/Serie, reparto, tráiler embebido, reseñas y recomendaciones acotadas a lo que ya está en catálogo (para no enlazar a fichas inexistentes).

## Movimiento

- Entradas de sección: `fade-up` (opacidad + traslación Y, `cubic-bezier(0.16,1,0.3,1)`), con pequeños *stagger delays* en grids.
- Modales: `scale-in`.
- Botones: `hover:scale-[1.02]`, `active:scale-95`.
- Todo el movimiento respeta `prefers-reduced-motion: reduce` (duración forzada a ~0 vía media query global).

## Principios

1. **Un solo acento vivo**: el degradado violeta-magenta es la firma; todo lo demás es neutro.
2. **Header/footer oscuros fijos**: ancla de marca que no depende del tema.
3. **Movimiento con propósito**: cada animación comunica estado (carga, éxito, error, jerarquía de entrada), nunca decorativa por sí sola.
4. **Accesibilidad como piso, no como extra**: foco visible, contraste AA en texto sobre acentos, `prefers-reduced-motion` respetado.
