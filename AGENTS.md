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

## Assets ya descargados

- `src/assets/brand/hero-background.png` — banner original del hero (1600×857),
  descargado de `awscommunitygt.com/wp-content/uploads/2026/07/banner_demo_2.png`.
- `src/assets/brand/logo-awscd-2026.png` — logo del evento (192×115),
  descargado de `awscommunitygt.com/wp-content/uploads/2026/01/logo_awscd_2026_mini.png`.
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

Para agregar un patrocinador/organizador nuevo: soltar la imagen en
`public/images/sponsors/` o `public/images/organizers/`, y añadir una entrada
al JSON correspondiente. Ningún componente necesita cambios.

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
