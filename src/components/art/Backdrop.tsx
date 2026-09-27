import { useEffect, useRef } from 'react';
import type { MotionValue } from 'framer-motion';

/**
 * Full-screen WebGL light field for /art.
 *
 * Domain-warped fbm makes slow red/white light ribbons; an anamorphic flare
 * trails the pointer. Oversized type scrolls through it in alternating rows —
 * nearly invisible in the dark, lit where the light passes. `heat` (shared
 * with the foreground Glitch words) tears it: band displacement, RGB split,
 * slight RGB split. Renders below device resolution; the grain hides it.
 */

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `
precision highp float;
uniform vec2 R;
uniform float T, H, I;
uniform vec2 M;
uniform sampler2D TX;

float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}

vec3 field(vec2 p){
  vec2 q=vec2(fbm(p*1.2+T*.045),fbm(p*1.2-T*.038+5.2));
  vec2 w=vec2(fbm(p*1.5+q*2.4+vec2(T*.03,-T*.02)),fbm(p*1.5+q*2.1+3.1));
  float f=fbm(p*1.4+w*2.6);
  float rib=smoothstep(.5,.9,f);
  vec3 c=vec3(.86,.12,.12)*pow(rib,2.2)*1.35;
  c+=vec3(.95,.93,.9)*pow(smoothstep(.7,1.,f),3.)*1.6;
  c+=vec3(.35,.05,.08)*smoothstep(.3,.7,w.x)*.35;
  vec2 d=p-M;
  c+=vec3(1.,.28,.22)*exp(-abs(d.y)*38.)*exp(-abs(d.x)*1.2)*.55;
  c+=vec3(1.,.9,.85)*exp(-length(d)*5.5)*.22;
  return c;
}

float type(vec2 uv, float ca, float asp){
  float N=asp<1.?6.:3.;           // more, smaller rows on a phone
  float row=floor(uv.y*N);
  float dir=mod(row,2.)*2.-1.;
  vec2 t=vec2(uv.x*asp*N/16.+dir*T*.012+ca, (mod(row,4.)+fract(uv.y*N))/4.);
  return texture2D(TX,t).r;
}

void main(){
  vec2 uv=gl_FragCoord.xy/R;
  float asp=R.x/R.y;
  float g=clamp(H,0.,1.);

  // tear: horizontal bands jump sideways while hot
  float bands=mix(10.,70.,h(vec2(floor(T*9.),3.)));
  float b=floor(uv.y*bands);
  float on=step(1.-g*.45,h(vec2(b,floor(T*16.))));
  uv.x+=on*(h(vec2(b,floor(T*24.)))-.5)*.1*g;

  vec2 p=(uv-.5)*vec2(asp,1.);
  vec3 c=field(p)*I;

  float ca=.002+g*.012;
  vec3 ty=vec3(type(uv,ca,asp),type(uv,0.,asp),type(uv,-ca,asp));
  c+=ty*(.035+c*1.6);

  c*=.94+.06*sin(gl_FragCoord.y*1.7);
  c+=(h(gl_FragCoord.xy+fract(T)*97.)-.5)*.07;
  vec2 v=uv-.5;c*=1.-dot(v,v)*1.1;
  gl_FragColor=vec4(c/(1.+c*.6),1.);
}`;

/** Four bands of IMANOL VILLAGOMEZ, the I.V. mark between repeats. */
function typeTexture(logo: HTMLImageElement | null): HTMLCanvasElement {
  const W = 4096; // power of two so the band can REPEAT
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = 1024;
  const x = cv.getContext('2d')!;
  x.fillStyle = '#000';
  x.fillRect(0, 0, W, 1024);
  const rh = 1024 / 4;
  const size = Math.round(rh * 0.78);
  x.font = `${size}px "Archivo Black", "Arial Black", sans-serif`;
  x.textBaseline = 'middle';
  x.fillStyle = '#fff';
  x.strokeStyle = '#fff';
  x.lineWidth = 3;
  // the mark's glyphs sit in x 60–480, y 130–300 of the 512² PNG
  const lw = logo ? size * (420 / 170) : 0;
  const gap = size * 0.45;

  const word = 'IMANOL VILLAGOMEZ';
  const ww = x.measureText(word).width;
  const period = ww + gap + (logo ? lw + gap : 0);
  // squeeze a whole number of periods into W so the wrap is seamless
  const n = Math.max(1, Math.round(W / period));
  x.setTransform(W / (n * period), 0, 0, 1, 0, 0);

  for (let i = 0; i < 4; i++) {
    const y = rh * (i + 0.5);
    const outline = i % 2 === 1;
    // shift each band so the name doesn't stack in a column
    for (let k = -1; k <= n; k++) {
      const cx = (k + i * 0.37) * period;
      if (outline) x.strokeText(word, cx, y);
      else x.fillText(word, cx, y);
      if (logo) x.drawImage(logo, 60, 130, 420, 170, cx + ww + gap, y - size / 2, lw, size);
    }
  }
  return cv;
}

export const Backdrop = ({ heat, intensity = 1 }: { heat: MotionValue<number>; intensity?: number }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const inten = useRef(intensity);
  inten.current = intensity;

  useEffect(() => {
    const cv = ref.current!;
    const gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
    if (!gl || gl.isContextLost()) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    let logo: HTMLImageElement | null = null;
    const upload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, typeTexture(logo));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
    upload();
    // Archivo Black and the mark may land after first paint
    document.fonts?.ready.then(upload).catch(() => {});
    const img = new Image();
    img.onload = () => {
      logo = img;
      upload();
    };
    img.src = '/I.V..png';

    const u = (k: string) => gl.getUniformLocation(prog, k);
    const uR = u('R'), uT = u('T'), uH = u('H'), uI = u('I'), uM = u('M');

    const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
    const size = () => {
      cv.width = Math.round(cv.clientWidth * scale);
      cv.height = Math.round(cv.clientHeight * scale);
      gl.viewport(0, 0, cv.width, cv.height);
    };
    size();
    window.addEventListener('resize', size);

    const target = { x: 0.25, y: 0.1 };
    const m = { x: 0.25, y: 0.1 };
    const move = (e: PointerEvent) => {
      const a = window.innerWidth / window.innerHeight;
      target.x = (e.clientX / window.innerWidth - 0.5) * a;
      target.y = 0.5 - e.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', move);

    let raf = 0;
    let i = inten.current;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const t = ((now - t0) / 1000) * (reduce ? 0.15 : 1);
      // idle drift so the flare wanders when nobody's touching
      const ix = target.x + Math.sin(t * 0.21) * 0.25;
      const iy = target.y + Math.cos(t * 0.17) * 0.18;
      m.x += (ix - m.x) * 0.06;
      m.y += (iy - m.y) * 0.06;
      i += (inten.current - i) * 0.05;
      gl.uniform2f(uR, cv.width, cv.height);
      gl.uniform1f(uT, t);
      gl.uniform1f(uH, reduce ? 0 : heat.get());
      gl.uniform1f(uI, i);
      gl.uniform2f(uM, m.x, m.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      window.removeEventListener('pointermove', move);
      // don't lose the context: StrictMode re-runs this effect on the same canvas
      gl.deleteProgram(prog);
      gl.deleteTexture(tex);
    };
  }, [heat]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
};
