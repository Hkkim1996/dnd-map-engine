/* dnd-map-engine HD — three.js r128, window.DMAP(M) */
window.DMAP=function(M){
M=M||{};
const W=document.getElementById("w"),LB=document.getElementById("lb"),NN=document.getElementById("n");
if(NN)NN.textContent=M.note||"";
const fail=()=>W&&W.insertAdjacentHTML("beforeend","<p style='padding:1rem'>3D 지도를 불러오지 못했습니다.</p>");
if(!window.THREE||!W)return fail();
const T3=THREE,PI=Math.PI;
let rw;try{rw=new T3.WebGLRenderer({antialias:true,alpha:true})}catch(e){return fail()}
const SMALL=(W.clientWidth||680)<500||Math.min(screen.width||999,screen.height||999)<500;
rw.setPixelRatio(Math.min(SMALL?1.5:2,window.devicePixelRatio||1));
rw.outputEncoding=T3.sRGBEncoding;rw.toneMapping=T3.ACESFilmicToneMapping;rw.toneMappingExposure=1.05;
rw.shadowMap.enabled=true;rw.shadowMap.type=T3.PCFSoftShadowMap;
const sc=new T3.Scene();
const col=h=>new T3.Color(h).convertSRGBToLinear();

/* ---------- noise ---------- */
const hsh=(x,y,s)=>{const h=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return h-Math.floor(h)};
const vn=(x,y,s,P)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
 const m=P?(q=>((q%P)+P)%P):(q=>q),a=hsh(m(xi),m(yi),s),b=hsh(m(xi+1),m(yi),s),c=hsh(m(xi),m(yi+1),s),d=hsh(m(xi+1),m(yi+1),s);
 return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v};
const fbm=(x,y,s,o,P)=>{let t=0,a=.5,f=1,n=0;for(let i=0;i<(o||4);i++){t+=a*vn(x*f,y*f,s+i*13,P?P*f:0);n+=a;f*=2;a*=.5}return t/n};
const rnd=s=>{let v=s*9301+49297;return()=>{v=(v*9301+49297)%233280;return v/233280}};

/* ---------- procedural textures ---------- */
const TS=SMALL?128:256,TX={};
const mix=(a,b,t)=>a+(b-a)*t;
const C3=h=>[(h>>16)&255,(h>>8)&255,h&255];
const lerpC=(a,b,t)=>[mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t)];
const GEN={
sand:(u,v)=>{const n=fbm(u*8,v*8,1,4,8),r=Math.sin((v*10+fbm(u*4,v*4,7,3,4)*1.6)*PI*2)*.5+.5,g=hsh(Math.floor(u*TS),Math.floor(v*TS),3);
 let c=lerpC(C3(0xA88E62),C3(0xCDB68A),n*.8+r*.25);if(g>.93)c=lerpC(c,C3(0x8A7A60),.5);return[c,n*.6+r*.4]},
grass:(u,v)=>{const n=fbm(u*6,v*6,2,4,6),m=fbm(u*3,v*3,9,3,3),g=hsh(Math.floor(u*TS),Math.floor(v*TS),5);
 let c=lerpC(C3(0x3E5E22),C3(0x7C9A3C),n);c=lerpC(c,C3(0x8A7A4A),Math.max(0,m-.62)*2.2);if(g>.88)c=lerpC(c,C3(0xA8C060),.45);return[c,n*.7+g*.3]},
dirt:(u,v)=>{const n=fbm(u*7,v*7,3,5,7),p=fbm(u*16,v*16,4,2,16);let c=lerpC(C3(0x5E4630),C3(0x9A7A56),n);if(p>.7)c=lerpC(c,C3(0xA8A090),(p-.7)*2.5);return[c,n*.6+(p>.7?.4:0)]},
stone:(u,v)=>{const rows=4,rv=v*rows,ri=Math.floor(rv),off=(ri%2)*.5,cu=u*2+off,ci=Math.floor(cu),fu=cu-ci,fv=rv-ri,
 e=Math.min(fu,1-fu,fv*.5,(1-fv)*.5),n=fbm(u*10,v*10,6,4,10),t=hsh(ci%2,ri,8);
 let c=lerpC(C3(0x8A867C),C3(0xC4C0B4),n*.7+t*.3);if(e<.04)c=lerpC(C3(0x4A463E),c,e/.04);return[c,e<.04?e/.04*.6:.6+n*.4]},
rock:(u,v)=>{const n=fbm(u*6,v*6,11,5,6),k=Math.abs(fbm(u*4,v*4,12,3,4)-.5);let c=lerpC(C3(0x6A665E),C3(0xA8A498),n);if(k<.03)c=lerpC(c,C3(0x3A3630),.6);return[c,n-(k<.03?.3:0)]},
plank:(u,v)=>{const pw=.25,pi=Math.floor(v/pw),fv=v/pw-pi,g=fbm(u*2+pi*3.1,v*40,14,4,0),t=hsh(pi,1,15),e=Math.min(fv,1-fv);
 let c=lerpC(C3(0x7A5230),C3(0xB08050),g*.7+t*.3);if(e<.05)c=lerpC(C3(0x3A2412),c,e/.05);return[c,e<.05?e/.05*.5:.5+g*.5]},
crate:(u,v)=>{const b=Math.min(u,1-u,v,1-v),d=Math.abs(u-v),[c0,h0]=GEN.plank(u,v);if(b<.1||d<.06){const g=fbm(u*30,v*3,21,3,0);return[lerpC(C3(0x5A3A1E),C3(0x8A5E34),g),.8]}return[c0,h0*.6]},
flesh:(u,v)=>{const n=fbm(u*5,v*5,31,4,5),r=Math.abs(fbm(u*4,v*4,32,4,4)-.5),w=fbm(u*12,v*12,33,3,12);
 let c=lerpC(C3(0x8A3048),C3(0xC45A70),n);if(r<.035)c=lerpC(C3(0x4A1030),c,r/.035);return[c,.5+n*.3+w*.2-(r<.035?.25:0)]},
fleshdark:(u,v)=>{const[c,h]=GEN.flesh(u*1.3,v*1.3);return[c.map(x=>x*.58),h]},
chitin:(u,v)=>{const N=3;let d1=9,d2=9;const cu=u*N,cv=v*N,iu=Math.floor(cu),iv=Math.floor(cv);
 for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const px=iu+a,py=iv+b,q=((px%N)+N)%N,r2=((py%N)+N)%N,x=px+hsh(q,r2,41),y=py+hsh(q,r2,42),dd=Math.hypot(cu-x,cv-y);if(dd<d1){d2=d1;d1=dd}else if(dd<d2)d2=dd}
 const e=d2-d1,n=fbm(u*8,v*8,43,3,8);let c=lerpC(C3(0x241C36),C3(0x46385E),n*.65+Math.min(1,e*2)*.35);if(e<.06)c=lerpC(C3(0x120C1E),c,e/.06);return[c,Math.min(1,e*3)]},
metal:(u,v)=>{const n=fbm(u*1.5,v*50,51,3,0),s=hsh(Math.floor(u*TS/3),Math.floor(v*TS),52);let c=lerpC(C3(0x7E8288),C3(0xB4B8BE),n);if(s>.985)c=lerpC(c,C3(0xE0E4E8),.6);return[c,n*.3]},
roof:(u,v)=>{const rows=8,rv=v*rows,ri=Math.floor(rv),fv=rv-ri,off=(ri%2)*.5,cu=u*6+off,fu=cu-Math.floor(cu),t=hsh(Math.floor(cu),ri,61),n=fbm(u*8,v*8,62,3,8);
 const edge=Math.min(fu,1-fu);let c=lerpC(C3(0x7A2E16),C3(0xAA4A26),t*.6+n*.4);c=lerpC(c.map(x=>x*.55),c,Math.min(1,fv*1.6));if(edge<.04)c=c.map(x=>x*.7);return[c,fv]},
roof2:(u,v)=>{const[c,h]=GEN.roof(u,v);return[c.map(x=>x*.75),h]},
cloth:(u,v)=>{const w=(Math.sin(u*TS*PI*.5)*Math.sin(v*TS*PI*.5))*.5+.5,n=fbm(u*6,v*6,71,3,6);return[lerpC(C3(0x14805E),C3(0x2AB080),n*.6+w*.2),w*.5]},
dark:(u,v)=>{const n=fbm(u*5,v*5,81,4,5);return[lerpC(C3(0x141416),C3(0x2A2A2E),n),n*.3]},
purple:(u,v)=>{const n=fbm(u*6,v*6,91,4,6),r=Math.abs(fbm(u*5,v*5,92,4,5)-.5);let c=lerpC(C3(0x5A4AB0),C3(0x9A8AE0),n);if(r<.03)c=lerpC(C3(0x3A2A70),c,r/.03);return[c,n]},
chain:(u,v)=>{const k=12,x=u*k,y=v*k*1.4,ry=Math.floor(y),fx=x-Math.floor(x+(ry%2)*.5)-(ry%2)*.5,fy=y-ry,d=Math.abs(Math.hypot(fx-.5,(fy-.5)*1.2)-.32);
 const c=d<.1?lerpC(C3(0xC8CCD2),C3(0x6A6E74),d/.1):C3(0x3A3C40);return[c,d<.1?1-d/.1:0]},
