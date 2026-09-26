// World processes from about 1840: recurring, state-driven events. Nothing
// here has a fixed date or a real person after the divergence. Each process
// reads the great-power model (js/world.js) and writes back to it and to the map.
(function (AH) {
  const E = (AH.EVENTS = AH.EVENTS || []);
  const ev = (o) => E.push(o);
  const L = (n) => 'LOCAL:' + n;
  const S = (x) => 1 / (1 + Math.exp(-x));
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const alive = (s, p) => AH.alive(s, p);
  const nm = (s, p) => AH.powerName(s, p);
  const adj = (p) => AH.ADJ[p] || AH.POWERS[p].name;
  const cult = (p) => AH.CULTURE[p] || 'en';
  const country = (s, p) => AH.COUNTRY[p] || AH.powerName(s, p);
  const list = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
  const recent = (s, p, n) => s.f['beaten_' + p] && s.y - s.f['beaten_' + p] <= n;
  const germany = (s) => (alive(s, 'GER') ? 'GER' : 'PRU');
  const italy = (s) => (alive(s, 'ITA') ? 'ITA' : 'SAR');

  // ---------------------------------------------------------------- industrialization
  const takeoffHazard = (s, p) => {
    const P = s.P[p];
    if (!P || P.dead || P.takeoff || s.y < P.earliest) return 0;
    if (p === 'JPN' && !s.f.japan_reform) return 0;
    if (p === 'QNG' && !s.f.china_republic) return 0;
    return 0.01 + 0.07 * P.stab + (p === 'MEX' && s.f.railways ? 0.06 : 0) + (p === 'RUS' && s.f.serfs_freed ? 0.05 : 0);
  };
  ev({ id: 'takeoff', repeat: true, win: [1815, 1995], m: 3, kind: 'econ',
    p: (s) => 1 - AH.majorsAlive(s).reduce((q, p) => q * (1 - takeoffHazard(s, p)), 1),
    place: 'london', title: 'Industrial revolution',
    fx: (s) => {
      const ps = AH.majorsAlive(s);
      const i = s.pick('takeoff', ps.map((p) => takeoffHazard(s, p)));
      if (i < 0) { s.cur.cancel = true; return; }
      const p = ps[i];
      s.P[p].takeoff = s.y;
      const who = s.fig('engineer:' + p, cult(p), 'Railway engineer', p);
      s.cur.place = AH.CAPITAL[p];
      s.cur.title = `The industrial revolution reaches ${AH.COUNTRY[p] || nm(s, p)}`;
      s.cur.text = `${who}'s railway opens, and the first steam mills and ironworks follow. Output per head in ${nm(s, p)} begins to climb.`;
      s.cur.major = ['MEX', 'USA', 'JPN', 'RUS', 'QNG', 'PRU', 'GER'].includes(p);
    } });

  ev({ id: 'serfs', win: [1850, 1900], m: 3, place: 'stpetersburg', kind: 'politics',
    when: (s) => alive(s, 'RUS') && s.P.RUS.gov === 'monarchy',
    p: (s) => 0.04 + (recent(s, 'RUS', 5) ? 0.3 : 0),
    title: 'Russia frees its serfs',
    text: (s) => `${AH.leaderOf(s, 'RUS')} signs the emancipation decree. Twenty million peasants are freed, burdened with redemption payments.`,
    fx: (s) => { s.set('serfs_freed'); s.P.RUS.stab = clamp(s.P.RUS.stab + 0.05); } });

  // ---------------------------------------------------------------- Italy and Germany
  ev({ id: 'italy', repeat: true, max: 1, win: [1820, 1920], m: 5, place: 'turin', kind: 'war', major: true,
    when: (s) => alive(s, 'SAR') && !s.f.italy_united,
    p: (s) => (s.P.SAR.takeoff ? 0.04 : 0.012) + (recent(s, 'AUT', 3) ? 0.3 : 0) + 0.06 * clamp(AH.tension(s, 'AUT', 'FRA')),
    title: 'The Italian question',
    fx: (s) => {
      const ally = AH.tension(s, 'AUT', 'FRA') > 0.3 && AH.tension(s, 'FRA', 'SAR') < 0.3 ? 'FRA' : null;
      const pw = AH.warOdds(s, ['SAR'].concat(ally ? [ally] : []), ['AUT']);
      const hero = s.fig('italy:hero', 'it', 'Hero of Italian unification', 'SAR');
      const king = AH.leaderOf(s, 'SAR');
      const i = s.pick('italy', [pw, 0.25, (1 - pw) * 0.8]);
      s.cur.place = 'solferino';
      if (i === 0) {
        s.set('italy_united');
        s.own(AH.ITALY.filter((k) => ['SAR', 'PAP', 'NAP', 'ITD'].includes(s.oid(k)) || (k === 'IT_LOMB' && s.oid(k) === 'AUT')), 'ITA');
        if (AH.hash(s.seed, 'rome', s.y) < 0.6) s.own('IT_LAZIO', 'PAP');
        if (ally) s.own('SAVOY', 'FRA');
        s.P.ITA = Object.assign({}, s.P.SAR, { pop: 24, regnal: s.P.SAR.regnal, hist: [] });
        s.P.SAR.dead = true;
        s.P.ITA.leader = s.P.SAR.leader;
        s.name('ITA', 'Kingdom of Italy');
        AH.addTension(s, 'AUT', 'ITA', 0.3);
        s.f.beaten_AUT = s.y;
        s.cur.title = 'The Kingdom of Italy';
        s.cur.text = `${ally ? 'With French help, ' : ''}Sardinia defeats Austria in Lombardy, and ${hero}'s volunteers sweep through the south. ${king} is proclaimed King of Italy.${s.oid('IT_LAZIO') === 'PAP' ? ' Rome stays with the Pope under a French garrison.' : ''}`;
      } else if (i === 1) {
        s.set('italy_united');
        s.own(AH.ITALY.filter((k) => ['SAR', 'PAP', 'NAP', 'ITD'].includes(s.oid(k))), 'ITA');
        s.P.ITA = Object.assign({}, s.P.SAR, { pop: 20, gov: 'monarchy', hist: [] });
        s.P.SAR.dead = true;
        s.name('ITA', 'Italian Confederation');
        s.P.ITA.leader = s.P.SAR.leader;
        s.cur.title = 'An Italian Confederation';
        s.cur.text = `The Italian states form a confederation under the Pope's presidency, with Turin's army and ${hero}'s blessing. Lombardy and Venetia stay Austrian.`;
      } else {
        s.cur.kind = 'war';
        s.cur.title = 'The Italian rising is crushed';
        s.cur.text = `Austrian troops beat the Sardinians in Lombardy; ${hero} escapes into exile. Italy stays divided for now.`;
        s.P.SAR.stab = clamp(s.P.SAR.stab - 0.1);
        s.count.italy = -1; // try again later
      }
    } });

  ev({ id: 'germany', repeat: true, max: 1, win: [1830, 1930], m: 7, place: 'frankfurt', kind: 'war', major: true,
    when: (s) => alive(s, 'PRU') && !s.f.german_united,
    p: (s) => (s.P.PRU.takeoff ? 0.012 + 0.04 * clamp(s.P.PRU.prod / 3) : 0.006) + (recent(s, 'AUT', 3) ? 0.2 : 0),
    title: 'The German question',
    fx: (s) => {
      const pw = AH.warOdds(s, ['PRU'], ['AUT']);
      const chancellor = s.fig('germany:chancellor', 'de', 'Architect of German unity', 'PRU');
      const i = s.pick('germany', [pw * 0.9, (1 - pw) * 0.5, 0.18, (1 - pw) * 0.35]);
      s.cur.place = i === 2 ? 'frankfurt' : 'koniggratz';
      const states = AH.GERMAN_STATES.filter((k) => ['GDC', 'DEN', 'PRU'].includes(s.oid(k)));
      if (i === 0 || i === 2) {
        s.set('german_united');
        s.own(AH.GERMANY.filter((k) => s.oid(k) === 'PRU' || states.includes(k)), 'GER');
        s.P.GER = Object.assign({}, s.P.PRU, { pop: s.P.PRU.pop + 20, hist: [], regnal: s.P.PRU.regnal });
        s.P.PRU.dead = true;
        s.P.GER.leader = s.P.PRU.leader;
        if (i === 0) {
          s.name('GER', 'German Empire'); s.P.GER.gov = 'empire';
          s.f.beaten_AUT = s.y;
          s.cur.title = 'Prussia unites Germany';
          s.cur.text = `Minister-President ${chancellor} provokes a war with Austria and wins it in seven weeks. ${AH.leaderOf(s, 'GER')} is proclaimed German Emperor.`;
          AH.addTension(s, 'FRA', 'GER', 0.35); AH.addTension(s, 'AUT', 'GER', 0.15);
        } else {
          s.name('GER', 'German Federal Union'); s.P.GER.gov = 'republic'; AH.newLeader(s, 'GER');
          s.cur.kind = 'politics';
          s.cur.title = 'A German parliament unites Germany';
          s.cur.text = `An elected German parliament in Frankfurt, led by ${chancellor}, writes a federal constitution that the princes accept. Austria is left out.`;
          AH.addTension(s, 'FRA', 'GER', 0.15);
        }
      } else if (i === 1) {
        s.set('german_united');
        s.own(states, 'AUT');
        s.P.AUT.pop += 18;
        s.name('AUT', 'Greater German Empire (Habsburg)');
        s.P.PRU.stab = clamp(s.P.PRU.stab - 0.2);
        s.f.beaten_PRU = s.y;
        AH.addTension(s, 'AUT', 'PRU', 0.3); AH.addTension(s, 'AUT', 'FRA', 0.2);
        s.cur.title = 'Austria wins the German war';
        s.cur.text = `Prussia is beaten in Bohemia. The German states join a Habsburg-led empire; ${chancellor}'s career ends in disgrace.`;
      } else {
        s.cur.kind = 'politics';
        s.cur.title = 'German unity fails again';
        s.cur.text = `A Prussian bid for German leadership collapses when the south German courts side with Vienna. ${chancellor} resigns.`;
        s.count.germany = -1; // try again later
      }
    } });

  // ---------------------------------------------------------------- the Eastern Question
  const BALKAN = [['ROU', 'ROM:United Principalities'], ['SRB', 'SRB:Kingdom of Serbia'], ['SRB_SOUTH', 'SRB:Kingdom of Serbia'], ['BGR', 'BUL:Principality of Bulgaria'],
    ['GR_THESSALY', 'GRE'], ['E_RUMELIA', 'BUL:Bulgaria'], ['DOBRUJA', 'ROM:Romania'], ['GR_CRETE', 'GRE'], ['GR_NORTH', 'GRE'], ['ALB', L('Albania')], ['MKD', 'SRB:Kingdom of Serbia'], ['KOS', 'SRB:Kingdom of Serbia']];
  // ---------------------------------------------------------------- wars between two powers
  const warPairs = (s) => {
    const out = [];
    const ms = AH.majorsAlive(s);
    for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) {
      const a = ms[i], b = ms[j];
      const k = a < b ? a + '|' + b : b + '|' + a;
      if (!AH.FLASHPOINT[k] || k === 'MEX|USA' || k === 'ESP|MEX') continue;
      if (s.f['peace_' + k] && s.y - s.f['peace_' + k] < 15) continue;
      const nuk = s.f.nukes || [];
      if (nuk.includes(a) && nuk.includes(b)) continue; // nuclear powers fight by proxy, not directly
      if (s.y > 1900 && AH.democratic(s, a) && AH.democratic(s, b)) continue;
      out.push([a, b, AH.tension(s, a, b)]);
    }
    return out;
  };
  ev({ id: 'local_war', repeat: true, win: [1815, 1995], m: 8, place: 'plevna', kind: 'war', major: true,
    when: (s) => !s.f.world_war,
    p: (s) => { const t = Math.max(0, ...warPairs(s).map((x) => x[2])); return (0.01 + 0.4 * Math.pow(Math.max(0, t - 0.35), 1.5)) * (s.f.nuclear_peace ? 0.3 : 1); },
    title: 'Crisis',
    fx: (s) => {
      const pairs = warPairs(s);
      const i = s.pick('lw:pair', pairs.map((x) => Math.pow(x[2], 3)));
      if (i < 0) { s.cur.cancel = true; return; }
      let [a, b] = pairs[i];
      // The challenger is the side with more to gain: claims on the other, or rearming.
      const claims = (w, l) => AH.claimsOn(s, w, l).length + (s.P[w].doctrine === 'rearmament' || s.P[w].doctrine === 'expansion' ? 0.5 : 0);
      if (claims(b, a) > claims(a, b)) [a, b] = [b, a];
      const k = a < b ? a + '|' + b : b + '|' + a;
      const [place, war] = AH.FLASHPOINT[k];
      const pa = AH.warOdds(s, [a], [b]);
      const stake = Math.min(1, 0.3 + 0.3 * AH.claimsOn(s, a, b).length);
      const demoB = AH.democratic(s, b);
      const [ri, ci] = AH.playGame(s, 'lw:' + k, {
        rowPlayer: country(s, a), colPlayer: country(s, b), rows: ['Ultimatum, then war', 'Negotiate'], cols: ['Resist', 'Concede'],
        P: [
          [[(3 * pa - 1.4) * stake + 0.2, 3 * (1 - pa) - 1.6], [1.8 * stake + 0.3, 0.5 - 0.2 * s.P[b].stab]],
          [[0.4, 1.4], [1 * stake + 0.4, 1.1 + (demoB ? 0.1 : 0)]],
        ],
      });
      s.f['peace_' + k] = s.y;
      s.cur.place = place;
      if (ri === 0 && ci === 0) {
        const aWins = s.pick('lw:win', [pa, 1 - pa]) === 0;
        const [w, l] = aWins ? [a, b] : [b, a];
        const sev = 0.35 + 0.4 * AH.hash(s.seed, 'lw:sev', s.y);
        const moved = AH.makePeace(s, [w], [l], sev);
        const gen = s.fig(`general:${w}:${s.y}`, cult(w), `Commander in the ${war} War`, w);
        s.T[k] = Math.max(0.15, s.T[k] - 0.3);
        s.cur.title = `The ${war} War: ${country(s, w)} defeats ${country(s, l)}`;
        s.cur.text = `${AH.leaderOf(s, a)} sends an ultimatum; ${AH.leaderOf(s, b)} refuses it. ${gen} wins the decisive battle.` + (moved.length ? ` The peace transfers ${list(moved.map((x) => AH.GROUP_LABEL[x] || AH.KEY_NAMES[x] || x))}.` : ' The peace changes little on the map but a great deal in prestige.');
      } else if (ri === 0 && ci === 1) {
        const cl = AH.claimsOn(s, a, b).slice(0, 1);
        s.own(cl, a);
        s.P[b].stab = clamp(s.P[b].stab - 0.08);
        AH.addTension(s, a, b, 0.1);
        s.cur.kind = 'diplomacy';
        s.cur.title = `${country(s, b)} backs down before ${country(s, a)}`;
        s.cur.text = `Faced with an ultimatum from ${AH.leaderOf(s, a)}, ${AH.leaderOf(s, b)} yields${cl.length ? ' ' + (AH.GROUP_LABEL[cl[0]] || AH.KEY_NAMES[cl[0]] || cl[0]) : ''} rather than fight. The humiliation will be remembered.`;
      } else {
        s.T[k] = Math.max(0.1, s.T[k] - 0.15);
        s.cur.kind = 'diplomacy';
        s.cur.major = false;
        s.cur.title = `A ${war} crisis ends at the conference table`;
        s.cur.text = `${AH.leaderOf(s, a)} and ${AH.leaderOf(s, b)} step back from war${ci === 1 ? '; a small border adjustment and an indemnity settle it' : ''}.`;
      }
    } });

  // ---------------------------------------------------------------- the general war
  ev({ id: 'great_war', repeat: true, max: 3, win: [1865, 1995], m: 8, place: 'belgrade', kind: 'war', major: true,
    when: (s) => !s.f.world_war && (!s.f.last_gw_end || s.y - s.f.last_gw_end > 18),
    p: (s) => {
      let t = 0;
      for (const [k, v] of Object.entries(s.T)) { const [a, b] = k.split('|'); if (alive(s, a) && alive(s, b)) t = Math.max(t, v); }
      const armed = AH.majorsAlive(s).filter((p) => s.P[p].takeoff).length;
      return (0.002 + 0.1 * S(12 * (t - 0.64))) * Math.min(1, armed / 5) * (s.f.nuclear_peace ? 0.03 : 1) * (s.warCount >= 2 ? 0.4 : 1);
    },
    title: 'A general war',
    fx: (s) => {
      const blocs = AH.formBlocs(s);
      if (!blocs || blocs[1].length === 0 || blocs[0].length + blocs[1].length < 3) { s.cur.cancel = true; return; }
      const [A, B] = blocs;
      s.warCount += 1;
      const n = ['the Great War', 'the Second Great War', 'the Third Great War'][s.warCount - 1];
      s.set('world_war');
      s.gw = { A, B, name: n, start: s.y };
      for (const p of A.concat(B)) s.P[p].atWar = true;
      const pa = AH.warOdds(s, A, B);
      const dur = 2 + Math.round(4 * (1 - Math.abs(pa - 0.5) * 2));
      s.after(dur, 'great_war_end');
      const k = A[0] < B[0] ? A[0] + '|' + B[0] : B[0] + '|' + A[0];
      const fp = AH.FLASHPOINT[k] || ['belgrade', 'Balkan'];
      const spark = s.fig(`assassin:${s.warCount}`, 'sl', 'Assassin whose shot started a general war', '');
      s.cur.place = fp[0];
      s.cur.title = `${n[0].toUpperCase() + n.slice(1)} begins`;
      s.cur.text = `A crisis on the ${fp[1]} frontier, set off when ${spark} shoots a minister, pulls the alliances in. ${list(A.map((p) => nm(s, p)))} against ${list(B.map((p) => nm(s, p)))}.` +
        (A.includes('MEX') || B.includes('MEX') ? ` Mexico fights beside ${(A.includes('MEX') ? A : B).filter((p) => p !== 'MEX').map((p) => nm(s, p))[0]}.` : ' Mexico stays neutral and sells oil to both sides.') +
        ((s.joinLog || []).filter(([p, d]) => d === 'stays neutral').length ? ` Neutral: ${list(s.joinLog.filter(([, d]) => d === 'stays neutral').map(([p]) => country(s, p)))}.` : '');
      if (A.includes('MEX') || B.includes('MEX')) s.set('at_war');
    } });

  ev({ id: 'great_war_end', sched: true, repeat: true, m: 11, place: 'versailles', kind: 'treaty', major: true,
    title: 'The general war ends',
    fx: (s) => {
      const { A, B, name } = s.gw;
      const a = A.filter((p) => alive(s, p)), b = B.filter((p) => alive(s, p));
      const pa = AH.warOdds(s, a, b);
      const aWins = s.pick('gw:win', [pa, 1 - pa]) === 0;
      const [W, Lo] = aWins ? [a, b] : [b, a];
      const sev = 0.6 + 0.4 * AH.hash(s.seed, 'gw:sev', s.y);
      const moved = AH.makePeace(s, W, Lo, sev);
      const broke = [];
      for (const l of Lo) {
        if (AH.BREAKUP[l] && AH.hash(s.seed, 'brk' + l, s.y) < 0.25 + 0.6 * sev && (l !== 'GER' || sev > 0.85) && l !== 'GBR') broke.push(...AH.breakUp(s, l));
      }
      // A resurrected Poland collects its lands from any beaten partitioner.
      if (s.held('POL')) for (const l of Lo) if (['GER', 'PRU'].includes(l)) s.take(['POSEN', 'CORRIDOR', 'UPPER_SIL'], l, 'POL:Republic of Poland');
      for (const p of a.concat(b)) if (s.P[p]) s.P[p].atWar = false;
      delete s.f.world_war; delete s.f.at_war;
      s.f.last_gw_end = s.y;
      s.v.decol = clamp(s.v.decol + (s.y > 1930 ? 0.22 : 0.1));
      if (W.includes('MEX')) { s.add('mx_stab', 0.05); s.add('gb_mx', 0.05); }
      if (Lo.includes('MEX')) s.add('mx_stab', -0.15);
      const peace = s.fig('peace:' + s.warCount, cult(W[0]), `Host of the peace conference ending ${name}`, W[0]);
      s.cur.place = AH.CAPITAL[W[0]] || 'versailles';
      s.cur.title = `${name[0].toUpperCase() + name.slice(1)} ends: ${list(W.map((p) => nm(s, p)))} victorious`;
      s.cur.text = `After ${s.y - s.gw.start} years and millions dead, ${list(Lo.map((p) => nm(s, p)))} ${Lo.length > 1 ? 'sue' : 'sues'} for peace. The treaty, drafted under ${peace}, ` +
        (moved.length ? `transfers ${list([...new Set(moved.map((x) => AH.GROUP_LABEL[x] || AH.KEY_NAMES[x] || x))].slice(0, 6))}` : 'redraws few borders') +
        (broke.length ? `. From the wreck of the losing empires rise ${list([...new Set(broke)].slice(0, 6))}.` : '.');
      s.gw = null;
    } });

  // ---------------------------------------------------------------- revolutions
  const revHazard = (s, p) => {
    const P = s.P[p];
    if (!P || P.dead || p === 'MEX' || p === 'USA') return 0;
    if (s.f['revolution_' + p] && s.y - s.f['revolution_' + p] < 12) return 0;
    const demo = AH.democratic(s, p) ? 0.3 : 1;
    // Revolutions are contagious: news of one raises the odds everywhere for a year or two.
    return demo * (0.08 * (s.v.rev_wave || 0) + 0.003 + 0.12 * Math.max(0, 0.38 - P.stab) + (recent(s, p, 2) ? 0.22 : 0) + ((P.gov === 'monarchy' || P.gov === 'empire') && !P.constitutional && s.y > 1890 ? 0.006 : 0));
  };
  ev({ id: 'revolution', repeat: true, win: [1815, 2000], m: 3, place: 'paris', kind: 'revolt', major: true,
    p: (s) => 1 - AH.majorsAlive(s).reduce((q, p) => q * (1 - revHazard(s, p)), 1),
    title: 'Revolution',
    fx: (s) => {
      const ps = AH.majorsAlive(s);
      const i = s.pick('rev:who', ps.map((p) => revHazard(s, p)));
      if (i < 0) { s.cur.cancel = true; return; }
      const p = ps[i], P = s.P[p];
      const industrial = P.takeoff && s.y - P.takeoff > 25 && s.y > 1885;
      const monarchy = P.gov === 'monarchy' || P.gov === 'empire';
      const beaten = recent(s, p, 3);
      const w = [
        industrial ? 0.12 + (beaten ? 0.3 : 0) + (P.gov === 'communist' ? -1 : 0) : 0, // communist
        monarchy ? 0.5 : P.gov === 'republic' ? 0.05 : 0.35, // republic
        0.2 + (beaten ? 0.25 : 0) + (P.gov === 'republic' ? 0.2 : 0), // dictatorship
        monarchy ? 0.2 : 0.1, // reform or restoration
      ];
      const o = s.pick('rev:kind', w);
      const leader = s.fig(`rev:${p}:${s.y}`, cult(p), 'Revolutionary leader', p);
      const a = adj(p);
      s.v.rev_wave = Math.min(1, (s.v.rev_wave || 0) + 0.7);
      const before = AH.COUNTRY[p] || nm(s, p);
      s.f['revolution_' + p] = s.y;
      if (p === 'QNG') { s.set('china_republic'); P.earliest = Math.min(P.earliest, s.y + 5); }
      s.cur.place = AH.CAPITAL[p];
      if (o === 0) {
        AH.setGov(s, p, 'communist', p === 'QNG' ? "People's Republic of China" : `${a} Socialist Republic`);
        P.leader.name = leader; (s.rulers[p] || []).slice(-1)[0].name = leader;
        s.set('communist_' + p);
        for (const q of AH.majorsAlive(s)) if (q !== p && s.P[q].gov !== 'communist') AH.addTension(s, p, q, 0.25);
        s.cur.title = `A socialist revolution in ${before}`;
        s.cur.text = `Workers' councils seize the capital. ${leader} proclaims the ${nm(s, p)}, nationalizes industry and land, and calls on the workers of the world to follow.`;
        P.stab = clamp(P.stab + 0.1);
        if (p === 'RUS' && AH.hash(s.seed, 'rus-civil', s.y) < 0.5) AH.breakUp(s, 'RUS');
      } else if (o === 1) {
        AH.setGov(s, p, 'republic', p === 'QNG' ? 'Republic of China' : p === 'OTT' ? 'Republic of Turkey' : `${a} Republic`);
        s.cur.title = `Revolution in ${before}: a republic is proclaimed`;
        s.cur.text = `${monarchy ? 'The monarch flees. ' : ''}${leader} leads a provisional government that calls elections for a constituent assembly.`;
        P.stab = clamp(P.stab + 0.12);
      } else if (o === 2) {
        AH.setGov(s, p, 'dictatorship', `${a} State`);
        P.leader.name = leader; P.leader.title = 'Marshal'; (s.rulers[p] || []).slice(-1)[0].name = leader;
        s.cur.title = `A coup in ${before}: Marshal ${leader} takes power`;
        s.cur.text = `Promising order and national revival, the army dissolves parliament. The ${nm(s, p)} rearms and nurses grievances.`;
        P.mil = clamp(P.mil + 0.3);
        for (const q of AH.majorsAlive(s)) if (q !== p && s.f['beaten_' + p] && AH.tension(s, p, q) > 0.2) AH.addTension(s, p, q, 0.25);
      } else {
        s.cur.kind = 'politics';
        if (!monarchy && P.gov !== 'communist') { AH.setGov(s, p, 'monarchy', null); s.names[p] = undefined; }
        P.constitutional = true;
        s.cur.title = `Unrest in ${before} ends in reform`;
        s.cur.text = `Mass protests led by ${leader} force a new constitution, a wider franchise and land reform. The regime survives.`;
        P.stab = clamp(P.stab + 0.15);
      }
    } });

  ev({ id: 'bloc_collapse', repeat: true, win: [1950, 2000], m: 11, place: 'moscow', kind: 'politics', major: true,
    p: (s) => AH.majorsAlive(s).filter((p) => s.P[p].gov === 'communist').reduce((t, p) => t + 0.01 + 0.25 * Math.max(0, 0.45 - s.P[p].stab) + (s.y > 1980 ? 0.03 : 0) + (s.y - (s.f['revolution_' + p] || s.y) > 60 ? 0.03 : 0), 0),
    title: 'A socialist state collapses',
    fx: (s) => {
      const ps = AH.majorsAlive(s).filter((p) => s.P[p].gov === 'communist');
      if (!ps.length) { s.cur.cancel = true; return; }
      const p = ps[s.pick('bc', ps.map((q) => 1 - s.P[q].stab))];
      const reformer = s.fig(`reform:${p}:${s.y}`, cult(p), 'Reformer who dismantled a socialist state', p);
      const keep = p === 'QNG' && AH.hash(s.seed, 'china-market', s.y) < 0.6;
      if (keep) {
        s.cur.title = `${nm(s, p)} opens its economy`;
        s.cur.text = `${reformer} keeps the party in power but frees prices, farms and foreign trade. Growth takes off.`;
        s.P[p].stab = clamp(s.P[p].stab + 0.2);
        s.f['revolution_' + p] = s.y;
        return;
      }
      AH.setGov(s, p, 'republic', p === 'RUS' ? 'Russian Federation' : `${adj(p)} Republic`);
      s.P[p].stab = clamp(s.P[p].stab + 0.1);
      const freed = [];
      if (p === 'RUS') for (const [k, n] of Object.entries(AH.RUS_REPUBLICS)) if (s.oid(k) === 'RUS' && k !== 'RUS') { s.own(k, n === 'Poland' ? 'POL:Republic of Poland' : L(n)); freed.push(n); }
      s.cur.place = AH.CAPITAL[p];
      s.cur.title = `The ${adj(p)} socialist state collapses`;
      s.cur.text = `${reformer}'s reforms slip out of control; the party's monopoly ends without a war.${freed.length ? ` ${list([...new Set(freed)])} become independent.` : ''}`;
    } });

  // ---------------------------------------------------------------- empire-building
  const colonizers = (s) => {
    const out = [];
    for (const p of AH.majorsAlive(s)) if (s.P[p].takeoff || ['ESP', 'OTT', 'RUS'].includes(p)) out.push([p, AH.strength(s, p)]);
    for (const [p, st] of Object.entries(AH.MINOR_STRENGTH)) if (s.held(p) && p !== 'EGY') out.push([p, st]);
    if (s.oid('EGY') === 'EGY') out.push(['EGY', AH.MINOR_STRENGTH.EGY]);
    return out;
  };
  const claimable = (s) => Object.keys(AH.REGION_OF).filter((k) => ['LOCAL', 'NATIVE'].includes(s.oid(k)) || (k === 'EGY' && s.oid(k) === 'EGY' && s.y > 1870) || (s.oid(k) === 'QNG' && ['KOR', 'PRK', 'MNG'].includes(k)))
    .filter((k) => !(s.f['resisted_' + k] && s.y - s.f['resisted_' + k] < 12));
  const colonialTech = (y) => 0.08 + 0.92 * S((y - 1878) / 7);
  ev({ id: 'scramble', repeat: true, win: [1815, 1925], m: 6, place: 'leopoldville', kind: 'colonial', bg: true,
    p: (s) => Math.min(0.97, 0.04 + 0.95 * colonialTech(s.y)) * (claimable(s).length ? 1 : 0),
    title: 'Empire-building',
    fx: (s) => {
      const targets = claimable(s);
      const n = 1 + Math.floor(colonialTech(s.y) * 2.5 * AH.hash(s.seed, 'scr:n', s.y));
      const done = [];
      const cols = colonizers(s);
      for (let j = 0; j < n && targets.length; j++) {
        const ti = s.pick('scr:t' + j, targets.map((k) => (AH.REGION_OF[k] === 'CAS' ? 2 : 1)));
        const k = targets.splice(ti, 1)[0];
        const r = AH.REGION_OF[k];
        const wts = cols.map(([p, st]) => ((AH.AFFINITY[p] || {})[r] || 0) * Math.sqrt(st));
        const ci = s.pick('scr:c' + j, wts);
        if (ci < 0) continue;
        const p = cols[ci][0];
        // Rival claimants in the same region grate on each other.
        const second = cols.filter((c, idx) => idx !== ci && ((AH.AFFINITY[c[0]] || {})[r] || 0) > 2).map((c) => c[0]);
        for (const q of second) if (AH.P_OK(s, q)) AH.addTension(s, p, q, 0.02);
        if (AH.hash(s.seed, 'scr:res' + k, s.y) < (AH.RESIST[k] || 0.08)) {
          s.f['resisted_' + k] = s.y;
          const hero = s.fig('resist:' + k, { ETH: 'am', AFG: 'fa', THA: 'vi', KOR: 'ko', PRK: 'ko' }[k] || AH.REGION_CULTURE[r] || 'yo', 'Leader of resistance to colonial conquest', '');
          done.push(`${AH.KEY_NAMES[k]} beats off ${nm(s, p)} under ${hero}`);
          if (s.P[p]) s.P[p].stab = clamp(s.P[p].stab - 0.03);
          continue;
        }
        s.own(k, p === 'EGY' ? 'EGY:Egyptian Sudan' : p);
        if (k === 'COCHINCHINA' || k === 'ANNAM_S' || k === 'VNM') s.own(AH.VNM_ALL, p);
        if (k === 'KOR' || k === 'PRK') s.own(['KOR', 'PRK'], p);
        done.push(`${nm(s, p)} takes ${AH.KEY_NAMES[k] || AH.GROUP_LABEL[k] || k}`);
        s.cur.place = AH.KEY_PLACE[k] || s.cur.place;
      }
      if (!done.length) { s.cur.cancel = true; return; }
      s.cur.title = done.length === 1 ? done[0][0].toUpperCase() + done[0].slice(1) : 'Empire-building: ' + done[0];
      s.cur.text = done.map((d) => d[0].toUpperCase() + d.slice(1) + '.').join(' ');
    } });
  AH.P_OK = (s, p) => alive(s, p);

  // ---------------------------------------------------------------- decolonization
  const colonyList = (s) => AH.COLONY_LIST.filter((k) => k in s.owners && !['LOCAL', 'NATIVE', 'MEX', 'CUB', 'CAF', 'HAI', 'DOM', 'IND', 'PAK', 'IDN'].includes(s.oid(k)) && !['BENGAL', 'MADRAS', 'MARATHA', 'PUNJAB', 'PUNJAB_PK', 'ASSAM', 'SINDH', 'KALAT', 'KASHMIR', 'KASHMIR_PK', 'BGD'].includes(k)
    && !(AH.CORE[s.oid(k)] || []).includes(k) && !['BLZ'].includes(k));
  ev({ id: 'india', win: [1905, 1980], m: 8, place: 'delhi', kind: 'politics', major: true,
    when: (s) => s.oid('BENGAL') === 'GBR',
    p: (s) => 0.4 * S(10 * (s.C.INDIANS.griev - 0.5)) + 0.3 * S(10 * (s.v.decol - 0.6)),
    title: 'India wins independence',
    text: (s) => `${s.fig('india:leader', 'hi', 'Leader of Indian independence', 'IND')}'s mass non-cooperation, fed by famine and by exclusion from the civil service, makes the Raj ungovernable (grievance ${s.C.INDIANS.griev.toFixed(2)}).`,
    outcomes: [
      { title: 'Independence and partition', w: 0.55, text: 'The subcontinent is divided along religious lines, amid mass killing and flight.',
        fx: (s) => { s.own(['BENGAL', 'MADRAS', 'MARATHA', 'PUNJAB', 'ASSAM', 'KASHMIR', 'SIKKIM', 'GOA', 'PONDICHERRY'].filter((k) => s.oid(k) === 'GBR' || k === 'KASHMIR'), 'IND'); s.own(['PUNJAB_PK', 'SINDH', 'KALAT', 'KASHMIR_PK', 'BGD'].filter((k) => s.oid(k) === 'GBR'), 'PAK'); s.add('decol', 0.1); } },
      { title: 'A united, federal India', w: 0.45, text: 'A loose federation with strong provinces keeps the subcontinent together.',
        fx: (s) => { s.own(['BENGAL', 'MADRAS', 'MARATHA', 'PUNJAB', 'ASSAM', 'KASHMIR', 'SIKKIM', 'PUNJAB_PK', 'SINDH', 'KALAT', 'KASHMIR_PK', 'BGD'].filter((k) => s.oid(k) === 'GBR' || k.startsWith('KASHMIR')), 'IND'); s.add('decol', 0.1); } },
    ] });

  // ---------------------------------------------------------------- China and Japan
  ev({ id: 'china_rebellion', win: [1845, 1880], m: 3, place: 'nanjing', kind: 'revolt', major: true,
    when: (s) => s.oid('JIANGNAN') === 'QNG',
    p: (s) => 0.02 + 0.1 * Math.max(0, 0.55 - s.P.QNG.stab),
    title: 'A great rebellion in southern China',
    text: (s) => `${s.fig('china:prophet', 'zh', 'Prophet-king of a southern Chinese rebellion', '')}, a failed examination candidate who preaches a new faith, raises an army of the poor and takes Nanjing.`,
    fx: (s) => { s.own('JIANGNAN', `LOCAL:Heavenly Kingdom of ${s.fig('china:prophet', 'zh').split(' ')[0]}`); s.P.QNG.stab = clamp(s.P.QNG.stab - 0.2); s.after(5 + Math.floor(AH.hash(s.seed, 'tp', s.y) * 10), 'china_rebellion_end'); } });
  ev({ id: 'china_rebellion_end', sched: true, m: 7, place: 'nanjing', kind: 'war', title: 'The rebellion in the south ends',
    outcomes: [
      { title: 'The dynasty retakes Nanjing', w: 0.8, text: 'A provincial army retakes the rebel capital; tens of millions have died.', fx: (s) => { s.own('JIANGNAN', 'QNG'); s.P.QNG.stab = clamp(s.P.QNG.stab + 0.05); } },
      { title: 'The rebels found a new dynasty', w: 0.2, text: 'The rebel armies take Beijing. The new dynasty keeps the old empire, and the old problems.',
        fx: (s) => { s.own(AH.CHINA_ALL.filter((k) => s.oid(k) === 'QNG' || k === 'JIANGNAN'), 'QNG'); s.name('QNG', 'Great Heavenly Dynasty'); AH.newLeader(s, 'QNG'); } },
    ] });
  ev({ id: 'china_revolution', win: [1880, 1960], m: 10, place: 'beijing', kind: 'revolt', major: true,
    when: (s) => alive(s, 'QNG') && (s.P.QNG.gov === 'monarchy'),
    p: (s) => 0.01 + 0.2 * Math.max(0, 0.45 - s.P.QNG.stab) + (recent(s, 'QNG', 3) ? 0.2 : 0),
    title: 'The Chinese empire falls',
    text: (s) => `An army mutiny in the Yangtze valley becomes a national revolution. ${s.fig('china:republican', 'zh', 'Founder of the Chinese Republic', 'QNG')} proclaims a republic.`,
    fx: (s) => { AH.setGov(s, 'QNG', 'republic', 'Republic of China'); s.set('china_republic'); s.P.QNG.earliest = s.y + 5; AH.breakUp(s, 'QNG'); s.P.QNG.stab = 0.3; } });

  ev({ id: 'japan_reform', win: [1854, 1910], m: 1, place: 'tokyo', kind: 'politics', major: true,
    when: (s) => s.f.japan_opened !== undefined || s.fired.japan_opened,
    p: 0.12,
    title: 'Restoration in Japan',
    text: (s) => `Young samurai led by ${s.fig('japan:reformer', 'ja', 'Leader of the Japanese restoration', 'JPN')} overthrow the shogunate in the Emperor's name and set out to catch up with the West.`,
    fx: (s) => { s.set('japan_reform'); s.P.JPN.earliest = s.y; s.name('JPN', 'Empire of Japan'); s.P.JPN.stab = 0.7; } });

  // ---------------------------------------------------------------- the settler dominions
  ev({ id: 'australia', win: [1885, 1915], m: 1, place: 'sydney', kind: 'politics', p: 0.1, bg: true,
    title: 'The Australian colonies federate', fx: (s) => s.own('AUS', 'GBR:Commonwealth of Australia') });
  ev({ id: 'boer_war', win: [1870, 1915], m: 10, place: 'pretoria', kind: 'war',
    when: (s) => s.oid('CAPE') === 'GBR' && ['TRANSVAAL', 'ORANGE'].some((k) => s.oid(k) === 'LOCAL'),
    p: (s) => 0.02 + (s.y > 1885 ? 0.06 : 0),
    title: (s) => `War with the Boer republics`,
    text: (s) => `Gold on the Witwatersrand draws Britain into war with the Boers. ${s.fig('boer:general', 'nl', 'Boer commando general', '')}'s commandos fight on for two years.`,
    outcomes: [
      { title: 'Britain annexes the republics', w: 0.8, fx: (s) => { s.own(['TRANSVAAL', 'ORANGE', 'NATAL', 'CAPE'], 'GBR:Union of South Africa'); } },
      { title: 'The Boers keep their independence', w: 0.2, fx: (s) => AH.addTension(s, 'GBR', germany(s), 0.05) },
    ] });
  ev({ id: 'sa_republic', win: [1945, 1995], m: 5, place: 'capetown', kind: 'politics',
    when: (s) => s.owner('CAPE').startsWith('GBR'), p: 0.06,
    title: 'South Africa leaves the empire',
    fx: (s) => s.own(['CAPE', 'NATAL', 'ORANGE', 'TRANSVAAL'].filter((k) => s.oid(k) === 'GBR'), L('Republic of South Africa')) });

  // ---------------------------------------------------------------- science and the bomb
  const INVENTIONS = [
    ['steel', 1850, 'a cheap process for making steel', 1.4], ['telephone', 1868, 'the telephone', 1.8], ['light', 1872, 'the incandescent electric lamp', 1.9],
    ['auto', 1880, 'the motor car', 2.1], ['radio', 1890, 'wireless telegraphy', 2.3], ['flight', 1896, 'the powered aeroplane', 2.5], ['antibiotic', 1918, 'the first antibiotic', 3.2],
    ['tv', 1922, 'television', 3.4], ['jet', 1930, 'the jet engine', 3.8], ['fission', 1934, 'nuclear fission', 4.0], ['computer', 1938, 'the electronic computer', 4.2],
    ['transistor', 1945, 'the transistor', 5], ['satellite', 1952, 'the first artificial satellite', 5.5], ['moon', 1962, 'a crewed landing on the Moon', 7],
    ['chip', 1956, 'the integrated circuit', 6], ['network', 1966, 'a packet-switched computer network', 7.5], ['mobile', 1975, 'the mobile telephone', 9], ['web', 1985, 'a worldwide hypertext web', 12],
  ];
  const nextInvention = (s) => INVENTIONS.find(([id, y0]) => !s.f['inv_' + id] && s.y >= y0);
  ev({ id: 'invention', repeat: true, win: [1850, 2000], m: 5, place: 'london', kind: 'econ',
    p: (s) => { const n = nextInvention(s); if (!n) return 0; const lead = Math.max(...AH.majorsAlive(s).map((p) => s.P[p].prod)); return lead >= n[3] ? 0.35 : 0.05; },
    title: 'Invention',
    fx: (s) => {
      const n = nextInvention(s);
      if (!n) { s.cur.cancel = true; return; }
      const [id, , what] = n;
      const ps = AH.majorsAlive(s).filter((p) => s.P[p].takeoff);
      const i = s.pick('inv:' + id, ps.map((p) => Math.pow(s.P[p].prod, 3) * Math.sqrt(s.P[p].pop)));
      if (i < 0) { s.cur.cancel = true; return; }
      const p = ps[i];
      s.f['inv_' + id] = p;
      const who = s.fig('inventor:' + id, cult(p), `Inventor of ${what}`, p);
      s.cur.place = AH.CAPITAL[p];
      s.cur.major = ['flight', 'fission', 'moon', 'web'].includes(id);
      s.cur.title = id === 'moon' ? `${nm(s, p)} lands people on the Moon` : `${who} invents ${what}`;
      s.cur.text = id === 'moon' ? `The mission, led by ${who}, ends a space race.` : id === 'fission' ? `${who}'s laboratory in ${nm(s, p)} splits the atom. Within a decade, the first atomic bomb.` : `${who}, working in ${nm(s, p)}, demonstrates ${what}.`;
      if (id === 'fission') { s.f.nukes = [p]; }
    } });
  ev({ id: 'bomb', repeat: true, win: [1940, 2000], m: 8, place: 'moscow', kind: 'econ',
    when: (s) => s.f.nukes && !s.f.world_war,
    p: (s) => AH.majorsAlive(s).filter((p) => !s.f.nukes.includes(p) && s.P[p].takeoff && s.P[p].prod > 2.5).length ? 0.12 : 0,
    title: 'The atomic bomb spreads',
    fx: (s) => {
      const ps = AH.majorsAlive(s).filter((p) => !s.f.nukes.includes(p) && s.P[p].takeoff && s.P[p].prod > 2.5);
      if (!ps.length) { s.cur.cancel = true; return; }
      const p = ps[s.pick('bomb', ps.map((q) => AH.strength(s, q)))];
      s.f.nukes = s.f.nukes.concat([p]);
      if (s.f.nukes.length >= 2) s.set('nuclear_peace');
      s.cur.place = AH.CAPITAL[p];
      s.cur.title = `${nm(s, p)} tests an atomic bomb`;
      s.cur.text = s.f.nukes.length === 2 ? 'With two nuclear powers, a general war now means mutual destruction. An armed peace begins.' : `${nm(s, p)} becomes the world's ${['', '', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'][s.f.nukes.length] || 'latest'} nuclear power.`;
    } });

  ev({ id: 'crash', win: [1905, 1960], m: 10, place: 'newyork', kind: 'econ', major: true,
    p: 0.03,
    title: (s) => `The Great Crash of ${s.y}`,
    text: 'A stock-market collapse becomes a worldwide depression. Trade halves; unemployment soars; extremists gain.',
    fx: (s) => { s.f.crash_y = s.y; for (const p of AH.majorsAlive(s)) { s.P[p].prod *= 0.9; s.P[p].stab = clamp(s.P[p].stab - 0.12); } s.add('mx_fisc', -0.12); s.add('mx_stab', -0.05); } });
})(globalThis.AH = globalThis.AH || {});
