// The simulation engine. It is DOM-free, so it runs in the browser and in Node.
//
// Each year: indicators drift (AH.drift), then every eligible event is rolled.
// Rolls are hashed from (seed, event id, year). Changing one outcome therefore
// changes later history only through the state it leaves behind; it does not
// reshuffle every later dice roll.
(function (AH) {
  const START = 1808, END = 1900;
  AH.START = START; AH.END = END;

  function hash(seed, str, n) {
    let h = (seed ^ 0x9e3779b9) >>> 0;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 0x85ebca6b) >>> 0;
    h = Math.imul(h ^ (n * 0x27d4eb2f), 0xc2b2ae35) >>> 0;
    h ^= h >>> 16; h = Math.imul(h, 0x7feb352d) >>> 0; h ^= h >>> 15; h = Math.imul(h, 0x846ca68b) >>> 0; h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  AH.hash = hash;

  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  AH.clamp = clamp;
  AH.sigmoid = (x) => 1 / (1 + Math.exp(-x));

  // Logit quantal-response equilibrium of a 2-player game: players choose
  // better strategies more often, but not always. lambda sets their rationality.
  function qre(P, lambda) {
    const R = P.length, C = P[0].length;
    let p = Array(R).fill(1 / R), q = Array(C).fill(1 / C);
    const soft = (u) => { const m = Math.max(...u); const e = u.map((x) => Math.exp(lambda * (x - m))); const z = e.reduce((a, b) => a + b); return e.map((x) => x / z); };
    for (let k = 0; k < 300; k++) {
      const ur = P.map((row) => row.reduce((a, cell, j) => a + q[j] * cell[0], 0));
      const uc = q.map((_, j) => P.reduce((a, row, i) => a + p[i] * row[j][1], 0));
      const pn = soft(ur), qn = soft(uc);
      p = p.map((x, i) => 0.5 * x + 0.5 * pn[i]);
      q = q.map((x, j) => 0.5 * x + 0.5 * qn[j]);
    }
    // Pure-strategy Nash equilibria, found by best-response checks.
    const ne = [];
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) {
      const rowBest = P.every((row) => row[j][0] <= P[i][j][0] + 1e-9);
      const colBest = P[i].every((cell) => cell[1] <= P[i][j][1] + 1e-9);
      if (rowBest && colBest) ne.push([i, j]);
    }
    return { p, q, ne };
  }
  AH.qre = qre;

  function createState(seed = 1, likely = false) {
    const s = {
      seed, likely,
      y: START, owners: Object.assign({}, AH.INITIAL_OWNERS), v: Object.assign({}, AH.INITIAL_VARS),
      f: {}, cum: {}, names: Object.assign({}, AH.INITIAL_NAMES), sched: {}, fired: {}, cur: null,
    };
    s.owner = (k) => s.owners[k] || AH.defaultOwner(k);
    s.oid = (k) => AH.ownerId(s.owner(k));
    s.own = (keys, owner) => {
      for (const k of [].concat(keys)) {
        if (s.owner(k) === owner) continue;
        s.owners[k] = owner;
        if (s.cur) s.cur.changes.push([k, owner]);
      }
    };
    // Transfer only the keys currently held by power `from`.
    s.take = (keys, from, owner) => s.own([].concat(keys).filter((k) => s.oid(k) === from), owner);
    s.set = (flag, val = true) => { s.f[flag] = val; };
    s.add = (k, d) => { s.v[k] = /pop/.test(k) ? Math.max(0.1, s.v[k] + d) : clamp(s.v[k] + d); };
    s.mul = (k, m) => { s.v[k] *= m; };
    s.roll = (tag, p) => (s.likely ? p >= 0.5 : hash(s.seed, tag, s.y) < p);
    s.after = (dy, id) => { s.sched[id] = s.y + dy; };
    s.name = (power, n) => { s.names[power] = n; if (s.cur) s.cur.rename = [power, n]; };
    return s;
  }
  AH.createState = createState;

  const text = (t, s) => (typeof t === 'function' ? t(s) : t || '');

  // Run one history.
  //   seed    integer
  //   likely  true = "most likely" mode: fire if p >= 0.5, take the heaviest outcome
  //   forces  { eventId: outcomeIndex, or -1 to prevent the event }
  AH.simulate = function ({ seed = 1, likely = false, forces = {} } = {}) {
    const s = createState(seed, likely);
    const years = [];
    const log = [];
    const evs = AH.EVENTS;

    for (let y = START; y <= END; y++) {
      s.y = y;
      if (y > START) AH.drift(s);
      years.push({ y, owners: Object.assign({}, s.owners), v: Object.assign({}, s.v), names: Object.assign({}, s.names) });

      const due = [];
      for (const ev of evs) {
        if (s.fired[ev.id]) continue;
        const scheduled = s.sched[ev.id] === y;
        const [a, b] = ev.win || [ev.y, ev.y];
        if (!scheduled && (ev.sched || y < a || y > b)) continue;
        due.push(ev);
      }
      due.sort((e1, e2) => (e1.m || 6) - (e2.m || 6));

      for (const ev of due) {
        const [, b] = ev.win || [ev.y, ev.y];
        const forced = Object.prototype.hasOwnProperty.call(forces, ev.id) ? forces[ev.id] : undefined;
        const ok = !ev.when || ev.when(s);
        let p = 0;
        if (ok) p = ev.p === undefined ? 1 : clamp(typeof ev.p === 'function' ? ev.p(s) : ev.p);
        let fire;
        if (!ok || forced === -1) fire = false;
        else if (forced !== undefined) fire = true;
        else if (likely) {
          // Most likely: fire once the cumulative chance of having fired passes 50%.
          const cum = (s.cum[ev.id] === undefined ? 1 : s.cum[ev.id]) * (1 - p);
          s.cum[ev.id] = cum;
          fire = 1 - cum >= 0.5;
        } else fire = hash(seed, ev.id, y) < p;

        if (!fire) {
          if (ev.otl && y === b && (ok || ev.otlAlways)) {
            log.push({ id: ev.id, y, m: ev.m || 12, kind: 'averted', title: ev.averted || text(ev.title, s), text: ev.otl, place: text(ev.place, s), p, changes: [] });
          }
          continue;
        }

        // Pick an outcome.
        const entry = { id: ev.id, y, m: ev.m || 6, kind: ev.kind || 'politics', place: text(ev.place, s), p, hazard: !!ev.win && ev.win[0] !== ev.win[1], changes: [], forced: forced !== undefined };
        s.cur = entry;
        let idx = -1, weights = null;
        if (ev.outcomes) {
          if (ev.game) {
            const g = ev.game, P = g.payoffs(s), r = qre(P, g.lambda || 1.6);
            weights = ev.outcomes.map(() => 0);
            for (let i = 0; i < P.length; i++) for (let j = 0; j < P[0].length; j++) weights[g.outcome(i, j)] += r.p[i] * r.q[j];
            entry.game = { rowPlayer: g.rowPlayer, colPlayer: g.colPlayer, rows: g.rows, cols: g.cols, P, p: r.p, q: r.q, ne: r.ne, outcome: P.map((row, i) => row.map((_, j) => g.outcome(i, j))) };
          } else {
            weights = ev.outcomes.map((o) => Math.max(0, o.w === undefined ? 1 : typeof o.w === 'function' ? o.w(s) : o.w));
          }
          const tot = weights.reduce((a, c) => a + c, 0) || 1;
          weights = weights.map((w) => w / tot);
          if (forced !== undefined && forced >= 0 && forced < weights.length) idx = forced;
          else if (likely) idx = weights.indexOf(Math.max(...weights));
          else {
            let r = hash(seed, ev.id + '#o', y), acc = 0;
            idx = weights.length - 1;
            for (let i = 0; i < weights.length; i++) { acc += weights[i]; if (r < acc) { idx = i; break; } }
          }
        }
        const o = idx >= 0 ? ev.outcomes[idx] : null;
        entry.title = text(ev.title, s);
        entry.text = text(ev.text, s);
        if (ev.fx) ev.fx(s);
        if (o) {
          if (o.fx) o.fx(s);
          entry.outcome = idx;
          entry.outcomeTitle = text(o.title, s);
          entry.outcomeText = text(o.text, s);
          entry.options = ev.outcomes.map((oo, i) => ({ title: text(oo.title, s), w: weights[i] }));
          if (o.place) entry.place = text(o.place, s);
          if (o.kind) entry.kind = o.kind;
        }
        entry.major = !!ev.major;
        entry.bg = !!ev.bg;
        s.fired[ev.id] = { y, o: idx };
        s.cur = null;
        log.push(entry);
      }
    }
    years.push({ y: END + 1, owners: Object.assign({}, s.owners), v: Object.assign({}, s.v), names: Object.assign({}, s.names) });
    return { seed, years, log, fired: s.fired, flags: s.f };
  };

  // Owners of every key at a fractional time t (e.g. 1846.5 = mid-1846).
  AH.ownersAt = function (run, t) {
    const y = Math.floor(t), m = Math.floor((t - y) * 12) + 1;
    const snap = run.years[Math.max(0, Math.min(run.years.length - 1, y - START))];
    const owners = Object.assign({}, snap.owners);
    const names = Object.assign({}, snap.names);
    for (const e of run.log) {
      if (e.y !== y || e.m > m) continue;
      for (const [k, o] of e.changes) owners[k] = o;
      if (e.rename) names[e.rename[0]] = e.rename[1];
    }
    return { owners, names };
  };

  // Monte Carlo: n sampled histories with the same forced choices. Owners are
  // stored compactly (one byte per key per year) so hundreds of runs fit in memory.
  // Use mcStart/mcStep to spread the work across animation frames.
  AH.mcStart = function ({ n = 200, forces = {}, seed0 = 1000 } = {}) {
    const powerIds = Object.keys(AH.POWERS);
    return { n, forces, seed0, done: 0, powerIds, pIndex: Object.fromEntries(powerIds.map((p, i) => [p, i])),
      keyIndex: new Map(), keys: [], grids: [], eventFreq: {} };
  };
  AH.mcStep = function (mc, count = 10) {
    const nYears = END + 2 - START;
    for (let c = 0; c < count && mc.done < mc.n; c++, mc.done++) {
      const r = AH.simulate({ seed: mc.seed0 + mc.done * 7919, forces: mc.forces });
      for (const y of r.years) for (const k in y.owners) if (!mc.keyIndex.has(k)) { mc.keyIndex.set(k, mc.keys.length); mc.keys.push(k); }
      const K = 1024; // fixed stride; the world has fewer keys than this
      const grid = new Uint8Array(nYears * K).fill(255);
      r.years.forEach((y, yi) => { for (const k in y.owners) grid[yi * K + mc.keyIndex.get(k)] = mc.pIndex[AH.ownerId(y.owners[k])]; });
      mc.grids.push(grid);
      for (const e of r.log) {
        const rec = mc.eventFreq[e.id] || (mc.eventFreq[e.id] = { fired: 0, averted: 0, outcomes: {}, years: [] });
        if (e.kind === 'averted') { rec.averted++; continue; }
        rec.fired++; rec.years.push(e.y);
        if (e.outcomeTitle) rec.outcomes[e.outcomeTitle] = (rec.outcomes[e.outcomeTitle] || 0) + 1;
      }
    }
    return mc.done >= mc.n;
  };
  AH.monteCarlo = function (opts) {
    const mc = AH.mcStart(opts);
    AH.mcStep(mc, mc.n);
    return mc;
  };

  // Owner distribution for one key at year y across Monte Carlo runs.
  AH.ownerOdds = function (mc, key, y) {
    const yi = Math.max(0, Math.min(END + 1 - START, y - START));
    const ki = mc.keyIndex.get(key);
    const counts = {};
    const fallback = AH.ownerId(AH.defaultOwner(key));
    for (const g of mc.grids) {
      const v = ki === undefined ? 255 : g[yi * 1024 + ki];
      const id = v === 255 ? fallback : mc.powerIds[v];
      counts[id] = (counts[id] || 0) + 1;
    }
    const n = mc.grids.length || 1;
    return Object.entries(counts).map(([id, c]) => ({ id, p: c / n })).sort((a, b) => b.p - a.p);
  };
})(globalThis.AH = globalThis.AH || {});