leather:(u,v)=>{const n=fbm(u*9,v*9,101,4,9),s=fbm(u*30,v*30,102,2,30);return[lerpC(C3(0x7A7A7A),C3(0xB0B0B0),n*.7+s*.3),n*.5+s*.5]}
};
GEN.wood=GEN.plank;GEN.crate2=GEN.crate;
const mkTex=k=>{if(TX[k])return TX[k];const f=GEN[k];if(!f)return null;
 const cv=document.createElement("canvas"),bv=document.createElement("canvas");cv.width=cv.height=bv.width=bv.height=TS;
 const cx=cv.getContext("2d"),bx=bv.getContext("2d"),id=cx.createImageData(TS,TS),bd=bx.createImageData(TS,TS);
 for(let j=0;j<TS;j++)for(let i=0;i<TS;i++){const[c,h]=f(i/TS,j/TS),o=(j*TS+i)*4;id.data[o]=c[0];id.data[o+1]=c[1];id.data[o+2]=c[2];id.data[o+3]=255;const hv=Math.max(0,Math.min(255,h*255));bd.data[o]=bd.data[o+1]=bd.data[o+2]=hv;bd.data[o+3]=255}
 cx.putImageData(id,0,0);bx.putImageData(bd,0,0);
 const m=new T3.CanvasTexture(cv),b=new T3.CanvasTexture(bv);[m,b].forEach(t=>{t.wrapS=t.wrapT=T3.RepeatWrapping;t.anisotropy=4});m.encoding=T3.sRGBEncoding;
 return TX[k]={map:m,bump:b}};

/* ---------- environment ---------- */
const MOOD={
day:{sun:0xFFF0DA,si:1.75,sky:0xCFE4FF,gnd:0x6B5A48,hi:.5,env:[0xAFC8E2,0x7C6A52],fog:null,exp:1.0},
dusk:{sun:0xFFB070,si:1.8,sky:0x8C7AB0,gnd:0x4A3A36,hi:.5,env:[0xE8A080,0x3A3040],fog:null,exp:1.0},
night:{sun:0x9DB6FF,si:.55,sky:0x3A4A7A,gnd:0x141420,hi:.45,env:[0x2A3A60,0x101018],fog:[0x0E1220,.012],exp:1.1},
cave:{sun:0xD8C8B0,si:1.0,sky:0x8A7A80,gnd:0x2A2020,hi:.8,env:[0x6A5A64,0x201818],fog:[0x120E10,.005],exp:1.2},
hell:{sun:0xFF7A4A,si:1.6,sky:0xFF6A3A,gnd:0x401010,hi:.6,env:[0xC04020,0x2A0808],fog:[0x3A0A06,.008],exp:1.0}};
const MD=MOOD[M.mood]||MOOD.day;rw.toneMappingExposure=MD.exp;
(()=>{try{const es=new T3.Scene(),g=new T3.SphereGeometry(10,24,12),top=col(MD.env[0]),bot=col(MD.env[1]),c=[];const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const t=Math.max(0,Math.min(1,(p.getY(i)/10+.3)/1.1));const cc=bot.clone().lerp(top,t);c.push(cc.r,cc.g,cc.b)}
 g.setAttribute("color",new T3.Float32BufferAttribute(c,3));es.add(new T3.Mesh(g,new T3.MeshBasicMaterial({vertexColors:true,side:T3.BackSide})));
 const pm=new T3.PMREMGenerator(rw);sc.environment=pm.fromScene(es,.04).texture;pm.dispose()}catch(e){}})();
if(MD.fog)sc.fog=new T3.FogExp2(col(MD.fog[0]),MD.fog[1]);

/* ---------- materials ---------- */
const MS={
stone:{tex:"stone",t:3,r:.9,b:.035},wood:{tex:"plank",t:2,r:.8,b:.02},plank:{tex:"plank",t:2,r:.8,b:.02},flesh:{tex:"flesh",t:4,r:.45,b:.05},
fleshdark:{tex:"fleshdark",t:3,r:.5,b:.05},purple:{tex:"purple",t:2,r:.35,b:.02},chitin:{tex:"chitin",t:6,r:.45,b:.06,m:.1},
grass:{tex:"grass",t:3,r:.95,b:.03},dirt:{tex:"dirt",t:3,r:.95,b:.04},sand:{tex:"sand",t:4,r:.95,b:.025},metal:{tex:"metal",t:2,r:.35,b:.01,m:.8},
crate:{tex:"crate",t:0,r:.8,b:.03},roof:{tex:"roof",t:3,r:.8,b:.04},roof2:{tex:"roof2",t:3,r:.8,b:.04},cloth:{tex:"cloth",t:1,r:.95,b:.01},
dark:{tex:"dark",t:4,r:1,b:.01},rock:{tex:"rock",t:2,r:.9,b:.05}};
const MC={};
const mat=k=>{if(MC[k])return MC[k];let m;
 if(k=="red"||k=="glow"){const c=k=="red"?0xE24B4A:0xC090FF;m=new T3.MeshStandardMaterial({color:col(c),emissive:col(k=="red"?0xB01818:0x8040E0),emissiveIntensity:1.4,roughness:.5})}
 else if(k=="water"){const nt=waterN();m=new T3.MeshStandardMaterial({color:col(0x1C4E66),roughness:.07,metalness:.2,normalMap:nt,normalScale:new T3.Vector2(.9,.9),transparent:true,opacity:.93,envMapIntensity:1.4})}
 else{const s=MS[k]||MS.stone,tx=mkTex(s.tex);m=new T3.MeshStandardMaterial({map:tx.map,bumpMap:tx.bump,bumpScale:s.b,roughness:s.r,metalness:s.m||0,envMapIntensity:.5})}
 m.userData.t=(MS[k]||{}).t;return MC[k]=m};
let WN=null;
function waterN(){if(WN)return WN;const N=SMALL?128:256,cv=document.createElement("canvas");cv.width=cv.height=N;const cx=cv.getContext("2d"),id=cx.createImageData(N,N),H=(i,j)=>fbm(i/N*6,j/N*6,201,4,6)+.4*fbm(i/N*14,j/N*14,202,3,14);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const dx=H(i+1,j)-H(i-1,j),dy=H(i,j+1)-H(i,j-1),o=(j*N+i)*4;id.data[o]=128-dx*300;id.data[o+1]=128-dy*300;id.data[o+2]=255;id.data[o+3]=255}
 cx.putImageData(id,0,0);WN=new T3.CanvasTexture(cv);WN.wrapS=WN.wrapT=T3.RepeatWrapping;return WN}
const wuv=(g,t,o)=>{if(!t)return g;const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;if(!uv||!n)return g;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+o[0],y=p.getY(i)+o[1],z=p.getZ(i)+o[2],ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));
  if(ay>=ax&&ay>=az)uv.setXY(i,x/t,z/t);else if(ax>=az)uv.setXY(i,z/t,y/t);else uv.setXY(i,x/t,y/t)}uv.needsUpdate=true;return g};

/* ---------- geometry helpers ---------- */
const GC={},SEG=SMALL?10:16;
const sphG=()=>GC.s||(GC.s=new T3.SphereGeometry(1,SEG,Math.round(SEG*.75)));
const hemiG=()=>GC.h||(GC.h=new T3.SphereGeometry(1,SEG,Math.round(SEG*.4),0,PI*2,0,PI/2));
const cylG=()=>GC.c||(GC.c=new T3.CylinderGeometry(1,1,1,SEG));
const boxG=()=>GC.b||(GC.b=new T3.BoxGeometry(1,1,1));
const coneG=n=>GC["k"+n]||(GC["k"+n]=new T3.ConeGeometry(1,1,n||SEG));
const V=(x,y,z)=>new T3.Vector3(x,y,z);
const PMC={};
const pm=(c,o)=>{const k=c+"|"+JSON.stringify(o||{});if(PMC[k])return PMC[k];const p=Object.assign({roughness:.7,metalness:0},o||{});
 if(p.tex){const t=mkTex(p.tex);delete p.tex;p.bumpMap=t.bump;p.bumpScale=p.bs||.01;delete p.bs}
 if("em" in p){if(p.em){p.emissive=col(p.em);p.emissiveIntensity=p.ei||1}delete p.em;delete p.ei}
 return PMC[k]=new T3.MeshStandardMaterial(Object.assign(p,{color:col(c)}))};
const part=(g,geo,m,x,y,z,sx,sy,sz,rx,ry,rz)=>{const me=new T3.Mesh(geo,m);me.position.set(x,y,z);me.scale.set(sx,sy==null?sx:sy,sz==null?sx:sz);if(rx||ry||rz)me.rotation.set(rx||0,ry||0,rz||0);me.castShadow=true;me.receiveShadow=true;g.add(me);return me};
const seg=(g,a,b,r1,r2,m,cap)=>{const d=V(0,0,0).subVectors(b,a),L=d.length();if(L<1e-4)return;const me=new T3.Mesh(new T3.CylinderGeometry(r2,r1,L,SMALL?8:12,1),m);
 me.position.copy(a).addScaledVector(d,.5);me.quaternion.setFromUnitVectors(V(0,1,0),d.clone().normalize());me.castShadow=true;g.add(me);
 if(cap!==false){part(g,sphG(),m,a.x,a.y,a.z,r1)}return me};
const lat=(pts,n)=>new T3.LatheGeometry(pts.map(p=>new T3.Vector2(Math.max(0,p[0]),p[1])),n||SEG);
const tube=(pts,r0,r1,m,g)=>{const cu=new T3.CatmullRomCurve3(pts.map(p=>p.isVector3?p:V(p[0],p[1],p[2]))),TSg=Math.max(12,pts.length*8),RS=SMALL?6:8,geo=new T3.TubeGeometry(cu,TSg,1,RS,false),P=geo.attributes.position;
 for(let i=0;i<=TSg;i++){const t=i/TSg,c=cu.getPointAt(t),r=r0+(r1-r0)*t;for(let j=0;j<=RS;j++){const k=i*(RS+1)+j,v=V(P.getX(k),P.getY(k),P.getZ(k)).sub(c).multiplyScalar(r).add(c);P.setXYZ(k,v.x,v.y,v.z)}}
 geo.computeVertexNormals();const me=new T3.Mesh(geo,m);me.castShadow=true;me.receiveShadow=true;if(g)g.add(me);return me};
