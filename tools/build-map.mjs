// Builds data/world.topo.json from Natural Earth (public domain).
// Countries whose internal history matters keep their admin-1 states/provinces;
// every other country is dissolved into a single unit to keep the file small.
import fs from 'node:fs';
import path from 'node:path';
import * as topojson from 'topojson-server';
import * as simp from 'topojson-simplify';
import * as client from 'topojson-client';

const RAW = 'tools/raw';
const BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const FILES = ['ne_10m_admin_1_states_provinces', 'ne_50m_rivers_lake_centerlines', 'ne_50m_lakes'];

// Countries kept at state/province resolution.
const DETAIL = new Set([
  'USA', 'MEX', 'CAN', 'DEU', 'POL', 'ITA', 'FRA', 'RUS', 'UKR', 'ROU', 'HRV', 'SRB', 'GRC',
  'BGR', 'IND', 'PAK', 'VNM', 'ARG', 'CHL', 'ZAF', 'CHN', 'DNK', 'BRA', 'ESP', 'NIC', 'HND',
]);

async function load(name) {
  const file = path.join(RAW, name + '.geojson');
  if (!fs.existsSync(file)) {
    console.log('downloading', name);
    const res = await fetch(BASE + name + '.geojson');
    if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const r1 = (v) => Math.round(v * 10) / 10;

const [admin1, rivers, lakes] = await Promise.all(FILES.map(load));

const seen = new Set();
const feats = admin1.features.map((f, i) => {
  const p = f.properties;
  let id = p.iso_3166_2 && !p.iso_3166_2.endsWith('~') ? p.iso_3166_2 : p.adm1_code;
  if (seen.has(id)) id = p.adm1_code + '_' + i;
  seen.add(id);
  return { type: 'Feature', geometry: f.geometry, properties: {
    id, n: p.name || p.name_en || id, a: p.admin, c: p.adm0_a3, r: p.region || '',
    x: r1(p.longitude), y: r1(p.latitude),
  } };
});

const riverFeats = rivers.features
  .filter((f) => f.properties.scalerank <= 4 && f.properties.featurecla !== 'Lake Centerline')
  .map((f) => ({ type: 'Feature', geometry: f.geometry, properties: { n: f.properties.name || '' } }));
const lakeFeats = lakes.features
  .filter((f) => f.properties.scalerank <= 0)
  .map((f) => ({ type: 'Feature', geometry: f.geometry, properties: {} }));

// Pass 1: topology of all admin-1 units, used to dissolve non-detail countries.
const t1 = topojson.topology({ a1: { type: 'FeatureCollection', features: feats } }, 1e6);
const byCountry = new Map();
const units = [];
for (const g of t1.objects.a1.geometries) {
  if (!g.type) continue;
  if (DETAIL.has(g.properties.c)) { const f = client.feature(t1, g); delete f.properties.a; units.push(f); continue; }
  if (!byCountry.has(g.properties.c)) byCountry.set(g.properties.c, []);
  byCountry.get(g.properties.c).push(g);
}
for (const [c, gs] of byCountry) {
  // label point: the largest member unit's label
  const big = gs.map((g) => [g, Math.abs(areaOf(client.feature(t1, g)))]).sort((a, b) => b[1] - a[1])[0][0];
  units.push({ type: 'Feature', geometry: client.merge(t1, gs),
    properties: { id: c, n: gs[0].properties.a || c, c, r: '', x: big.properties.x, y: big.properties.y, m: 1 } });
}

function areaOf(f) {
  let a = 0;
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) {
    const ring = poly[0];
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  }
  return a / 2;
}

// Pass 2: final topology, simplified.
let topo = topojson.topology({
  units: { type: 'FeatureCollection', features: units },
  rivers: { type: 'FeatureCollection', features: riverFeats },
  lakes: { type: 'FeatureCollection', features: lakeFeats },
}, 1e5);
// Antarctica is irrelevant to the period and dominates the projection
topo.objects.units.geometries = topo.objects.units.geometries.filter((g) => g.properties.c !== 'ATA');
topo = simp.presimplify(topo);
topo = simp.simplify(topo, simp.quantile(topo, Number(process.env.KEEP || 0.12)));
topo = simp.filter(topo, simp.filterWeight(topo, 0.01, simp.planarRingArea));
topo.arcs = topo.arcs.map((arc) => arc.map((p) => [p[0], p[1]]));
topo = client.quantize(topo, 3e4);
fs.writeFileSync('data/world.topo.json', JSON.stringify(topo));
const size = fs.statSync('data/world.topo.json').size;
console.log('units:', topo.objects.units.geometries.length, 'rivers:', riverFeats.length, 'lakes:', lakeFeats.length, 'size:', (size / 1e6).toFixed(2), 'MB');
