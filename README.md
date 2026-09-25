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