const ext=(pts,depth,m,g,bev)=>{const s=new T3.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const p=pts[i];if(p.length==4)s.quadraticCurveTo(p[0],p[1],p[2],p[3]);else s.lineTo(p[0],p[1])}s.closePath();
 const geo=new T3.ExtrudeGeometry(s,{depth,bevelEnabled:!!bev,bevelSize:bev||0,bevelThickness:bev||0,bevelSegments:1,curveSegments:8});geo.translate(0,0,-depth/2);const me=new T3.Mesh(geo,m);me.castShadow=true;g.add(me);return me};
const merge=gs=>{let P=[],N=[],U=[];gs.forEach(g=>{g=g.index?g.toNonIndexed():g;P.push(...g.attributes.position.array);N.push(...g.attributes.normal.array);U.push(...g.attributes.uv.array)});
 const o=new T3.BufferGeometry();o.setAttribute("position",new T3.Float32BufferAttribute(P,3));o.setAttribute("normal",new T3.Float32BufferAttribute(N,3));o.setAttribute("uv",new T3.Float32BufferAttribute(U,2));return o};
const halo=(c,s)=>{if(!GC.halo){const cv=document.createElement("canvas");cv.width=cv.height=64;const x=cv.getContext("2d"),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,"rgba(255,255,255,1)");gr.addColorStop(.3,"rgba(255,255,255,.45)");gr.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=gr;x.fillRect(0,0,64,64);GC.halo=new T3.CanvasTexture(cv)}
 const sp=new T3.Sprite(new T3.SpriteMaterial({map:GC.halo,color:col(c),blending:T3.AdditiveBlending,depthWrite:false,transparent:true,opacity:.85}));sp.scale.set(s,s,s);return sp};

/* ---------- terrain ---------- */
const GR=(M.items||[]).filter(o=>o&&o.t=="ground");
const gh=(o,x,y)=>{const a=o.amp==null?.4:o.amp,s=o.seed||7;let h=(fbm((x-o.x)/9,(y-o.y)/9,s,4)-.5)*2*a+(fbm((x-o.x)/2.5,(y-o.y)/2.5,s+5,3)-.5)*a*.25;
 (o.flat||[]).forEach(f=>{const d=Math.hypot(x-f[0],y-f[1]),r=f[2]||2;if(d<r*1.8){const t=Math.max(0,Math.min(1,(d-r)/(r*.8)));h*=t*t*(3-2*t)}});return h+(o.z||0)};
const heightAt=(x,y)=>{for(const o of GR)if(x>=o.x&&x<=o.x+o.w&&y>=o.y&&y<=o.y+o.d)return gh(o,x,y);return 0};
const baseZ=o=>o.z!=null?o.z:heightAt(o.x,o.y);

