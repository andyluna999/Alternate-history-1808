// UI controller: playback, chronicle, odds, kingdom stats.
(function (AH) {
  const $ = (id) => document.getElementById(id);
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const MON = MONTHS.map((m) => m.slice(0, 3));
  const pct = (x) => Math.round(100 * x) + '%';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = {
    get(k) { try { return localStorage.getItem('rdm.' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('rdm.' + k, v); } catch (e) { /* storage unavailable */ } },
  };

  const S = {
    seed: 1808, likely: false, forces: {}, run: null, t: AH.START, playing: false, speed: 0.5,
    mc: null, mcTimer: null, mapMode: 'history', showWorld: store.get('showWorld') === '1', follow: true,
    shown: 0, expanded: null, oddsCache: {},
  };
  let map = null, lastRenderKey = '';

  const timeOf = (e) => e.y + (e.m - 1) / 12;
  const kindColor = (k) => {
    const v = { war: '--war', treaty: '--treaty', revolt: '--revolt', politics: '--politics', diplomacy: '--politics', econ: '--econ', averted: '--averted', colonial: '--ink-3' }[k] || '--ink-3';
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#888';
  };
  const placeName = (e) => (AH.PLACES[e.place] ? AH.PLACES[e.place][2] : '');
  const isAmericas = (e) => AH.PLACES[e.place] && AH.PLACES[e.place][0] < -30;
  const visibleInChron = (e) => S.showWorld || !e.bg || isAmericas(e) || e.major;

  // ------------------------------------------------------------ simulation
  function simulate() {
    S.run = AH.simulate({ seed: S.seed, likely: S.likely, forces: S.forces });
    S.shown = -1;
    lastRenderKey = '';
    drawTicks();
    renderForces();
    startMonteCarlo();
  }

  function startMonteCarlo() {
    clearTimeout(S.mcTimer);
    S.mc = AH.mcStart({ n: 120, forces: S.forces });
    S.oddsCache = {};
    const step = () => {
      const done = AH.mcStep(S.mc, 3);
      $('oddsProgress').style.width = pct(S.mc.done / S.mc.n);
      if (done) { S.oddsCache = {}; renderOdds(); if (S.mapMode === 'odds') applyFillMode(); }
      else S.mcTimer = setTimeout(step, S.playing ? 60 : 16);
      if (S.mc.done % 30 === 0) renderOdds();
    };
    step();
  }

  // ------------------------------------------------------------ rendering
  function render(animate) {
    const t = S.t;
    const { owners, names } = AH.ownersAt(S.run, t);
    const key = Math.floor(t * 12);
    if (key !== lastRenderKey) {
      map.update(owners, names, { animate });
      lastRenderKey = key;
      if (S.mapMode === 'odds') applyFillMode();
      renderPlate(t, owners, names);
      renderMarkers(t);
      renderHeadline(t);
      renderChron(t);
      renderLegend(owners);
      if (!$('panelMex').hidden) renderKingdom(t, owners, names);
      if (!$('panelPowers').hidden) renderPowers(t);
      if (!$('panelPeople').hidden) renderPeople(t);
      if (!$('panelOdds').hidden) renderOdds();
    }
    $('scrubber').value = t.toFixed(3);
  }

  function renderPlate(t, owners, names) {
    const y = Math.floor(t), m = Math.min(11, Math.floor((t - y) * 12));
    $('plateYear').textContent = y;
    $('plateMonth').textContent = MONTHS[m];
    const mexHeld = AH.ownerId(owners.MEX || '') === 'MEX';
    const snap = S.run.years[Math.min(S.run.years.length - 1, y - AH.START)];
    const ruler = mexHeld && snap.P && snap.P.MEX ? snap.P.MEX.leader : '';
    $('platePolity').textContent = mexHeld ? names.MEX + (ruler ? ' · ' + ruler : '') : 'Viceroyalty of New Spain';
    $('plateSwatch').style.background = map.colorOf(mexHeld ? 'MEX' : 'ESP');
  }

  function renderMarkers(t) {
    const list = [];
    for (const e of S.run.log) {
      const et = timeOf(e);
      if (et > t + 1e-6 || et < t - 1.5) continue;
      if (!visibleInChron(e) && !e.major) continue;
      const p = AH.PLACES[e.place];
      if (!p) continue;
      const old = et < t - 0.34;
      list.push({ id: e.id, lon: p[0], lat: p[1], color: kindColor(e.kind), label: old ? '' : p[2], old });
    }
    map.setMarkers(list);
  }

  let lastHeadline = null;
  function renderHeadline(t) {
    let best = null;
    for (const e of S.run.log) {
      const et = timeOf(e);
      if (et > t + 1e-6 || et < t - 0.45 || e.bg) continue;
      if (!visibleInChron(e)) continue;
      best = e;
    }
    const h = $('headline');
    if (!best) { h.hidden = true; lastHeadline = null; return; }
    if (best === lastHeadline) return;
    lastHeadline = best;
    h.hidden = false;
    h.style.setProperty('--kind', kindColor(best.kind));
    h.innerHTML = `<div class="meta">${MON[best.m - 1]} ${best.y} · ${esc(placeName(best))}</div><div class="t">${esc(best.title)}</div>` +
      (best.outcomeTitle ? `<div class="o">${esc(best.outcomeTitle)}</div>` : best.kind === 'averted' ? `<div class="o">Did not happen in this history</div>` : '');
    h.style.animation = 'none'; void h.offsetWidth; h.style.animation = '';
    if (S.playing && S.follow && (best.major || isAmericas(best))) {
      const p = AH.PLACES[best.place];
      if (p) map.ensureVisible([p[0], p[1]]);
    }
  }

  function renderLegend(owners) {
    if (S.mapMode === 'odds') {
      $('legend').innerHTML = `<span><i class="ramp" style="background:linear-gradient(90deg, ${map.colorOf('LOCAL')}, ${map.colorOf('MEX')})"></i></span><span>Color: most likely owner in ${Math.floor(S.t)}. Paler: less certain.</span>`;
      return;
    }
    const area = {};
    for (const f of map.visibleUnits()) {
      const id = AH.ownerId(owners[f.key] || AH.defaultOwner(f.key));
      area[id] = (area[id] || 0) + (f.sqkm || (f.sqkm = d3.geoArea(f) * 40589641));
    }
    const ids = Object.keys(area).filter((id) => id !== 'LOCAL').sort((a, b) => (b === 'MEX') - (a === 'MEX') || area[b] - area[a]).slice(0, 11);
    $('legend').innerHTML = ids.map((id) => {
      const fill = AH.POWERS[id].hatch ? `repeating-linear-gradient(45deg, ${map.colorOf(id)} 0 3px, rgba(0,0,0,.25) 3px 4px)` : map.colorOf(id);
      const n = AH.displayOwner(id, AH.ownersAt(S.run, S.t).names);
      return `<span><i class="swatch" style="background:${fill}"></i>${esc(n)}</span>`;
    }).join('');
  }

  // ------------------------------------------------------------ chronicle
  function entryHTML(e, i) {
    const kind = e.kind === 'averted' ? 'averted' : e.kind;
    const cls = [e.kind === 'averted' ? 'averted' : '', e.bg ? 'bg' : ''].join(' ');
    let chip = '';
    if (e.kind === 'averted') chip = 'did not happen';
    else if (e.forced) chip = '';
    else if (e.p < 0.999) chip = e.hazard ? `p ${pct(e.p)} / yr` : `p ${pct(e.p)}`;
    const opts = e.options ? e.options.length : 0;
    return `<li class="${cls}" data-i="${i}" style="--kind:${kindColor(kind)}">
      <div class="meta"><span>${MON[e.m - 1]} ${e.y}</span><span>${esc(placeName(e))}</span><span class="p">${chip}${opts > 1 && e.kind !== 'averted' ? ` · ${opts} paths` : ''}</span></div>
      ${e.forced ? '<div class="forced">Rewritten by you</div>' : ''}
      <div class="t">${esc(e.title)}</div>
      ${e.outcomeTitle ? `<div class="o">${esc(e.outcomeTitle)}</div>` : ''}
      ${e.text || e.outcomeText ? `<div class="x">${esc(e.kind === 'averted' ? e.text : [e.text, e.outcomeText].filter(Boolean).join(' '))}</div>` : ''}
      ${S.expanded === e.id ? detailHTML(e) : ''}
    </li>`;
  }

  function detailHTML(e) {
    const ev = AH.EVENTS.find((x) => x.id === e.id);
    let h = '<div class="detail">';
    if (e.game) {
      const g = e.game;
      const ne = new Set(g.ne.map(([i, j]) => i + ',' + j));
      h += `<table class="game"><caption>Payoffs (${esc(g.rowPlayer)}, ${esc(g.colPlayer)}). Outlined cells are pure Nash equilibria.</caption>
        <tr><th></th>${g.cols.map((c, j) => `<th>${esc(c)}<br><small>${pct(g.q[j])}</small></th>`).join('')}</tr>
        ${g.rows.map((r, i) => `<tr><th>${esc(r)} <small>${pct(g.p[i])}</small></th>${g.cols.map((_, j) => `<td class="${ne.has(i + ',' + j) ? 'ne' : ''}">${g.P[i][j][0].toFixed(1)}, ${g.P[i][j][1].toFixed(1)}<small>${pct(g.p[i] * g.q[j])}</small></td>`).join('')}</tr>`).join('')}
      </table>`;
    }
    if (e.process) {
      h += `<div class="hint">This is a recurring world process. Its timing and result follow from the state of the great powers that year, so it can't be rewritten on its own. Rewrite an earlier decision, or change the seed, to see it go differently.</div>`;
      return h + '</div>';
    }
    if (e.kind === 'averted') {
      const outs = ev.outcomes ? ev.outcomes.map((o, i) => [i, typeof o.title === 'function' ? 'Alternative ' + (i + 1) : o.title]) : [[0, 'Make it happen']];
      h += outs.map(([i, t]) => `<button type="button" class="opt" data-force="${i}"><span>${esc(t)}</span><span class="pct">force</span></button>`).join('');
      h += `<div class="hint">Forcing an event makes it fire in the first year its preconditions hold. Everything after is re-simulated.</div>`;
    } else {
      if (e.options) {
        h += e.options.map((o, i) => `<button type="button" class="opt ${i === e.outcome ? 'chosen' : ''}" data-force="${i}"><span>${esc(o.title)}</span><span class="pct">${pct(o.w)}</span><i class="bar" style="width:${(100 * o.w).toFixed(1)}%"></i></button>`).join('');
      }
      h += `<button type="button" class="opt" data-force="-1"><span>Prevent this event</span><span class="pct"></span></button>`;
      h += `<div class="hint">${e.options ? 'Choose a different outcome to rewrite history from this point. ' : ''}Later events keep their luck; they change only if the new state changes their odds.</div>`;
    }
    if (S.forces[e.id] !== undefined) h += `<button type="button" class="opt" data-unforce="1"><span>Undo my change here</span><span class="pct"></span></button>`;
    return h + '</div>';
  }

  function renderChron(t) {
    const list = S.run.log.map((e, i) => [e, i]).filter(([e]) => timeOf(e) <= t + 1e-6 && visibleInChron(e));
    const n = list.length;
    if (n === S.shown) return;
    const el = $('chron');
    const grew = S.shown >= 0 && n > S.shown;
    const prevShown = S.shown;
    el.innerHTML = list.slice().reverse().map(([e, i]) => entryHTML(e, i)).join('');
    if (grew) [...el.children].slice(0, n - prevShown).forEach((li) => li.classList.add('new'));
    S.shown = n;
  }
  function rerenderChron() { S.shown = -1; renderChron(S.t); }

  $('chron').addEventListener('click', (ev) => {
    const li = ev.target.closest('li');
    if (!li) return;
    const e = S.run.log[+li.dataset.i];
    const btn = ev.target.closest('button');
    if (btn) {
      if (btn.dataset.unforce) delete S.forces[e.id];
      else S.forces[e.id] = +btn.dataset.force;
      S.expanded = e.id;
      simulate();
      render(false);
      rerenderChron();
      return;
    }
    if (ev.target.closest('.detail')) return;
    S.expanded = S.expanded === e.id ? null : e.id;
    rerenderChron();
    const p = AH.PLACES[e.place];
    if (p && S.expanded) map.flyTo([p[0], p[1]], 3);
  });

  function renderForces() {
    const n = Object.keys(S.forces).length;
    const f = $('forces');
    f.hidden = n === 0;
    f.innerHTML = `<span>You rewrote ${n} event${n === 1 ? '' : 's'}.</span><button type="button" id="clearForces">Restore all</button>`;
    if (n) $('clearForces').onclick = () => { S.forces = {}; simulate(); render(false); rerenderChron(); };
  }

  // ------------------------------------------------------------ odds
  const TERRITORIES = [
    ['US-TX', 'Texas'], ['US-CA', 'Alta California'], ['NEWMEX', 'New Mexico'], ['GBASIN', 'Utah & Nevada'], ['GTM', 'Guatemala'],
    ['YUCATAN', 'Yucatán'], ['CUB', 'Cuba'], ['PRI', 'Puerto Rico'], ['US-FL', 'Florida'], ['US-VA', 'Virginia (the U.S. South)'],
    ['US-WA', 'Washington (Oregon Country)'], ['US-AK', 'Alaska'], ['COL', 'Colombia'], ['PAN', 'Panama'], ['US-HI', 'Hawaii'], ['PHL', 'Philippines'],
  ];
  const LANDMARKS = [
    ['hidalgo', 'A mass revolt in the Bajío', null, 'Grito de Dolores, 1810'],
    ['crown', 'A Bourbon prince takes the Mexican crown', 'Infante Francisco de Paula accepts'],
    ['cam_secession', 'Central America secedes before 1850', null, '1823'],
    ['texas_revolt', 'Texas wins independence', 'The Republic of Texas', '1836'],
    ['crisis_1846', 'War between the U.S. and Mexico', 'War: U.S. troops cross the Rio Grande', '1846'],
    ['mxus_peace', 'Mexico loses its north in the 1840s', 'U.S. victory: the Mexican Cession', '1848'],
    ['ca_crisis', 'California breaks away from Mexico', 'The California Republic stands'],
    ['intervention', 'A Habsburg on a Mexican throne', 'A Habsburg emperor installed', '1864'],
    ['civil_war', 'American Civil War', null, '1861'],
    ['civil_war_end', 'The Confederacy survives', 'A negotiated Confederate independence'],
    ['war_1898', 'The U.S. fights Spain over Cuba', 'The Spanish–American War', '1898'],
    ['war_1898', 'Mexico fights Spain over Cuba', 'The Spanish–Mexican War'],
    ['mx_revolution', 'A Mexican revolutionary civil war', 'A decade of civil war', '1910'],
    ['oil_nat', 'Mexico nationalizes its oil', null, '1938'],
    ['north_referendum', 'Independence referendum in the north'],
    ['italy', 'Italy unified', null, '1861'],
    ['germany', 'Germany unified', null, '1871'],
    ['great_war', 'At least one general war', null, '1914'],
    ['great_war_end', 'Two or more general wars end', '__2'],
    ['revolution', 'A socialist revolution in a great power', '__socialist', '1917'],
    ['china_revolution', 'The Chinese empire falls', null, '1911'],
    ['india', 'India wins independence', null, '1947'],
    ['bomb', 'Two or more nuclear powers', null, '1949'],
  ];


  function renderOdds() {
    const mc = S.mc;
    if (!mc || !mc.grids.length) return;
    const y = Math.floor(S.t);
    $('oddsYear').textContent = y;
    $('oddsLede').textContent = mc.done < mc.n
      ? `Running simulated histories… ${mc.done} of ${mc.n}`
      : `${mc.n} sampled histories${Object.keys(S.forces).length ? ', all with your rewritten events' : ''}. Each starts from the same 1808 and differs only by chance.`;
    $('territoryOdds').innerHTML = TERRITORIES.map(([k, label]) => {
      const odds = AH.ownerOdds(mc, k, y).filter((o) => o.p >= 0.005);
      return `<div class="orow"><div class="lab"><span>${esc(label)}</span><span>${esc(AH.POWERS[odds[0].id].name)} ${pct(odds[0].p)}</span></div>
        <div class="stack">${odds.map((o) => `<i style="width:${(100 * o.p).toFixed(2)}%;background:${map.colorOf(o.id)}" title="${esc(AH.POWERS[o.id].name)} ${pct(o.p)}"></i>`).join('')}</div>
        <div class="keys">${odds.slice(0, 4).map((o) => `<span><i class="swatch" style="background:${map.colorOf(o.id)}"></i>${esc(AH.POWERS[o.id].name)} ${pct(o.p)}</span>`).join('')}</div></div>`;
    }).join('');
    const n = mc.done || 1;
    $('eventOdds').innerHTML = LANDMARKS.map(([id, label, outcome, otl]) => {
      const r = mc.eventFreq[id] || { fired: 0, runs: 0, outcomes: {} };
      const share = (outcome === '__2' ? mc.multi[id] || 0 : outcome === '__socialist' ? mc.socialist || 0 : outcome ? r.outcomes[outcome] || 0 : r.runs) / n;
      return `<div class="orow"><div class="lab"><span>${esc(label)}${otl ? ` <span class="note">(OTL ${otl})</span>` : ''}</span><span>${pct(share)}</span></div>
        <div class="meter ${share < 0.5 ? 'muted' : ''}"><i style="width:${(100 * share).toFixed(1)}%"></i></div></div>`;
    }).join('');
  }

  function oddsFill(key) {
    const y = Math.floor(S.t);
    const c = S.oddsCache[y] || (S.oddsCache[y] = {});
    if (!c[key]) {
      const top = AH.ownerOdds(S.mc, key, y)[0];
      const base = d3.color(map.colorOf('LOCAL'));
      c[key] = d3.interpolateRgb(base, map.colorOf(top.id))(0.15 + 0.85 * Math.pow(top.p, 1.5));
    }
    return c[key];
  }
  function applyFillMode() {
    map.setFillMode(S.mapMode === 'odds' && S.mc && S.mc.grids.length ? oddsFill : null);
  }

  // ------------------------------------------------------------ kingdom tab
  function renderKingdom(t) {
    const y = Math.min(AH.END, Math.floor(t));
    const snap = S.run.years[y - AH.START];
    const v = snap.v;
    const { owners, names } = AH.ownersAt(S.run, t);
    let km = 0;
    for (const f of map.units) if (AH.ownerId(owners[f.key] || '') === 'MEX') km += f.sqkm || (f.sqkm = d3.geoArea(f) * 40589641);
    const otlPop = interp(AH.OTL.mexico, y);
    const held = AH.ownerId(owners.MEX || '') === 'MEX';
    $('kstat').innerHTML = `
      <div class="wide"><div class="k">State</div><div class="v">${esc(held ? names.MEX : 'Viceroyalty of New Spain')}</div></div>
      <div><div class="k">Population</div><div class="v">${v.mx_pop.toFixed(1)}M</div><div class="d">Our timeline: ${otlPop.toFixed(1)}M</div></div>
      <div><div class="k">Territory</div><div class="v">${(km / 1e6).toFixed(2)}M km²</div><div class="d">Mexico today: 1.96M km²</div></div>
      <div><div class="k">United States</div><div class="v">${v.us_pop.toFixed(1)}M</div><div class="d">Our timeline: ${interp(AH.OTL.usa, y).toFixed(1)}M</div></div>
      <div><div class="k">Government</div><div class="v" style="font-size:18px">${S.run.flags && held ? (/Republic/.test(names.MEX) ? 'Republic' : /Junta/.test(names.MEX) ? 'Junta' : 'Monarchy') : '—'}</div></div>`;
    const G = [
      ['Political stability', v.mx_stab], ['Treasury', v.mx_fisc], ['Army', v.mx_mil], ['Alignment with Britain', v.gb_mx],
      ['Church–state tension', v.mx_church, 1], ['Central American grievance', v.cam_tension, 1], ['Anglo share of Texas settlers', v.tx_anglo, 1],
      ['Foreign share of California', v.ca_anglo, 1], ['Cuban separatism', v.cu_unrest, 1], ['U.S. sectional tension', v.us_sect, 1],
    ];
    $('gauges').innerHTML = G.map(([l, x, bad]) => `<div><div class="lab"><span>${l}</span><span>${x.toFixed(2)}</span></div><div class="meter ${bad ? 'muted' : ''}"><i style="width:${(100 * x).toFixed(1)}%"></i></div></div>`).join('');
    drawPopChart(y);
  }
  function interp(series, y) {
    if (y <= series[0][0]) return series[0][1];
    for (let i = 1; i < series.length; i++) if (y <= series[i][0]) {
      const [x0, y0] = series[i - 1], [x1, y1] = series[i];
      return y0 + ((y - x0) / (x1 - x0)) * (y1 - y0);
    }
    return series[series.length - 1][1];
  }

  function drawPopChart(cur) {
    const el = $('popChart');
    const W = 340, H = 190, m = { l: 28, r: 64, t: 8, b: 20 };
    const x = d3.scaleLinear([AH.START, AH.END], [m.l, W - m.r]);
    const ymax = Math.max(80, d3.max(S.run.years, (d) => d.v.us_pop));
    const yS = d3.scaleLinear([0, ymax], [H - m.b, m.t]).nice();
    const yrs = S.run.years.filter((d) => d.y <= AH.END);
    const line = (acc) => d3.line().x((d) => x(d.y)).y((d) => yS(acc(d)))(yrs);
    const otl = (s) => d3.line().x((d) => x(d[0])).y((d) => yS(d[1]))(s);
    const cm = map.colorOf('MEX'), cu = map.colorOf('USA');
    const inkM = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim();
    const last = yrs[yrs.length - 1];
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Population of Mexico and the United States, simulated vs our timeline">
      <g class="grid">${yS.ticks(4).map((t) => `<line x1="${m.l}" x2="${W - m.r}" y1="${yS(t)}" y2="${yS(t)}"/><text x="${m.l - 4}" y="${yS(t) + 4}" text-anchor="end">${t}</text>`).join('')}</g>
      ${[1810, 1850, 1900, 1950, 2000].map((t) => `<text x="${x(t)}" y="${H - 4}" text-anchor="middle">${t}</text>`).join('')}
      <path d="${otl(AH.OTL.usa)}" fill="none" stroke="${cu}" stroke-width="1.5" stroke-dasharray="4 3"/>
      <path d="${otl(AH.OTL.mexico)}" fill="none" stroke="${cm}" stroke-width="1.5" stroke-dasharray="4 3"/>
      <path d="${line((d) => d.v.us_pop)}" fill="none" stroke="${cu}" stroke-width="2"/>
      <path d="${line((d) => d.v.mx_pop)}" fill="none" stroke="${cm}" stroke-width="2"/>
      <line x1="${x(cur)}" x2="${x(cur)}" y1="${m.t}" y2="${H - m.b}" stroke="${inkM}" stroke-opacity=".35"/>
      <circle cx="${x(cur)}" cy="${yS(S.run.years[cur - AH.START].v.mx_pop)}" r="4" fill="${cm}" stroke="var(--panel)" stroke-width="2"/>
      <circle cx="${x(cur)}" cy="${yS(S.run.years[cur - AH.START].v.us_pop)}" r="4" fill="${cu}" stroke="var(--panel)" stroke-width="2"/>
      <text class="lbl" x="${W - m.r + 6}" y="${yS(last.v.mx_pop) + 4}">Mexico</text>
      <text class="lbl" x="${W - m.r + 6}" y="${yS(last.v.us_pop) + 4}">U.S.</text>
      <rect class="hit" x="${m.l}" y="${m.t}" width="${W - m.l - m.r}" height="${H - m.t - m.b}" fill="transparent"/>
      <g class="xhair" style="display:none"><line y1="${m.t}" y2="${H - m.b}" stroke="${inkM}" stroke-opacity=".5"/><text class="lbl" y="${m.t + 10}"></text></g>
    </svg>`;
    const svg = el.querySelector('svg'), xh = svg.querySelector('.xhair');
    svg.querySelector('.hit').addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * W;
      const yr = Math.round(Math.max(AH.START, Math.min(AH.END, x.invert(px))));
      const d = S.run.years[yr - AH.START].v;
      xh.style.display = '';
      xh.querySelector('line').setAttribute('x1', x(yr)); xh.querySelector('line').setAttribute('x2', x(yr));
      const tx = xh.querySelector('text');
      tx.setAttribute('x', Math.min(x(yr) + 4, W - m.r - 150));
      tx.textContent = `${yr}: Mexico ${d.mx_pop.toFixed(1)}M · U.S. ${d.us_pop.toFixed(1)}M`;
    });
    svg.querySelector('.hit').addEventListener('pointerleave', () => { xh.style.display = 'none'; });
  }

  // ------------------------------------------------------------ powers & people
  function renderPowers(t) {
    const y = Math.min(AH.END, Math.floor(t));
    const snap = S.run.years[y - AH.START];
    const { names } = AH.ownersAt(S.run, t);
    const rows = Object.entries(snap.P || {}).sort((a, b) => b[1].str - a[1].str);
    const tot = rows.reduce((a, [, q]) => a + q.str, 0) || 1;
    $('powersYear').textContent = y;
    const govName = { monarchy: 'Monarchy', empire: 'Empire', republic: 'Republic', communist: 'Socialist state', dictatorship: 'Military regime', junta: 'Junta', regency: 'Regency' };
    $('powersTable').innerHTML = `<tr><th>Power</th><th>Strength</th><th>People</th><th>GDP</th><th>Per head</th></tr>` + rows.map(([p, q]) => `<tr>
      <td><i class="swatch" style="background:${map.colorOf(p)}"></i>${esc(AH.displayOwner(p, names))}<span class="sub">${esc(govName[q.gov] || q.gov)} · ${esc(q.leader)}</span></td>
      <td>${pct(q.str / tot)}</td><td>${q.pop.toFixed(0)}M</td><td>${(q.pop * q.prod).toFixed(0)}</td><td>${q.prod.toFixed(1)}k</td></tr>`).join('');
    $('powersStack').innerHTML = rows.map(([p, q]) => `<i style="width:${((100 * q.str) / tot).toFixed(2)}%;background:${map.colorOf(p)}" title="${esc(AH.displayOwner(p, names))} ${pct(q.str / tot)}"></i>`).join('');
  }

  function renderPeople(t) {
    const y = Math.floor(t);
    $('peopleYear').textContent = y;
    const { names } = AH.ownersAt(S.run, t);
    const cur = [];
    const alive = S.run.years[Math.min(AH.END, y) - AH.START].P || {};
    for (const [p, list] of Object.entries(S.run.rulers || {})) {
      if (!alive[p]) continue;
      const r = list.filter((x) => x.from <= y && (x.to === null || x.to > y)).pop();
      if (r) cur.push([p, r]);
    }
    const order = ['MEX', 'USA', 'GBR', 'FRA', 'GER', 'PRU', 'AUT', 'ITA', 'SAR', 'RUS', 'OTT', 'ESP', 'JPN', 'QNG'];
    cur.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
    $('rulersNow').innerHTML = cur.map(([p, r]) => `<div><i class="swatch" style="background:${map.colorOf(p)}"></i><span>${esc(r.title)} ${esc(r.name)}</span><span class="who">${esc(AH.displayOwner(p, names))}, since ${r.from}</span></div>`).join('');
    const ppl = (S.run.people || []).filter((x) => x.first <= y).slice().reverse();
    $('peopleList').innerHTML = ppl.map((x) => `<li><div class="n">${esc(x.name)}</div><div class="r">${esc(x.role)}</div><div class="y">Born c. ${x.born}; appears ${x.first}${x.power && AH.POWERS[x.power] ? ' · ' + esc(AH.displayOwner(x.power, names)) : ''}</div></li>`).join('') || '<li>No new figures yet: everyone on stage was alive in 1808.</li>';
  }

  // ------------------------------------------------------------ ticks
  function drawTicks() {
    const svg = $('ticks');
    svg.setAttribute('viewBox', '0 0 1000 16');
    svg.setAttribute('preserveAspectRatio', 'none');
    const span = AH.END + 1 - AH.START;
    svg.innerHTML = S.run.log.filter((e) => !e.bg && (e.major || isAmericas(e))).map((e) =>
      `<rect x="${(((timeOf(e) - AH.START) / span) * 1000).toFixed(1)}" y="${e.major ? 2 : 7}" width="3" height="${e.major ? 12 : 7}" fill="${kindColor(e.kind)}"/>`).join('');
  }

  // ------------------------------------------------------------ tooltip
  function hover(f, ev) {
    const tip = $('tooltip');
    if (!f) { tip.hidden = true; return; }
    const { owners, names } = AH.ownersAt(S.run, S.t);
    const o = owners[f.key] || AH.defaultOwner(f.key);
    const id = AH.ownerId(o);
    const who = AH.displayOwner(o, names);
    const region = AH.GROUP_LABEL[f.key] || f.properties.n;
    let h = `<div class="row"><i class="swatch" style="background:${map.colorOf(o)}"></i><b>${esc(who)}</b></div><div>${esc(region)}</div>`;
    if (AH.GROUP_LABEL[f.key]) h += `<div class="sub">Today: ${esc(f.properties.n)}</div>`;
    if (S.mc && S.mc.grids.length) {
      const odds = AH.ownerOdds(S.mc, f.key, Math.floor(S.t)).slice(0, 3);
      h += `<div class="sub" style="margin-top:4px">Across ${S.mc.grids.length} runs: ${odds.map((x) => `${esc(AH.POWERS[x.id].name)} ${pct(x.p)}`).join(', ')}</div>`;
    }
    tip.innerHTML = h;
    tip.hidden = false;
    const r = $('mapWrap').getBoundingClientRect();
    let x = ev.clientX - r.left + 14, y = ev.clientY - r.top + 14;
    if (x + 290 > r.width) x = ev.clientX - r.left - 290;
    if (y + 110 > r.height) y = ev.clientY - r.top - 110;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }

  // ------------------------------------------------------------ playback
  let lastFrame = 0;
  function frame(ts) {
    if (!S.playing) return;
    const dt = lastFrame ? Math.min(0.1, (ts - lastFrame) / 1000) : 0;
    lastFrame = ts;
    S.t = Math.min(AH.END + 11 / 12, S.t + dt * S.speed);
    render(true);
    if (S.t >= AH.END + 11 / 12) { setPlaying(false); return; }
    requestAnimationFrame(frame);
  }
  function setPlaying(on) {
    S.playing = on;
    $('playIcon').setAttribute('d', on ? 'M6 4.5h4v15H6zM14 4.5h4v15h-4z' : 'M7 4.5v15l12-7.5z');
    $('play').setAttribute('aria-label', on ? 'Pause' : 'Play');
    if (on) {
      if (S.t >= AH.END + 11 / 12 - 0.01) { S.t = AH.START; rerenderChron(); }
      lastFrame = 0; requestAnimationFrame(frame);
    }
  }

  // ------------------------------------------------------------ wiring
  function wire() {
    $('play').onclick = () => setPlaying(!S.playing);
    $('scrubber').oninput = (e) => { S.t = +e.target.value; render(false); };
    $('speed').onchange = (e) => { S.speed = +e.target.value; };
    const setMode = (likely) => {
      S.likely = likely;
      $('sampled').classList.toggle('on', !likely); $('likely').classList.toggle('on', likely);
      $('sampled').setAttribute('aria-pressed', !likely); $('likely').setAttribute('aria-pressed', likely);
      simulate(); render(false); rerenderChron();
    };
    $('sampled').onclick = () => setMode(false);
    $('likely').onclick = () => setMode(true);
    $('seed').onchange = (e) => { S.seed = Math.max(1, Math.floor(+e.target.value) || 1); simulate(); render(false); rerenderChron(); };
    $('reroll').onclick = () => { S.seed = 1 + Math.floor(Math.random() * 999998); $('seed').value = S.seed; if (S.likely) setMode(false); else { simulate(); render(false); rerenderChron(); } };
    $('showWorld').checked = S.showWorld;
    $('showWorld').onchange = (e) => { S.showWorld = e.target.checked; store.set('showWorld', S.showWorld ? '1' : '0'); rerenderChron(); lastRenderKey = ''; render(false); };
    document.querySelectorAll('.views button').forEach((b) => b.onclick = () => {
      document.querySelectorAll('.views button').forEach((x) => x.classList.toggle('on', x === b));
      map.view(b.dataset.view);
    });
    const setMapMode = (m) => {
      S.mapMode = m;
      $('modeHistory').classList.toggle('on', m === 'history'); $('modeOdds').classList.toggle('on', m === 'odds');
      $('modeHistory').setAttribute('aria-pressed', m === 'history'); $('modeOdds').setAttribute('aria-pressed', m === 'odds');
      applyFillMode(); lastRenderKey = ''; render(false);
    };
    $('modeHistory').onclick = () => setMapMode('history');
    $('modeOdds').onclick = () => setMapMode('odds');
    document.querySelectorAll('.tabs button').forEach((b) => b.onclick = () => {
      document.querySelectorAll('.tabs button').forEach((x) => { x.setAttribute('aria-selected', x === b); $(x.dataset.panel).hidden = x !== b; });
      store.set('tab', b.id);
      lastRenderKey = ''; render(false);
    });
    const savedTab = store.get('tab');
    if (savedTab && $(savedTab)) $(savedTab).click();
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, select, textarea')) return;
      if (e.code === 'Space') { e.preventDefault(); setPlaying(!S.playing); }
      if (e.key === 'ArrowRight') { S.t = Math.min(AH.END + 0.99, S.t + 1); render(false); }
      if (e.key === 'ArrowLeft') { S.t = Math.max(AH.START, S.t - 1); rerenderChron(); render(false); }
    });
    // Theme changes: recolor the map.
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    const retheme = () => { map.refreshTheme(); lastRenderKey = ''; drawTicks(); render(false); };
    if (mq && mq.addEventListener) mq.addEventListener('change', retheme);
    new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  async function boot() {
    const topo = await (await fetch('data/world.topo.json')).json();
    // Keep atlas labels clear of the overlays that sit on the map.
    const reserved = () => {
      const base = $('mapWrap').getBoundingClientRect();
      return ['.plate', '.map-mode', '#legend', '#headline'].map((q) => document.querySelector(q))
        .filter((el) => el && !el.hidden && el.offsetParent !== null)
        .map((el) => { const r = el.getBoundingClientRect(); return [r.left - base.left - 6, r.top - base.top - 6, r.right - base.left + 6, r.bottom - base.top + 6]; });
    };
    map = AH.createMap($('map'), topo, { hover, reserved, zoomEnd: () => S.run && renderLegend(AH.ownersAt(S.run, S.t).owners) });
    wire();
    simulate();
    map.view('americas', 0);
    // Open on the junta's first autumn so the first frame already shows the divergence.
    S.t = 1808 + 10 / 12;
    render(false);
    $('scrubber').addEventListener('pointerdown', () => { if (S.playing) setPlaying(false); });
  }
  boot().catch((err) => {
    $('headline').hidden = false;
    $('headline').innerHTML = `<div class="t">The map data failed to load.</div><div class="o">${esc(err.message)}. Serve this folder over HTTP (for example <code>python3 -m http.server</code>) rather than opening the file directly.</div>`;
  });
})(globalThis.AH = globalThis.AH || {});
