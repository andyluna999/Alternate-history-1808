// Every state is an actor. Choices are made by comparing utilities through a
// logit rule: actors usually take their best option, but not always, and the
// "most likely" mode always takes it. Three kinds of choice:
//   1. Great-power doctrines (reform, repression, rearmament, expansion,
//      development, détente), re-chosen every few years or after a shock.
//   2. Two-player crisis games (a separatist movement against its state; an
//      aggressor against a defender; soldiers against a civilian government),
//      solved as a quantal-response equilibrium like the Americas decisions.
//   3. Whether to join a general war, and on which side.
(function (AH) {
  const E = (AH.EVENTS = AH.EVENTS || []);
  const ev = (o) => E.push(o);
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const S = (x) => 1 / (1 + Math.exp(-x));
  const L = (n) => 'LOCAL:' + n;
  const list = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
  const country = (s, p) => AH.COUNTRY[p] || AH.powerName(s, p);

  // Logit choice among options with utilities u (lambda = rationality).
  AH.logitPick = function (s, tag, u, lambda = 5) {
    const m = Math.max(...u);
    const w = u.map((x) => Math.exp(lambda * (x - m)));
    return s.pick(tag, w);
  };

  // Solve a 2×2 game, sample the outcome cell, and describe it for the chronicle.
  AH.playGame = function (s, tag, g) {
    const r = AH.qre(g.P, g.lambda || 1.8);
    const cells = [];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) cells.push(r.p[i] * r.q[j]);
    const c = s.pick(tag, cells);
    const i = Math.floor(c / 2), j = c % 2;
    if (s.cur) {
      s.cur.game = { rowPlayer: g.rowPlayer, colPlayer: g.colPlayer, rows: g.rows, cols: g.cols, P: g.P, p: r.p, q: r.q, ne: r.ne };
    }
    return [i, j, cells[c]];
  };

  // ---------------------------------------------------------------- 1. doctrines
  const DOCTRINES = ['reform', 'repression', 'rearmament', 'expansion', 'development', 'détente'];
  AH.DOCTRINE_LABEL = { reform: 'Reform', repression: 'Repression', rearmament: 'Rearmament', expansion: 'Expansion', development: 'Development', 'détente': 'Détente' };

  function unrestOf(s, p) {
    let u = 0;
    for (const c of AH.COMMUNITIES) { const st = s.C[c.id]; if (st.ruler === p) u = Math.max(u, st.griev); }
    return u;
  }
  function threatTo(s, p) {
    let t = 0;
    const sp = AH.strength(s, p) + 1e-6;
    for (const q of AH.majorsAlive(s)) if (q !== p) t = Math.max(t, AH.tension(s, p, q) * Math.min(3, AH.strength(s, q) / sp));
    return t;
  }
  function doctrineUtilities(s, p) {
    const P = s.P[p];
    const demo = AH.democratic(s, p), autoc = P.gov === 'dictatorship' || P.gov === 'communist' || ((P.gov === 'monarchy' || P.gov === 'empire') && !P.constitutional);
    const unrest = unrestOf(s, p), threat = threatTo(s, p), lag = 1 - P.prod / (s.leadProd || P.prod);
    const tech = S((s.y - 1870) / 10) * (s.y < 1935 ? 1 : 0.2);
    return [
      unrest * 1.1 + (1 - P.stab) * 0.6 + (demo ? 0.35 : 0) - (autoc ? 0.25 : 0), // reform
      unrest * 1.0 + (autoc ? 0.45 : 0) - (demo ? 0.7 : 0) + (1 - P.stab) * 0.3, // repression
      threat * 1.3 + (s.f['beaten_' + p] && s.y - s.f['beaten_' + p] < 25 ? 0.4 : 0), // rearmament
      tech * (P.takeoff ? 0.9 : 0.2) + (p === 'GBR' || p === 'FRA' ? 0.2 : 0), // expansion
      lag * 1.2 + P.stab * 0.35, // development
      (1 - P.stab) * 0.4 + (P.atWar ? 0 : 0.2) + (demo ? 0.2 : 0) + ((s.f.nukes || []).includes(p) ? 0.35 : 0) - threat * 0.3, // détente
    ];
  }
  AH.chooseDoctrine = function (s, p) {
    const u = doctrineUtilities(s, p);
    const i = AH.logitPick(s, 'doct:' + p, u, 6);
    const P = s.P[p];
    const d = DOCTRINES[i];
    const changed = P.doctrine !== d;
    P.doctrine = d;
    P.doctrineUntil = s.y + 6 + Math.floor(AH.hash(s.seed, 'dtu' + p, s.y) * 8);
    return changed ? d : null;
  };

  // Yearly effects of each doctrine.
  AH.applyDoctrines = function (s) {
    for (const p of AH.majorsAlive(s)) {
      const P = s.P[p];
      switch (P.doctrine) {
        case 'reform': P.stab = clamp(P.stab + 0.006); for (const c of AH.COMMUNITIES) { const st = s.C[c.id]; if (st.ruler === p) { st.policy = clamp(st.policy - 0.012, -0.3, 0.3); st.auto = clamp(st.auto + 0.004); } } break;
        case 'repression': P.stab = clamp(P.stab + 0.004); for (const c of AH.COMMUNITIES) { const st = s.C[c.id]; if (st.ruler === p) st.policy = clamp(st.policy + 0.012, -0.3, 0.3); } break;
        case 'rearmament': P.mil = clamp(P.mil + 0.015); for (const q of AH.majorsAlive(s)) if (q !== p && AH.tension(s, p, q) > 0.3) AH.addTension(s, p, q, 0.002); break;
        case 'development': P.prod *= 1.003; break;
        case 'détente': for (const q of AH.majorsAlive(s)) if (q !== p) AH.addTension(s, p, q, -0.005); break;
        default: break;
      }
    }
  };

  ev({ id: 'doctrine', repeat: true, win: [1815, 2000], m: 1, place: 'london', kind: 'politics', bg: true, p: 1,
    title: 'Policy shifts',
    fx: (s) => {
      const out = [];
      for (const p of AH.majorsAlive(s)) {
        const P = s.P[p];
        const shock = s.f['beaten_' + p] === s.y - 1 || s.f['revolution_' + p] === s.y - 1;
        if (P.doctrine && s.y < (P.doctrineUntil || 0) && !shock) continue;
        const d = AH.chooseDoctrine(s, p);
        if (d) out.push(`${country(s, p)} under ${AH.leaderOf(s, p)} turns to ${d}`);
      }
      if (!out.length) { s.cur.cancel = true; return; }
      s.cur.title = out.length === 1 ? out[0][0].toUpperCase() + out[0].slice(1) : `Policy shifts in ${out.length} capitals`;
      s.cur.text = out.map((x) => x[0].toUpperCase() + x.slice(1) + '.').join(' ');
    } });

  // ---------------------------------------------------------------- 2a. separatism
  // State capacity to hold a territory: strength, distance from decolonization, war.
  function capacity(s, ruler, c) {
    const P = s.P[ruler];
    let cap;
    if (P) {
      const tot = AH.majorsAlive(s).reduce((t, q) => t + AH.strength(s, q), 0) || 1;
      cap = 0.35 + 0.9 * Math.sqrt(AH.strength(s, ruler) / tot);
      if (P.atWar) cap -= 0.15;
      if (s.f['beaten_' + ruler] && s.y - s.f['beaten_' + ruler] < 4) cap -= 0.2;
      if (s.f['revolution_' + ruler] && s.y - s.f['revolution_' + ruler] < 3) cap -= 0.15;
    } else cap = 0.4;
    if (c.colony) cap -= 0.55 * s.v.decol;
    return clamp(cap);
  }
  // Outside help: the ruler's worst enemy backs the movement.
  function foreignBacker(s, ruler) {
    let best = null, t = 0;
    for (const q of AH.majorsAlive(s)) if (q !== ruler && s.P[ruler]) { const x = AH.tension(s, ruler, q); if (x > t) { t = x; best = q; } }
    return [best, t];
  }
  // Cumulative "not yet" probability for most-likely mode; true once it passes 50%.
  function likelyCum(s, tag, p, reset) {
    s.cumC = s.cumC || {};
    const cum = (s.cumC[tag] === undefined ? 1 : s.cumC[tag]) * (1 - p);
    s.cumC[tag] = cum;
    if (cum <= 0.5 && reset) delete s.cumC[tag];
    return cum <= 0.5;
  }
  const sepHazard = (s, c) => {
    const st = s.C[c.id];
    if (!st.ruler || c.custom || st.cool > 0 || s.y < c.awaken) return 0;
    return 0.22 * S(11 * (st.griev - 0.5));
  };
  ev({ id: 'separatism', repeat: true, win: [1808, 2000], m: 4, place: 'warsaw', kind: 'revolt',
    // In "most likely" mode each people keeps its own cumulative hazard, and a
    // crisis happens only once that passes 50%.
    p: (s) => {
      if (!s.likely) return 1 - AH.COMMUNITIES.reduce((q, c) => q * (1 - sepHazard(s, c)), 1);
      let any = 0;
      for (const c of AH.COMMUNITIES) if (likelyCum(s, 'sep:' + c.id, sepHazard(s, c))) any = 1;
      return any;
    },
    title: 'A national movement challenges its rulers',
    fx: (s) => {
      const cs = AH.COMMUNITIES.filter((c) => sepHazard(s, c) > 0 && (!s.likely || s.cumC['sep:' + c.id] <= 0.5));
      const i = s.pick('sep:who', cs.map((c) => sepHazard(s, c)));
      if (i < 0) { s.cur.cancel = true; return; }
      const c = cs[i], st = s.C[c.id], ruler = st.ruler;
      if (s.likely) delete s.cumC['sep:' + c.id];
      const P = s.P[ruler];
      const demo = AH.democratic(s, ruler), dict = P && (P.gov === 'dictatorship' || P.gov === 'communist');
      const cap = capacity(s, ruler, c);
      const [backer, bt] = foreignBacker(s, ruler);
      const support = backer ? bt * 0.5 : 0;
      const ps = S(3.2 * (0.55 * st.mob + support + 0.45 * st.griev - cap - 0.1));
      const leader = s.fig(`sep:${c.id}:${s.y}`, c.culture, `Leader of the ${c.name} ${c.minority ? 'rights' : 'national'} movement`, '');
      const rulerName = AH.displayOwner(ruler, s.names);
      s.cur.place = AH.KEY_PLACE[c.keys[0]] || placeFor(c.keys[0]);
      s.cur.bg = c.colony && s.y > 1945;
      const [ri, ci] = AH.playGame(s, 'sep:' + c.id, {
        rowPlayer: `${c.name} movement`, colPlayer: rulerName, rows: [c.minority ? 'Mass defiance' : 'Armed revolt', 'Negotiate'], cols: ['Repress', 'Concede'],
        P: [
          [[3 * ps - 1.2 + (c.minority ? 0.3 : 0), 1.8 - 3.2 * ps - 0.2 - (demo ? 0.5 : 0)], [2.2, 0.8 + (dict ? -0.3 : 0.1)]],
          [[-0.3 - st.griev, 1.8 - (demo ? 0.8 : 0)], [0.9 + 0.7 * (1 - st.mob), 1.2 + (demo ? 0.35 : 0) - (dict ? 0.35 : 0)]],
        ],
      });
      st.cool = 8;
      const keys = c.keys.filter((k) => s.oid(k) === ruler);
      const succ = AH.successor(s, c);
      const winIndep = () => {
        if (c.minority || !succ) return false;
        s.own(keys, succ);
        s.v.nat_wave = clamp(s.v.nat_wave + 0.35);
        st.auto = 0; st.mob *= 0.6; st.policy = 0; st.cool = 30;
        if (backer) AH.addTension(s, ruler, backer, 0.08);
        return true;
      };
      const who = `${c.name} ${c.minority ? '' : 'nationalists '}led by ${leader}`.replace('  ', ' ');
      if (ri === 0 && ci === 0) {
        s.cur.kind = 'war';
        const won = s.pick('sep:war:' + c.id, [ps, 1 - ps]) === 0;
        st.shock = clamp(st.shock + 0.3);
        if (P) P.stab = clamp(P.stab - 0.08);
        if (won && winIndep()) {
          s.cur.major = !c.colony || s.y < 1945;
          s.cur.title = `${AH.displayOwner(succ, s.names)} wins independence from ${rulerName}`;
          s.cur.text = `${who} rise in arms${backer ? `, armed by ${country(s, backer)}` : ''}. After a bitter war, ${rulerName} lets them go.`;
        } else if (won && c.minority) {
          st.policy = clamp(st.policy - 0.3, -0.3, 0.3); st.auto = clamp(st.auto + 0.3);
          s.cur.title = `${c.name}: defiance forces equal rights`;
          s.cur.text = `Strikes, boycotts and marches by ${who} make segregation unworkable. ${rulerName} passes equal-rights laws.`;
        } else {
          st.policy = clamp(st.policy + 0.2, -0.3, 0.3); st.mob *= 0.8;
          s.cur.title = `${rulerName} crushes the ${c.name} ${c.minority ? 'uprising' : 'revolt'}`;
          s.cur.text = `${who} rise${backer ? ` with ${country(s, backer)}'s encouragement` : ''}, but are defeated. Martial law, executions and exile follow; resentment deepens.`;
        }
      } else if (ri === 0 && ci === 1) {
        const full = !c.minority && succ && ((c.colony && s.v.decol > 0.55) || (demo && st.griev > 0.65) || ps > 0.55);
        if (full && winIndep()) {
          s.cur.major = !c.colony || s.y < 1945;
          s.cur.title = `${AH.displayOwner(succ, s.names)} becomes independent of ${rulerName}`;
          s.cur.text = `Facing an armed rising by ${who}, ${rulerName} negotiates a transfer of power rather than fight.`;
        } else {
          st.auto = clamp(st.auto + 0.45); st.policy = clamp(st.policy - 0.2, -0.3, 0.3);
          s.cur.title = `${c.name} win autonomy from ${rulerName}`;
          s.cur.text = `After a rising by ${who}, ${rulerName} grants self-government: a local assembly, schooling in their own language and control of their own taxes.`;
        }
      } else if (ri === 1 && ci === 0) {
        st.policy = clamp(st.policy + 0.15, -0.3, 0.3);
        s.cur.title = `${rulerName} rejects ${c.name} demands`;
        s.cur.text = `A petition campaign by ${who} is met with arrests, press bans and new language laws. Segregation hardens.`;
      } else {
        const referendum = !c.minority && succ && demo && st.griev > 0.55 && AH.hash(s.seed, 'ref' + c.id, s.y) < 0.5;
        if (referendum && winIndep()) {
          s.cur.major = true;
          s.cur.title = `${AH.displayOwner(succ, s.names)} votes for independence`;
          s.cur.text = `${rulerName} agrees to a referendum requested by ${who}; the vote is for independence and the separation is peaceful.`;
        } else {
          st.auto = clamp(st.auto + 0.35); st.policy = clamp(st.policy - 0.25, -0.3, 0.3);
          s.cur.kind = 'politics';
          s.cur.title = c.minority ? `${rulerName} reforms: new rights for ${c.name}` : `An autonomy statute for the ${c.name}`;
          s.cur.text = `Negotiations between ${leader} and ${AH.leaderOf(s, ruler)} end in ${c.minority ? 'civil rights laws and an end to legal discrimination' : 'a statute of autonomy'}.`;
        }
      }
    } });
  const placeFor = (k) => ({ WARSAW: 'warsaw', POSEN: 'warsaw', GR_OLD: 'athens', SRB: 'belgrade', ROU: 'bucharest', TRANSYLVANIA: 'bucharest', BGR: 'plevna', E_RUMELIA: 'plovdiv', ALB: 'sarajevo',
    MKD: 'belgrade', HRV: 'sarajevo', BIH: 'sarajevo', CZE: 'vienna', SVK: 'vienna', HUN: 'budapest', IT_LOMB: 'milan', RHINE_L: 'frankfurt', BEL: 'brussels', IRL: 'london', NOR: 'oslo',
    FIN: 'helsinki', EST: 'stpetersburg', UKR: 'moscow', GEO: 'tbilisi', N_CAUCASUS: 'gunib', ESP_CAT: 'madrid', ESP_CENTER: 'madrid', EGY: 'cairo', SYR: 'aden', IRQ: 'aden', SAU: 'diriyah',
    KOR: 'seoul', TIBET: 'beijing', XINJIANG: 'kashgar', MNG: 'beijing', BGD: 'calcutta', KASHMIR: 'srinagar', 'CA-QC': 'quebec', 'US-GA': 'richmond' }[k] || 'london');

  // ---------------------------------------------------------------- 2a'. decolonization waves
  // Once colonial rule loses legitimacy, each metropole weighs holding its
  // restive colonies (cost grows with their grievance and with the world norm)
  // against transferring power. Several colonies can go in one year.
  ev({ id: 'decol_wave', repeat: true, win: [1900, 2000], m: 9, place: 'london', kind: 'treaty',
    when: (s) => s.v.decol > 0.2,
    p: 1,
    title: 'Colonies win independence',
    fx: (s) => {
      const byRuler = {};
      for (const c of AH.COMMUNITIES) {
        const st = s.C[c.id];
        if (!c.colony || !st.ruler || st.griev < 0.35) continue;
        const hold = 0.9 * (s.P[st.ruler] ? Math.sqrt(AH.strength(s, st.ruler) / (AH.majorsAlive(s).reduce((t, q) => t + AH.strength(s, q), 0) || 1)) : 0.2) + (AH.democratic(s, st.ruler) ? -0.15 : 0.1);
        const pGo = 0.4 * S(10 * (s.v.decol + 0.6 * st.griev - hold - 0.85));
        if (s.likely ? likelyCum(s, 'dw:' + c.id, pGo, true) : AH.hash(s.seed, 'dw:' + c.id, s.y) < pGo) (byRuler[st.ruler] = byRuler[st.ruler] || []).push(c);
      }
      const done = [];
      for (const [ruler, cs] of Object.entries(byRuler)) {
        for (const c of cs) {
          const succ = AH.successor(s, c);
          const keys = c.keys.filter((k) => s.oid(k) === ruler);
          if (!succ || !keys.length) continue;
          s.own(keys, succ);
          Object.assign(s.C[c.id], { auto: 0, policy: 0, cool: 30 });
          s.C[c.id].mob *= 0.6;
          done.push([ruler, AH.displayOwner(succ, s.names), c]);
        }
      }
      if (!done.length) { s.cur.cancel = true; return; }
      s.v.nat_wave = clamp(s.v.nat_wave + 0.1 * done.length);
      s.cur.bg = done.length < 3;
      const rulers = [...new Set(done.map((d) => d[0]))];
      s.cur.title = done.length === 1 ? `${done[0][1]} wins independence` : `${done.length} colonies win independence`;
      s.cur.text = rulers.map((r) => `${country(s, r)} transfers power in ${done.filter((d) => d[0] === r).map((d) => d[1]).join(', ')}.`).join(' ');
      const first = done[0][2];
      s.cur.place = AH.KEY_PLACE[first.keys[0]] || placeFor(first.keys[0]);
    } });

  // ---------------------------------------------------------------- 2b. minor states
  // Every sovereign state that is not a great power: Latin American republics,
  // Balkan kingdoms, newly independent countries. Each has its own stability
  // and regime, and plays a game between its soldiers and its government.
  const MINOR_IDS = ['ARG', 'CHL', 'BRA', 'COL', 'GCO', 'VEN', 'ECU', 'PERU', 'BOL', 'PAR', 'URU', 'CAF', 'CUB', 'HAI', 'DOM', 'GRE', 'SRB', 'ROM', 'BUL', 'POL', 'YUG', 'CZS', 'IND', 'PAK', 'IDN', 'CAL', 'TEX', 'YUC', 'SWE', 'DEN', 'NLD', 'BEL', 'POR', 'PERS', 'EGY'];
  function minorStates(s) {
    if (s._minor && s._minor[0] === s.ownerStrVersion) return s._minor[1];
    const seen = new Map();
    for (const [o, rec] of Object.entries(s.ownerStr)) {
      const id = AH.ownerId(o);
      if (id === 'LOCAL' ? !/Republic|Kingdom|State|Empire|Federation|Union|^[A-Z][a-z]+$/.test(o.slice(6)) : !MINOR_IDS.includes(id)) continue;
      const name = AH.displayOwner(o, s.names);
      if (!seen.has(name)) seen.set(name, { name, id, key: rec.key });
    }
    const out = [...seen.values()];
    s._minor = [s.ownerStrVersion, out];
    return out;
  }
  function minorRecord(s, m) {
    s.minor = s.minor || {};
    let r = s.minor[m.name];
    if (!r) r = s.minor[m.name] = { stab: 0.35 + 0.35 * AH.hash(s.seed, 'minor' + m.name, 0), regime: /Republic/.test(m.name) ? 'republic' : /Kingdom|Empire|Sultanate|Emirate/.test(m.name) ? 'monarchy' : 'republic', since: s.y };
    return r;
  }
  ev({ id: 'minor_politics', repeat: true, win: [1820, 2000], m: 9, place: 'buenosaires', kind: 'politics', bg: true,
    p: (s) => (s.y < 1900 ? 0.3 : 0.6),
    title: 'Regime change',
    fx: (s) => {
      const ms = minorStates(s);
      if (!ms.length) { s.cur.cancel = true; return; }
      for (const m of ms) { const r = minorRecord(s, m); const reg = AH.COMMUNITY_OF_KEY && AH.COMMUNITY_OF_KEY[m.key]; r.stab = clamp(r.stab + 0.05 * ((r.regime === 'republic' && s.y > 1960 ? 0.62 : 0.5) - r.stab) - (s.f.crash_y && s.y - s.f.crash_y < 4 ? 0.03 : 0) + (reg && s.C[reg] ? -0.02 * s.C[reg].griev : 0)); }
      const i = s.pick('minor:who', ms.map((m) => Math.pow(1 - minorRecord(s, m).stab, 3)));
      if (i < 0) { s.cur.cancel = true; return; }
      const m = ms[i], r = minorRecord(s, m);
      const cult = AH.CULTURE[m.id] || AH.KEY_CULTURE[m.key] || AH.REGION_CULTURE[AH.REGION_OF[m.key]] || 'es';
      const general = s.fig(`coup:${m.name}:${s.y}`, cult, `Soldier who seized power in ${m.name}`, m.id);
      const mil = r.regime === 'military';
      const [ri, ci] = AH.playGame(s, 'minor:' + m.name, {
        rowPlayer: `Army of ${m.name}`, colPlayer: mil ? 'Civilian opposition' : `Government of ${m.name}`,
        rows: mil ? ['Hold power', 'Return to barracks'] : ['Coup', 'Stay loyal'], cols: mil ? ['Mass protest', 'Wait'] : ['Reform', 'Crack down'],
        P: [
          [[1.6 - r.stab - (s.y > 1975 ? 0.4 : 0), 0.8], [2.2 - r.stab, 0.5 + r.stab]],
          [[0.9 + (s.y > 1975 ? 0.4 : 0), 1.8], [1.1, 1.2 + r.stab * 0.5]],
        ],
      });
      s.cur.place = AH.KEY_PLACE[m.key] || s.cur.place;
      if (ri === 0 && !mil) {
        r.regime = 'military'; r.stab = clamp(r.stab + 0.1); r.since = s.y;
        s.cur.title = `Coup in ${m.name}: General ${general} takes power`;
        s.cur.text = `Hardship and unrest give the army its pretext. Congress is dissolved.`;
      } else if (ri === 1 && mil) {
        r.regime = 'republic'; r.stab = clamp(r.stab + 0.08); r.since = s.y;
        s.cur.title = `${m.name} returns to civilian rule`;
        s.cur.text = `Facing ${ci === 0 ? 'mass protests' : 'a divided officer corps'}, the generals hand power to an elected government.`;
      } else if (ri === 0 && mil) {
        r.stab = clamp(r.stab - 0.05);
        s.cur.title = `${m.name}'s junta digs in`;
        s.cur.text = `General ${general}'s regime ${ci === 0 ? 'fires on protesters and' : ''} postpones elections indefinitely.`.replace('  ', ' ');
      } else {
        r.stab = clamp(r.stab + (ci === 0 ? 0.08 : 0.02));
        if (ci === 0 && r.regime !== 'republic' && AH.hash(s.seed, 'mon' + m.name, s.y) < 0.3) r.regime = 'constitutional monarchy';
        s.cur.title = `${m.name}: ${ci === 0 ? 'reform averts a crisis' : 'a crisis passes'}`;
        s.cur.text = ci === 0 ? 'The government widens the vote and spends on schools and roads; the army stays in its barracks.' : 'Strikes are broken and newspapers closed; the army stays loyal, for now.';
      }
    } });

  // ---------------------------------------------------------------- 3. joining a general war
  // Replace the bloc builder: each uncommitted power weighs joining either side
  // against neutrality.
  AH.formBlocs = function (s) {
    const ms = AH.majorsAlive(s).filter((p) => AH.strength(s, p) > 0);
    let best = null, bestScore = 0;
    for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) {
      const a = ms[i], b = ms[j];
      const sc = AH.tension(s, a, b) * Math.pow(Math.min(AH.strength(s, a), AH.strength(s, b)), 0.3);
      if (sc > bestScore) { bestScore = sc; best = [a, b]; }
    }
    if (!best) return null;
    const A = [best[0]], B = [best[1]];
    s.joinLog = [];
    const rest = ms.filter((p) => !best.includes(p)).sort((a, b) => AH.strength(s, b) - AH.strength(s, a));
    for (const p of rest) {
      let ha = A.reduce((t, x) => t + AH.tension(s, p, x), 0), hb = B.reduce((t, x) => t + AH.tension(s, p, x), 0);
      if (p === 'MEX' && s.v.gb_mx > 0.45) { if (A.includes('GBR')) hb += 0.4; if (B.includes('GBR')) ha += 0.4; }
      if (p === 'USA' && s.v.gb_mx > 0.45 && (A.includes('MEX') || B.includes('MEX'))) { if (A.includes('MEX')) ha += 0.2; else hb += 0.2; }
      const demo = AH.democratic(s, p);
      const uA = hb * 1.2 + AH.warOdds(s, A.concat(p), B) - 0.45 - (demo ? 0.15 : 0);
      const uB = ha * 1.2 + AH.warOdds(s, A, B.concat(p)) - 0.45 - (demo ? 0.15 : 0);
      const uN = 0.35 + (demo ? 0.1 : 0) + (p === 'USA' && s.y < 1900 ? 0.3 : 0) + (s.P[p].doctrine === 'détente' ? 0.2 : 0) - (s.P[p].doctrine === 'rearmament' ? 0.15 : 0);
      const c = AH.logitPick(s, 'join:' + p, [uA, uB, uN], 6);
      if (c === 0) A.push(p); else if (c === 1) B.push(p);
      s.joinLog.push([p, ['joins ' + country(s, A[0]), 'joins ' + country(s, B[0]), 'stays neutral'][c]]);
    }
    return [A, B];
  };
})(globalThis.AH = globalThis.AH || {});