/* ---------- scene items ---------- */
const labels=[],anim=[],lights=[],POST=[];let PL=0;
const add=(geo,k,x,y,z,cast=1,uvT)=>{const m=mat(k);if(uvT!==false&&m.userData.t&&geo.attributes.uv)wuv(geo,m.userData.t,[x,y,z]);const me=new T3.Mesh(geo,m);me.position.set(x,y,z);me.castShadow=!!cast;me.receiveShadow=true;sc.add(me);return me};
const lab=(x,y,z,t)=>{if(t)labels.push([x,y,z,t])};
const IT={
ground:o=>{const sw=Math.min(SMALL?60:120,Math.max(8,Math.round(o.w*2))),sd=Math.min(SMALL?60:120,Math.max(8,Math.round(o.d*2))),geo=new T3.PlaneGeometry(o.w,o.d,sw,sd);geo.rotateX(-PI/2);
 const P=geo.attributes.position,U=geo.attributes.uv,cs=[],k=o.c||"grass",t=(MS[k]||MS.grass).t||3;
 for(let i=0;i<P.count;i++){const x=P.getX(i)+o.x+o.w/2,y=P.getZ(i)+o.y+o.d/2,h=gh(o,x,y);P.setY(i,h);U.setXY(i,x/t,y/t);
  const n=fbm(x/6,y/6,(o.seed||7)+30,3),q=fbm(x/3.5,y/3.5,(o.seed||7)+40,3);let c=[.85+n*.3,.85+n*.3,.85+n*.3];
  if(k=="grass"&&q>.6)c=[1.25,1.05,.75];if(k=="sand"&&h<-.15)c=[.75,.72,.7];if(k=="dirt"&&q>.62)c=[.8,1.15,.7];cs.push(...c)}
 geo.setAttribute("color",new T3.Float32BufferAttribute(cs,3));geo.computeVertexNormals();
 const m=mat(k).clone();m.vertexColors=true;const me=new T3.Mesh(geo,m);me.position.set(o.x+o.w/2,0,o.y+o.d/2);me.receiveShadow=true;sc.add(me);
 if(o.n)lab(o.x+o.w/2,.3,o.y+o.d/2,o.n)},
slab:o=>{const z=o.z||0;if(o.c=="water"){water(o);return}add(new T3.BoxGeometry(o.w,o.h||.3,o.d),o.c,o.x+o.w/2,z+(o.h||.3)/2,o.y+o.d/2,0);lab(o.x+o.w/2,z+(o.h||.3),o.y+o.d/2,o.n)},
box:o=>{const z=o.z||0;if(o.c=="water"){water(o);return}add(new T3.BoxGeometry(o.w,o.h,o.d),o.c,o.x+o.w/2,z+o.h/2,o.y+o.d/2);lab(o.x+o.w/2,z+o.h,o.y+o.d/2,o.n)},
crate:o=>{const z=baseZ(o),m=add(new T3.BoxGeometry(o.w,o.h,o.d),o.c=="crate"||!o.c?"crate":o.c,o.x+o.w/2,z+o.h/2,o.y+o.d/2,1,false);m.rotation.y=(hsh(o.x,o.y,3)-.5)*.3;lab(o.x+o.w/2,z+o.h,o.y+o.d/2,o.n)},
barrel:o=>{const z=baseZ(o),r=o.r,h=o.h,g=new T3.Group();g.position.set(o.x,z,o.y);sc.add(g);
 const b=new T3.Mesh(lat([[0,0],[r*.86,0],[r,h*.5],[r*.86,h],[0,h]],SEG),pm(0x8A5A32,{tex:"plank",bs:.02,roughness:.8}));b.castShadow=b.receiveShadow=true;g.add(b);
 [.18,.82].forEach(f=>{const t=new T3.Mesh(new T3.TorusGeometry(r*(f==.5?1:.95),.018,6,SEG),pm(0x4A4A4E,{metalness:.7,roughness:.4}));t.rotation.x=PI/2;t.position.y=h*f;g.add(t)});lab(o.x,z+h,o.y,o.n)},
pillar:o=>{const z=baseZ(o),g=new T3.Group();g.position.set(o.x,z,o.y);sc.add(g);const k=o.c||"stone",m=mat(k);
 const p=new T3.Mesh(lat([[o.r,0],[o.r*.82,o.h*.08],[o.r*.72,o.h*.5],[o.r*.8,o.h*.92],[o.r*.95,o.h],[0,o.h]],SEG),m);p.castShadow=p.receiveShadow=true;g.add(p);lab(o.x,z+o.h,o.y,o.n)},
pod:o=>{const z=baseZ(o),m=pm(0x7A6AD0,{tex:"purple",bs:.02,roughness:.3,transparent:true,opacity:o.open?.95:.88,em:0x3A2080,ei:.35,side:o.open?T3.DoubleSide:T3.FrontSide});
 const g=o.open?new T3.SphereGeometry(1,SEG,SEG,0,PI*2,1.35,1.8):new T3.SphereGeometry(1,SEG,SEG);const me=new T3.Mesh(g,m);me.position.set(o.x,z+o.h/2,o.y);me.scale.set(o.r,o.h/2,o.r);me.castShadow=true;sc.add(me);
 const st=new T3.Mesh(lat([[o.r*.9,0],[o.r*.55,o.h*.12],[0,o.h*.14]]),mat("fleshdark"));st.position.set(o.x,z,o.y);sc.add(st);
 if(o.open){const gl=halo(0xB080FF,o.r*2.2);gl.position.set(o.x,z+o.h*.35,o.y);sc.add(gl)}else{const gl=halo(0x9070FF,o.r*2.6);gl.position.set(o.x,z+o.h*.5,o.y);gl.material.opacity=.35;sc.add(gl)}
 lab(o.x,o.open?z+o.h*.6:z+o.h,o.y,o.n)},
house:o=>{const z=baseZ(o),wm=o.c||"stone";add(new T3.BoxGeometry(o.w,o.h,o.d),wm,o.x+o.w/2,z+o.h/2,o.y+o.d/2);
 const rh=o.rh||o.d*.45,s=new T3.Shape();s.moveTo(-o.d/2-.35,0);s.lineTo(o.d/2+.35,0);s.lineTo(0,rh);s.closePath();const rg=new T3.ExtrudeGeometry(s,{depth:o.w+.5,bevelEnabled:false});
 const r=new T3.Mesh(rg,mat(o.rc||"roof"));wuv(rg,3,[0,0,0]);r.rotation.y=PI/2;r.position.set(o.x-.25,z+o.h,o.y+o.d/2);r.castShadow=r.receiveShadow=true;sc.add(r);
 const dr=new T3.Mesh(boxG(),pm(0x3A2414,{tex:"plank",bs:.01}));dr.scale.set(Math.min(1.1,o.w*.25),Math.min(2,o.h*.7),.08);dr.position.set(o.x+o.w/2,z+dr.scale.y/2,o.y+o.d+.02);sc.add(dr);
 [-1,1].forEach(q=>{if(o.w<3)return;const wn=new T3.Mesh(boxG(),pm(0xFFD48A,{em:0xFFB050,ei:M.mood=="night"||M.mood=="dusk"?1.2:.25}));wn.scale.set(.6,.6,.06);wn.position.set(o.x+o.w/2+q*o.w*.3,z+o.h*.6,o.y+o.d+.02);sc.add(wn)});
 lab(o.x+o.w/2,z+o.h+rh,o.y+o.d/2,o.n)},
table:o=>{const z=baseZ(o),m=pm(0x8A5A32,{tex:"plank",bs:.015,roughness:.7});part(sc,boxG(),m,o.x+o.w/2,z+.78,o.y+o.d/2,o.w,.06,o.d);
 [[.12,.12],[o.w-.12,.12],[.12,o.d-.12],[o.w-.12,o.d-.12]].forEach(([a,b])=>part(sc,boxG(),m,o.x+a,z+.38,o.y+b,.08,.76,.08));lab(o.x+o.w/2,z+.9,o.y+o.d/2,o.n)},
tree:o=>{const z=baseZ(o),h=o.h||5,r=o.r||1.4,R=rnd(Math.floor(o.x*13+o.y*7)+1),g=new T3.Group();g.position.set(o.x,z,o.y);sc.add(g);
 const bark=pm(0x5A4030,{tex:"plank",bs:.03,roughness:.95}),lf=o.c&&o.c!="grass"?o.c:null;
 tube([[0,0,0],[(R()-.5)*.3,h*.35,(R()-.5)*.3],[(R()-.5)*.5,h*.62,(R()-.5)*.5]],.16*h/5+.08,.07,bark,g);
 const n=4+Math.floor(R()*3),cols=[0x3E6A26,0x4E7A2E,0x355A20,0x5A8A34];
 for(let i=0;i<n;i++){const a=R()*PI*2,d=R()*r*.55,cz=h*(.55+R()*.35),s=r*(.55+R()*.45),geo=new T3.IcosahedronGeometry(1,1),P=geo.attributes.position;
  for(let j=0;j<P.count;j++){const f=.85+hsh(P.getX(j)*5,P.getY(j)*5+i,P.getZ(j)*5)*.3;P.setXYZ(j,P.getX(j)*f,P.getY(j)*f,P.getZ(j)*f)}geo.computeVertexNormals();
  part(g,geo,lf?mat(lf):pm(cols[i%4],{tex:"grass",bs:.04,roughness:.9,flatShading:true}),Math.cos(a)*d,cz,Math.sin(a)*d,s,s*.8,s)}
 lab(o.x,z+h,o.y,o.n)},
rock:o=>{const z=baseZ(o),r=o.r||1,geo=new T3.IcosahedronGeometry(1,SMALL?1:2),P=geo.attributes.position,sd=(o.x*3+o.y*7)|0;
 for(let j=0;j<P.count;j++){const x=P.getX(j),y=P.getY(j),zz=P.getZ(j),f=.75+fbm(x*1.5+sd,y*1.5+zz*1.3,sd,3)*.5;P.setXYZ(j,x*f,Math.max(-.35,y)*f,zz*f)}geo.computeVertexNormals();
 const m=add(geo,"rock",o.x,z+(o.h||r)*.3,o.y,1,false);m.scale.set(r,o.h||r*.8,r*(.8+hsh(o.x,o.y,1)*.4));m.rotation.y=hsh(o.y,o.x,2)*PI;lab(o.x,z+(o.h||r),o.y,o.n)},
blob:o=>{const w=o.w||2,d=o.d||2,h=o.h||1.5,z=o.z!=null?o.z:heightAt(o.x+w/2,o.y+d/2),sd=o.seed||((o.x*7+o.y*13)|0)+1,geo=new T3.SphereGeometry(1,SMALL?18:30,SMALL?12:20),P=geo.attributes.position,ro=o.rough==null?.45:o.rough;
 for(let i=0;i<P.count;i++){let x=P.getX(i),y=P.getY(i),zz=P.getZ(i);const f=1+(fbm(x*1.4+sd,zz*1.4+y*1.1,sd,4)-.5)*ro*2;x*=f*w/2;zz*=f*d/2;y=Math.max(y*f,-.02)*h;P.setXYZ(i,x,y,zz)}
 geo.computeVertexNormals();const k=o.c||"rock",mm=mat(k);if(mm.userData.t)wuv(geo,mm.userData.t,[o.x,z,o.y]);const me=new T3.Mesh(geo,mm);me.position.set(o.x+w/2,z,o.y+d/2);me.rotation.y=o.rot?o.rot*PI/180:0;me.castShadow=me.receiveShadow=true;sc.add(me);lab(o.x+w/2,z+h,o.y+d/2,o.n)},
ship:o=>{const z=o.z||0,L=o.w,D=o.d,s=new T3.Shape();s.moveTo(0,0);s.lineTo(L-D*.6,0);s.quadraticCurveTo(L,0,L,D/2);s.quadraticCurveTo(L,D,L-D*.6,D);s.lineTo(0,D);s.closePath();
 const geo=new T3.ExtrudeGeometry(s,{depth:o.h,bevelEnabled:false});const m=add(geo,o.c||"plank",o.x,z,o.y,1,false);wuv(geo,2,[0,0,0]);m.rotation.x=PI/2;m.position.y=z+o.h;
 part(sc,cylG(),pm(0x5A3A20,{roughness:.8}),o.x+L*.5,z+o.h+3,o.y+D/2,.12,6,.12);
 const sail=new T3.Mesh(new T3.PlaneGeometry(D*.9,4,6,6),pm(0xE8E0CC,{tex:"cloth",bs:.005,roughness:.95,side:T3.DoubleSide}));const sp=sail.geometry.attributes.position;for(let i=0;i<sp.count;i++)sp.setZ(i,Math.sin((sp.getY(i)+2)/4*PI)*.35);sail.geometry.computeVertexNormals();
 sail.rotation.y=PI/2;sail.position.set(o.x+L*.5+.2,z+o.h+3.4,o.y+D/2);sail.castShadow=true;sc.add(sail);lab(o.x+L/2,z+o.h+1,o.y+D/2,o.n)},
tentacle:o=>{const pts=(o.p||[]).map(([a,b,c])=>V(a,c,b));if(pts.length<2)return;const m=mat(o.c||"fleshdark");const tb=tube(pts,o.r||.2,(o.r||.2)*.35,m,sc);if(m.userData.t)wuv(tb.geometry,m.userData.t,[0,0,0])},
glow:o=>{const z=o.z||0,k=o.c||"glow",c=k=="red"?0xFF5A3A:0xC090FF,s=new T3.Mesh(sphG(),pm(c,{em:c,ei:2}));s.scale.setScalar(Math.max(.02,o.r||.1));s.position.set(o.x,z,o.y);sc.add(s);
 const h=halo(c,Math.max(.8,(o.r||.1)*7));h.position.set(o.x,z,o.y);sc.add(h);
 if(PL<(SMALL?4:8)){PL++;const l=new T3.PointLight(col(c),1.4,9,2);l.position.set(o.x,z,o.y);sc.add(l);lights.push(l)}lab(o.x,z+.3,o.y,o.n)},
scatter:o=>{const R=rnd(o.seed||(o.x*31+o.y*17+7)|0),n=Math.min(o.n||20,SMALL?150:400),kind=o.kind||"grass";let geo,m,sz=[.6,1.2],shadow=true;
 if(kind=="grass"){if(!GC.tuft){const pl=[0,1,2].map(i=>{const p=new T3.PlaneGeometry(.5,.38);p.translate(0,.19,0);p.rotateY(i*PI/3);return p});GC.tuft=merge(pl)}geo=GC.tuft;
  if(!GC.gt){const cv=document.createElement("canvas");cv.width=64;cv.height=64;const x=cv.getContext("2d");for(let i=0;i<22;i++){const bx=4+Math.random()*56,g=x.createLinearGradient(0,64,0,0);g.addColorStop(0,"#2e5a14");g.addColorStop(1,"#8cc440");x.strokeStyle=g;x.lineWidth=2+Math.random()*2;x.beginPath();x.moveTo(bx,64);x.quadraticCurveTo(bx+(Math.random()-.5)*10,40,bx+(Math.random()-.5)*16,8+Math.random()*20);x.stroke()}
   GC.gt=new T3.CanvasTexture(cv);GC.gt.encoding=T3.sRGBEncoding}m=pm(0xD8F0B0,{roughness:.95,side:T3.DoubleSide,alphaTest:.5,transparent:false});m.map=GC.gt;m.needsUpdate=true;sz=[.7,1.4];shadow=false}
 else if(kind=="rock"){geo=GC.rk||(GC.rk=(()=>{const g=new T3.IcosahedronGeometry(1,1),P=g.attributes.position;for(let j=0;j<P.count;j++){const f=.75+hsh(P.getX(j)*3,P.getY(j)*3,P.getZ(j)*3)*.5;P.setXYZ(j,P.getX(j)*f,P.getY(j)*f*.7,P.getZ(j)*f)}g.computeVertexNormals();return g})());m=mat("rock");sz=[.12,.45]}
 else if(kind=="bush"){geo=GC.bu||(GC.bu=new T3.IcosahedronGeometry(1,1));m=pm(0x3E6A26,{tex:"grass",bs:.04,roughness:.9,flatShading:true});sz=[.35,.8]}
 else{geo=boxG();m=Math.random()<.5?mat("fleshdark"):mat("chitin");sz=[.12,.35]}
 const im=new T3.InstancedMesh(geo,m,n),d=new T3.Object3D();
 for(let i=0;i<n;i++){const x=o.x+R()*o.w,y=o.y+R()*o.d,s=sz[0]+R()*(sz[1]-sz[0]);d.position.set(x,heightAt(x,y)+(kind=="bush"?s*.35:kind=="rock"?s*.2:0),y);d.rotation.set(kind=="debris"?R()*3:0,R()*PI*2,kind=="debris"?R()*3:0);d.scale.set(s,kind=="bush"?s*.75:s,s);d.updateMatrix();im.setMatrixAt(i,d.matrix)}
 im.castShadow=shadow;im.receiveShadow=true;sc.add(im)},
windmill:o=>{/* {x,y,h,r,f(facing deg, 0=east 90=south),rot(sail angle deg),L(sail length),c,rc,torn,tied:{m,n,t,s,blade,at}} */
 const z=baseZ(o),h=o.h||7,r=o.r||2.2,L=o.L||h*.75,g=new T3.Group();g.position.set(o.x,z,o.y);g.rotation.y=-(o.f||0)*PI/180;sc.add(g);
 const rAt=y=>y<h*.1?r+(r*.96-r)*y/(h*.1):r*.96+(r*.74-r*.96)*(y-h*.1)/(h*.9);
 const wm=mat(o.c||"stone"),tg=lat([[r,0],[r*.96,h*.1],[r*.74,h],[0,h]],SEG*2);if(wm.userData.t)wuv(tg,wm.userData.t,[0,0,0]);const tw=new T3.Mesh(tg,wm);tw.castShadow=tw.receiveShadow=true;g.add(tw);
 const rm=mat(o.rc||"roof2"),rg=lat([[r*.86,0],[r*.82,h*.07],[r*.5,h*.2],[0,h*.3]],SEG*2);wuv(rg,3,[0,0,0]);const rf=new T3.Mesh(rg,rm);rf.position.y=h;rf.castShadow=rf.receiveShadow=true;g.add(rf);
 part(g,cylG(),pm(0x4A3220,{tex:"plank",bs:.01}),0,h+.02,0,r*.8,.08,r*.8);
 const DW=pm(0x3A2414,{tex:"plank",bs:.01,roughness:.8}),DK=pm(0x141210,{roughness:1});
 part(g,boxG(),DW,rAt(.95)+.01,.95,0,.12,1.9,1.05);part(g,boxG(),pm(0x2A2A2C,{metalness:.7,roughness:.4}),rAt(.95)+.08,.95,.35,.04,.08,.12);
 [[h*.5,0],[h*.35,PI/2],[h*.6,-PI/2]].forEach(([wy,wa])=>{const rr=rAt(wy)+.01,w=part(g,boxG(),DK,Math.cos(wa)*rr,wy,-Math.sin(wa)*rr,.1,.55,.4);w.rotation.y=wa});
 const SW=o.sw||L*.2,hy=h*.84,hx=r+.3,WD=pm(0x6A4A2E,{tex:"plank",bs:.015,roughness:.85}),CL=pm(0xCFC3A4,{tex:"cloth",bs:.004,roughness:.95,side:T3.DoubleSide});
 const ax0=rAt(hy)-.15;part(g,cylG(),WD,(ax0+hx)/2,hy,0,.14,hx-ax0,.14,0,0,PI/2);part(g,sphG(),WD,hx+.12,hy,0,.2);
 const sg=new T3.Group();sg.position.set(hx+.12,hy,0);sg.rotation.x=(o.rot||0)*PI/180;g.add(sg);const blades=[];
 for(let i=0;i<4;i++){const bg=new T3.Group();bg.rotation.x=i*PI/2;sg.add(bg);blades.push(bg);
  part(bg,boxG(),WD,0,L/2,0,.09,L,.12);
  const tn=o.torn!=null&&o.torn==i,cl=tn?.3:.72;
  part(bg,boxG(),WD,.04,L*.6,SW,.04,L*.72,.05);
  for(let k=0;k<6;k++)part(bg,boxG(),WD,.04,L*(.25+k*.14),SW/2,.035,.045,SW);
  part(bg,boxG(),CL,.07,L*(.24+cl/2),SW/2,.012,L*cl,SW*.92)}
 lab(o.x,z+h*1.32,o.y,o.n);
 if(o.tied){const tt=o.tied;POST.push(()=>{const bg=blades[(tt.blade||0)%4],fm=FIG[tt.m]?tt.m:"pawn",cc=T[tt.t]||T.npc,s=(tt.s||1)*(M.ts||1),fg=new T3.Group(),at=L*(tt.at==null?.45:tt.at);
  const fh=(FIG[fm](fg,cc,tt)||1.2)*s;fg.scale.setScalar(s);fg.position.set(.2,at,0);bg.add(fg);
  const RP=pm(0x8A6A40,{roughness:.9});[.12,.46,.7].forEach(q=>{const rg2=new T3.Mesh(new T3.TorusGeometry(.17*s,.02,5,SEG),RP);rg2.rotation.x=PI/2;rg2.scale.set(1.5,1,1);rg2.position.set(.12,at+fh*q,0);rg2.castShadow=true;bg.add(rg2)});
  fg.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true}});
  g.updateMatrixWorld(true);const wp=fg.localToWorld(V(0,fh/s*.5,0));if(tt.n)labels.push([wp.x,wp.y+.45,wp.z,tt.n,cc])})}}
};
function water(o){const z=o.z||0,h=o.h||.3,top=z+h,m=mat("water");
 const pg=new T3.PlaneGeometry(o.w,o.d,1,1);pg.rotateX(-PI/2);const U=pg.attributes.uv,P=pg.attributes.position;for(let i=0;i<P.count;i++)U.setXY(i,(P.getX(i)+o.x+o.w/2)/3.5,(P.getZ(i)+o.y+o.d/2)/3.5);
 const me=new T3.Mesh(pg,m);me.position.set(o.x+o.w/2,top,o.y+o.d/2);me.receiveShadow=true;sc.add(me);
 const bd=new T3.Mesh(new T3.BoxGeometry(o.w,Math.max(.05,h-.02),o.d),pm(0x123848,{roughness:.6}));bd.position.set(o.x+o.w/2,z+(h-.02)/2,o.y+o.d/2);sc.add(bd);
 anim.push(t=>{m.normalMap.offset.set(t*.000012,t*.000018)});lab(o.x+o.w/2,top,o.y+o.d/2,o.n)}
