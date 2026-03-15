# fractal37 — Documentation

  ## Overview

  **fractal37** is a real-time 3D fractal renderer built on WebGL. It ray-marches signed distance functions (SDFs) for each fractal type and renders with physically-inspired lighting, smooth glow, and customizable color palettes.

  Open `index.html` in any browser — no install, no server required.

  ---

  ## Quick Start

  ```bash
  # Clone the repo
  git clone https://github.com/issues37/fractal37.git
  cd fractal37

  # Open the standalone explorer
  open index.html       # macOS
  xdg-open index.html   # Linux
  ```

  That's it. The entire fractal renderer is self-contained in `index.html`.

  ---

  ## Controls

  ### Opening the Control Panels
  - Press **C** on the keyboard, or **tap/click** anywhere on the canvas
  - Two panels slide in: **Animation & Fractal** (left) and **Camera & Color** (right)

  ### Left Panel — Animation & Fractal

  | Control | Range | Description |
  |---------|-------|-------------|
  | Speed | 0–1 | Overall animation speed multiplier |
  | Rot Speed | 0–2 | How fast the fractal rotates |
  | Morph | 0–2 | Rate of internal shape morphing |
  | Morph Offset | 0–6.28 | Phase offset for morphing |
  | Iterations | 4–20 | Ray march iteration depth (quality vs. performance) |
  | Power | 2–16 | Fractal power exponent (changes shape dramatically) |
  | Size | 0.1–3 | Scale of the fractal |
  | Type | dropdown | Select one of 7 fractal types |
  | Light Angle | 0–6.28 | Direction of the key light |
  | Ambient | 0–1 | Minimum fill light (0 = pure shadow, 1 = flat) |
  | Edge Fog | 0–1 | Darkens silhouette edges via Fresnel factor |
  | Specular | 0–2 | Phong specular highlight intensity |
  | Fog Distance | 1–20 | Depth at which distant surfaces fade to black |
  | Step Size | 0.3–1.2 | Ray march step multiplier (lower = slower but safer) |
  | Contrast | 0.5–3 | Push/pull tonal contrast around mid-grey |

  ### Right Panel — Camera & Color

  | Control | Range | Description |
  |---------|-------|-------------|
  | Rotate X | 0–6.28 | Manual X-axis camera rotation offset |
  | Rotate Y | 0–6.28 | Manual Y-axis camera rotation offset |
  | Field of View | 0.5–2 | Camera FOV (wider = more distortion) |
  | Saturation | 0–2 | Color saturation (0 = greyscale) |
  | Brightness | 0.1–3 | Overall brightness multiplier |
  | Color Depth | 0–2 | How much 3D depth affects color |
  | Palette | dropdown | 9 color palette options |
  | Palette Offset | 0–6.28 | Shift the palette hue cycle |
  | Cycle Speed | 0–2 | How fast the palette animates |
  | Smoothness | 1–50 | Controls soft glow radius |
  | Glow | 0–5 | Smooth glow intensity |
  | Pixelate | 1–32 | Pixel block size (1 = off) |
  | Vignette | 0–1 | Edge darkening |
  | Scanline | 0–1 | CRT scanline overlay opacity |
  | Glow Intensity | 0–5 | Hard inner glow intensity |

  ---

  ## Fractal Types

  ### Mandelbulb
  The 3D analogue of the Mandelbrot set. Uses spherical coordinate power iteration:
  ```
  z → z^n + c  (in spherical coordinates)
  ```
  Power 8 is the "classic" Mandelbulb. Try powers 2–16 for different shapes.

  ### Mandelbox
  Iterates box-folding and sphere-folding transformations. Scale parameter driven by Power control. Produces richly detailed interior folds.

  ### Torus Knot
  SDF computed by sampling the knot curve at 48 angles. Knot parameters (p, q) animate with morph time. The tube radius also breathes gently.

  ### Apollonian
  Inversion-based IFS (Iterated Function System). Iterates modular reduction + inversion to produce infinite circle/sphere packing fractal geometry.

  ### Julia 3D
  4D quaternion Julia set. The quaternion constant **c** slowly morphs over time giving organic shape evolution.

  ### Sierpinski Tetrahedron
  Classic IFS: folds space toward four corner attractors, 10 iterations. Scale 2.0 with attractor subtraction produces the recursive tetra structure.

  ### Menger Sponge
  Iterative cube with cross-shaped holes. 5 iterations produce the characteristic recursive Swiss cheese geometry.

  ---

  ## Color Palettes

  All palettes use the **cosine palette** formula by Inigo Quilez:

  ```
  color(t) = a + b · cos(2π(ct + d))
  ```

  This guarantees smooth, seamless color cycling with no hard edges or banding.

  | Palette | Mood |
  |---------|------|
  | Blade Runner | Deep purples, electric blue, crimson — noir cyberpunk |
  | Cyber | Cyan → magenta → electric yellow — high-energy neon |
  | Neon Trout | Vivid pink → teal → orange — neon fever dream |
  | Heat | Black → deep red → orange → white — plasma forge |
  | Frost | Midnight navy → ice blue → silver — arctic light |
  | Monochrome | Smooth silver sine wave — clean structural |
  | Neon Blue | Deep black → electric blue → white-blue — cold voltage |
  | Magenta Cyan | Pure magenta → cyan — neon duality |
  | CGA Retro | Classic 4-color CGA palette — retro PC mode |

  ---

  ## Rendering Architecture

  ```
  For each pixel:
    1. Compute ray origin + direction from camera position and UV
    2. March the ray up to 150 steps using the scene SDF
    3. Accumulate glow at each step (hard + smooth)
    4. On surface hit:
       a. Estimate normal via central differences
       b. Compute Lambert diffuse + Phong specular
       c. Apply Fresnel rim light
       d. Sample cosine palette for surface color
       e. Apply edge fog, depth fog
    5. Add glow layers
    6. Gamma correction → brightness → contrast → vignette
    7. Output to gl_FragColor
  ```

  ---

  ## Performance Tips

  - Reduce **Iterations** (4–8) for faster rendering on mobile/slower GPUs
  - Increase **Step Size** to 1.0–1.2 for faster but potentially artifact-prone marching
  - Use **Pixelate** (4–16) for a retro look that also dramatically improves performance
  - Mandelbulb and Julia 3D are more GPU-intensive than Sierpinski or Menger

  ---

  ## License

  MIT — do whatever you want with it.
  