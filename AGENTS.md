## Proyecto

Sitio web de **AWS Community Day Guatemala 2026**, construido con Astro. Es una
mejora del sitio actual [awscommunitygt.com](https://awscommunitygt.com/),
tomando esa fuente como referencia de contenido (patrocinadores, organizadores,
etc.) pero con un diseño nuevo, propio y más cuidado.

Referencias de diseño (inspiración, no copiar tal cual):

- https://awscommunitygt.com/ (sitio actual, fuente de contenido/datos)
- https://awscommunitydaycolombia.com/home
- https://awscommunityday.ca/
- https://www.infolavelada.com/combate/illojuan-vs-thegrefg (referencia del
  tratamiento de las fotos de keynote: recorte sobre negro + glow + disolución)

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

- `src/data/keynotes.json` — array de objetos; **el orden del array es el orden
  del slider**:
  ```json
  { "id": "magali-pinto", "name": "Magali Pinto", "role": "Solutions Architect", "org": "Amazon Web Services", "talk": "", "photo": "/images/keynotes/magali-pinto.webp", "linkedin": "https://www.linkedin.com/in/magalipintof" }
  ```
  Ya poblado con los 3 keynotes confirmados (Luis Carlo Arias, Magali Pinto,
  Alejandra Bricio). El orden del array manda en el slider; cambiarlo es mover
  el objeto de lugar, nada más. **Pendiente:** el `role` de Luis Carlo Arias y
  el `talk` (título de la charla) de los tres.

  `talk: ""` no rompe nada: la tarjeta muestra «Tema por confirmar» en gris
  apagado; en cuanto se llena, ese mismo renglón pasa a título en degradado
  magenta→naranja (el acento fuerte del slide, como el banner de keynote de
  `day.awscommunity.mx`). `photo: ""` tampoco rompe: cae al ícono de silueta.
  Cada keynote lleva **dos fotos**, una por diseño (ver «Los dos diseños del
  bloque de keynotes»): `photo` es el recorte con transparencia y
  `photoOriginal` la foto tal cual, con su fondo, en
  `public/images/keynotes/con-fondo/`. Si falta `photoOriginal`, el diseño
  alterno cae a `photo`.

  Fotos en `public/images/keynotes/`, cuadradas (800×800), `.webp` y **con el
  fondo recortado** (transparencia): el slide las pinta sobre negro con un glow
  detrás, así que una foto con fondo se ve como un recuadro pegado. Para
  recortar una foto nueva está `solicitudes/recortar-fondo.py` (u2net vía
  onnxruntime, uso en el docstring del script). El script conserva el encuadre
  original de la foto; el tamaño al que se ve la persona se decide en el CSS
  del slide, no recortando la imagen.

  Ojo con un caso concreto que ya apareció: u2net marca como opaco el fondo que
  se cuela **entre los mechones sueltos** del pelo y eso sale como una mancha
  gris dentro de la silueta. El script lo corrige inundando el fondo desde el
  marco de la foto (píxeles claros y neutros) y recalculando ahí la
  transparencia real de la mezcla pelo/fondo. Esa corrección va **solo** en esa
  zona: aplicarla al contorno general se come el borde de la piel.

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

### Banderas de país

`Flag.astro` dibuja la bandera como **SVG en línea** a partir del `countryCode`
del ponente (`speakers.json`). **No se usa el emoji de bandera** (🇬🇹): Windows
no lo trae — Segoe UI Emoji no tiene glifos de bandera — y el navegador termina
dibujando las dos letras del código ("GT") dentro de la cajita blanca.

- Los diseños están simplificados porque se ven a 15-26px, pero los escudos de
  **México y Ecuador sí van insinuados**: sin ellos México se confunde con
  Italia y Ecuador queda idéntico a Colombia.
- Para un país nuevo: agregar su entrada al objeto `FLAGS` de `Flag.astro`. Si
  el código no está, el componente no pinta nada — no rompe la tarjeta.
- Lo usan `SpeakerCard.astro` (26px, dentro del chip blanco sobre la foto) y
  `AgendaTalkCard.astro` / `AgendaGeneralBanner.astro` (15px, en línea después
  del nombre).

### Los dos diseños del bloque de keynotes

Hay **dos versiones del bloque**, en discusión, y se cambia de una a otra
comentando/descomentando un import en `src/pages/index.astro` — nada más:

```astro
import Keynotes from '../components/Keynotes.astro';        // A (por defecto)
// import Keynotes from '../components/KeynotesFramed.astro';  // B
```

- **A · `Keynotes.astro` + `KeynoteCard.astro`** — la persona recortada sobre
  negro, con glow detrás y los hombros disueltos en el fondo (estilo
  `infolavelada.com`). Usa `photo` (recorte con transparencia).