(M.items||[]).forEach(o=>{try{o&&IT[o.t]&&IT[o.t](o)}catch(e){console&&console.warn&&console.warn("item",o&&o.t,e)}});
if(M.grid){const g=M.grid,v=[];for(let i=0;i*g.cell<=g.w+.01;i++){const x=g.x+i*g.cell;for(let j=0;j<g.d;j+=g.cell/2){const y=g.y+j,y2=Math.min(g.y+g.d,y+g.cell/2);v.push(x,(g.z!=null?g.z:heightAt(x,y))+.03,y,x,(g.z!=null?g.z:heightAt(x,y2))+.03,y2)}}
 for(let j=0;j*g.cell<=g.d+.01;j++){const y=g.y+j*g.cell;for(let i=0;i<g.w;i+=g.cell/2){const x=g.x+i,x2=Math.min(g.x+g.w,x+g.cell/2);v.push(x,(g.z!=null?g.z:heightAt(x,y))+.03,y,x2,(g.z!=null?g.z:heightAt(x2,y))+.03,y)}}
 const bg=new T3.BufferGeometry();bg.setAttribute("position",new T3.Float32BufferAttribute(v,3));sc.add(new T3.LineSegments(bg,new T3.LineBasicMaterial({color:0x000000,transparent:true,opacity:.25})))}

/* ---------- characters ---------- */
const HUM=(g,o)=>{const k=o.H/1.8,b=o.bulk||1,hs=o.headS||1,Y=v=>v*k,S=pm(o.skin,{roughness:.55}),Tm=pm(o.top,Object.assign({roughness:.8},o.topM||{})),Bm=pm(o.bottom,{roughness:.85}),BT=pm(o.boots||0x2A1E16,{roughness:.6}),AR=o.sleeve!=null?pm(o.sleeve,Object.assign({roughness:.8},o.sleeveM||{})):S;
 [-1,1].forEach(s=>{const z=.1*b*s;seg(g,V(0,Y(.93),z),V(.02,Y(.5),z*1.05),.078*b,.066*b,Bm);seg(g,V(.02,Y(.5),z*1.05),V(0,Y(.11),z*1.05),.064*b,.05*b,o.robe?Bm:BT);part(g,sphG(),BT,.05,Y(.05),z*1.05,.11*b,.055,.065*b)});
 part(g,sphG(),Bm,0,Y(.96),0,.12*b,.1*k,.16*b);
 const to=part(g,lat([[0,0],[.14,0],[.155,.13],[.185,.33],[.2,.45],[.16,.52],[.07,.56],[0,.565]].map(p=>[p[0]*b,p[1]*k])),Tm,0,Y(.9),0,1);to.scale.set(.74,1,1);
 if(o.robe){const r=part(g,lat([[0,0],[.3*b,0],[.27*b,Y(.25)],[.18*b,Y(.8)],[.12*b,Y(.86)],[0,Y(.86)]]),Tm,0,Y(.05),0,1);r.scale.set(.82,1,1)}
 seg(g,V(0,Y(1.42),0),V(.005,Y(1.54),0),.056*b,.05*b,S);
 part(g,sphG(),S,.005,Y(1.64),0,.1*hs,.122*hs,.094*hs);
 part(g,sphG(),S,.075*hs,Y(1.6),0,.035*hs,.03*hs,.07*hs);
 [-1,1].forEach(s=>part(g,sphG(),pm(o.eye||0x16120E,{roughness:.25,em:o.eyeE||0x000000,ei:o.eyeE?1.5:0}),.088*hs,Y(1.66),s*.037*hs,.017*hs));
 const sh=[-1,1].map(s=>V(0,Y(1.36),s*.2*b)),el=[V(.03,Y(1.12),-.25*b),V(.06,Y(1.13),.25*b)],hd=[V(.12,Y(.94),-.22*b),V(.17,Y(.96),.21*b)];
 [0,1].forEach(i=>{seg(g,sh[i],el[i],.062*b,.054*b,AR);seg(g,el[i],hd[i],.052*b,.044*b,o.forearm!=null?pm(o.forearm,{roughness:.8}):AR);part(g,sphG(),o.glove!=null?pm(o.glove):S,hd[i].x,hd[i].y,hd[i].z,.05*b)});
 return{k,b,hs,Y,S,T:Tm,head:V(.005,Y(1.64),0),hand:hd[1],handL:hd[0],sh}};
