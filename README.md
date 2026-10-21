<a name="readme-top"></a>

<div align="center">

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<a href="https://github.com/xauendevs/xauendevs-astro">
  <img width="300px" src="https://raw.githubusercontent.com/xauendevs/xauendevs-astro/main/public/img/devS.svg" alt="Logo" width="800" />
</a>

## Rediseño XauenDevs

Puedes colaborar con el rediseño de la web de XauenDevs, no solo estás colaborando con la comunidad sino que puedes practicar/aprender algo nuevo como Astro.\
[Diseño de Figma](https://www.figma.com/design/jN8BrJx9paE4iBNNnU6F0g/Prototipo-Landing?node-id=0-1&t=hsSZtMPQBtG9fFGq-0) · [Reportar error](https://github.com/xauendevs/xauendevs-astro/issues) · [Sugerir algo](https://github.com/xauendevs/xauendevs-astro/issues)

</div>

<details>
<summary>Tabla de contenidos</summary>

- [Para empezar](#para-empezar)
  - [Prerequisitos](#prerequisitos)
  - [Instalación](#instalación)
- [Contribuir al proyecto](#contribuir-al-proyecto)
- [🛠️ Stack](#️-stack)

</details>

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

## Para empezar

### Prerequisitos

- NPM

  ```sh
  npm install npm@latest -g
  ```

### Instalación

1. Clona el repositorio

   ```sh
   git clone https://github.com/xauendevs/xauendevs-astro
   ```

2. Instala los paquetes de NPM

   ```sh
   npm install
   ```

3. Ejecuta el proyecto

   ```sh
   npm run dev
   ```

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

## Contribuir al proyecto

Las contribuciones son lo que hacen que la comunidad de código abierto sea un lugar increíble para aprender, inspirar y crear. ¡Cualquier contribución que hagas es **muy apreciada**!

Si tienes alguna sugerencia que podría mejorar el proyecto, por favor haz un [_fork_](https://github.com/xauendevs/xauendevs-astro/fork) del repositorio y crea una [_pull request_](https://github.com/xauendevs/xauendevs-astro/pulls). También puedes simplemente abrir un [_issue_](https://github.com/xauendevs/xauendevs-astro/issues) con la etiqueta "enhancement".

Aquí tienes una guía rápida:

1. Haz un [_fork_](https://github.com/xauendevs/xauendevs-astro/fork) del Proyecto
2. Clona tu [_fork_](https://github.com/xauendevs/xauendevs-astro/fork) (`git clone <URL del fork>`)
3. Añade el repositorio original como remoto (`git remote add upstream <URL del repositorio original>`)
4. Crea tu Rama de Funcionalidad (`git switch -c feature/CaracteristicaIncreible`)
5. Realiza tus Cambios (`git commit -m 'Add: alguna CaracterísticaIncreible'`)
6. Haz Push a la Rama (`git push origin feature/CaracteristicaIncreible`)
7. Abre una [_pull request_](https://github.com/xauendevs/xauendevs-astro/pulls)

Por favor, consulta nuestra [guía de contribución](https://github.com/xauendevs/xauendevs-astro/blob/master/CONTRIBUTING.md) para saber cómo puedes empezar de la mejor manera y siguiendo [buenas prácticas](https://github.com/xauendevs/xauendevs-astro/blob/main/CONTRIBUTING.md#buenas-prácticas-).

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

## 🛠️ Stack

- [![Astro][astro-badge]][astro-url] - The web framework for content-driven websites.
- [![Typescript][typescript-badge]][typescript-url] - JavaScript with syntax for types.
- [![Tailwind CSS][tailwind-badge]][tailwind-url] - A utility-first CSS framework for rapidly building custom designs.

**¡Gracias a todos por colaborar!**

[![Contribuidores](https://contrib.rocks/image?repo=xauendevs/xauendevs-astro&max=500&columns=20)](https://github.com/xauendevs/xauendevs-astro/graphs/contributors)

<p align="right">(<a href="#readme-top">volver arriba</a>)</p>

[astro-url]: https://astro.build/
[typescript-url]: https://www.typescriptlang.org/
[tailwind-url]: https://tailwindcss.com/
[animations-url]: https://tailwindcss-animations.vercel.app/
[astro-badge]: https://img.shields.io/badge/Astro-fff?style=for-the-badge&logo=astro&logoColor=bd303a&color=352563
[typescript-badge]: https://img.shields.io/badge/Typescript-007ACC?style=for-the-badge&logo=typescript&logoColor=white&color=blue
[tailwind-badge]: https://img.shields.io/badge/Tailwind-ffffff?style=for-the-badge&logo=tailwindcss&logoColor=38bdf8
[contributors-shield]: https://img.shields.io/github/contributors/xauendevs/xauendevs-astro.svg?style=for-the-badge
[contributors-url]: https://github.com/xauendevs/xauendevs-astro/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/xauendevs/xauendevs-astro.svg?style=for-the-badge
[forks-url]: https://github.com/xauendevs/xauendevs-astro/network/members
[stars-shield]: https://img.shields.io/github/stars/xauendevs/xauendevs-astro.svg?style=for-the-badge
[stars-url]: https://github.com/xauendevs/xauendevs-astro/stargazers
[issues-shield]: https://img.shields.io/github/issues/xauendevs/xauendevs-astro.svg?style=for-the-badge
[issues-url]: https://github.com/xauendevs/xauendevs-astro/issues
[with-love]: https://img.shields.io/badge/with_%F0%9F%92%9A_from-JAEN-green

## Temporadas (Halloween, Navidad…)

La web tiene un diseño base (el de siempre) y **temporadas** que se activan y desactivan **sin desplegar**, con Vercel *Global Config* (antes Edge Config). Cada año se vuelve a activar la que toque; no hay que borrar nada.

### Activar una temporada
1. Vercel → *Storage* → crear un **Global Config** y conectarlo al proyecto (Vercel añade la variable `GLOBAL_CONFIG`).
2. Claves del store:
   - `site_theme`: `"halloween"` · `"navidad"` · `"default"`. **Cualquier otro valor (o ninguno) deja la web exactamente como siempre.**
   - `hack_intro`: `true` / `false` (broma de entrada; usa los textos de la temporada activa).
3. Guardar: se ve en ≤ 1 min (caché de la CDN, `s-maxage=60`).

Alternativa sin Global Config: variables `SITE_THEME` y `SITE_HACK_INTRO` (**requieren *Redeploy***: Vercel solo aplica las variables de entorno a despliegues nuevos).

### Cómo está montado
- `src/lib/site-theme.ts` resuelve la temporada (Global Config → env → `default`); `src/lib/season.ts` la memoiza por petición y guarda los textos/rutas por temporada (`SEASON_CONTENT`).
- `<body data-theme="navidad" data-festive>`: `data-festive` está con cualquier temporada, `data-theme` dice cuál.
- **Colores y recursos por temporada = tokens CSS** en `src/styles/seasons.css` (`--season-rgb`, `--night-rgb`, `--glow-*`, `--season-overlay`, `--season-hero-photo`…). Tailwind los expone como `bg-season`, `text-season`, `bg-night`…
- **Variantes de Tailwind**: `fest:` (cualquier temporada), `halloween:` y `navidad:` (solo esa). Ej.: `bg-white fest:bg-white/[0.04] navidad:border-red-500`.
- Decoraciones que cambian de forma según la temporada: `SeasonMark` (calabaza/árbol), `SeasonFlyer` (murciélago/copo), `SeasonCorner` (telaraña/guirnalda) en `src/components/season/`.
- Lo que solo existe con temporada: `FestiveHero` (hero), `PageHeader`, `RealCommunity`, `HackIntro`.
- Las páginas dependientes de la temporada son SSR (`prerender = false`).

### Añadir una temporada nueva (p. ej. Reyes, Semana Santa…)
1. Añadirla a `THEMES` (`src/lib/site-theme.ts`) y a `SEASON_CONTENT` (`src/lib/season.ts`).
2. Definir sus tokens en `src/styles/seasons.css` (+ variante `x:` en `tailwind.config.mjs` si quieres estilos propios).
3. Generar sus imágenes (overlay, foto del hero y de la comunidad). Las de Navidad se generan con `python3 tools/make-navidad-assets.py`; sirve de plantilla.
4. Decoraciones: añadir su rama en `SeasonMark/Flyer/Corner` y los textos de la broma en `COPY` (`src/scripts/hack-intro.ts`).

Broma de entrada: `/?hack=1` la fuerza (también sin temporada) · `/?nohack` la salta.
