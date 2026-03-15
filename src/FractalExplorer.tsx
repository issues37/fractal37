import React, { useEffect, useRef } from "react";

const VERTEX_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  
  uniform vec2 resolution;
  uniform float time;
  
  uniform float u_animSpeed;
  uniform float u_rotSpeed;
  uniform float u_morphPhase;
  uniform float u_maxIter;
  uniform float u_power;
  uniform float u_fractalSize;
  uniform float u_fractalType;
  uniform float u_rotateX;
  uniform float u_rotateY;
  uniform float u_fov;
  uniform float u_saturation;
  uniform float u_brightness;
  uniform float u_colorDepth;
  uniform float u_palette;
  uniform float u_smoothness;
  uniform float u_glow;
  uniform float u_dither;
  uniform float u_vignette;
  uniform float u_glowIntensity;
  uniform float u_paletteOffset;
  uniform float u_paletteSpeed;
  uniform float u_lightAngle;
  uniform float u_ambient;
  uniform float u_edgeFog;
  uniform float u_pixelate;
  uniform float u_specular;
  uniform float u_fogDist;
  uniform float u_stepSize;
  uniform float u_contrast;
  
  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }
  
  vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return clamp(a + b * cos(6.28318 * (c * t + d)), 0.0, 1.0);
  }
  
  vec3 paletteBladeRunner(float t) {
    return cosPalette(t, vec3(0.35,0.10,0.45), vec3(0.35,0.10,0.40), vec3(0.70,0.90,0.60), vec3(0.00,0.30,0.60));
  }
  vec3 paletteCyber(float t) {
    return cosPalette(t, vec3(0.50,0.50,0.50), vec3(0.50,0.50,0.50), vec3(1.00,0.70,0.40), vec3(0.00,0.15,0.50));
  }
  vec3 paletteNeon(float t) {
    return cosPalette(t, vec3(0.60,0.30,0.60), vec3(0.40,0.40,0.40), vec3(0.80,1.00,0.50), vec3(0.00,0.50,0.75));
  }
  vec3 paletteHeat(float t) {
    return cosPalette(t, vec3(0.50,0.20,0.10), vec3(0.50,0.20,0.10), vec3(0.50,0.60,0.80), vec3(0.00,0.20,0.55));
  }
  vec3 paletteFrost(float t) {
    return cosPalette(t, vec3(0.25,0.45,0.65), vec3(0.25,0.35,0.35), vec3(0.60,0.50,0.40), vec3(0.50,0.20,0.00));
  }
  vec3 paletteMono(float t) {
    return cosPalette(t, vec3(0.50,0.50,0.50), vec3(0.45,0.45,0.45), vec3(1.00,1.00,1.00), vec3(0.00,0.05,0.10));
  }
  vec3 paletteNeonBlue(float t) {
    return cosPalette(t, vec3(0.05,0.15,0.50), vec3(0.05,0.15,0.50), vec3(0.80,0.70,0.60), vec3(0.00,0.10,0.40));
  }
  vec3 paletteMagentaCyan(float t) {
    return cosPalette(t, vec3(0.60,0.30,0.60), vec3(0.40,0.30,0.40), vec3(0.50,1.00,0.50), vec3(0.50,0.00,0.25));
  }
  vec3 paletteCGA(float t) {
    float q = floor(mod(t * 2.0, 4.0));
    if (q < 1.0) return vec3(0.0, 0.0, 0.0);
    else if (q < 2.0) return vec3(0.0, 0.67, 0.67);
    else if (q < 3.0) return vec3(0.67, 0.0, 0.67);
    else return vec3(0.67, 0.67, 0.67);
  }
  
  vec3 getPalette(float t) {
    int p = int(u_palette);
    if (p == 0) return paletteBladeRunner(t);
    else if (p == 1) return paletteCyber(t);
    else if (p == 2) return paletteNeon(t);
    else if (p == 3) return paletteHeat(t);
    else if (p == 4) return paletteFrost(t);
    else if (p == 5) return paletteMono(t);
    else if (p == 6) return paletteNeonBlue(t);
    else if (p == 7) return paletteMagentaCyan(t);
    else return paletteCGA(t);
  }
  
  float mandelbulbDE(vec3 pos) {
    vec3 z = pos;
    float dr = 1.0;
    float r = 0.0;
    float power = u_power + sin(u_morphPhase) * 0.5;
    int maxI = int(u_maxIter);
    for (int i = 0; i < 20; i++) {
      if (i >= maxI) break;
      r = length(z);
      if (r > 4.0) break;
      float theta = acos(z.z / r);
      float phi = atan(z.y, z.x);
      dr = pow(r, power - 1.0) * power * dr + 1.0;
      float zr = pow(r, power);
      theta = theta * power;
      phi = phi * power;
      z = zr * vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
      z += pos;
    }
    return 0.5 * log(r) * r / dr;
  }
  
  float mandelboxDE(vec3 pos) {
    vec3 z = pos;
    float dr = 1.0;
    float minRadius2 = 0.25;
    float fixedRadius2 = 1.0;
    float foldLimit = 1.0 + sin(u_morphPhase * 0.5) * 0.15;
    float scale = u_power * 0.5 + 1.5;
    for (int i = 0; i < 10; i++) {
      z = clamp(z, -foldLimit, foldLimit) * 2.0 - z;
      float r2 = dot(z, z);
      if (r2 < minRadius2) { float t2 = fixedRadius2/minRadius2; z *= t2; dr *= t2; }
      else if (r2 < fixedRadius2) { float t2 = fixedRadius2/r2; z *= t2; dr *= t2; }
      z = z * scale + pos;
      dr = dr * abs(scale) + 1.0;
      if (dot(z,z) > 64.0) break;
    }
    return length(z) / abs(dr);
  }
  
  float torusKnotDE(vec3 pos) {
    float morphT = u_morphPhase * 0.08;
    float kp = 2.0 + sin(morphT * 0.31) + 1.0;
    float kq = 3.0 + sin(morphT * 0.19) * 1.2;
    float R = 0.85;
    float r = 0.38;
    float tubeR = 0.16 + sin(morphT * 0.7) * 0.03;
    float best = 1e9;
    for (int i = 0; i < 48; i++) {
      float phi = 6.28318 * float(i) / 48.0;
      float sa = phi * kq / kp;
      vec3 sp = vec3((R + r*cos(sa))*cos(phi), (R + r*cos(sa))*sin(phi), r*sin(sa));
      best = min(best, length(pos - sp) - tubeR);
    }
    return best;
  }
  
  float apollonianDE(vec3 pos) {
    vec3 p = pos;
    float scale = 1.0;
    float morphT = u_morphPhase * 0.05;
    float k = 1.8 + sin(morphT * 0.3) * 0.15;
    for (int i = 0; i < 8; i++) {
      p = mod(p, 2.0) - 1.0;
      float r2 = dot(p, p);
      float f = max(k / r2, 1.0);
      p *= f;
      scale *= f;
    }
    return length(p) / scale;
  }
  
  float juliaDE(vec3 pos) {
    float morphT = u_morphPhase * 0.06;
    vec4 c = vec4(
      0.35 + sin(morphT * 0.41) * 0.12,
      0.25 + cos(morphT * 0.37) * 0.10,
     -0.15 + sin(morphT * 0.53) * 0.08,
      0.10 + cos(morphT * 0.29) * 0.05
    );
    vec4 z = vec4(pos, 0.0);
    float dr = 1.0;
    for (int i = 0; i < 12; i++) {
      float r2 = dot(z, z);
      if (r2 > 4.0) break;
      dr = 2.0 * sqrt(r2) * dr;
      vec4 z2;
      z2.x = z.x*z.x - z.y*z.y - z.z*z.z - z.w*z.w;
      z2.y = 2.0*z.x*z.y;
      z2.z = 2.0*z.x*z.z;
      z2.w = 2.0*z.x*z.w;
      z = z2 + c;
    }
    float r = length(z);
    return 0.5 * r * log(r) / dr;
  }
  
  float sierpinskiDE(vec3 pos) {
    vec3 a1 = vec3(1,1,1);
    vec3 a2 = vec3(-1,-1,1);
    vec3 a3 = vec3(1,-1,-1);
    vec3 a4 = vec3(-1,1,-1);
    vec3 c;
    float scale = 2.0;
    int n = 0;
    vec3 z = pos;
    float r;
    for (int i = 0; i < 10; i++) {
      c = a1; float d = length(z-a1);
      float d2 = length(z-a2); if (d2 < d) { c = a2; d = d2; }
      d2 = length(z-a3); if (d2 < d) { c = a3; d = d2; }
      d2 = length(z-a4); if (d2 < d) { c = a4; }
      z = scale*z - c*(scale-1.0);
      r = dot(z,z);
      if (r > 64.0) break;
    }
    return length(z) * pow(scale, -float(n));
  }
  
  float mengerDE(vec3 pos) {
    vec3 z = pos;
    float scale = 3.0;
    float d = length(max(abs(z) - 1.0, 0.0));
    float s = 1.0;
    for (int i = 0; i < 5; i++) {
      vec3 a = mod(z * s, 2.0) - 1.0;
      s *= scale;
      vec3 r = abs(1.0 - scale * abs(a));
      float da = max(r.x, r.y);
      float db = max(r.y, r.z);
      float dc = max(r.z, r.x);
      float c = (min(da, min(db, dc)) - 1.0) / s;
      d = max(d, c);
    }
    return d;
  }
  
  float scene(vec3 pos) {
    vec3 p = pos;
    float slowTime = time * u_animSpeed;
    mat2 rotX = rotate2d(slowTime * u_rotSpeed * 0.7 + u_rotateX);
    mat2 rotY = rotate2d(slowTime * u_rotSpeed * 0.5 * 1.3 + u_rotateY);
    mat2 rotZ = rotate2d(slowTime * u_rotSpeed * 0.3 * 0.7);
    p.xz *= rotX;
    p.yz *= rotY;
    p.xy *= rotZ;
    float scale = u_fractalSize;
    p /= scale;
    float d;
    int ftype = int(u_fractalType);
    if (ftype == 0) d = mandelbulbDE(p);
    else if (ftype == 1) d = mandelboxDE(p);
    else if (ftype == 2) d = torusKnotDE(p);
    else if (ftype == 3) d = apollonianDE(p);
    else if (ftype == 4) d = juliaDE(p);
    else if (ftype == 5) d = sierpinskiDE(p);
    else d = mengerDE(p);
    return d * scale;
  }
  
  vec3 getNormal(vec3 p) {
    float eps = 0.001;
    return normalize(vec3(
      scene(p + vec3(eps,0,0)) - scene(p - vec3(eps,0,0)),
      scene(p + vec3(0,eps,0)) - scene(p - vec3(0,eps,0)),
      scene(p + vec3(0,0,eps)) - scene(p - vec3(0,0,eps))
    ));
  }
  
  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    if (u_pixelate > 1.0) {
      fragCoord = floor(fragCoord / u_pixelate) * u_pixelate + u_pixelate * 0.5;
    }
    vec2 uv = (fragCoord - 0.5 * resolution) / resolution.y;
    uv *= u_fov;
    
    float stableOrbit = 3.2;
    float driftTime = time * u_animSpeed * 0.25;
    float camX = sin(driftTime * 0.41) * 0.18 + sin(driftTime * 0.17) * 0.09;
    float camY = sin(driftTime * 0.29) * 0.12 + cos(driftTime * 0.13) * 0.06;
    float camZ = stableOrbit;
    
    vec3 ro = vec3(camX, camY, camZ);
    vec3 target = vec3(0.0);
    vec3 forward = normalize(target - ro);
    vec3 right = normalize(cross(vec3(0,1,0), forward));
    vec3 up = cross(forward, right);
    vec3 rd = normalize(forward + uv.x * right + uv.y * up);
    
    float t = 0.0;
    float glow = 0.0;
    float smoothGlow = 0.0;
    float smoothFactor = u_smoothness;
    
    for (int i = 0; i < 150; i++) {
      vec3 p = ro + rd * t;
      float d = scene(p);
      float glowContrib = exp(-d * smoothFactor) * 0.015;
      smoothGlow += glowContrib;
      glow += exp(-d * 20.0) * 0.02;
      if (d < 0.001 || t > 15.0) break;
      t += d * u_stepSize;
    }
    
    vec3 color = vec3(0.0);
    
    if (t < 15.0) {
      vec3 p = ro + rd * t;
      vec3 n = getNormal(p);
      vec3 lightDir = normalize(vec3(cos(u_lightAngle), sin(u_lightAngle), -1.0));
      float diff = max(dot(n, lightDir), 0.0);
      float spec = pow(max(dot(reflect(-lightDir, n), -rd), 0.0), 32.0);
      float colorDrift = time * u_paletteSpeed + u_paletteOffset;
      float colorT = length(p) * u_colorDepth * 0.4 + colorDrift;
      vec3 baseColor = getPalette(colorT);
      baseColor = mix(vec3(dot(baseColor, vec3(0.299,0.587,0.114))), baseColor, u_saturation);
      color = baseColor * (u_ambient + diff * (1.0 - u_ambient));
      color += vec3(0.5, 0.0, 1.0) * spec * u_specular;
      float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
      color += vec3(0.0, 0.5, 1.0) * fresnel * 0.4;
      float edgeDark = 1.0 - fresnel * u_edgeFog;
      color *= edgeDark;
      float fog = exp(-t * (1.0 / max(u_fogDist, 0.1)));
      color = mix(vec3(0.0), color, fog);
    }
    
    color += vec3(0.1, 0.0, 0.3) * glow * u_glowIntensity;
    float glowDrift = time * u_paletteSpeed + u_paletteOffset;
    vec3 glowColor1 = getPalette(glowDrift);
    vec3 glowColor2 = getPalette(glowDrift + 0.5);
    vec3 glowMix = mix(glowColor1, glowColor2, 0.5);
    color += glowMix * smoothGlow * u_glow;
    
    color = pow(color, vec3(0.8));
    color *= u_brightness;
    color = (color - 0.5) * u_contrast + 0.5;
    float vig = 1.0 - length(uv) * u_vignette;
    color *= vig;
    color = clamp(color, 0.0, 1.0);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