const hair=(g,h,c,o)=>{const m=pm(c,{roughness:.85}),y=h.head.y,hs=h.hs;o=o||{};const tl=o.tilt==null?.48:o.tilt,key="hc"+tl;
 if(!GC[key]){const gg=new T3.SphereGeometry(1,SEG,SEG,0,PI*2,0,1.61);gg.rotateZ(tl);GC[key]=gg}
 part(g,GC[key],m,.005,y,0,.108*hs,.132*hs,.102*hs);return m};
const blade=(g,a,dir,len,w,m,guard)=>{const d=dir.clone().normalize(),q=new T3.Quaternion().setFromUnitVectors(V(0,1,0),d),bl=new T3.Mesh(new T3.BoxGeometry(w,len,.012),m);bl.quaternion.copy(q);bl.position.copy(a).addScaledVector(d,len/2+.12);bl.castShadow=true;g.add(bl);
 const tip=new T3.Mesh(coneG(4),m);tip.scale.set(w*.7,w*1.6,.012);tip.quaternion.copy(q);tip.position.copy(a).addScaledVector(d,len+.12+w*.8);g.add(tip);
 if(guard!==false){const gd=new T3.Mesh(boxG(),pm(0x8A6A3A,{metalness:.7,roughness:.35}));gd.scale.set(.03,.03,w*4.5);gd.quaternion.copy(q);gd.position.copy(a).addScaledVector(d,.11);g.add(gd)}
 seg(g,a.clone().addScaledVector(d,-.04),a.clone().addScaledVector(d,.1),.018,.018,pm(0x2A1A10,{roughness:.8}))};
const MET=c=>pm(c,{metalness:.8,roughness:.32});
const FIG={
pawn:(g,c)=>{const m=pm(c,{roughness:.45,metalness:.1});part(g,lat([[0,0],[.3,0],[.3,.08],[.2,.14],[.13,.5],[.18,.62],[.12,.7],[0,.7]]),m,0,0,0,1);part(g,sphG(),m,0,.84,0,.17);return 1.05},
orc:g=>{const h=HUM(g,{H:2.0,bulk:1.32,skin:0x72905A,top:0x6B4A2E,topM:{tex:"leather",bs:.01},bottom:0x4A3526,boots:0x2A1E16,sleeve:null,forearm:0x5A3A22}),HR=pm(0x17120F,{roughness:.9}),b=h.b,y=h.head.y,L=pm(0x5A3E26,{tex:"leather",bs:.01,roughness:.75});
 part(g,cylG(),pm(0x2E2014,{roughness:.6}),0,h.Y(.97),0,.12*b,.07,.165*b);part(g,boxG(),MET(0x9A8A60),.12*b,h.Y(.97),0,.02,.06,.07);
 [-1,1].forEach(s=>part(g,hemiG(),L,0,h.Y(1.37),s*.2*b,.1*b,.08,.11*b,0,0,s*-.35));
 hair(g,h,0x17120F,{tilt:.55});part(g,sphG(),HR,-.02,y+.13,0,.055);part(g,cylG(),pm(0x6A4A2A),-.02,y+.085,0,.03,.03,.03);
 const bd=part(g,lat([[0,.02],[.085,.02],[.1,-.05],[.075,-.14],[.03,-.2],[0,-.21]]),HR,.04,y-.02,0,1);bd.scale.set(.85,1,1.05);bd.rotation.z=.22;
 part(g,boxG(),HR,.105,y-.035,0,.02,.02,.11);
 [-1,1].forEach(s=>part(g,coneG(6),pm(0xEEE6CC,{roughness:.4}),.105,y-.02,s*.042,.012,.05,.012,0,0,-.2));
 const a=V(h.hand.x-.02,h.hand.y-.3,h.hand.z+.02),t=V(h.hand.x+.12,h.hand.y+.95,h.hand.z+.02);seg(g,a,t,.024,.022,pm(0x4A3020,{roughness:.8}));
 const hg=new T3.Group();hg.position.copy(t).lerp(a,.12);hg.quaternion.setFromUnitVectors(V(0,1,0),t.clone().sub(a).normalize());hg.rotateY(PI/4);g.add(hg);
 const ax=MET(0x9AA0A6);[-1,1].forEach(s=>{const m=ext([[0,.07],[s*.14,.2,s*.28,.2],[s*.23,.0,s*.28,-.2],[s*.14,-.2,0,-.07]],.022,ax,hg,.004)});
 return 2.25},
gith:g=>{const h=HUM(g,{H:1.9,bulk:.92,skin:0xB4B868,top:0x8A6A3A,topM:{metalness:.65,roughness:.38},bottom:0x3A3230,boots:0x2A2222,sleeve:0x4A3A30}),y=h.head.y,Hm=pm(0x5A2418,{roughness:.8}),BZ=MET(0x9A7A4A),b=h.b;
 [-1,1].forEach(s=>{const p=part(g,coneG(4),BZ,0,h.Y(1.42),s*.23*b,.12,.16,.1,s*.9,0,0)});
 part(g,cylG(),MET(0x6A5030),0,h.Y(.97),0,.11*b,.06,.15*b);
 [-1,1].forEach(s=>part(g,coneG(4),h.S,-.03,y+.03,s*.09,.018,.14,.03,s*1.25,0,.7));
 hair(g,h,0x5A2418);tube([V(-.02,y+.11,0),V(-.06,y+.24,0),V(-.16,y+.23,0),V(-.2,y+.08,0)],.04,.018,Hm,g);
 const a=V(h.hand.x,h.hand.y,h.hand.z-.05);blade(g,a,V(.25,1,-.08),.82,.045,MET(0xD8DEE4));
 return 2.2},
halfelf:g=>{const h=HUM(g,{H:1.76,bulk:.86,skin:0xD9B8A2,top:0xA8AEB6,topM:{metalness:.6,roughness:.45,tex:"chain",bs:.006},bottom:0x2E2A30,boots:0x3A2A22,sleeve:0xA8AEB6,sleeveM:{metalness:.6,roughness:.45,tex:"chain",bs:.006}}),y=h.head.y,b=h.b,HR=pm(0x121014,{roughness:.8});
 part(g,cylG(),pm(0x3A2A1E),0,h.Y(.97),0,.11*b,.05,.15*b);part(g,sphG(),pm(0x6A4A2A,{roughness:.8}),.1*b,h.Y(.92),.1*b,.05);
 [-1,1].forEach(s=>part(g,coneG(4),h.S,-.01,y+.02,s*.09,.014,.07,.02,s*1.3,0,.5));
 hair(g,h,0x121014,{tilt:.42});tube([V(-.09,y+.05,0),V(-.13,y-.06,0),V(-.13,y-.22,0)],.035,.02,HR,g);
 const a=h.hand;seg(g,V(a.x,a.y-.08,a.z),V(a.x+.08,a.y+.4,a.z),.018,.018,pm(0x3A2A1E));part(g,sphG(),MET(0x8A8F96),a.x+.09,a.y+.44,a.z,.065);
 [0,1,2,3].forEach(i=>part(g,boxG(),MET(0x8A8F96),a.x+.09,a.y+.44,a.z,.02,.12,.13,0,i*PI/4,0));
 return 1.95},
human:(g,c,t)=>{const rb=(t&&t.robe)||0x6A6A70,h=HUM(g,{H:1.76,bulk:.95,skin:0xD9B08C,top:rb,bottom:rb,sleeve:rb,robe:true});hair(g,h,0x4A3222);part(g,cylG(),pm(0x3A2A1E),0,h.Y(1.0),0,.12,.05,.16);return 1.95},
paleelf:g=>{const h=HUM(g,{H:1.8,bulk:.82,skin:0xE6D6D0,top:0x4A1620,topM:{tex:"leather",bs:.008},bottom:0x1C181C,boots:0x121012,sleeve:0x241C22,eye:0x8A1020,eyeE:0x400008}),y=h.head.y,HM=pm(0xEEEAE2,{roughness:.8});
 [-1,1].forEach(s=>part(g,coneG(4),h.S,-.02,y+.03,s*.09,.016,.12,.024,s*1.3,0,.6));
 (hair(g,h,0xEEEAE2,{tilt:.42}),[[-.02,.1,0],[.03,.1,.05],[.03,.1,-.05],[-.06,.08,.07],[-.06,.08,-.07],[-.08,.03,0],[.06,.08,0],[-.04,.11,.03]]).forEach(p=>part(g,sphG(),HM,p[0],y+p[1],p[2],.045));
 part(g,lat([[.07,0],[.075,.08],[.1,.14]]),pm(0x1C181C),0,h.Y(1.43),0,1);
 blade(g,h.hand,V(.4,1,.05),.8,.018,MET(0xDCE2E8));part(g,new T3.TorusGeometry(.05,.008,6,12),MET(0xB09050),h.hand.x+.02,h.hand.y+.06,h.hand.z,1);
 return 2.0},
wizard:g=>{const h=HUM(g,{H:1.8,bulk:.95,skin:0xD9B08C,top:0x4B2E83,bottom:0x4B2E83,sleeve:0x4B2E83,robe:true}),y=h.head.y,HB=pm(0x4A3020,{roughness:.85});
 hair(g,h,0x4A3020);part(g,lat([[0,.01],[.07,.01],[.07,-.05],[.03,-.09],[0,-.1]]),HB,.05,y-.03,0,1).rotation.z=.25;
 part(g,cylG(),pm(0xB09050,{metalness:.6,roughness:.4}),0,h.Y(1.0),0,.13,.04,.17);
 const a=h.hand;seg(g,V(a.x,.02,a.z+.05),V(a.x+.05,h.Y(2.0),a.z+.05),.022,.018,pm(0x5A3A22));part(g,sphG(),pm(0x9AD0FF,{em:0x4A90FF,ei:1.5}),a.x+.05,h.Y(2.06),a.z+.05,.06);
 return 2.2},
tiefling:(g,c,t)=>{const sk=(t&&t.skin)||0xA8433A,h=HUM(g,{H:1.78,bulk:.9,skin:sk,top:0x5A4A32,bottom:0x3A3A2E,sleeve:0x4A3E2A,eye:0xE8C040,eyeE:0x6A4A00}),y=h.head.y,HN=pm(0x2A2020,{roughness:.6});
 hair(g,h,0x1A1418);[-1,1].forEach(s=>tube([V(.03,y+.09,s*.06),V(-.02,y+.18,s*.1),V(-.12,y+.16,s*.12),V(-.14,y+.05,s*.1)],.03,.01,HN,g));
 tube([V(-.1,h.Y(.95),0),V(-.3,h.Y(.6),0),V(-.35,h.Y(.2),.1),V(-.22,h.Y(.1),.2)],.035,.01,h.S,g);return 2.0},
goblin:(g,c,t)=>{const h=HUM(g,{H:1.05,bulk:.85,skin:0x7A8F4A,top:0x5A4430,topM:{tex:"leather",bs:.01},bottom:0x4A3A28,boots:0x2A2018,headS:1.5,eye:0xE0C030,eyeE:0x6A5000}),y=h.head.y,hs=h.hs;
 [-1,1].forEach(s=>part(g,coneG(4),h.S,-.02,y+.02,s*.12*hs,.03,.2,.05,s*1.45,0,.2));
 part(g,coneG(6),h.S,.14*hs*.75,y-.02,0,.02,.07,.02,0,0,-1.3);
 const a=h.hand;
 if(t&&t.wpn=="axe"){/* greataxe as tall as the goblin, dragged behind */const top=V(a.x+.1,a.y+.16,a.z),e=V(a.x-.6,.07,a.z+.14);seg(g,top,e,.024,.02,pm(0x4A3020,{roughness:.8}));
  const hg=new T3.Group();hg.position.copy(e).lerp(top,.12);hg.quaternion.setFromUnitVectors(V(0,1,0),top.clone().sub(e).normalize());hg.rotateY(PI/2);g.add(hg);
  const ax=MET(0x8A8E92);[-1,1].forEach(s=>ext([[0,.05],[s*.13,.18,s*.26,.18],[s*.21,0,s*.26,-.18],[s*.13,-.18,0,-.05]],.02,ax,hg,.003))}
 else{const m=MET(0xA0A4A8),grp=new T3.Group();grp.position.copy(a);g.add(grp);ext([[0,0],[.03,.1,.02,.42],[-.03,.4],[-.02,.1,-.02,0]],.012,m,grp);seg(g,V(a.x,a.y-.06,a.z),V(a.x,a.y+.03,a.z),.014,.014,pm(0x3A2A1A))}
 return 1.35},
gnome:(g,c,t)=>{/* deep gnome: small, grey stone skin, bald, big nose */const h=HUM(g,{H:1.0,bulk:.8,skin:(t&&t.skin)||0x8E8C88,top:0x5A4E42,topM:{tex:"leather",bs:.008},bottom:0x3E3630,boots:0x2A2420,headS:1.45,eye:0x141414}),y=h.head.y,hs=h.hs;
 part(g,sphG(),h.S,.1*hs+.012,y-.015,0,.042,.036,.032);
 [-1,1].forEach(s=>part(g,coneG(4),h.S,-.01,y+.01,s*.1*hs,.024,.12,.04,s*1.4,0,.3));
 return 1.22},
brain:g=>{const pk=pm(0xD98A9A,{roughness:.35,tex:"flesh",bs:.015}),geo=new T3.SphereGeometry(1,SMALL?14:22,SMALL?10:16),P=geo.attributes.position;
 for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),f=1+.07*Math.abs(Math.sin(x*9+fbm(x*2,z*2,5,2)*6)*Math.sin(y*7+z*5));P.setXYZ(i,x*f,y*f,z*f)}geo.computeVertexNormals();
 [-1,1].forEach(s=>part(g,geo,pk,0,.56,s*.11,.34,.24,.2));part(g,boxG(),pm(0x8A3A4A),0,.72,0,.62,.08,.02);
 const lg=pm(0xB86070,{roughness:.45});[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,c])=>{tube([V(a*.14,.45,c*.14),V(a*.36,.62,c*.36),V(a*.5,.3,c*.5),V(a*.52,.03,c*.52)],.045,.02,lg,g);part(g,coneG(6),pm(0x3A2020),a*.53,.03,c*.53,.025,.08,.025,PI,0,0)});
 return .95},
