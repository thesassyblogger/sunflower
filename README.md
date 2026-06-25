# Helia | Sunflower Bloom Website

A polished sunflower microsite built with Vite and Three.js. The site centers on a realistic scroll-controlled sunflower bloom, editorial typography, refined botanical content, and a clean premium visual style.

## Preview

The first screen is a cinematic sunflower experience:

- Sticky hero copy with animated letter-by-letter title reveal
- Scroll-driven 3D sunflower bloom
- Soft morning-light background with subtle grain and pointer-reactive glow
- Clean navigation for Cultivar, Growth, and Care sections

## Features

- **3D sunflower animation:** Built in Three.js with layered petals, phyllotaxis-style seed geometry, leaves, stem, pollen particles, and cinematic lighting.
- **Scroll-controlled bloom:** The sunflower opens as the user scrolls down and reverses as the user scrolls back up.
- **Sophisticated text animation:** Hero title letters reveal with soft blur and lift; section headings use refined reveal motion.
- **Animated counters:** Stat numbers count up when the stats section enters view.
- **Growth imagery:** A four-panel botanical image shows sunflower growth from germination to full bloom.
- **Responsive layout:** Designed for desktop and mobile with separate camera/scene composition tuning.
- **Care content:** Includes sunlight, watering, soil, spacing, and botanical detail sections.

## Visual Style

The design direction is calm, premium, and botanical rather than flashy. It uses:

- Warm cream backgrounds
- Natural sunflower golds
- Deep olive greens
- Soft editorial typography
- Thin divider lines
- Large negative space
- Subtle hover and reveal motion
- Gentle light washes instead of loud gradients

The goal is to feel like a sophisticated plant editorial or boutique botanical product page, with the animation acting as the main visual centerpiece.

## Animation Style

The animation system is intentionally layered:

- The sunflower bloom is controlled by scroll progress.
- Petals open in staggered rings for a more natural reveal.
- Seeds rotate subtly as the flower resolves.
- Light intensity changes as the bloom reaches full form.
- Pollen particles drift softly in the background.
- Text and content sections reveal on entry with measured easing.
- Buttons and cards have restrained hover motion.

## Tech Stack

- Vite
- Three.js
- HTML
- CSS
- JavaScript

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Project Structure

```text
.
├── index.html
├── package.json
├── public/
│   └── assets/
│       └── sunflower-growth-stages.png
└── src/
    ├── main.js
    └── styles.css
```

## Notes

The JavaScript bundle is larger than a simple static site because it includes Three.js and a custom 3D scene. Vite may show a chunk-size warning during build, but the production build completes successfully.
