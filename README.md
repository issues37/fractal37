# fractal37

  ![fractal37 preview](images/preview.png)

  **fractal37** is an interactive 3D fractal explorer rendered entirely in WebGL embedded in a single HTML file (and also available as a full React web app). Fly through mathematically infinite structures with real-time controls for animation, lighting, color, and rendering style.


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
  | **Sierpinski Tetra** | Classic IFS tetrahedral fractal triangular self-similarity |
  | **Menger Sponge** | Cube-subtraction fractal with recursive cross-shaped holes |


  ### 9 Color Palettes
  Neon Blue · Magenta Cyan · CGA Retro
  Blade Runner · Cyber · Neon Trout
  Heat · Frost · Monochrome


  ### Real-Time Controls

  ![controls screenshot](images/controls.png)

  Press **C** or **tap/click** anywhere on the canvas to toggle the control panels.

  - **Animation** speed, rotation speed, morph & offset
  - **Fractal** iterations, power/exponent, size, type
  - **Lighting** angle, edge, fog, specular, distance
  - **Camera** X/Y rotation speeds, field of view
  - **Color** saturation, brightness, depth, cycles
  - **Rendering** smoothness, glow, pixelate, vignette
  - **Effects** scanline intensity, glow intensity


  ---


  ## Files

  ```
  fractal37/
  ├── index.html          ← Standalone single-file fractal explorer
  ├── frontpage.html      ← Project frontpage with live embed
  ├── images/
  │   ├── preview.png     ← Fractal preview screenshot
  │   └── controls.png    ← Controls panel screenshot
  ├── docs/
  │   └── index.md        ← Full documentation
  └── README.md           ← This file
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


  ---


  ## Technical Details

  ### Rendering Pipeline
  - **Ray marching** with sphere-tracing (distance estimator functions)
  - **150 march steps** per fragment, early exit on hit or miss
  - **Normal estimation** via central differences (6 scene evaluations per surface point)
  - **Lighting** -Lambertian diffuse + Phong specular + Fresnel rim + depth fog
  - **Glow** - dual accumulation: hard glow (exp(-d×20)) + soft smooth glow (exp(-d×smoothness))
  - **Post-processing** - gamma correction, brightness, contrast, vignette, optional pixelation

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


  ## License

  MIT License - free to use, modify, and distribute.


  ---


  ## Credits

  - Fractal distance estimators adapted from the work of **Inigo Quilez** (iquilezles.org)
  - Cosine-basis color palettes by **Inigo Quilez**
  
