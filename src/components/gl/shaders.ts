// Shader GLSL dell'acqua. Un quad a tutto schermo per ogni View: la camera non serve.

export const quadVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const common = /* glsl */ `
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
// "object-fit: cover" in UV
vec2 cover(vec2 uv, vec2 texRes) {
  float rs = uRes.x / uRes.y;
  float ri = texRes.x / texRes.y;
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}
const vec3 ABISSO = vec3(0.024, 0.043, 0.071);
const vec3 NOTTE = vec3(0.051, 0.094, 0.141);
const vec3 OTTONE = vec3(0.722, 0.573, 0.353);
const vec3 SPUMA = vec3(0.949, 0.937, 0.914);
`;

/** Intro: sotto la linea, acqua scura con increspature e il riflesso del wordmark. */
export const introFrag = /* glsl */ `
${common}
uniform sampler2D uWord;
uniform vec4 uWordRect; // x, y (baseline), w, h in uv della view
uniform float uLineY;
uniform float uWater;
uniform float uRise;
uniform float uFade;
uniform float uPulse;

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  float dy = uLineY - uv.y; // >0 sotto la linea
  if (dy <= 0.0) { gl_FragColor = vec4(0.0); return; }

  float t = uTime;
  // l'acqua si propaga verso il basso partendo dalla linea, con un bordo irregolare
  float reach = uWater * 0.75 + (fbm(vec2(uv.x * 4.0, t * 0.3)) - 0.5) * 0.08;
  float shown = smoothstep(reach, reach - 0.12, dy);

  // increspature che partono dalla linea
  float n = fbm(vec2(uv.x * 3.0 * aspect, dy * 18.0 - t * 0.6));
  float bands = sin(dy * 160.0 / (0.4 + dy * 3.0) - t * 1.6 + n * 5.0);
  float ripple = bands * exp(-dy * 4.0) * 0.5 + 0.5;

  vec3 col = mix(NOTTE * 1.25, ABISSO * 0.7, smoothstep(0.0, 0.5, dy));
  col += vec3(0.05, 0.075, 0.1) * ripple * exp(-dy * 3.0);

  // anello di "goccia" sul centro della linea
  float age = t - uPulse;
  if (age > 0.0 && age < 5.0) {
    vec2 d = vec2((uv.x - 0.5) * aspect, dy * 2.2);
    float r = length(d);
    float ring = exp(-pow((r - age * 0.32) * 26.0, 2.0)) * exp(-age * 0.8);
    col += SPUMA * ring * 0.12;
  }

  // riflesso del wordmark, distorto dalle onde
  float h = dy / 0.85; // altezza sopra la linea che si riflette qui
  float wob = (fbm(vec2(uv.x * 6.0, dy * 60.0 - t * 1.4)) - 0.5) * (0.004 + dy * 0.06);
  vec2 w = vec2((uv.x + wob - uWordRect.x) / uWordRect.z, (h + (1.0 - uRise) * uWordRect.w) / uWordRect.w);
  float word = 0.0;
  if (w.x > 0.0 && w.x < 1.0 && w.y > 0.0 && w.y < 1.0 && h < uRise * uWordRect.w) {
    word = texture2D(uWord, w).a;
  }
  col += SPUMA * word * 0.34 * exp(-dy * 7.0) * (0.75 + 0.25 * ripple);

  // bagliori d'ottone appena sotto la linea
  float glint = pow(noise(vec2(uv.x * 140.0, t * 0.7)), 10.0) * exp(-dy * 38.0);
  col += OTTONE * glint * 1.4;

  float a = shown * uFade;
  gl_FragColor = vec4(col, a);
}
`;