imp:g=>{const r=pm(0xB0302A,{roughness:.5}),d=pm(0x5A1414,{roughness:.6,side:T3.DoubleSide});
 [-1,1].forEach(s=>seg(g,V(0,.3,s*.05),V(.02,.02,s*.06),.03,.022,r));part(g,lat([[0,0],[.1,0],[.13,.12],[.11,.25],[.06,.3],[0,.3]]),r,0,.28,0,1);
 part(g,sphG(),r,.02,.66,0,.1,.1,.09);[-1,1].forEach(s=>{part(g,coneG(6),pm(0x2A1A14),-.01,.76,s*.05,.02,.1,.02,s*.3,0,.35);part(g,sphG(),pm(0xFFD040,{em:0xFFA000,ei:1.6}),.09,.68,s*.04,.018)});
 [-1,1].forEach(s=>{seg(g,V(0,.5,s*.1),V(.12,.36,s*.12),.024,.02,r)});
 [-1,1].forEach(s=>{const w=new T3.Group();w.position.set(-.08,.5,s*.06);w.rotation.y=s*PI/2+s*.3;g.add(w);ext([[0,0],[.42,.3],[.36,.06],[.28,.14],[.2,-.03],[.1,.05]],.008,d,w)});
 tube([V(-.08,.3,0),V(-.3,.18,0),V(-.4,.32,0),V(-.46,.38,0)],.02,.008,r,g);part(g,coneG(4),d,-.47,.4,0,.035,.07,.01,0,0,.6);return .95},
mindflayer:g=>{const sk=0x8E6E9E,h=HUM(g,{H:2.1,bulk:.92,skin:sk,top:0x241A30,bottom:0x241A30,sleeve:0x241A30,robe:true,headS:1.35,eye:0xF4F0F8,eyeE:0x303030}),y=h.head.y,S=h.S,hs=h.hs;
 part(g,sphG(),S,-.06,y+.07,0,.13*hs,.13*hs,.1*hs);
 part(g,lat([[.1,0],[.16,.1],[.26,.3],[.28,.36]]),pm(0x241A30,{side:T3.DoubleSide,roughness:.7}),-.05,h.Y(1.42),0,1).scale.set(.7,1,1);
 [[.04],[-.04],[.1],[-.1]].forEach(([z])=>tube([V(.12,y-.05,z),V(.2,y-.2,z*1.3),V(.16,y-.38,z*1.6),V(.23,y-.5,z*1.2)],.026,.008,S,g));
 part(g,cylG(),pm(0x5A3A6A,{metalness:.4,roughness:.5}),0,h.Y(1.0),0,.14,.05,.17);return 2.4},
cambion:g=>{const h=HUM(g,{H:2.5,bulk:1.3,skin:0x9A2A20,top:0x1C1A1A,topM:{metalness:.65,roughness:.32},bottom:0x1C1A1A,boots:0x121010,sleeve:0x9A2A20,eye:0xFFB030,eyeE:0xFF7000}),y=h.head.y,b=h.b,AU=MET(0xB08A3A),BK=MET(0x1C1A1A);
 part(g,new T3.TorusGeometry(1,.1,6,SEG),AU,0,h.Y(.97),0,.15*b,.15*b,.2*b,PI/2,0,0);
 [-1,1].forEach(s=>{part(g,hemiG(),BK,0,h.Y(1.39),s*.21*b,.13*b,.11,.14*b,0,0,s*-.35);part(g,new T3.TorusGeometry(1,.06,4,SEG),AU,0,h.Y(1.39),s*.21*b,.13*b,.13*b,.14*b,PI/2,0,0)});
 [-1,1].forEach(s=>tube([V(.02,y+.1,s*.07),V(-.03,y+.26,s*.14),V(-.15,y+.32,s*.2),V(-.24,y+.22,s*.2)],.045,.012,pm(0x1A1210,{roughness:.5}),g));
 [-1,1].forEach(s=>{const w=new T3.Group();w.position.set(-.18,h.Y(1.3),s*.12);w.rotation.y=s*PI/2+s*.35;w.rotation.x=s*-.15;g.add(w);ext([[0,0],[.95,.75],[.85,.15],[.66,.34],[.52,-.08],[.3,.14]],.012,pm(0x3A1212,{roughness:.6,side:T3.DoubleSide}),w)});
 const bm=pm(0xE8702A,{em:0xFF5A10,ei:1.6,roughness:.4});blade(g,h.hand,V(.3,1,.05),1.3,.08,bm);
 const hl=halo(0xFF6A20,1.8);hl.position.copy(h.hand).add(V(.25,.8,.05));g.add(hl);return 2.85},
