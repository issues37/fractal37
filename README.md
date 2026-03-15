# fractal37

**fractal37** is an interactive 3D fractal explorer rendered entirely in WebGL — embedded in a single HTML file (and also available as a full React web app). Fly through mathematically infinite structures with real-time controls for animation, lighting, color, and rendering style.

## Live Demo

[View on Replit →](https://replit.com)

---

## Features

### 7 Fractal Types
| Name | Description |
|------|-------------|
| **Mandelbulb** | The iconic 3D extension of the Mandelbrot set using spherical power iteration |
| **Mandelbox** | Box- and sphere-fold IFS fractal with rich interior detail |
| **Torus Knot** | Mathematically knotted tube sampled with angular SDF |
| **Apollonian** | Inversion-based IFS gasket producing infinite circle packing |
| **Julia 3D** | 4D quaternion Julia set sliced through 3D space |
| **Sierpinski Tetra** | Classic IFS tetrahedral fractal — triangular self-similarity |
| **Menger Sponge** | Cube-subtraction fractal with recursive cross-shaped holes |

### 9 Color Palettes
Blade Runner · Cyber · Neon Trout · Heat · Frost · Monochrome · Neon Blue · Magenta Cyan · CGA Retro

All palettes use Inigo Quilez's cosine-basis formula — mathematically seamless, zero banding.

### Real-Time Controls
- **Animation** — speed, rotation speed, morph speed & offset
- **Fractal** — iterations, power/exponent, size, type
- **Lighting** — light angle, ambient, edge fog, specular, fog distance, step size, contrast
- **Camera** — X/Y rotation, field of view
- **Color** — saturation, brightness, color depth, palette, palette offset & cycle speed
- **Rendering** — smoothness, glow, pixelate, vignette
- **Effects** — scanline intensity, glow intensity

### Interaction
- Press **C** or **tap/click** anywhere on the canvas to toggle the control panels
- Left panel: Animation & Fractal settings
- Right panel: Camera & Color settings

---

## Files

```
fractal37/
├── index.html          ← Standalone single-file fractal explorer (no dependencies)
├── README.md           ← This file
└── artifacts/
    └── fractal37/      ← React + Vite web app version
        └── src/
            ├── App.tsx
            └── FractalExplorer.tsx
```

## Running the Standalone HTML File

Just open `index.html` in any modern browser. No build step, no dependencies, no internet required.

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

Requires a browser with **WebGL 1.0** support (all modern browsers qualify).

## Running the React App

```bash
pnpm install
pnpm --filter @workspace/fractal37 run dev
```

---

## Technical Details

### Rendering Pipeline
- **Ray marching** with sphere-tracing (distance estimator functions)
- **150 march steps** per fragment, early exit on hit or miss
- **Normal estimation** via central differences (6 scene evaluations per surface point)
- **Lighting** — Lambertian diffuse + Phong specular + Fresnel rim + depth fog
- **Glow** — dual accumulation: hard glow (exp(-d*20)) + soft smooth glow (exp(-d*smoothness))
- **Post-processing** — gamma correction, brightness, contrast, vignette, optional pixelation

### Fractal Math
- Mandelbulb uses standard spherical coordinate power formula
- Mandelbox uses box-fold + sphere-fold IFS with morphing fold limit
- Julia 3D uses quaternion multiplication (4D → 3D slice)
- Apollonian uses iterative inversion IFS
- Sierpinski and Menger use classic IFS fold techniques

### Performance Notes
- All rendering happens on the GPU via GLSL fragment shaders
- Higher iteration counts and lower step sizes increase quality but reduce frame rate
- The **Pixelate** control can be used to improve performance on slower GPUs

---

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 80+ | ✅ Full |
| Firefox 75+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 80+ | ✅ Full |
| Mobile (iOS/Android) | ✅ Touch support |

---

## Contributing

1. Fork this repo
2. Create a feature branch: `git checkout -b feature/my-fractal`
3. Make your changes
4. Push and open a Pull Request

Issues and suggestions welcome — open a GitHub Issue.

---

## License

MIT License — free to use, modify, and distribute.

---

## Credits

- Fractal distance estimators adapted from the work of **Inigo Quilez** (iquilezles.org)
- Cosine-basis color palettes by **Inigo Quilez**
- WebGL rendering by fractal37 contributors
