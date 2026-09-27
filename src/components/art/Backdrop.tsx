import { useEffect, useRef } from 'react';
import { TRAIL, type Field } from './heat';

/**
 * Full-screen WebGL light field for /art, in two passes.
 *
 * Scene: domain-warped fbm makes slow light ribbons, with oversized type
 * scrolling through in alternating rows — nearly invisible in the dark, lit
 * where the light passes. Rendered into a texture.
 *
 * Color: at rest the scene is shown in grey ink only. Saturated color, a
 * warm glow and a soft fringe bloom along the cursor's recent trail (bigger
 * the faster it moved), and sustained fast movement floods the whole frame
 * with color. Everything eases in and out — no tearing or shake.
 * Renders below device resolution; the grain hides it.
 */

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const HASH = `
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}`;

const SCENE = `
precision highp float;
uniform vec2 R, M;
uniform float T, I, F;
uniform sampler2D TX;
${HASH}
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
  // anamorphic flare on the cursor — only while it's moving
  vec2 d=p-M;
  c+=vec3(1.,.28,.22)*exp(-abs(d.y)*38.)*exp(-abs(d.x)*1.2)*.75*F;
  c+=vec3(1.,.9,.85)*exp(-length(d)*5.5)*.3*F;
  return c;
}

float type(vec2 uv, float asp){
  float N=asp<1.?6.:3.;           // more, smaller rows on a phone
  float row=floor(uv.y*N);
  float dir=mod(row,2.)*2.-1.;
  vec2 t=vec2(uv.x*asp*N/16.+dir*T*.012, (mod(row,4.)+fract(uv.y*N))/4.);
  return texture2D(TX,t).r;
}

void main(){
  vec2 uv=gl_FragCoord.xy/R;
  float asp=R.x/R.y;
  vec3 c=field((uv-.5)*vec2(asp,1.))*I;
  c+=type(uv,asp)*(.035+c*1.6);
  gl_FragColor=vec4(c/(1.+c*.6),1.);
}`;

