// D3 map renderer: province-level fills, owner borders, atlas-style labels,
// event markers, zoom and camera presets.
(function (AH) {
  const VIEWS = {
    americas: [[-168, -56], [-32, 71]],
    mexico: [[-126, 6], [-78, 43]],
    caribbean: [[-98, 7], [-58, 30]],
    europe: [[-11, 34], [44, 64]],
    world: null,
  };

  AH.createMap = function (svgEl, topo, cb = {}) {
    const svg = d3.select(svgEl);
    const geoms = topo.objects.units.geometries;
    geoms.forEach((g) => { g.key = AH.groupOf(g.properties); });
    const units = topojson.feature(topo, topo.objects.units).features;
    units.forEach((f, i) => { f.key = geoms[i].key; f.geo = d3.geoCentroid(f); });
    const lakes = topojson.feature(topo, topo.objects.lakes);
    const rivers = topojson.feature(topo, topo.objects.rivers);
    const coastMesh = topojson.mesh(topo, topo.objects.units, (a, b) => a === b);

    const projection = d3.geoNaturalEarth1();
    const path = d3.geoPath(projection);
    const defs = svg.append('defs');
    const root = svg.append('g');
    const gSphere = root.append('path').attr('class', 'sphere');
    const gGrat = root.append('path').attr('class', 'graticule');
    const gUnits = root.append('g');
    const gLakes = root.append('path').attr('class', 'lakes');
    const gRivers = root.append('path').attr('class', 'rivers');
    const gCoast = root.append('path').attr('class', 'coast');
    const gBorders = root.append('path').attr('class', 'owner-borders');
    const gLabels = svg.append('g');
    const gMarkers = svg.append('g');

    let W = 800, H = 500, transform = d3.zoomIdentity;
    let owners = {}, names = {}, fillFor = null, markers = [], labelData = [];

    const unitSel = gUnits.selectAll('path').data(units).join('path').attr('class', 'unit')
      .on('pointerenter pointermove', (e, d) => cb.hover && cb.hover(d, e))
      .on('pointerleave', () => cb.hover && cb.hover(null))
      .on('click', (e, d) => cb.click && cb.click(d, e));

    // ---- colors
    const dark = () => {
      const t = document.documentElement.getAttribute('data-theme');
      if (t) return t === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    const hashStr = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
    function colorOf(owner) {
      const id = AH.ownerId(owner);
      const p = AH.POWERS[id] || AH.POWERS.LOCAL;
      const c = d3.hsl(p.color);
      if (id === 'LOCAL') c.l += ((Math.abs(hashStr(owner)) % 7) - 3) * 0.018;
      if (dark()) { c.l = c.l * 0.55 + 0.02; c.s *= 0.8; }
      return c.formatHex();
    }
    AH.colorOf = colorOf;
    function buildPatterns() {
      defs.selectAll('*').remove();
      for (const id of Object.keys(AH.POWERS).filter((k) => AH.POWERS[k].hatch)) {
        const pat = defs.append('pattern').attr('id', 'hatch-' + id).attr('patternUnits', 'userSpaceOnUse')
          .attr('width', 6).attr('height', 6).attr('patternTransform', 'rotate(45)');
        pat.append('rect').attr('width', 6).attr('height', 6).attr('fill', colorOf(id));
        pat.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 6)
          .attr('stroke', dark() ? '#0d1116' : '#8a7a5c').attr('stroke-opacity', dark() ? 0.5 : 0.35).attr('stroke-width', 1.6);
      }
    }
    const fillOf = (owner) => { const id = AH.ownerId(owner); return AH.POWERS[id] && AH.POWERS[id].hatch ? `url(#hatch-${id})` : colorOf(owner); };

    // ---- layout
    function resize() {
      const r = svgEl.getBoundingClientRect();
      W = Math.max(200, r.width); H = Math.max(200, r.height);
      svg.attr('viewBox', `0 0 ${W} ${H}`);
      projection.fitExtent([[6, 6], [W - 6, H - 6]], { type: 'Sphere' });
      gSphere.attr('d', path({ type: 'Sphere' }));
      gGrat.attr('d', path(d3.geoGraticule10()));
      unitSel.attr('d', path);
      units.forEach((f) => { f.area = path.area(f); f.c = projection(f.geo); });
      gLakes.attr('d', path(lakes));
      gRivers.attr('d', path(rivers));
      gCoast.attr('d', path(coastMesh));
      zoom.translateExtent([[-W * 0.1, -H * 0.1], [W * 1.1, H * 1.1]]);
      drawBorders();
      layoutLabels();
      placeOverlays();
    }

    // ---- zoom
    const zoom = d3.zoom().scaleExtent([1, 24]).on('zoom', (e) => {
      transform = e.transform;
      root.attr('transform', transform);
      placeOverlays();
    }).on('end', () => { layoutLabels(); placeOverlays(); if (cb.zoomEnd) cb.zoomEnd(); });
    svg.call(zoom).on('dblclick.zoom', null);

    function boundsTransform(b) {
      if (!b) return d3.zoomIdentity;
      const pts = [];
      for (let lon = b[0][0]; lon <= b[1][0]; lon += (b[1][0] - b[0][0]) / 8) for (let lat = b[0][1]; lat <= b[1][1]; lat += (b[1][1] - b[0][1]) / 8) pts.push(projection([lon, lat]));
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const k = Math.min(24, 0.94 / Math.max((x1 - x0) / W, (y1 - y0) / H));
      return d3.zoomIdentity.translate(W / 2, H / 2).scale(k).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    }
    function view(name, dur = 900) {
      const t = boundsTransform(VIEWS[name]);
      (dur ? svg.transition().duration(dur).ease(d3.easeCubicInOut) : svg).call(zoom.transform, t);
    }
    function flyTo(lonlat, minK = 3) {
      const p = projection(lonlat);
      const k = Math.max(transform.k, minK);
      const t = d3.zoomIdentity.translate(W / 2, H / 2).scale(k).translate(-p[0], -p[1]);
      svg.transition().duration(1100).ease(d3.easeCubicInOut).call(zoom.transform, t);
    }
    function ensureVisible(lonlat) {
      const [x, y] = transform.apply(projection(lonlat));
      if (x < 40 || y < 40 || x > W - 40 || y > H - 40) flyTo(lonlat, transform.k);
    }

    // ---- ownership
    const ownerOf = (key) => owners[key] || AH.defaultOwner(key);
    function drawBorders() {
      gBorders.attr('d', path(topojson.mesh(topo, topo.objects.units, (a, b) => a !== b && ownerOf(a.key) !== ownerOf(b.key))));
    }
    function update(nextOwners, nextNames, opts = {}) {
      const prev = owners;
      owners = nextOwners; names = nextNames || {};
      const fills = (d) => (fillFor ? fillFor(d.key) : fillOf(ownerOf(d.key)));
      if (opts.animate) {
        unitSel.filter((d) => (prev[d.key] || '') !== (owners[d.key] || '') || opts.force)
          .transition().duration(700).attr('fill', fills);
      } else unitSel.attr('fill', fills);
      drawBorders();
      layoutLabels();
    }
    function setFillMode(fn) { fillFor = fn; unitSel.interrupt().attr('fill', (d) => (fillFor ? fillFor(d.key) : fillOf(ownerOf(d.key)))); }
    function refreshTheme() { buildPatterns(); setFillMode(fillFor); layoutLabels(); }

    // ---- atlas labels: one per contiguous-ish block of each owner
    const shortName = (owner) => {
      const id = AH.ownerId(owner);
      let n = id === 'MEX' ? names.MEX || AH.ownerName(owner) : AH.ownerName(owner);
      if (id === 'LOCAL' || id === 'NATIVE' || id === 'JOINT' || id === 'FRC') n = n.replace(/\s*\(.*\)$/, '');
      return n;
    };
    function layoutLabels() {
      const byOwner = new Map();
      for (const f of units) {
        if (!f.area) continue;
        const o = ownerOf(f.key);
        const id = AH.ownerId(o);
        if (id === 'NATIVE' || id === 'JOINT') continue;
        if (!byOwner.has(o)) byOwner.set(o, []);
        byOwner.get(o).push(f);
      }
      const cands = [];
      for (const [o, fs] of byOwner) {
        const big = fs.reduce((a, b) => (b.area > a.area ? b : a));
        const block = fs.filter((f) => d3.geoDistance(f.geo, big.geo) < 0.32);
        let A = 0, x = 0, y = 0;
        for (const f of block) { A += f.area; x += f.c[0] * f.area; y += f.c[1] * f.area; }
        if (!A) continue;
        const text = shortName(o).toUpperCase();
        const side = Math.sqrt(A) * transform.k;
        const fs0 = Math.min(26, (side * 1.25) / Math.max(5, text.length * 0.66));
        if (fs0 < 8.5) continue;
        cands.push({ o, text, x: x / A, y: y / A, fs: fs0, major: AH.ownerId(o) === 'MEX' });
      }
      cands.sort((a, b) => (b.major - a.major) || (b.fs - a.fs));
      const placed = cb.reserved ? cb.reserved() : [];
      labelData = [];
      for (const c of cands) {
        const [sx, sy] = transform.apply([c.x, c.y]);
        const w = c.text.length * c.fs * 0.72, h = c.fs * 1.2;
        const box = [sx - w / 2, sy - h / 2, sx + w / 2, sy + h / 2];
        if (box[2] < 0 || box[0] > W || box[3] < 0 || box[1] > H) continue;
        if (placed.some((b) => !(box[2] < b[0] || box[0] > b[2] || box[3] < b[1] || box[1] > b[3]))) continue;
        placed.push(box);
        labelData.push(c);
        if (labelData.length > 40) break;
      }
      gLabels.selectAll('text').data(labelData, (d) => d.o).join('text').attr('class', 'plabel')
        .attr('font-size', (d) => d.fs.toFixed(1)).text((d) => d.text);
      placeOverlays();
    }

    // ---- markers
    function setMarkers(list) { markers = list; drawMarkers(); }
    function drawMarkers() {
      const sel = gMarkers.selectAll('g.marker').data(markers, (d) => d.id).join((enter) => {
        const g = enter.append('g').attr('class', 'marker');
        g.append('circle').attr('class', 'ring').attr('r', 7);
        g.append('circle').attr('class', 'dot').attr('r', 5);
        g.append('text').attr('x', 9).attr('y', 4);
        return g;
      });
      sel.classed('old', (d) => d.old);
      sel.select('.ring').attr('stroke', (d) => d.color).style('display', (d) => (d.old ? 'none' : null));
      sel.select('.dot').attr('fill', (d) => d.color).attr('r', (d) => (d.old ? 3.5 : 5));
      sel.select('text').text((d) => d.label);
      placeOverlays();
    }
    function placeOverlays() {
      gLabels.selectAll('text').attr('x', (d) => transform.applyX(d.x)).attr('y', (d) => transform.applyY(d.y) + d.fs * 0.35);
      gMarkers.selectAll('g.marker').attr('transform', (d) => {
        const p = projection([d.lon, d.lat]);
        return p ? `translate(${transform.applyX(p[0])},${transform.applyY(p[1])})` : 'translate(-99,-99)';
      });
    }

    buildPatterns();
    new ResizeObserver(() => resize()).observe(svgEl);
    resize();
    function visibleUnits() {
      return units.filter((f) => { if (!f.c) return false; const [x, y] = transform.apply(f.c); return x > 0 && y > 0 && x < W && y < H; });
    }
    return { update, setFillMode, visibleUnits, setMarkers, view, flyTo, ensureVisible, refreshTheme, colorOf, fillOf, units, get transform() { return transform; } };
  };
})(globalThis.AH = globalThis.AH || {});