- **B · `KeynotesFramed.astro` + `KeynoteFramedCard.astro`** — la foto con su
  fondo original, tratada como pieza impresa: recorte vertical 3:4, paspartú
  magenta plano, pestaña con el número y un bloque naranja sólido de apoyo
  detrás. Usa `photoOriginal`.

  Va sobre **morado oscuro** (`#211936`), un paso por debajo del violet-deep
  con el que empatan los bloques vecinos, así que el degradado hunde el centro
  del bloque en vez de levantarlo — igual se distingue, y las uniones siguen
  empatando. El tono vive en ocho variables al inicio del `<style>` de
  `KeynotesFramed.astro` (`--kf-surface`, `--kf-text`, `--kf-muted`,
  `--kf-line`, `--kf-accent`, `--kf-ghost`, `--kf-chip`, `--kf-edge`), con
  alternativas anotadas ahí mismo.

  **Se conecta con los bloques vecinos por degradado**, sin cortes: el fondo
  sube desde `--kf-edge` (violet-deep, el color con el que termina el bloque
  del video y con el que empieza el de ponentes) hasta el morado y vuelve a
  bajar. Para que la unión no se note hubo que hacer tres cosas, no una:
  quitarle el `border-block` a la sección, desvanecer el patrón de iconos en
  los bordes con un `mask-image` (su corte marcaba la línea aunque el color ya
  empatara) y apagar el borde superior del bloque siguiente. Ese último va en
  `:global`, con `~` en vez de `+` — Astro deja el `<script>` del carrusel
  entre las dos secciones — y pisando `border-block-start-color`, que es la
  propiedad con la que la sección vecina lo declara.

  Lleva la palabra **KEYNOTE en gigante como banda superior**, con el retrato
  encima tapándole la parte de abajo — el recurso de las tarjetas de keynote de
  `awscommunitydaycolombia.com`. Va con los mismos colores que "Guatemala" en
  el título del hero (magenta y naranja), pero **invertida**: naranja a la
  izquierda, porque de ese lado la palabra toca el paspartú magenta del
  retrato y los dos magentas se fundían. Como esa palabra ya titula el bloque,
  en este diseño se ocultan el kicker de sección y el "Keynote Speaker" de la
  tarjeta, que lo repetían.

  Ojo con el `line-height: 0.78` de esa palabra: con line-height menor que 1
  los glifos se salen por arriba de su caja, y el carrusel los recorta
  (`overflow-x: auto` hace que `overflow-y` compute a `auto`, así que también
  corta en vertical). Por eso lleva `padding-top: 0.2em` — sin él se ve la
  parte de arriba de las letras cortada en plano.

  El marco es **plano a propósito**: la versión anterior tenía un degradado
  magenta→morado con radio grande y una placa repitiendo el nombre que ya está
  en grande al lado. Como la foto trae su propio fondo (blanco, gris o una
  oficina), cualquier adorno con color compite con ella; el paspartú plano la
  contiene y el bloque naranja da profundidad sin degradados.

Los dos comparten cabecera, carrusel, controles y datos, y ninguno recibe
props, así que son intercambiables. Lo único que cambia es el tratamiento de la
tarjeta. El custom element del alterno se llama `<keynote-slider-framed>` para
que los dos scripts no se pisen si alguna vez conviven en la misma página.

Cuando se decida uno, borrar el otro par de componentes y el import comentado.

### El slider de keynotes

`Keynotes.astro` renderiza un custom element `<keynote-slider>`: un carrusel de
un keynote a la vez, con la puesta en escena de las fichas de combate de
`infolavelada.com` — la persona recortada sobre negro, sin marco ni tarjeta.

Las tres capas del efecto viven en `KeynoteCard.astro` y son CSS puro:

- `.glow` — dos radiales morados detrás de la figura (uno cerrado a la altura
  de la cabeza, como contraluz, y otro amplio), desenfocados y al 60%. Sube a
  85% y escala un 4% en `:hover`.
- `.cutout` — la foto recortada, con `mask-image` degradado que **disuelve los
  hombros en el negro de la sección** (opaco hasta el 34%, transparente al
  95%). El degradado es largo a propósito: uno corto deja una línea recta
  visible donde termina la foto.
- `.floor` — una elipse naranja muy tenue (`mix-blend-mode: screen`) a los pies,
  para apoyar la figura en el suelo en vez de dejarla flotando.

Comportamiento del carrusel:

- La pista es un scroll horizontal con `scroll-snap`, así que **sin JavaScript
  sigue funcionando**: se desliza con el dedo/trackpad y los controles quedan
  ocultos (`hidden` lo quita el script al montar), igual que la agenda.
- Autoplay de 8s (`data-interval`); la barra de progreso son los propios
  puntos/`.dot`, animados por CSS con `--interval`. Se pausa cuando la sección
  sale de viewport y **se apaga en la primera interacción** del usuario
  (clic, swipe, teclas, foco) — entonces `data-autoplay="off"` congela la barra.
- Navegación por flechas, puntos y teclas ←/→ sobre la pista; el slide inactivo
  queda `inert` para que no se pueda tabular a un enlace invisible.
- Con `prefers-reduced-motion` no hay autoplay ni desplazamiento suave.

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

## Pedir datos en Excel (carpeta `solicitudes/`)

Para no editar los JSON a mano cuando falta información (o llega un ponente
nuevo), hay un ida y vuelta por CSV:

```
npm run csv:generar             # agenda.csv + ponentes.csv desde el estado actual
npm run csv:importar            # los carga de vuelta a agenda.json / speakers.json
npm run csv:importar -- --dry   # preview, no escribe
```

Los CSV llevan el **nombre** legible de salón/track/país (no ids) y una primera
columna `QUE_FALTA` que marca qué le falta a cada fila. Una fila **sin id** crea
una sesión o un ponente nuevo; el id se genera del nombre. Una celda vacía
significa «no cambies este dato», nunca «bórralo» — el importador no borra nada.

Si una charla no trae `id_ponente`, se enlaza por coincidencia **exacta** de
nombre contra `ponentes.csv` (sin acentos ni mayúsculas); si no hay match,
avisa y la tarjeta cae a las iniciales. La organización del ponente rellena la
de la charla cuando esta viene vacía. Detalles en `solicitudes/README.md`.

`importar-csv.mjs` conserva el formato de `agenda.json` (una sesión por línea,
línea en blanco entre bloques horarios) y solo reescribe un archivo si cambió.

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
