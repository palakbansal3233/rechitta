/**
 * GLSL ES 1.00 (WebGL1) for maximum device coverage.
 *
 * The orb is drawn as an implicit disc whose radius is modulated by the live
 * spectrum, then shaded as if it were a sphere: the Figma artwork is sampled
 * through a fake surface normal, refracted towards the rim, split into RGB by
 * the treble band, and rim-lit. Everything is one full-screen triangle.
 */

export const VERTEX_SHADER = /* glsl */ `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

export const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform float uBass;    // 0..1  ~20-250 Hz
uniform float uMid;     // 0..1  ~250-2k Hz
uniform float uTreble;  // 0..1  ~2k-8k Hz
uniform float uLevel;   // 0..1  weighted overall loudness
uniform float uThink;   // 0..1  agent is processing
uniform float uReveal;  // 0..1  entrance fade
uniform sampler2D uTex;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  float m  = min(uRes.x, uRes.y);
  vec2  uv = (gl_FragCoord.xy - 0.5 * uRes) / m;

  float t   = uTime;
  float ang = atan(uv.y, uv.x);
  float rad = length(uv);
  vec2  dir = vec2(cos(ang), sin(ang));

  // ---- silhouette -------------------------------------------------------
  // Two octaves of angular noise give the soap-bubble wobble; bass inflates
  // the whole body, treble adds a fast ripple around the circumference.
  float wobA = fbm(dir * 2.1 + vec2( t * 0.11, -t * 0.08)) - 0.5;
  float wobB = fbm(dir * 4.3 - vec2( t * 0.19,  t * 0.13)) - 0.5;

  float R = 0.335 * (
      1.0
    + 0.030 * sin(t * 0.62)
    + 0.115 * uBass
    + 0.085 * wobA * (0.55 + uLevel * 1.2)
    + 0.045 * wobB * uMid
    + 0.030 * uThink * sin(ang * 3.0 + t * 2.4)
  );
  R += 0.010 * uTreble * sin(ang * 11.0 - t * 7.0);

  float aa     = 2.0 / m;
  float inside = smoothstep(aa, -aa, rad - R);

  // ---- surface ----------------------------------------------------------
  vec2  s  = uv / max(R, 1e-4);              // -1..1 across the orb
  float r2 = clamp(dot(s, s), 0.0, 1.0);
  float z  = sqrt(1.0 - r2);                 // fake sphere normal.z

  // 0.335 is the radius the bubble actually occupies inside the source PNG.
  // Sampling wider than that drags the artwork's black surround onto the
  // silhouette and reads as a dark ring.
  vec2 refr = s * (0.050 + 0.070 * uMid) * (1.0 - z);
  vec2 flow = vec2(sin(t * 0.09), cos(t * 0.07)) * 0.022;
  vec2 tc   = s * 0.335 + 0.5 + refr + flow;

  float ca = 0.004 + 0.016 * uTreble;        // chromatic aberration
  vec3 col;
  col.r = texture2D(uTex, tc + s * ca).r;
  col.g = texture2D(uTex, tc).g;
  col.b = texture2D(uTex, tc - s * ca).b;

  col  = pow(col, vec3(0.92));
  col *= 0.82 + 0.55 * z;
  col += 0.10 * uLevel;

  // Rim: cool towards the lower right, warm towards the upper left.
  float rim  = pow(1.0 - z, 3.4);
  float lean = 0.5 + 0.5 * dot(normalize(s + 1e-5), normalize(vec2(-0.7, 0.72)));
  vec3  rimC = mix(vec3(0.34, 0.68, 0.86), vec3(0.98, 0.84, 0.58), lean);
  col += rim * rimC * (0.34 + 0.70 * uLevel + 0.22 * uThink);

  // Specular pin-light.
  float spec = pow(max(0.0, 1.0 - length(s - vec2(-0.34, 0.40)) * 1.65), 9.0);
  col += spec * vec3(1.0, 0.97, 0.92) * (0.5 + 0.4 * uLevel);

  // ---- halo -------------------------------------------------------------
  // The canvas is un-premultiplied, so the glow has to be a *bright* colour at
  // a low alpha. Deriving alpha from the glow's own luminance keeps it additive
  // in feel; folding the brightness into alpha instead would tint the page
  // behind it with a dark ring.
  float d     = max(0.0, rad - R);
  float halo  = exp(-d * d * 160.0) * (0.30 + 0.95 * uLevel + 0.25 * uThink);
  vec3  haloC = mix(vec3(0.35, 0.62, 0.86), vec3(0.85, 0.70, 1.00), 0.5 + 0.5 * sin(t * 0.4));

  vec3  glow  = haloC * halo;
  float glowA = clamp(max(glow.r, max(glow.g, glow.b)), 0.0, 1.0);
  vec3  glowC = glowA > 0.001 ? glow / glowA : vec3(0.0);

  vec3  rgb   = mix(glowC, col, inside);
  float alpha = clamp(inside + glowA * (1.0 - inside), 0.0, 1.0);

  gl_FragColor = vec4(rgb, alpha * uReveal);
}
`
