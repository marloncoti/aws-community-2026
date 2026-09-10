## Proyecto

Sitio web de **AWS Community Day Guatemala 2026**, construido con Astro. Es una
mejora del sitio actual [awscommunitygt.com](https://awscommunitygt.com/),
tomando esa fuente como referencia de contenido (patrocinadores, organizadores,
etc.) pero con un diseño nuevo, propio y más cuidado.

Referencias de diseño (inspiración, no copiar tal cual):

- https://awscommunitygt.com/ (sitio actual, fuente de contenido/datos)
- https://awscommunitydaycolombia.com/home
- https://awscommunityday.ca/

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Dirección de diseño

**Mobile-first, moderno y profesional. Evitar a toda costa que se vea "genérico
de IA".** Concretamente, evitar:

- Gradientes morado/violeta/azul-índigo genéricos de fondo.
- Glassmorphism decorativo sin motivo (cards translúcidas flotando por flotar).
- Blobs/formas orgánicas difuminadas de relleno detrás del hero.
- Iconos genéricos en círculo con gradiente (el típico grid "3 iconitos").
- Todo con `border-radius` grande y uniforme como única decisión de estilo.
- Tipografía por defecto (Inter/system-ui) sin ninguna personalidad tipográfica.
- Hero centrado con texto + botón + imagen stock flotando a la derecha.

En su lugar:

- Paleta anclada en la identidad de AWS (Squid Ink `#232F3E`, Smile Orange
  `#FF9900`) combinada con neutros propios (no clonar el naranja/azul de forma
  literal en todos lados; usarlo con acento, no de fondo saturado).
  Usar el logo (`src/assets/brand/logo-awscd-2026.png`) y el hero
  (`src/assets/brand/hero-background.png`) como ancla de paleta real: sacar los
  colores de ahí en vez de inventarlos.
- Layout con estructura de grid visible (columnas asimétricas, alineación
  editorial), no todo centrado y apilado igual.
- Un solo acento tipográfico con carácter para títulos (ej. una sans
  condensada/geométrica) + una sans neutra para cuerpo de texto. Jerarquía
  marcada por tamaño/peso, no por color.
- Separadores de sección con quiebres angulares, líneas o bloques de color
  sólido en vez de más gradientes.
- Fotografía real de organizadores (ya descargada) en vez de ilustraciones
  genéricas; logos de patrocinadores en cajas neutras (blanco/gris) para que
  no compitan entre sí.

**Transición de paleta (en curso):** por pedido explícito, el sitio está
migrando gradualmente de un tono solo navy/gris hacia acentos morados, tomando
como referencia el hero de `day.awscommunity.mx` (fondo púrpura oscuro +
patrón de iconos a muy baja opacidad). Variables ya definidas en
`Layout.astro`: `--color-violet` (#6d4aad) y `--color-violet-deep` (#2a1f3d).
Primer paso aplicado: un glow radial morado en la esquina superior del Hero
(`.hero-glow`, `mix-blend-mode: screen`) combinado con el patrón de iconos.
Esto es intencionalmente gradual — no reemplazar navy/orange de golpe en el
resto del sitio sin confirmarlo primero.

## Assets ya descargados

- `src/assets/brand/hero-background.png` — banner original del hero (1600×857),
  descargado de `awscommunitygt.com/wp-content/uploads/2026/07/banner_demo_2.png`.
- `src/assets/brand/logo-awscd-2026.png` — logo del evento (192×115),
  descargado de `awscommunitygt.com/wp-content/uploads/2026/01/logo_awscd_2026_mini.png`.
- `src/assets/brand/quetzal.png` — flourish decorativo del header, descargado
  de `awscommunitygt.com/wp-content/uploads/2026/07/mini_v3_shape_quetzal.png`.
- `public/images/pattern.svg` — patrón de iconos tileable (475×475), descargado
  de `day.awscommunity.mx/img/Pattern.svg`. Se usa como textura de fondo en el
  Hero a opacidad muy baja (`.hero-pattern`, 8%, `mix-blend-mode: soft-light`)
  con una animación lenta de `background-position` (`pattern-drift`, 50s) para
  darle algo de movimiento al hero, respetando `prefers-reduced-motion`.
- `public/images/sponsors/*` — logos de patrocinadores (ver `src/data/sponsors.json`).
- `public/images/organizers/*` — fotos de organizadores (ver `src/data/organizers.json`).

Los assets de hero/logo están en `src/assets/` porque se importan directamente
en componentes (permite optimización de Astro `<Image />`). Los assets de
contenido variable (patrocinadores, organizadores) están en `public/images/`
porque se referencian por ruta simple desde JSON, sin pasar por el pipeline de
build de imágenes — así cualquiera puede agregar un patrocinador nuevo sin
tocar código.

## Contenido dirigido por JSON

Cada bloque de contenido variable tiene un archivo JSON en `src/data/`. Para
agregar/quitar/editar un elemento (patrocinador, organizador) solo se edita el
JSON — no hace falta tocar componentes.

- `src/data/sponsors.json` — array de objetos:
  ```json
  { "id": "gbm", "name": "GBM", "tier": "diamond", "logo": "/images/sponsors/gbm.svg", "url": "" }
  ```
  `tier` acepta `diamond | gold | silver` (define el tamaño/orden de render).
  Ya poblado con los 7 patrocinadores actuales de awscommunitygt.com.

- `src/data/organizers.json` — array de objetos:
  ```json
  { "id": "vicente-suc", "name": "Vicente Suc", "role": "", "photo": "/images/organizers/vicente-suc.jpg", "linkedin": "https://linkedin.com/in/..." }
  ```
  Ya poblado con los 7 organizadores actuales. **Pendiente:** llenar `role`
  (cargo/rol de cada uno) — el sitio original no expone ese dato en el markup,
  hay que pedirlo o inferirlo.

- `src/data/keynotes.json` — array de objetos:
  ```json
  { "id": "keynote-1", "name": "Por confirmar", "role": "", "org": "", "photo": "", "linkedin": "" }
  ```
  **Placeholder por ahora** (3 entradas "Por confirmar", sin foto todavía —
  `KeynoteCard.astro` detecta `photo: ""` y muestra un ícono de silueta en vez
  de romper el layout). Diseño inspirado en las tarjetas de keynote de
  `awscommunitydaycolombia.com/home#keynote` y el spotlight de
  `day.awscommunity.mx`, adaptado a nuestra paleta. Cuando haya speakers
  confirmados: reemplazar `name`/`role`/`org`/`linkedin`, y subir la foto a
  `public/images/keynotes/` y referenciarla en `photo`.

- `src/data/agenda-rooms.json` — array de objetos, el orden del array define el
  orden de columnas/tarjetas en toda la agenda:
  ```json
  { "id": "auditorio-principal", "name": "Auditorio Principal", "nickname": "Tajumulco", "building": "Edificio O", "capacity": 300, "color": "#ff9900" }
  ```
  `color` es el acento de la sala: se usa **solo** como punto de 8px y como
  barra de 3px en el borde superior de la tarjeta, nunca como fondo. Sirve para
  rastrear un salón cuando se ven las 7 salas en paralelo. Agregar una sala al
  JSON hace aparecer su tab de filtro automáticamente; si falta `color` la barra
  cae a `var(--color-orange)`.

- `src/data/agenda-tracks.json` — categorías temáticas, solo `id` + `name`
  (sin color: el track se distingue tipográficamente para no competir con el
  color de sala):
  ```json
  { "id": "ia", "name": "IA & Agentes" }
  ```

- `src/data/agenda.json` — array de objetos (sesiones), consumido por
  `Agenda.astro`, que agrupa por `startTime` exacto (sin lógica de solape de
  horarios) y ordena las charlas de cada bloque según el orden de
  `agenda-rooms.json`:
  ```json
  { "id": "0950-auditorio-principal", "type": "talk", "startTime": "09:50", "endTime": "10:40", "title": "...", "speakerName": "...", "speakerOrg": "", "speakerId": "angel-castillo", "roomIds": ["auditorio-principal"], "track": "carrera", "notes": "" }
  ```
  `speakerId` resuelve la miniatura y la bandera del ponente: se busca primero en
  `speakers.json` y luego en `organizers.json` (varios organizadores también dan
  charla). Los organizadores no traen `countryCode`, así que salen con avatar
  pero sin bandera. Con `speakerId: ""` la tarjeta cae a las iniciales sobre un
  círculo neutro, así que **nunca rompe el layout** — es el estado de los
  ponentes que todavía no están en `speakers.json`. Es un id explícito a
  propósito, no un match por nombre: la agenda y `speakers.json` escriben varios
  nombres distinto y un match difuso fallaría en silencio.
  `track` referencia un `id` de `agenda-tracks.json`; `""` no rompe nada
  (simplemente no se pinta el badge) y es lo que usan las charlas "Tema por
  confirmar". Las sesiones `type: "general"` usan `"track": "plenaria"`.
  La clasificación actual se infirió de los títulos — **revisar**; en particular
  las dos sesiones de Casa de Kiro están en `ia` de forma tentativa.
  `type` acepta `general | talk`. Las sesiones generales (recepción, keynote,
  almuerzo, cierre, cena) usan `roomIds: []` y se renderizan como banner de
  ancho completo (`AgendaGeneralBanner.astro`) en vez de tarjeta
  (`AgendaTalkCard.astro`). `roomIds` acepta más de un id para una charla que
  ocupa dos salones combinados (ver la sesión `0950-salon-1-salon-2`).
  Charlas sin confirmar usan `"speakerName": "Por confirmar"` /
  `"title": "Tema por confirmar"`, mismo patrón placeholder que `keynotes.json`.
  Reconstruido a partir de un PDF de la agenda; algunas celdas venían
  incompletas o ambiguas en la fuente original (título de Byron Laínez
  truncado, la sesión de Casa de Kiro con Bárbara Gaspar sin título, la charla
  de Luis Carlo sin tema) — revisar y corregir directamente en el JSON cuando
  se tenga el dato real.

### Los dos modos de vista de la agenda

`Agenda.astro` renderiza un custom element `<agenda-board>` con dos atributos
que el script del filtro va cambiando; **los dos layouts son CSS puro sobre
`[data-view]`, no hay re-render**:

- `data-view="grid"` (tab «Todas las salas», por defecto): grid de 1/2/3
  columnas por bloque horario, para que se lea que las charlas son simultáneas.
  El rail de tiempo se colapsa en una línea de encabezado y muestra solo
  `startTime` — dentro de un mismo bloque las tarjetas pueden tener distinto
  `endTime` (los workshops de Casa de Kiro llegan hasta las 16:50), así que la
  duración vive en cada tarjeta, donde siempre es correcta.
- `data-view="track"` (una sala seleccionada): timeline de 1 columna con rail
  vertical, nodo y línea continua. Como queda una sola sesión visible por
  bloque, el script copia su `endTime` y duración al rail, y oculta la hora
  duplicada dentro de la tarjeta.

Las sesiones plenarias (`data-general`) **nunca se ocultan** al filtrar por
sala: keynote, almuerzo y cierre aplican a todos los asistentes. Los chips de
horario sí se reducen a las horas que quedan visibles. El filtro se refleja en
la URL como `?sala=<id>` (`history.replaceState`) para poder compartir un track.

Sin JavaScript la barra de tabs no se muestra (`hidden` lo quita el script al
montar) y la página se comporta como la versión estática: todo visible.

Para agregar un patrocinador/organizador/keynote/sesión de agenda nuevo: soltar
la imagen en `public/images/sponsors/`, `public/images/organizers/` o
`public/images/keynotes/` si aplica, y añadir una entrada al JSON
correspondiente. Ningún componente necesita cambios.

El CTA principal del hero ("Regístrate") enlaza directo a la plataforma de
tickets: `https://c.proticket.store/1e90d63c6b97` (`target="_blank"`).

## Arquitectura de componentes (plan)

Un componente Astro por bloque, cada uno consumiendo su JSON vía
`import data from '../data/x.json'`. Nada de contenido hardcodeado dentro del
componente.

```
src/
  components/
    Hero.astro            # imagen + logo + título/fecha/CTA
    Sponsors.astro         # itera sponsors.json, agrupa por tier
    SponsorCard.astro       # una tarjeta de logo
    Organizers.astro       # itera organizers.json
    OrganizerCard.astro     # foto + nombre + rol + link LinkedIn
  data/
    sponsors.json
    organizers.json
  assets/
    brand/
      hero-background.png
      logo-awscd-2026.png
  pages/
    index.astro            # compone Hero + Sponsors + Organizers dentro de Layout
```

Convención: los componentes de bloque (`Sponsors.astro`, `Organizers.astro`)
no reciben props — leen su propio JSON. Los componentes de tarjeta
(`SponsorCard.astro`, `OrganizerCard.astro`) sí reciben props (un item del
array) para poder reusarlos/testearlos aislados.

## Plan de mejora (fases)

**Fase 1 — Fundación (foco actual)**
1. `Hero.astro`: usa `hero-background.png` como fondo, `logo-awscd-2026.png`
   como logo, título del evento, fecha/lugar (placeholder si no está definido
   aún) y un CTA (ej. "Regístrate").
2. `Sponsors.astro` + `SponsorCard.astro`: grid responsive agrupado por tier,
   mobile-first (1 columna en móvil, más columnas en desktop).
3. `Organizers.astro` + `OrganizerCard.astro`: grid de tarjetas con foto
   circular/cuadrada, nombre, rol, link a LinkedIn.
4. Montar los tres en `src/pages/index.astro` dentro de `Layout.astro`.

**Fase 2 — Contenido adicional** (no iniciar sin confirmación):
- Agenda / horario de charlas.
- Speakers (separado de organizadores).
- Sede / mapa / cómo llegar.
- FAQ.
- Footer con redes sociales y contacto.

**Fase 3 — Pulido**
- Animaciones sutiles al hacer scroll (sin exagerar).
- Modo oscuro si aplica.
- SEO/OpenGraph, favicon definitivo, performance (Lighthouse mobile).

## Notas

- `Welcome.astro` fue el componente de bienvenida por defecto de Astro; ya no
  se usa (fue borrado) — `index.astro` debe reconstruirse desde cero usando los
  componentes de este plan, no restaurar `Welcome.astro`.
- Todo el copy debe quedar en español (el evento es en Guatemala).