interface Params {
  animSpeed: number; rotSpeed: number; morphSpeed: number; morphOffset: number;
  maxIter: number; power: number; fractalSize: number; fractalType: number;
  rotateX: number; rotateY: number; fov: number;
  saturation: number; brightness: number; colorDepth: number; palette: number;
  smoothness: number; glow: number; pixelate: number; vignette: number;
  scanline: number; glowIntensity: number; paletteOffset: number; paletteSpeed: number;
  lightAngle: number; ambient: number; edgeFog: number; specular: number;
  fogDist: number; stepSize: number; contrast: number;
}

const DEFAULT_PARAMS: Params = {
  animSpeed: 0.15, rotSpeed: 0.3, morphSpeed: 0.3, morphOffset: 0,
  maxIter: 12, power: 8, fractalSize: 1, fractalType: 0,
  rotateX: 0, rotateY: 0, fov: 1,
  saturation: 1, brightness: 1.2, colorDepth: 0.5, palette: 0,
  smoothness: 20, glow: 2, pixelate: 1, vignette: 0.5,
  scanline: 1, glowIntensity: 2, paletteOffset: 0, paletteSpeed: 0.15,
  lightAngle: 1.0, ambient: 0.3, edgeFog: 0.5, specular: 0.5,
  fogDist: 10, stepSize: 0.8, contrast: 1.0
};

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(prog));
    gl.deleteProgram(prog);
    return null;
  }
  return prog;
}