boar:g=>{const bd=pm(0x4A2418,{roughness:.8,tex:"leather",bs:.02}),dk=pm(0x201008);
 [[.3,.18],[.3,-.18],[-.3,.18],[-.3,-.18]].forEach(([x,z])=>seg(g,V(x,.45,z),V(x+.02,.03,z*1.05),.07,.045,dk));
 part(g,sphG(),bd,0,.62,0,.55,.33,.3);part(g,sphG(),bd,.5,.62,0,.2,.2,.2);part(g,cylG(),dk,.72,.56,0,.08,.14,.08,0,0,PI/2);
 [-1,1].forEach(s=>{part(g,coneG(6),pm(0xEEE6CC,{roughness:.4}),.74,.62,s*.08,.018,.12,.018,0,0,-.5);part(g,sphG(),pm(0xFF4010,{em:0xFF3000,ei:1.8}),.64,.7,s*.1,.025);part(g,coneG(4),dk,.45,.8,s*.1,.04,.1,.02,s*.4,0,.2)});
 const fm=pm(0xFF7A20,{em:0xFF4A00,ei:1.8});[-.25,-.08,.1,.26].forEach((x,i)=>part(g,coneG(5),fm,x,.95+i%2*.03,0,.05,.18,.05));return 1.15}};
FIG.bulk=FIG.orc;

/* ---------- tokens ---------- */
const T={me:0x1D9E75,ally:0x378ADD,foe:0xE24B4A,npc:0x888780,odd:0x7F77DD};
const RR={pawn:.42,orc:.55,gith:.46,halfelf:.42,human:.42,paleelf:.42,wizard:.44,tiefling:.42,goblin:.34,gnome:.3,brain:.55,imp:.32,mindflayer:.48,cambion:.62,boar:.62},SZ={imp:1.3,brain:1.2};
const TK=(M.tokens||[]).filter(Boolean),sd=t=>t.t=="foe"?1:t.t=="npc"?0:-1,BASE=pm(0x2E2B28,{roughness:.6,metalness:.2});
POST.forEach(f=>{try{f()}catch(e){console&&console.warn&&console.warn("post",e)}});
TK.forEach(t=>{try{const col_=T[t.t]||T.npc,m=FIG[t.m]?t.m:"pawn",sz=(t.s||SZ[m]||1)*(M.ts||1),z=t.z!=null?t.z:heightAt(t.x,t.y),g=new T3.Group(),body=new T3.Group(),hold=new T3.Group();
 const h=FIG[m](body,col_,t)||1.8;body.scale.setScalar(sz);hold.add(body);g.add(hold);
 if(t.lie){body.rotation.z=PI/2;body.position.set(h*sz/2,.22*sz,0)}else{const R=(RR[m]||.42)*sz;
  const bs=new T3.Mesh(new T3.CylinderGeometry(R,R*1.06,.05*sz,SEG*2),BASE);bs.position.y=.025*sz;bs.receiveShadow=bs.castShadow=true;g.add(bs);body.position.y=.05*sz;
  const ring=new T3.Mesh(new T3.TorusGeometry(R*1.02,.022*Math.max(1,sz),6,SEG*2),pm(col_,{em:col_,ei:.6,roughness:.4}));ring.rotation.x=PI/2;ring.position.y=.05*sz;g.add(ring)}
 let a=0;if(t.f!=null)a=-t.f*PI/180;else if(sd(t)){let bb=1e9;TK.forEach(u=>{if(sd(u)==-sd(t)){const dx=u.x-t.x,dy=u.y-t.y,dd=dx*dx+dy*dy;if(dd<bb){bb=dd;a=Math.atan2(-dy,dx)}}})}hold.rotation.y=a;
 g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});g.position.set(t.x,z,t.y);sc.add(g);if(t.n)labels.push([t.x,z+(t.lie?.7:h*sz+.25),t.y,t.n,col_])}catch(e){console&&console.warn&&console.warn("token",t,e)}});

/* ---------- lights & camera ---------- */
sc.add(new T3.HemisphereLight(col(MD.sky),col(MD.gnd),MD.hi));
const dl=new T3.DirectionalLight(col(MD.sun),MD.si);dl.castShadow=true;const SMS=SMALL?1024:2048;dl.shadow.mapSize.set(SMS,SMS);dl.shadow.bias=-.0004;dl.shadow.normalBias=.03;
const bb=new T3.Box3(),BXS=[];sc.updateMatrixWorld(true);sc.children.forEach(c=>{if(c.isInstancedMesh||c.isLight)return;const b=new T3.Box3().expandByObject(c);if(!b.isEmpty()){BXS.push(b);bb.union(b)}});if(bb.isEmpty()){bb.set(V(-5,0,-5),V(5,2,5));BXS.push(bb.clone())}
const ctr=bb.getCenter(V(0,0,0)),rad=Math.max(2,bb.getBoundingSphere(new T3.Sphere()).radius);
dl.position.copy(ctr).add(V(-.3,1,.8).normalize().multiplyScalar(rad*2.2));dl.target.position.copy(ctr);
Object.assign(dl.shadow.camera,{left:-rad,right:rad,top:rad,bottom:-rad,near:.1,far:rad*5});dl.shadow.camera.updateProjectionMatrix();sc.add(dl,dl.target);
W.prepend(rw.domElement);rw.domElement.style.display="block";
const VA=(M.view==null?45:M.view)*PI/180,cam=new T3.OrthographicCamera(-1,1,1,-1,.1,rad*12);cam.position.copy(ctr).add(V(Math.SQRT2*Math.cos(VA),.95,Math.SQRT2*Math.sin(VA)).normalize().multiplyScalar(rad*3));
const ctl=T3.OrbitControls?new T3.OrbitControls(cam,rw.domElement):null;if(ctl){ctl.target.copy(ctr);ctl.enablePan=false;ctl.maxPolarAngle=1.35;ctl.minZoom=.6;ctl.maxZoom=5;ctl.enableDamping=false}
cam.lookAt(ctr);cam.updateMatrixWorld();const cs=[];BXS.forEach(b=>{for(const X of[b.min.x,b.max.x])for(const Y of[b.min.y,b.max.y])for(const Z of[b.min.z,b.max.z])cs.push(V(X,Y,Z).applyMatrix4(cam.matrixWorldInverse))});
/* re-center on the projected scene so tall objects at the back don't waste space */
const mnx=Math.min(...cs.map(v=>v.x)),mxx=Math.max(...cs.map(v=>v.x)),mny=Math.min(...cs.map(v=>v.y)),mxy=Math.max(...cs.map(v=>v.y));
const shv=V(1,0,0).applyQuaternion(cam.quaternion).multiplyScalar((mnx+mxx)/2).add(V(0,1,0).applyQuaternion(cam.quaternion).multiplyScalar((mny+mxy)/2+.3));
ctr.add(shv);cam.position.add(shv);cam.updateMatrixWorld();if(ctl)ctl.target.copy(ctr);
const ex=(mxx-mnx)/2,ey=(mxy-mny)/2+.6;
const fit=()=>{const w=W.clientWidth||680,h=W.clientHeight||440,a=w/h;let hx=ex*1.04,hy=ey*1.06;if(hx/hy>a)hy=hx/a;else hx=hy*a;cam.left=-hx;cam.right=hx;cam.top=hy;cam.bottom=-hy;cam.updateProjectionMatrix();rw.setSize(w,h)};
let dirty=true;
const drawLabels=()=>{const w=W.clientWidth||680,h=W.clientHeight||440,occ=[];let s="";[...labels].sort((p,q)=>(q[4]!==undefined)-(p[4]!==undefined)).forEach(([x,y,z,t,c])=>{const p=V(x,y,z).project(cam),px=(p.x+1)/2*w,py=(1-p.y)/2*h,lw=[...t].reduce((a,ch)=>a+(ch.charCodeAt(0)>0x3000?12.5:7),0)+12;const hit=(X,Y)=>occ.some(q=>!(X+lw<q[0]||X>q[2]||Y+19<q[1]||Y>q[3]));let X=px-lw/2,Y=py-24;
 search:for(let i=0;i<6;i++)for(const dx of[0,lw/2+4,-(lw/2+4)]){if(!hit(px-lw/2+dx,py-24-i*21)){X=px-lw/2+dx;Y=py-24-i*21;break search}if(i==5&&dx==0){X=px-lw/2;Y=py-24-i*21}}occ.push([X,Y,X+lw,Y+19]);
 s+=`<div style="position:absolute;left:${X}px;top:${Y}px;background:rgba(255,255,255,.92);color:#2C2C2A;font-size:12px;line-height:19px;padding:0 6px;border-radius:4px;white-space:nowrap;box-shadow:0 1px 2px rgba(0,0,0,.15);${c!==undefined?"border-left:3px solid #"+c.toString(16).padStart(6,"0"):""}">${t}</div>`});if(LB)LB.innerHTML=s};
const render=()=>{rw.render(sc,cam);if(dirty){drawLabels();dirty=false}};
if(ctl)ctl.addEventListener("change",()=>{dirty=true;if(!anim.length)render()});
addEventListener("resize",()=>{fit();dirty=true;render()});fit();render();
if(anim.length){let vis=true,raf=0;const loop=t=>{if(!vis||document.hidden){raf=0;return}anim.forEach(f=>f(t));render();raf=requestAnimationFrame(loop)};
 const go=()=>{if(!raf)raf=requestAnimationFrame(loop)};
 try{new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis)go()}).observe(W)}catch(e){}
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)go()});go()}
};
