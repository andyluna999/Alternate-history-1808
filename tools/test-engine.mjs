// Headless checks for the simulation: loads the browser scripts into Node,
// validates data references, and runs sampled and Monte Carlo histories.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const FILES = ['powers', 'regions', 'places', 'model', 'engine', 'events-americas', 'events-world'];
for (const f of FILES) vm.runInThisContext(fs.readFileSync(`js/${f}.js`, 'utf8'), { filename: f });
const AH = globalThis.AH;

// Every key an event writes must exist on the map.
const topo = JSON.parse(fs.readFileSync('data/world.topo.json', 'utf8'));
const mapKeys = new Set(topo.objects.units.geometries.map((g) => AH.groupOf(g.properties)));
const emptyGroups = AH.GROUPS.filter((g) => !mapKeys.has(g.key)).map((g) => g.key);
assert.deepEqual(emptyGroups, [], 'groups with no map units: ' + emptyGroups);

const written = new Set(Object.keys(AH.INITIAL_OWNERS));
const origCreate = AH.createState;
AH.createState = (...a) => { const s = origCreate(...a); const own = s.own; s.own = (k, o) => { [].concat(k).forEach((x) => written.add(x)); own(k, o); }; return s; };

let ids = new Set();
for (const e of AH.EVENTS) { assert.ok(!ids.has(e.id), 'duplicate id ' + e.id); ids.add(e.id); }

const likely = AH.simulate({ likely: true });
const mc = AH.monteCarlo({ n: 300 });
AH.createState = origCreate;

const unknown = [...written].filter((k) => !mapKeys.has(k));
console.log('keys not on map (ignored by the renderer):', unknown.join(' ') || 'none');

// Places referenced by fired events exist.
const sample = Array.from({ length: 20 }, (_, i) => AH.simulate({ seed: i + 1 }));
for (const r of [likely, ...sample]) for (const e of r.log) assert.ok(AH.PLACES[e.place], `unknown place ${e.place} in ${e.id}`);
// Owners resolve to known powers.
for (const r of [likely, ...sample]) for (const y of r.years) for (const o of Object.values(y.owners)) assert.ok(AH.POWERS[AH.ownerId(o)], 'unknown power ' + o);

// Determinism.
assert.deepEqual(AH.simulate({ seed: 42 }).log.map((e) => e.id + e.outcome), AH.simulate({ seed: 42 }).log.map((e) => e.id + e.outcome));
// Windows respected.
for (const r of sample) for (const e of r.log) {
  const ev = AH.EVENTS.find((x) => x.id === e.id);
  if (ev.sched) continue;
  const [a, b] = ev.win || [ev.y, ev.y];
  assert.ok(e.y >= a && e.y <= b, `${e.id} fired in ${e.y}, outside ${a}-${b}`);
}

const pct = (x) => (100 * x).toFixed(0).padStart(3) + '%';
console.log('\nMost likely path, Americas:');
for (const e of likely.log.filter((e) => !e.bg && e.kind !== 'averted')) if (AH.PLACES[e.place][0] < -30) console.log(`  ${e.y}-${String(e.m).padStart(2, '0')} ${e.title}${e.outcomeTitle ? ' → ' + e.outcomeTitle : ''}`);
console.log('Averted:', likely.log.filter((e) => e.kind === 'averted').map((e) => e.y + ' ' + e.title).join('; '));
console.log('1900 MEX name:', likely.years.at(-1).names.MEX, '| pop MX', likely.years.at(-1).v.mx_pop.toFixed(1), 'US', likely.years.at(-1).v.us_pop.toFixed(1));

console.log(`\nMonte Carlo (${mc.n} runs): share of runs where each event fired`);
const show = ['junta', 'guatemala', 'cuba_1808', 'hidalgo', 'mx_abolition', 'ultimatum', 'expedition', 'crown', 'cam_secession', 'cuba_1826', 'texas_revolt', 'texas_annex', 'yucatan', 'crisis_1846', 'mxus_peace', 'ca_crisis', 'reforma', 'intervention', 'civil_war', 'civil_war_end', 'mx_republic', 'canal', 'cuba_1895', 'war_1898', 'gc_split'];
for (const id of show) {
  const r = mc.eventFreq[id] || { fired: 0, outcomes: {} };
  const outs = Object.entries(r.outcomes).map(([t, c]) => `${t} ${pct(c / mc.n)}`).join(' | ');
  console.log(`${pct(r.fired / mc.n)}  ${id.padEnd(15)} ${outs}`);
}
for (const k of ['US-TX', 'US-CA', 'NEWMEX', 'GTM', 'CUB', 'PRI', 'US-FL', 'US-VA', 'US-AK']) {
  console.log(`1900 ${k.padEnd(7)}`, AH.ownerOdds(mc, k, 1900).map((o) => `${o.id} ${pct(o.p)}`).join(', '));
}
console.log('\nAll checks passed.');
