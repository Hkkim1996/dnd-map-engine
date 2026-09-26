# dnd-map-engine

3D scene/combat map engine (three.js r128) for a D&D roleplay.

Usage inside a widget:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script src="https://cdn.jsdelivr.net/gh/Hkkim1996/dnd-map-engine@v1/engine.js"></script>
<script>DMAP({note:"...", items:[...], tokens:[...]})</script>
```

Requires elements `#w` (with child `#lb`) and `#n` on the page.

## HD engine (`engine-hd.js`)

Same API (`DMAP(M)`), higher-fidelity rendering: procedural textures, ACES tone mapping, soft shadows,
environment lighting, animated water, miniature-style characters.

Extra data fields:
- `mood`: "day" (default) | "dusk" | "night" | "cave" | "hell"
- `view`: camera azimuth in degrees (0 = from east, 90 = from south; default 45 = south-east)
- items: `ground` {x,y,w,d,c,amp,seed,flat:[[x,y,r]]} height-mapped terrain; `blob` {x,y,w,d,h,c,seed,rough,rot} organic mass;
  `rock` {x,y,r,h}; `scatter` {kind:"grass"|"rock"|"bush"|"debris",x,y,w,d,n,seed};
  `windmill` {x,y,h,r,f,rot,L,sw,c,rc,torn,tied:{m,n,t,s,blade,at}} tower mill facing `f` (deg) with four sails at angle `rot`; `tied` straps a figure to a sail
- models: pawn, orc, gith, halfelf, human, paleelf, wizard, tiefling(skin), goblin(wpn:"axe" for a dragged greataxe), gnome(skin), brain, imp, mindflayer, cambion, boar
- tokens and items without `z` sit on `ground` height automatically.
