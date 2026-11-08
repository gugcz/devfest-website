/**
 * The aether's GLSL (WebGL 1). One full-screen triangle; the fragment shader
 * paints, in order:
 *
 * 1. Smoke: domain-warped noise banded into brush strokes over a fixed
 *    bristle texture, so the paint stays on the canvas and only the colour
 *    moves under it. Mostly dark petrol, warm plum and rust only in places;
 *    cold light from above, warm from below; darker and calmer behind the
 *    logo.
 * 2. The sigil: three rings turning at their own speeds. At rest they are
 *    only cut into the paint; they catch light from a slow sweep, the wave
 *    after load (`u_ignite`) and the lamp that follows the pointer.
 * 3. The traces, with a pulse running along each now and then.
 * 4. Embers rising, a hatched vignette in the corners, paper grain.
 */
import { RING_EXTENT, TRACE_EXTENT } from './textures';

export const VERTEX = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

export const FRAGMENT = [
	'#ifdef GL_FRAGMENT_PRECISION_HIGH',
	'precision highp float;',
	'#else',
	'precision mediump float;',
	'#endif',
	'uniform vec2 u_res;',
	'uniform float u_time;',
	'uniform float u_ignite;',
	'uniform vec2 u_lamp;',
	'uniform vec2 u_center;',
	'uniform sampler2D u_rings;',
	'uniform sampler2D u_traces;',
	`const float RING_EXT=${RING_EXTENT.toFixed(3)};`,
	`const float TRACE_EXT=${TRACE_EXTENT.toFixed(3)};`,

	'float h21(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}',
	'vec2 h22(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));q+=dot(q,q.yzx+33.33);return fract((q.xx+q.yz)*q.zy);}',
	'float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
	'  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}',
	'const mat2 M=mat2(.8,.6,-.6,.8);',
	'float fbm3(vec2 p){float a=.5,s=0.;for(int i=0;i<3;i++){s+=a*n2(p);p=M*p*2.03+7.1;a*=.5;}return s/.875;}',
	'float fbm4(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n2(p);p=M*p*2.03+7.1;a*=.5;}return s/.9375;}',
	'mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}',

	// Tonal steps with a slightly soft edge: what turns mist into brush strokes.
	'float bands(float v,float n){float b=v*n,i=floor(b),f=b-i;return(i+smoothstep(.3,.7,f))/n;}',

	// Embers: small diamond dabs drifting upward.
	'vec3 embers(vec2 p,float t){vec3 s=vec3(0.);',
	'  for(int i=0;i<3;i++){float fi=float(i);float sc=5.+fi*4.;',
	'    vec2 g=p*sc+vec2(sin(t*.11+fi*2.)*.5+n2(p*2.+t*.05)*1.2,-t*(.16-.03*fi));',
	'    vec2 id=floor(g),f=fract(g)-.5;vec2 h=h22(id+fi*17.);',
	'    if(h.x<.68)continue;',
	'    vec2 o=(h22(id+3.)-.5)*.6;vec2 d=abs(f-o);',
	'    float life=sin(t*(.5+h.y)+h.y*40.)*.5+.5;life*=life;',
	'    float dab=smoothstep(.055-.01*fi,.0,d.x+d.y*.62);',
	'    vec3 tint=h.y>.8?vec3(.45,.95,.92):vec3(1.,.58,.24);',
	'    s+=tint*dab*life*(1.-fi*.22);',
	'  }return s;}',

	'void main(){',
	'  float mn=min(u_res.x,u_res.y);',
	'  vec2 p=(gl_FragCoord.xy-.5*u_res)/mn;',
	'  vec2 c=p-u_center;',
	'  float t=u_time;',

	// Smoke flow.
	'  vec2 q=vec2(fbm3(p*1.3+vec2(0.,t*.022)),fbm3(p*1.3+vec2(5.2,1.3)-t*.017));',
	'  vec2 r=vec2(fbm3(p*1.1+2.8*q+vec2(1.7,9.2)+t*.019),fbm3(p*1.1+2.8*q+vec2(8.3,2.8)-t*.014));',
	'  float f=fbm4(p*1.25+2.5*r);',

	// The stroke direction is fixed: the paint stays put, only colour moves under it.
	'  float ang=-.6+(n2(p*.8+11.)-.5)*1.6;',
	'  vec2 dir=vec2(cos(ang),sin(ang));',
	'  vec2 bp=vec2(dot(p,dir),dot(p,vec2(-dir.y,dir.x)));',
	'  float bristle=n2(bp*vec2(5.,72.))*.6+n2(bp*vec2(13.,165.))*.4;',
	'  float dab=n2(bp*vec2(2.6,17.)+f*2.);',

	'  float v=clamp(smoothstep(.2,.84,f)+(bristle-.5)*.17,0.,1.);',
	'  float tone=bands(v,5.);',

	// Palette: dark petrol shadows mostly, warm plum and rust masses only in places.
	'  vec3 ink=vec3(.012,.022,.036);',
	'  vec3 petrol=vec3(.024,.088,.108);',
	'  vec3 teal=vec3(.058,.235,.25);',
	'  vec3 plum=vec3(.07,.036,.12);',
	'  vec3 wine=vec3(.2,.052,.15);',
	'  vec3 rust=vec3(.5,.2,.09);',
	'  vec3 cold=mix(ink,petrol,smoothstep(.1,.5,tone));cold=mix(cold,teal,smoothstep(.55,1.,tone));',
	'  vec3 warm=mix(ink,plum,smoothstep(.1,.5,tone));warm=mix(warm,wine,smoothstep(.6,1.,tone));',
	'  float mass=smoothstep(.54,.66,r.y+(bristle-.5)*.1+p.x*.1);',
	'  vec3 col=mix(cold,warm,mass);',

	// One big fall of light: cold from above, warm from below.
	'  col*=mix(.72,1.2,smoothstep(-.5,.6,p.y+(p.x*.25)));',
	'  float low=smoothstep(-.12,-.72,p.y+(q.x-.5)*.45);',
	'  col=mix(col,rust,low*smoothstep(.22,.8,tone)*.8);',

	// Dry strokes in an accent colour.
	'  float accentMask=smoothstep(.68,.72,dab)*smoothstep(.5,.8,tone);',
	'  col=mix(col,mix(vec3(.13,.5,.48),vec3(.62,.18,.38),mass),accentMask*.32);',

	// A calmer, darker centre so the logo reads.
	'  float focus=length(c*vec2(.62,1.75));',
	'  col*=mix(.42,1.,smoothstep(.08,.62,focus));',
	'  col+=vec3(.03,.14,.15)*exp(-focus*focus*5.)*(.55+.9*f);',

	// The lamp that follows the pointer.
	'  vec2 ld=p-u_lamp;float lamp=exp(-dot(ld,ld)*13.);',
	'  col+=vec3(.05,.17,.17)*lamp*(.35+tone);',

	// The sigil.
	'  float boil=mod(floor(t*7.),97.);',
	'  vec2 w=(vec2(n2(p*13.+boil),n2(p*13.+boil+9.))-.5)*.0034;',
	'  vec2 cw=c+w;',
	'  vec2 uR=rot(t*.009)*cw/(2.*RING_EXT)+.5;',
	'  vec2 uG=rot(-t*.015+.4)*cw/(2.*RING_EXT)+.5;',
	'  vec2 uB=rot(t*.022+1.)*cw/(2.*RING_EXT)+.5;',
	'  float lines=texture2D(u_rings,uR).r+texture2D(u_rings,uG).g+texture2D(u_rings,uB).b;',
	'  float halo=texture2D(u_rings,uR,3.2).r+texture2D(u_rings,uG,3.2).g+texture2D(u_rings,uB,3.2).b;',
	'  lines=clamp(lines,0.,1.)*(.68+.62*bristle);',
	'  float a=atan(c.y,c.x);',
	'  float sweep=pow(.5+.5*cos(a-t*.17),22.)+.7*pow(.5+.5*cos(a+t*.11+2.),34.);',
	'  float wave=exp(-pow((length(c)-u_ignite*1.1)*5.,2.))*step(.001,u_ignite)*smoothstep(1.,.6,u_ignite);',
	'  float lit=sweep*.34+lamp*.95+wave*1.25+(1.-smoothstep(0.,.9,u_ignite))*.12;',
	'  vec3 glow=mix(vec3(.36,.95,.88),vec3(.92,.32,.62),smoothstep(.45,.72,q.x+sin(a+t*.03)*.12));',
	'  col*=1.-lines*.3;',
	'  col+=glow*(lines*lit+halo*lit*.34);',

	// The traces.
	'  vec2 uT=p/(2.*TRACE_EXT)+.5;',
	'  vec3 tr=texture2D(u_traces,uT+w*.3).rgb;',
	'  vec3 trB=texture2D(u_traces,uT,2.6).rgb;',
	'  float m=tr.r,mb=trB.r;',
	'  float tt=tr.g/max(m,.02),sd=tr.b/max(m,.02);',
	'  float ttb=trB.g/max(mb,.02),sdb=trB.b/max(mb,.02);',
	'  float ph=fract(t*(.028+.05*sd)+sd*17.-tt*.55);',
	'  float phb=fract(t*(.028+.05*sdb)+sdb*17.-ttb*.55);',
	'  float pulse=exp(-ph*30.),pulseB=exp(-phb*30.);',
	'  col*=1.-m*.26*(.6+bristle);',
	'  vec3 tglow=mix(vec3(.42,.96,.88),vec3(1.,.62,.28),smoothstep(-.1,-.6,p.y));',
	'  col+=tglow*(m*(pulse*.9+lamp*.42+wave*.5)+mb*pulseB*.9);',

	// Embers.
	'  col+=embers(p,t)*.8;',

	// A hatched vignette, as if inked into the corners.
	'  float ax=u_res.x/mn,ay=u_res.y/mn;',
	'  vec2 e=vec2(p.x/ax,p.y/ay)*2.;',
	'  float vig=smoothstep(.55,1.35,length(e)+(q.y-.5)*.3);',
	'  float hatch=smoothstep(-.15,.35,sin((p.x*.9+p.y)*105.+n2(p*9.)*5.));',
	'  col*=1.-vig*(.5+.2*hatch*smoothstep(.45,.6,n2(p*3.+4.)));',

	// Grain.
	'  col+=(h21(gl_FragCoord.xy)-.5)*.022;',
	'  gl_FragColor=vec4(pow(max(col,0.),vec3(.92)),1.);',
	'}',
].join('\n');