interface SliderRowProps {
  label: string; subLabel: string; id: string;
  min: number; max: number; step: number; value: number;
  onChange: (v: number) => void;
}

function SliderRow({ label, subLabel, id, min, max, step, value, onChange }: SliderRowProps) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] tracking-widest text-cyan-400 uppercase">{label} <span className="text-[9px] text-pink-500">{subLabel}</span></span>
        <input
          type="number"
          className="bg-black/40 border border-purple-900/50 text-pink-400 font-mono text-[11px] px-1.5 py-0.5 w-16 text-right rounded focus:outline-none focus:border-cyan-400"
          value={value}
          step={step}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
        />
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded cursor-pointer accent-cyan-400"
        style={{ background: `linear-gradient(90deg, rgba(139,0,255,0.4), rgba(0,255,255,0.4))` }}
      />
    </div>
  );
}

interface SelectRowProps {
  label: string; subLabel: string; value: number;
  options: { value: number; label: string }[];
  onChange: (v: number) => void;
}

function SelectRow({ label, subLabel, value, options, onChange }: SelectRowProps) {
  return (
    <div className="mb-3">
      <div className="text-[10px] tracking-widest text-cyan-400 uppercase mb-1">{label} <span className="text-[9px] text-pink-500">{subLabel}</span></div>
      <select
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full bg-black/40 border border-purple-900/50 text-cyan-400 font-mono text-[11px] px-2 py-1.5 rounded focus:outline-none focus:border-cyan-400"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

interface PanelProps {
  title: string; subTitle: string;
  side: "left" | "right";
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Panel({ title, subTitle, side, visible, onClose, children }: PanelProps) {
  const transform = visible
    ? "translateY(-50%) translateX(0)"
    : side === "left"
      ? "translateY(-50%) translateX(-100%)"
      : "translateY(-50%) translateX(100%)";
  const radius = side === "left" ? "0 8px 8px 0" : "8px 0 0 8px";
  const border = side === "left" ? "border-l-0" : "border-r-0";

  return (
    <div
      className={`fixed top-1/2 w-72 max-h-[88vh] z-50 overflow-y-auto backdrop-blur-xl transition-transform duration-500 ${border}`}
      style={{
        [side]: 0,
        transform,
        background: "rgba(5,5,20,0.88)",
        border: "1px solid rgba(139,0,255,0.4)",
        borderRadius: radius,
        padding: "20px",
        scrollbarWidth: "thin",
        scrollbarColor: "#8b00ff rgba(0,0,0,0.4)",
      }}
    >
      <div className="flex justify-between items-center mb-5 pb-4 border-b border-purple-900/40">
        <span className="text-[14px] font-bold tracking-widest text-cyan-400">
          {title}<br />
          <span className="text-[10px] text-purple-500 tracking-widest">{subTitle}</span>
        </span>
        <button
          onClick={onClose}
          className="border border-purple-700/60 text-purple-500 w-6 h-6 text-sm rounded hover:bg-purple-900/40 hover:text-pink-400 transition-colors"
        >×</button>
      </div>
      {children}
    </div>
  );
}

function SectionTitle({ jp, en }: { jp: string; en: string }) {
  return (
    <div className="text-[10px] tracking-widest text-purple-500 uppercase mb-3 opacity-80">
      {jp} &nbsp;<span className="text-pink-500 text-[9px]">{en}</span>
    </div>
  );
}

export default function FractalExplorer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paramsRef = useRef<Params>({ ...DEFAULT_PARAMS });
  const [controlsVisible, setControlsVisible] = React.useState(false);
  const [params, setParams] = React.useState<Params>({ ...DEFAULT_PARAMS });
  const [scanlineOpacity, setScanlineOpacity] = React.useState(1);

  const setParam = (key: keyof Params, value: number) => {
    paramsRef.current[key] = value;
    setParams(p => ({ ...p, [key]: value }));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    resize();

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;
    const prog = createProgram(gl, vs, fs);
    if (!prog) return;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(prog, "position");
    const u = {
      resolution: gl.getUniformLocation(prog, "resolution"),
      time: gl.getUniformLocation(prog, "time"),
      animSpeed: gl.getUniformLocation(prog, "u_animSpeed"),
      rotSpeed: gl.getUniformLocation(prog, "u_rotSpeed"),
      morphPhase: gl.getUniformLocation(prog, "u_morphPhase"),
      maxIter: gl.getUniformLocation(prog, "u_maxIter"),
      power: gl.getUniformLocation(prog, "u_power"),
      fractalSize: gl.getUniformLocation(prog, "u_fractalSize"),
      fractalType: gl.getUniformLocation(prog, "u_fractalType"),
      rotateX: gl.getUniformLocation(prog, "u_rotateX"),
      rotateY: gl.getUniformLocation(prog, "u_rotateY"),
      fov: gl.getUniformLocation(prog, "u_fov"),
      saturation: gl.getUniformLocation(prog, "u_saturation"),
      brightness: gl.getUniformLocation(prog, "u_brightness"),
      colorDepth: gl.getUniformLocation(prog, "u_colorDepth"),
      palette: gl.getUniformLocation(prog, "u_palette"),
      smoothness: gl.getUniformLocation(prog, "u_smoothness"),
      glow: gl.getUniformLocation(prog, "u_glow"),
      pixelate: gl.getUniformLocation(prog, "u_pixelate"),
      vignette: gl.getUniformLocation(prog, "u_vignette"),
      glowIntensity: gl.getUniformLocation(prog, "u_glowIntensity"),
      paletteOffset: gl.getUniformLocation(prog, "u_paletteOffset"),
      paletteSpeed: gl.getUniformLocation(prog, "u_paletteSpeed"),
      lightAngle: gl.getUniformLocation(prog, "u_lightAngle"),
      ambient: gl.getUniformLocation(prog, "u_ambient"),
      edgeFog: gl.getUniformLocation(prog, "u_edgeFog"),
      specular: gl.getUniformLocation(prog, "u_specular"),
      fogDist: gl.getUniformLocation(prog, "u_fogDist"),
      stepSize: gl.getUniformLocation(prog, "u_stepSize"),
      contrast: gl.getUniformLocation(prog, "u_contrast"),
      dither: gl.getUniformLocation(prog, "u_dither"),
    };

    const startTime = Date.now();
    let rafId: number;

    function render() {
      const p = paramsRef.current;
      const t = (Date.now() - startTime) / 1000;
      gl!.useProgram(prog);
      gl!.enableVertexAttribArray(posLoc);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
      gl!.vertexAttribPointer(posLoc, 2, gl!.FLOAT, false, 0, 0);
      gl!.uniform2f(u.resolution, canvas!.width, canvas!.height);
      gl!.uniform1f(u.time, t);
      gl!.uniform1f(u.animSpeed, p.animSpeed);
      gl!.uniform1f(u.rotSpeed, p.rotSpeed);
      gl!.uniform1f(u.morphPhase, t * p.morphSpeed + p.morphOffset);
      gl!.uniform1f(u.maxIter, p.maxIter);
      gl!.uniform1f(u.power, p.power);
      gl!.uniform1f(u.fractalSize, p.fractalSize);
      gl!.uniform1f(u.fractalType, p.fractalType);
      gl!.uniform1f(u.rotateX, p.rotateX);
      gl!.uniform1f(u.rotateY, p.rotateY);
      gl!.uniform1f(u.fov, p.fov);
      gl!.uniform1f(u.saturation, p.saturation);
      gl!.uniform1f(u.brightness, p.brightness);
      gl!.uniform1f(u.colorDepth, p.colorDepth);
      gl!.uniform1f(u.palette, p.palette);
      gl!.uniform1f(u.smoothness, p.smoothness);
      gl!.uniform1f(u.glow, p.glow);
      gl!.uniform1f(u.pixelate, p.pixelate);
      gl!.uniform1f(u.vignette, p.vignette);
      gl!.uniform1f(u.glowIntensity, p.glowIntensity);
      gl!.uniform1f(u.paletteOffset, p.paletteOffset);
      gl!.uniform1f(u.paletteSpeed, p.paletteSpeed);
      gl!.uniform1f(u.lightAngle, p.lightAngle);
      gl!.uniform1f(u.ambient, p.ambient);
      gl!.uniform1f(u.edgeFog, p.edgeFog);
      gl!.uniform1f(u.specular, p.specular);
      gl!.uniform1f(u.fogDist, p.fogDist);
      gl!.uniform1f(u.stepSize, p.stepSize);
      gl!.uniform1f(u.contrast, p.contrast);
      gl!.uniform1f(u.dither, 0);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    }
    render();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "c" || e.key === "C") setControlsVisible(v => !v);
    };
    document.addEventListener("keydown", onKey);

    let pdt = 0;
    const onPD = () => { pdt = Date.now(); };
    const onPU = () => { if (Date.now() - pdt < 250) setControlsVisible(v => !v); };
    canvas.addEventListener("pointerdown", onPD);
    canvas.addEventListener("pointerup", onPU);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onPD);
      canvas.removeEventListener("pointerup", onPU);
    };
  }, []);

  const fractalTypes = [
    { value: 0, label: "Mandelbulb マンデルブルー" },
    { value: 1, label: "Mandelbox マンデルボックス" },
    { value: 2, label: "Torus Knot トーラスノット" },
    { value: 3, label: "Apollonian アポロニアン" },
    { value: 4, label: "Julia 3D ジュリア 3D" },
    { value: 5, label: "Sierpinski Tetra 四面体" },
    { value: 6, label: "Menger Sponge メンガースポンジ" },
  ];

  const palettes = [
    { value: 0, label: "Blade Runner ブレードランナー" },
    { value: 1, label: "Cyber サイバー" },
    { value: 2, label: "Neon Trout ネオントラウト" },
    { value: 3, label: "Heat ヒート" },
    { value: 4, label: "Frost フロスト" },
    { value: 5, label: "Monochrome モノクロ" },
    { value: 6, label: "Neon Blue ネオンブルー" },
    { value: 7, label: "Magenta Cyan マゼンタシアン" },
    { value: 8, label: "CGA Retro CGAレトロ" },
  ];

  return (
    <div style={{ background: "#000", width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
      <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }} />

      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)",
        zIndex: 50, pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)",
        zIndex: 100, pointerEvents: "none", opacity: scanlineOpacity,
      }} />

      {!controlsVisible && (
        <div style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          zIndex: 15, fontSize: 11, color: "rgba(139,0,255,0.6)", letterSpacing: 2, pointerEvents: "none",
        }}>
          [ C ] or TAP · コントロール
        </div>
      )}

      <Panel title="アニメーション & フラクタル" subTitle="ANIMATION & FRACTAL" side="left" visible={controlsVisible} onClose={() => setControlsVisible(false)}>
        <div className="mb-5">
          <SectionTitle jp="アニメーション" en="ANIMATION" />
          <SliderRow label="速度" subLabel="SPEED" id="animSpeed" min={0} max={1} step={0.01} value={params.animSpeed} onChange={v => setParam("animSpeed", v)} />
          <SliderRow label="回転速度" subLabel="ROT SPEED" id="rotSpeed" min={0} max={2} step={0.01} value={params.rotSpeed} onChange={v => setParam("rotSpeed", v)} />
          <SliderRow label="変異速度" subLabel="MORPH" id="morphSpeed" min={0} max={2} step={0.01} value={params.morphSpeed} onChange={v => setParam("morphSpeed", v)} />
          <SliderRow label="変異位置" subLabel="MORPH OFFSET" id="morphOffset" min={0} max={6.28} step={0.01} value={params.morphOffset} onChange={v => setParam("morphOffset", v)} />
        </div>
        <div className="mb-5">
          <SectionTitle jp="フラクタル" en="FRACTAL" />
          <SliderRow label="反復回数" subLabel="ITERATIONS" id="maxIter" min={4} max={20} step={1} value={params.maxIter} onChange={v => setParam("maxIter", v)} />
          <SliderRow label="べき乗" subLabel="POWER" id="power" min={2} max={16} step={0.1} value={params.power} onChange={v => setParam("power", v)} />
          <SliderRow label="サイズ" subLabel="SIZE" id="fractalSize" min={0.1} max={3} step={0.1} value={params.fractalSize} onChange={v => setParam("fractalSize", v)} />
          <SelectRow label="フラクタルタイプ" subLabel="TYPE" value={params.fractalType} options={fractalTypes} onChange={v => setParam("fractalType", v)} />
        </div>
        <div className="mb-5">
          <SectionTitle jp="ライティング" en="LIGHTING & DEPTH" />
          <SliderRow label="光角度" subLabel="LIGHT ANGLE" id="lightAngle" min={0} max={6.28} step={0.05} value={params.lightAngle} onChange={v => setParam("lightAngle", v)} />
          <SliderRow label="環境光" subLabel="AMBIENT" id="ambient" min={0} max={1} step={0.01} value={params.ambient} onChange={v => setParam("ambient", v)} />
          <SliderRow label="エッジフォグ" subLabel="EDGE FOG" id="edgeFog" min={0} max={1} step={0.01} value={params.edgeFog} onChange={v => setParam("edgeFog", v)} />
          <SliderRow label="スペキュラー" subLabel="SPECULAR" id="specular" min={0} max={2} step={0.05} value={params.specular} onChange={v => setParam("specular", v)} />
          <SliderRow label="フォグ距離" subLabel="FOG DIST" id="fogDist" min={1} max={20} step={0.5} value={params.fogDist} onChange={v => setParam("fogDist", v)} />
          <SliderRow label="ステップサイズ" subLabel="STEP SIZE" id="stepSize" min={0.3} max={1.2} step={0.05} value={params.stepSize} onChange={v => setParam("stepSize", v)} />
          <SliderRow label="コントラスト" subLabel="CONTRAST" id="contrast" min={0.5} max={3} step={0.05} value={params.contrast} onChange={v => setParam("contrast", v)} />
        </div>
      </Panel>

      <Panel title="カメラ & カラー" subTitle="CAMERA & COLOR" side="right" visible={controlsVisible} onClose={() => setControlsVisible(false)}>
        <div className="mb-5">
          <SectionTitle jp="カメラ" en="CAMERA" />
          <SliderRow label="X軸回転" subLabel="ROTATE X" id="rotateX" min={0} max={6.28} step={0.01} value={params.rotateX} onChange={v => setParam("rotateX", v)} />
          <SliderRow label="Y軸回転" subLabel="ROTATE Y" id="rotateY" min={0} max={6.28} step={0.01} value={params.rotateY} onChange={v => setParam("rotateY", v)} />
          <SliderRow label="視野" subLabel="FIELD OF VIEW" id="fov" min={0.5} max={2} step={0.1} value={params.fov} onChange={v => setParam("fov", v)} />
        </div>
        <div className="mb-5">
          <SectionTitle jp="カラー" en="COLOR" />
          <SliderRow label="彩度" subLabel="SATURATION" id="saturation" min={0} max={2} step={0.1} value={params.saturation} onChange={v => setParam("saturation", v)} />
          <SliderRow label="輝度" subLabel="BRIGHTNESS" id="brightness" min={0.1} max={3} step={0.1} value={params.brightness} onChange={v => setParam("brightness", v)} />
          <SliderRow label="色深度" subLabel="COLOR DEPTH" id="colorDepth" min={0} max={2} step={0.1} value={params.colorDepth} onChange={v => setParam("colorDepth", v)} />
          <SelectRow label="パレット" subLabel="PALETTE" value={params.palette} options={palettes} onChange={v => setParam("palette", v)} />
          <SliderRow label="パレット位置" subLabel="PALETTE OFFSET" id="paletteOffset" min={0} max={6.28} step={0.01} value={params.paletteOffset} onChange={v => setParam("paletteOffset", v)} />
          <SliderRow label="ループ速度" subLabel="CYCLE SPEED" id="paletteSpeed" min={0} max={2} step={0.01} value={params.paletteSpeed} onChange={v => setParam("paletteSpeed", v)} />
        </div>
        <div className="mb-5">
          <SectionTitle jp="レンダリング" en="RENDERING" />
          <SliderRow label="滑らかさ" subLabel="SMOOTHNESS" id="smoothness" min={1} max={50} step={1} value={params.smoothness} onChange={v => setParam("smoothness", v)} />
          <SliderRow label="発光" subLabel="GLOW" id="glow" min={0} max={5} step={0.1} value={params.glow} onChange={v => setParam("glow", v)} />
          <SliderRow label="ピクセル化" subLabel="PIXELATE" id="pixelate" min={1} max={32} step={1} value={params.pixelate} onChange={v => setParam("pixelate", v)} />
          <SliderRow label="ビネット" subLabel="VIGNETTE" id="vignette" min={0} max={1} step={0.05} value={params.vignette} onChange={v => setParam("vignette", v)} />
        </div>
        <div className="mb-5">
          <SectionTitle jp="エフェクト" en="EFFECTS" />
          <div className="mb-3">
            <div className="text-[10px] tracking-widest text-cyan-400 uppercase mb-1">スキャンライン <span className="text-[9px] text-pink-500">SCANLINE</span></div>
            <input type="range" min={0} max={1} step={0.1} defaultValue={1}
              onChange={e => setScanlineOpacity(parseFloat(e.target.value))}
              className="w-full h-1 rounded cursor-pointer accent-cyan-400" />
          </div>
          <SliderRow label="グロー強度" subLabel="GLOW INTENSITY" id="glowIntensity" min={0} max={5} step={0.1} value={params.glowIntensity} onChange={v => setParam("glowIntensity", v)} />
        </div>
      </Panel>
    </div>
  );
}