const GLITCH = `
precision highp float;
uniform vec2 R;
uniform float T, H;
uniform vec3 P[${TRAIL}];
uniform sampler2D S;
${HASH}
const vec3 INK=vec3(.79,.78,.78);

void main(){
  vec2 uv=gl_FragCoord.xy/R;
  float asp=R.x/R.y;
  vec2 pa=vec2(uv.x*asp,uv.y);

  // how hard the cursor went through here — faster strokes paint wider
  float L=0.;
  for(int i=0;i<${TRAIL};i++){
    vec3 p=P[i];
    vec2 d=pa-vec2(p.x*asp,p.y);
    L+=p.z*exp(-dot(d,d)*mix(45.,9.,clamp(p.z,0.,1.)));
  }
  L=clamp(L,0.,1.5);
  // moving fast floods the whole frame with color — no tearing, no shake
  float flood=smoothstep(.6,1.3,H);
  float g=clamp(L+flood*.8,0.,1.4);

  // soft color fringe, smooth in space and time
  vec2 dir=(uv-.5)*vec2(asp,1.);
  vec2 ca=dir*g*.012;
  vec3 col=vec3(texture2D(S,uv+ca).r,texture2D(S,uv).g,texture2D(S,uv-ca).b);

  // grey ink at rest; saturated color wherever the cursor has been
  float lum=dot(col,vec3(.3,.59,.11));
  vec3 vivid=max(mix(vec3(lum),col,1.+g*.9),0.)*(1.+g*.4);
  // warm glow along the stroke so color shows even over the dark
  vivid+=mix(vec3(.86,.12,.16),vec3(1.,.5,.3),clamp(L-.5,0.,1.))*min(L,1.)*.32;
  col=mix(INK*lum*1.15,vivid,smoothstep(0.,.35,g));

  col*=.94+.06*sin(gl_FragCoord.y*1.7);
  col+=(h(gl_FragCoord.xy+fract(T)*97.)-.5)*.07;
  vec2 v=uv-.5;col*=1.-dot(v,v)*1.1;
  gl_FragColor=vec4(col,1.);
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

export const Backdrop = ({
  field,
  intensity = 1,
}: {
  field: React.MutableRefObject<Field>;
  intensity?: number;
}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const inten = useRef(intensity);
  inten.current = intensity;

  useEffect(() => {
    const cv = ref.current!;
    const gl = cv.getContext('webgl', {
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: 'low-power',
    });
    if (!gl || gl.isContextLost()) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = (frag: string) => {
      const pr = gl.createProgram()!;
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, frag));
      gl.linkProgram(pr);
      return gl.getProgramParameter(pr, gl.LINK_STATUS) ? pr : null;
    };
    const scene = program(SCENE);
    const glitch = program(GLITCH);
    if (!scene || !glitch) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    for (const pr of [scene, glitch]) {
      const loc = gl.getAttribLocation(pr, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    }

    const texParams = (wrap: number) => {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };

    // type texture on unit 1
    const tex = gl.createTexture();
    let logo: HTMLImageElement | null = null;
    const upload = () => {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, typeTexture(logo));
      texParams(gl.REPEAT);
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

    // scene render target on unit 0 (NPOT, so clamp + no mips)
    const rt = gl.createTexture();
    const fb = gl.createFramebuffer();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, rt);
    texParams(gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rt, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    const u = (pr: WebGLProgram, k: string) => gl.getUniformLocation(pr, k);
    const s = {
      R: u(scene, 'R'),
      M: u(scene, 'M'),
      T: u(scene, 'T'),
      I: u(scene, 'I'),
      F: u(scene, 'F'),
    };
    const g = { R: u(glitch, 'R'), T: u(glitch, 'T'), H: u(glitch, 'H'), P: u(glitch, 'P[0]') };
    gl.useProgram(scene);
    gl.uniform1i(u(scene, 'TX'), 1);
    gl.useProgram(glitch);
    gl.uniform1i(u(glitch, 'S'), 0);

    const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6;
    const size = () => {
      cv.width = Math.round(cv.clientWidth * scale);
      cv.height = Math.round(cv.clientHeight * scale);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, rt);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        cv.width,
        cv.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
      );
      gl.viewport(0, 0, cv.width, cv.height);
    };
    size();
    window.addEventListener('resize', size);

    const m = { x: 0, y: 0 };
    const trail = new Float32Array(TRAIL * 3);
    let raf = 0;
    let i = inten.current;
    let flare = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const f = field.current;
      const t = ((now - t0) / 1000) * (reduce ? 0.15 : 1);
      const a = cv.width / cv.height;
      m.x += ((f.x - 0.5) * a - m.x) * 0.2;
      m.y += (f.y - 0.5 - m.y) * 0.2;
      i += (inten.current - i) * 0.05;
      const e = reduce ? 0 : f.energy;
      flare += (Math.min(e, 1) - flare) * 0.25;
      if (!reduce) trail.set(f.trail);

      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.useProgram(scene);
      gl.uniform2f(s.R, cv.width, cv.height);
      gl.uniform2f(s.M, m.x, m.y);
      gl.uniform1f(s.T, t);
      gl.uniform1f(s.I, i);
      gl.uniform1f(s.F, flare);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.useProgram(glitch);
      gl.uniform2f(g.R, cv.width, cv.height);
      gl.uniform1f(g.T, t);
      gl.uniform1f(g.H, e);
      gl.uniform3fv(g.P, trail);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      // don't lose the context: StrictMode re-runs this effect on the same canvas
      gl.deleteProgram(scene);
      gl.deleteProgram(glitch);
      gl.deleteTexture(tex);
      gl.deleteTexture(rt);
      gl.deleteFramebuffer(fb);
    };
  }, [field]);

  return (
    <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />
  );
};
