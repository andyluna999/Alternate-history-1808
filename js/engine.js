// The simulation engine. It is DOM-free, so it runs in the browser and in Node.
//
// Each year: indicators drift (AH.drift), then every eligible event is rolled.
// Rolls are hashed from (seed, event id, year). Changing one outcome therefore
// changes later history only through the state it leaves behind; it does not
// reshuffle every later dice roll.
(function (AH) {
  const START = 1808, END = 2000;
  AH.START = START; AH.END = END;
  const KEY_STRIDE = 640; // more than the number of territory keys

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
    for (let k = 0; k < 120; k++) {
      const ur = P.map((row) => row.reduce((a, cell, j) => a + q[j] * cell[0], 0));
      const uc = q.map((_, j) => P.reduce((a, row, i) => a + p[i] * row[j][1], 0));
      const pn = soft(ur), qn = soft(uc);
      let d = 0;
      p = p.map((x, i) => { const n = 0.5 * x + 0.5 * pn[i]; d += Math.abs(n - x); return n; });
      q = q.map((x, j) => { const n = 0.5 * x + 0.5 * qn[j]; d += Math.abs(n - x); return n; });
      if (d < 1e-5) break;
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
    const oidMap = {};
    s.oid = (k) => { let v = oidMap[k]; if (v === undefined) v = oidMap[k] = AH.ownerId(s.owner(k)); return v; };
    s.dirty = true;
    const hc = (s.heldCount = {});
    for (const k in s.owners) { const o = s.oid(k); hc[o] = (hc[o] || 0) + 1; }
    // Distinct owner strings (states on the map), with one of their keys.
    const sc = (s.ownerStr = {});
    for (const k in s.owners) { const o = s.owners[k]; if (!sc[o]) sc[o] = { n: 0, key: k }; sc[o].n++; }
    s.dirtyComm = null; // null = recompute all communities
    s.ownerStrVersion = 1;
    s.own = (keys, owner) => {
      for (const k of [].concat(keys)) {
        if (s.owner(k) === owner) continue;
        const had = k in s.owners ? s.oid(k) : null;
        if (had) hc[had]--;
        const prevStr = s.owners[k];
        if (prevStr && sc[prevStr]) { sc[prevStr].n--; if (!sc[prevStr].n) { delete sc[prevStr]; s.ownerStrVersion++; } else if (sc[prevStr].key === k) { for (const kk in s.owners) if (kk !== k && s.owners[kk] === prevStr) { sc[prevStr].key = kk; break; } } }
        if (!sc[owner]) { sc[owner] = { n: 0, key: k }; s.ownerStrVersion++; }
        sc[owner].n++;
        if (s.dirtyComm && AH.KEY_COMMS && AH.KEY_COMMS[k]) for (const c of AH.KEY_COMMS[k]) s.dirtyComm.add(c);
        s.owners[k] = owner;
        oidMap[k] = AH.ownerId(owner);
        s.ownVersion++;
        hc[oidMap[k]] = (hc[oidMap[k]] || 0) + 1;
        s.dirty = true;
        if (s.cur) s.cur.changes.push([k, owner]);
      }
    };
    // How many territories each power holds (refreshed yearly).
    s.held = (p) => (s.heldCount && s.heldCount[p]) || 0;
    // Transfer only the keys currently held by power `from`.
    s.take = (keys, from, owner) => s.own([].concat(keys).filter((k) => s.oid(k) === from), owner);
    s.set = (flag, val = true) => { s.f[flag] = val; };
    s.add = (k, d) => { s.v[k] = /pop/.test(k) ? Math.max(0.1, s.v[k] + d) : clamp(s.v[k] + d); };
    s.mul = (k, m) => { s.v[k] *= m; };
    s.roll = (tag, p) => (s.likely ? p >= 0.5 : hash(s.seed, tag, s.y) < p);
    s.after = (dy, id) => { s.sched[id] = s.y + dy; };
    s.name = (power, n) => { s.names[power] = n; if (s.cur) (s.cur.renames = s.cur.renames || []).push([power, n]); };
    s.fig = (tag, culture, role, power) => AH.figure(s, tag, culture, role, power);
    // Weighted choice; in "most likely" mode, the heaviest option.
    s.pick = (tag, weights) => {
      const tot = weights.reduce((a, w) => a + Math.max(0, w), 0);
      if (!tot) return -1;
      if (s.likely) return weights.indexOf(Math.max(...weights));
      let r = hash(s.seed, tag, s.y) * tot;
      for (let i = 0; i < weights.length; i++) { r -= Math.max(0, weights[i]); if (r < 0) return i; }
      return weights.length - 1;
    };
    s.count = {};
    if (AH.initWorld) AH.initWorld(s);
    if (AH.initCommunities) AH.initCommunities(s);
    return s;
  }
  AH.createState = createState;

  // Per-year record: territory, variables, names, and a compact view of the great powers.
  function snapshot(s, y, lite) {
    if (lite) return { y, owners: null, v: null, names: Object.assign({}, s.names), P: null, C: null };
    const P = {};
    for (const p in s.P || {}) {
      const q = s.P[p];
      if (q.dead) continue;
      P[p] = { pop: q.pop, prod: q.prod, stab: q.stab, gov: q.gov, str: AH.strength(s, p), leader: q.leader ? q.leader.title + ' ' + q.leader.name : '' };
    }
    // Communities under foreign rule: grievance, hardship, segregation, ruler, autonomy.
    const C = {};
    for (const id in s.C || {}) { const c = s.C[id]; if (c.ruler || c.griev > 0.02) C[id] = [c.griev, c.hard, c.segr, c.ruler || '', c.auto]; }
    for (const p in P) P[p].doctrine = s.P[p].doctrine || '';
    // Owners are not copied here; AH.materialize rebuilds them from the log's changes.
    return { y, owners: null, v: Object.assign({}, s.v), names: Object.assign({}, s.names), P, C };
  }

  const text = (t, s) => (typeof t === 'function' ? t(s) : t || '');

  // Run one history.
  //   seed    integer
  //   likely  true = "most likely" mode: fire if p >= 0.5, take the heaviest outcome
  //   forces  { eventId: outcomeIndex, or -1 to prevent the event }
  AH.simulate = function ({ seed = 1, likely = false, forces = {}, lite = false } = {}) {
    const s = createState(seed, likely);
    const years = [];
    const log = [];
    const evs = AH.EVENTS;
    // Index events by the years they can fire in; scheduled ones are checked separately.
    if (!AH._buckets || AH._bucketsN !== evs.length) {
      AH._buckets = {}; AH._sched = evs.filter((e) => e.sched);
      for (const e of evs) { if (e.sched) continue; const [a, b] = e.win || [e.y, e.y]; for (let y = Math.max(START, a); y <= Math.min(END, b); y++) (AH._buckets[y] = AH._buckets[y] || []).push(e); }
      AH._bucketsN = evs.length;
    }

    for (let y = START; y <= END; y++) {
      s.y = y;
      if (y > START) AH.drift(s);
      if (AH.worldDrift) AH.worldDrift(s);
      if (AH.applyDoctrines) AH.applyDoctrines(s);
      if (AH.communityDrift) AH.communityDrift(s);
      years.push(snapshot(s, y, lite));

      const due = [];
      const cands = (AH._buckets[y] || []).concat(AH._sched.filter((e) => s.sched[e.id] === y));
      for (const ev of cands) {
        if (s.fired[ev.id] && !ev.repeat) continue;
        if (ev.repeat && ev.max && (s.count[ev.id] || 0) >= ev.max) continue;
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
        if (entry.major === undefined) entry.major = !!ev.major;
        if (entry.bg === undefined) entry.bg = !!ev.bg;
        s.cur = null;
        if (entry.cancel) continue;
        s.fired[ev.id] = { y, o: idx };
        if (ev.repeat) { s.count[ev.id] = (s.count[ev.id] || 0) + 1; delete s.cum[ev.id]; entry.process = true; }
        log.push(entry);
      }
    }
    s.y = END + 1;
    years.push(snapshot(s, END + 1, lite));
    return { seed, years, log, fired: s.fired, flags: s.f, people: s.people || [], rulers: s.rulers || {} };
  };

  // Fill in each year's owner map from the initial map plus the log's changes.
  // Changes from events in year y appear in the snapshot for year y + 1.
  AH.materialize = function (run) {
    if (run.years[0].owners) return run;
    const cur = Object.assign({}, AH.INITIAL_OWNERS);
    let li = 0;
    for (const yr of run.years) {
      while (li < run.log.length && run.log[li].y < yr.y) { for (const [k, o] of run.log[li].changes) cur[k] = o; li++; }
      yr.owners = Object.assign({}, cur);
    }
    return run;
  };

  // Owners of every key at a fractional time t (e.g. 1846.5 = mid-1846).
  AH.ownersAt = function (run, t) {
    AH.materialize(run);
    const y = Math.floor(t), m = Math.floor((t - y) * 12) + 1;
    const snap = run.years[Math.max(0, Math.min(run.years.length - 1, y - START))];
    const owners = Object.assign({}, snap.owners);
    const names = Object.assign({}, snap.names);
    for (const e of run.log) {
      if (e.y !== y || e.m > m) continue;
      for (const [k, o] of e.changes) owners[k] = o;
      for (const [p, n] of e.renames || []) names[p] = n;
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
      const r = AH.simulate({ seed: mc.seed0 + mc.done * 7919, forces: mc.forces, lite: true });
      const K = KEY_STRIDE;
      const kidx = (k) => { let i = mc.keyIndex.get(k); if (i === undefined) { i = mc.keys.length; mc.keyIndex.set(k, i); mc.keys.push(k); } return i; };
      const grid = new Uint8Array(nYears * K).fill(255);
      const row = new Uint8Array(K).fill(255);
      for (const k in AH.INITIAL_OWNERS) row[kidx(k)] = mc.pIndex[AH.ownerId(AH.INITIAL_OWNERS[k])];
      let li = 0;
      r.years.forEach((yr, yi) => {
        while (li < r.log.length && r.log[li].y < yr.y) { for (const [k, o] of r.log[li].changes) row[kidx(k)] = mc.pIndex[AH.ownerId(o)]; li++; }
        grid.set(row, yi * K);
      });
      mc.grids.push(grid);
      const seen = new Set();
      mc.multi = mc.multi || {};
      const gwe = r.log.filter((e) => e.id === 'great_war_end').length;
      if (gwe >= 2) mc.multi.great_war_end = (mc.multi.great_war_end || 0) + 1;
      if (r.log.some((e) => e.id === 'revolution' && /socialist revolution/.test(e.title))) mc.socialist = (mc.socialist || 0) + 1;
      for (const e of r.log) {
        const rec = mc.eventFreq[e.id] || (mc.eventFreq[e.id] = { fired: 0, runs: 0, averted: 0, outcomes: {}, years: [] });
        if (e.kind === 'averted') { rec.averted++; continue; }
        rec.fired++; rec.years.push(e.y);
        if (!seen.has(e.id)) { seen.add(e.id); rec.runs++; }
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
      const v = ki === undefined ? 255 : g[yi * KEY_STRIDE + ki];
      const id = v === 255 ? fallback : mc.powerIds[v];
      counts[id] = (counts[id] || 0) + 1;
    }
    const n = mc.grids.length || 1;
    return Object.entries(counts).map(([id, c]) => ({ id, p: c / n })).sort((a, b) => b.p - a.p);
  };
})(globalThis.AH = globalThis.AH || {});