/** Hero: il video con increspature al passaggio del cursore. */
export const heroFrag = /* glsl */ `
${common}
uniform sampler2D uTex;
uniform vec2 uTexRes;
uniform vec4 uRipples[12];
uniform float uZoom;
uniform float uFade;

void main() {
  vec2 uv = vUv;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 disp = vec2(0.0);
  float light = 0.0;
  for (int i = 0; i < 12; i++) {
    vec4 r = uRipples[i];
    float age = uTime - r.z;
    if (age < 0.0 || age > 3.5) continue;
    vec2 d = (uv - r.xy) * asp;
    float dist = length(d);
    float front = age * 0.2;
    float env = exp(-abs(dist - front) * 16.0) * exp(-age * 1.3) * r.w;
    float w = sin((dist - front) * 70.0) * env;
    disp += (d / (dist + 1e-4)) * w * 0.0045;
    light += w;
  }
  vec2 tuv = cover(uv + disp, uTexRes);
  tuv = (tuv - 0.5) / (1.0 + uZoom) + 0.5;
  vec3 col = texture2D(uTex, tuv).rgb;
  col += light * 0.03 * vec3(1.0, 0.94, 0.82);
  gl_FragColor = vec4(col, uFade);
}
`;

/** Discesa sotto la superficie (e risalita nel footer). */
export const diveFrag = /* glsl */ `
${common}
uniform sampler2D uAbove;
uniform sampler2D uBelow;
uniform vec2 uAboveRes;
uniform vec2 uBelowRes;
uniform float uP;

void main() {
  vec2 uv = vUv;
  float t = uTime;
  float approach = smoothstep(0.0, 0.55, uP);
  float s = smoothstep(0.25, 0.8, uP);
  float waveY = mix(-0.16, 1.16, s)
    + (fbm(vec2(uv.x * 2.4 + t * 0.12, t * 0.18)) - 0.5) * 0.14
    + sin(uv.x * 8.0 + t * 1.1) * 0.012;
  float under = smoothstep(waveY + 0.006, waveY - 0.006, uv.y);

  // sopra: ci si avvicina alla superficie, con rifrazione vicino alla linea
  float nearLine = exp(-abs(uv.y - waveY) * 18.0);
  vec2 ra = vec2(fbm(uv * 5.0 + t * 0.2) - 0.5, fbm(uv * 5.0 - t * 0.2) - 0.5) * 0.03 * nearLine;
  vec2 au = cover(uv + ra, uAboveRes);
  au = (au - 0.5) / (1.0 + approach * 0.22) + 0.5;
  vec3 above = texture2D(uAbove, au).rgb;

  // sotto: distorsione lenta, raggi di luce che ondeggiano
  vec2 bd = vec2(fbm(uv * 3.0 + vec2(t * 0.08, 0.0)) - 0.5, fbm(uv * 3.0 + vec2(0.0, t * 0.07)) - 0.5) * 0.025;
  vec2 bu = cover(uv + bd, uBelowRes);
  bu = (bu - 0.5) / (1.0 + (1.0 - s) * 0.12) + 0.5;
  vec3 below = texture2D(uBelow, bu).rgb;
  float ang = atan(uv.x - 0.5, 1.35 - uv.y);
  float rays = pow(noise(vec2(ang * 16.0 + sin(t * 0.2) * 0.6, t * 0.12)), 3.0);
  rays *= smoothstep(0.0, 1.0, uv.y) * 0.32;
  float caust = pow(abs(sin(fbm(uv * 9.0 + t * 0.25) * 12.0)), 12.0) * smoothstep(0.55, 1.0, uv.y) * 0.12;
  below += vec3(0.75, 0.88, 1.0) * (rays + caust);
  below = mix(below, below * vec3(0.8, 0.92, 1.05), 0.4);

  vec3 col = mix(above, below, under);
  // il menisco: una linea di luce sulla superficie
  float men = exp(-pow((uv.y - waveY) * 140.0, 2.0));
  col += SPUMA * men * 0.55;
  col += SPUMA * exp(-abs(uv.y - waveY) * 30.0) * 0.06;
  gl_FragColor = vec4(col, 1.0);
}
`;
