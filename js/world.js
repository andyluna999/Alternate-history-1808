// The great-power model. From the mid-19th century the world outside the
// Americas is driven by these numbers, not by a script:
//   pop    population, millions
//   prod   output per head (thousands of 1990 dollars; Britain 1808 ≈ 1.7)
//   mil    militarization 0–1, stab stability 0–1
//   takeoff  year its industrial revolution began (null: not yet)
// Military strength ≈ pop^0.6 · prod^2.5, so industry beats numbers, and
// oil adds a bonus after 1905. Wars, alliances, revolutions, colonization and
// decolonization all read these values, and all write them back.
(function (AH) {
  const S = (x) => 1 / (1 + Math.exp(-x));
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));

  // [pop, prod, stab, mil, gov, monarch title, earliest takeoff, pop growth]
  const INIT = {
    GBR: [18, 1.7, 0.7, 0.5, 'monarchy', 'King', 1780, 0.002],
    FRA: [29, 1.1, 0.6, 0.7, 'empire', 'Emperor', 1825, 0.0005],
    PRU: [5, 1.0, 0.5, 0.6, 'monarchy', 'King', 1835, 0.004],
    AUT: [21, 1.0, 0.5, 0.5, 'monarchy', 'Emperor', 1850, 0.003],
    RUS: [40, 0.7, 0.6, 0.5, 'monarchy', 'Tsar', 1865, 0.008],
    OTT: [24, 0.7, 0.4, 0.4, 'monarchy', 'Sultan', 1885, 0.004],
    ESP: [11, 1.0, 0.3, 0.3, 'monarchy', 'King', 1850, 0.004],
    SAR: [4, 1.0, 0.5, 0.3, 'monarchy', 'King', 1850, 0.004],
    USA: [7, 1.25, 0.7, 0.1, 'republic', 'President', 1815, 0],
    MEX: [7.1, 0.7, 0.55, 0.35, 'junta', 'President of the Junta', 1830, 0],
    JPN: [30, 0.67, 0.7, 0.2, 'monarchy', 'Emperor', 9999, 0.002],
    QNG: [350, 0.6, 0.5, 0.2, 'monarchy', 'Emperor', 9999, 0.004],
  };
  // How much faster population grows during the demographic transition.
  const TRANSITION = { FRA: 0.003, GBR: 0.007 };
  // Long-run stability each power drifts toward: the old empires are decaying.
  const STAB_TARGET = { OTT: 0.42, QNG: 0.42, ESP: 0.5 };
  AH.MAJORS = Object.keys(INIT);

  // Rulers alive in 1808, with the year their rule ends. After them, rulers are generated.
  const HIST = {
    GBR: [['George III', 1820], ['George IV', 1830], ['William IV', 1837]],
    FRA: [['Napoleon I', 1860]], // how his reign ends is decided by the Napoleonic events
    PRU: [['Frederick William III', 1840], ['Frederick William IV', 1858], ['Wilhelm I', 1882]],
    AUT: [['Francis I', 1835], ['Ferdinand I', 1860]],
    RUS: [['Alexander I', 1825], ['Nicholas I', 1855]],
    OTT: [['Mahmud II', 1839]],
    ESP: [['Ferdinand VII', 1833]],
    SAR: [['Victor Emmanuel I', 1821], ['Charles Felix', 1831], ['Charles Albert', 1849]],
    USA: [['Thomas Jefferson', 1809], ['James Madison', 1817], ['James Monroe', 1825]],
    MEX: [['José de Iturrigaray', 1815]],
    JPN: [['Kōkaku', 1817], ['Ninkō', 1846], ['Kōmei', 1867]],
    QNG: [['the Jiaqing Emperor', 1820], ['the Daoguang Emperor', 1850]],
  };
  const US_CONTENDERS = [['John Quincy Adams', 1767], ['Andrew Jackson', 1767], ['Henry Clay', 1777], ['John C. Calhoun', 1782], ['William H. Crawford', 1772], ['Daniel Webster', 1782],
    ['Martin Van Buren', 1782], ['William Henry Harrison', 1773], ['John Tyler', 1790], ['James K. Polk', 1795], ['Lewis Cass', 1782], ['Zachary Taylor', 1784], ['Winfield Scott', 1786],
    ['Thomas Hart Benton', 1782], ['James Buchanan', 1791], ['Millard Fillmore', 1800], ['Sam Houston', 1793], ['William Seward', 1801], ['Stephen Douglas', 1813]].filter((c) => c[1] <= 1808);
  const REGNAL = {
    GBR: ['Charlotte', 'Frederick', 'Edward', 'Augusta', 'Albert', 'George', 'William', 'Mary', 'Alfred', 'Henry'],
    FRA: ['Louis', 'Henri', 'Charles', 'Philippe', 'Napoléon'],
    PRU: ['Frederick William', 'Wilhelm', 'Frederick', 'Albert', 'Louise'],
    AUT: ['Francis', 'Ferdinand', 'Joseph', 'Maximilian', 'Rudolf', 'Maria Theresa'],
    RUS: ['Alexander', 'Nicholas', 'Konstantin', 'Mikhail', 'Paul', 'Catherine', 'Elizabeth'],
    OTT: ['Abdülaziz', 'Murad', 'Mehmed', 'Selim', 'Ahmed', 'Osman', 'Mustafa'],
    ESP: ['Carlos', 'Isabel', 'Fernando', 'Alfonso', 'Luisa'],
    SAR: ['Victor Amadeus', 'Charles', 'Umberto', 'Emmanuel', 'Margherita'],
    MEX: ['Francisco', 'Fernando', 'Carlos', 'Luisa', 'Isabel', 'Agustín', 'Felipe', 'María', 'Alfonso', 'Victoria'],
    JPN: ['Kōsei', 'Shōan', 'Meitoku', 'Taishin', 'Kenmei', 'Hōkō', 'Genchō'],
    QNG: ['Zhaoming', 'Yongtai', 'Guangde', 'Xiande', 'Tongxi', 'Chengwu'],
  };
  REGNAL.ITA = REGNAL.SAR; REGNAL.GER = REGNAL.PRU;
  const FEMALE = new Set(['Charlotte', 'Augusta', 'Mary', 'Louise', 'Maria Theresa', 'Catherine', 'Elizabeth', 'Isabel', 'Luisa', 'Margherita', 'María', 'Victoria']);
  const REGNAL_START = { GBR: { George: 4, William: 4, Edward: 6, Henry: 8, Mary: 2 }, FRA: { Louis: 18, Charles: 10, Henri: 4, Philippe: 6, 'Napoléon': 1 },
    PRU: { 'Frederick William': 4, Wilhelm: 1, Frederick: 2 }, AUT: { Francis: 1, Ferdinand: 1, Joseph: 2 }, RUS: { Alexander: 1, Nicholas: 1, Paul: 1, Catherine: 2, Elizabeth: 1 },
    OTT: { Mehmed: 4, Selim: 3, Ahmed: 3, Osman: 3, Mustafa: 4, Murad: 4 }, ESP: { Carlos: 4, Fernando: 7, Alfonso: 11, Isabel: 1 }, SAR: { Charles: 1, 'Victor Amadeus': 3 }, MEX: { Francisco: 1 } };
  REGNAL_START.GER = REGNAL_START.PRU; REGNAL_START.ITA = REGNAL_START.SAR;
  const ADJ = { GBR: 'British', FRA: 'French', PRU: 'Prussian', GER: 'German', AUT: 'Austrian', RUS: 'Russian', OTT: 'Ottoman', ESP: 'Spanish', SAR: 'Sardinian', ITA: 'Italian', USA: 'American', MEX: 'Mexican', JPN: 'Japanese', QNG: 'Chinese' };
  AH.ADJ = ADJ;

  const roman = (n) => { const r = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let o = ''; for (const [v, c] of r) while (n >= v) { o += c; n -= v; } return o; };

  AH.initWorld = function (s) {
    s.P = {};
    for (const [p, a] of Object.entries(INIT)) {
      s.P[p] = { pop: a[0], prod: a[1], stab: a[2], mil: a[3], gov: a[4], mtitle: a[5], earliest: a[6], growth: a[7],
        takeoff: p === 'GBR' ? 1780 : null, hist: (HIST[p] || []).slice(), regnal: Object.assign({}, REGNAL_START[p] || {}), leader: null, dead: false };
    }
    s.T = {
      'FRA|PRU': 0.25, 'FRA|GBR': 0.45, 'GBR|RUS': 0.3, 'OTT|RUS': 0.6, 'AUT|PRU': 0.45, 'AUT|RUS': 0.3, 'AUT|SAR': 0.5, 'AUT|FRA': 0.3,
      'GBR|USA': 0.3, 'MEX|USA': 0.3, 'JPN|QNG': 0.2, 'JPN|RUS': 0.1, 'QNG|RUS': 0.2, 'ESP|MEX': 0.5, 'FRA|SAR': 0.1, 'GBR|QNG': 0.2,
    };
    s.rulers = {};
    s.people = [];
    s.figs = {};
    s.warCount = 0;
  };

  const key2 = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
  AH.tension = (s, a, b) => s.T[key2(a, b)] || 0;
  AH.addTension = (s, a, b, d) => { const k = key2(a, b); s.T[k] = clamp((s.T[k] || 0) + d); };
  AH.alive = (s, p) => !!(s.P[p] && !s.P[p].dead);
  AH.majorsAlive = (s) => Object.keys(s.P).filter((p) => AH.alive(s, p));

  AH.hasOil = function (s, p) {
    if (s.y < 1905) return false;
    if (p === 'MEX') return !!s.f.mx_oil;
    if (p === 'USA') return s.oid('US-TX') === 'USA' || s.oid('US-CA') === 'USA' || s.oid('US-OK') === 'USA';
    if (p === 'RUS') return s.oid('AZE') === 'RUS' || s.oid('RUS') === 'RUS';
    if (p === 'GBR') return ['IRQ', 'KWT', 'IRN'].some((k) => s.oid(k) === 'GBR') || (s.v.gb_mx > 0.5 && !!s.f.mx_oil);
    return false;
  };
  AH.strength = function (s, p) {
    const P = s.P[p];
    if (!P || P.dead) return 0;
    return Math.pow(P.pop, 0.6) * Math.pow(P.prod, 2.5) * (0.5 + P.mil) * (0.5 + 0.5 * P.stab) * (AH.hasOil(s, p) ? 1.2 : 1);
  };
  AH.gdp = (s, p) => (AH.alive(s, p) ? s.P[p].pop * s.P[p].prod : 0);

  // Display name for a power in this history.
  AH.powerName = (s, p) => (s.names && s.names[p]) || (AH.POWERS[p] ? AH.POWERS[p].name : p);

  // ---- leaders
  function title(s, p, name) {
    const P = s.P[p];
    const f = FEMALE.has(name.split(' ')[0]);
    if (P.gov === 'monarchy' || P.gov === 'empire') {
      const t = P.gov === 'empire' ? 'Emperor' : P.mtitle;
      if (!f) return t;
      return { King: 'Queen', Emperor: 'Empress', Tsar: 'Tsarina', Sultan: 'Sultana' }[t] || t;
    }
    return { republic: 'President', communist: 'Chairman', dictatorship: 'Marshal', junta: 'President of the Junta', regency: 'Regent' }[P.gov] || 'Leader';
  }
  AH.newLeader = function (s, p, forcedName) {
    const P = s.P[p];
    if (!P || P.dead) return;
    let name, until;
    const monarchy = P.gov === 'monarchy' || P.gov === 'empire';
    const tag = `leader:${p}:${s.y}:${(s.rulers[p] || []).length}`;
    if (forcedName) { name = forcedName[0]; until = forcedName[1]; }
    else if (p === 'USA' && s.y < 1861 && !P.hist.length) {
      // Presidents after Monroe come from politicians alive in 1808; who wins is contingent.
      const used = new Set((s.rulers.USA || []).map((r) => r.name));
      const pool = US_CONTENDERS.filter(([n, b]) => !used.has(n) && s.y - b >= 35 && s.y - b <= 70);
      const pick = pool.length ? pool[Math.floor(AH.hash(s.seed, tag, 3) * pool.length)] : [AH.makeName(s, tag, 'en')];
      name = pick[0];
      until = s.y + (AH.hash(s.seed, tag, 4) < 0.45 ? 8 : 4);
    }
    else if (P.hist.length && P.hist[0][1] > s.y) { [name, until] = P.hist.shift(); }
    else if (monarchy && REGNAL[p]) {
      const base = REGNAL[p][Math.floor(AH.hash(s.seed, tag, 3) * REGNAL[p].length)];
      P.regnal[base] = (P.regnal[base] || 0) + 1;
      name = p === 'QNG' ? `the ${base} Emperor` : p === 'JPN' ? base : `${base} ${roman(P.regnal[base])}`;
      until = s.y + 8 + Math.floor(AH.hash(s.seed, tag, 4) * 28);
    } else {
      const cult = AH.CULTURE[p] || 'en';
      name = AH.makeName(s, tag, cult);
      const span = { republic: [4, 8], communist: [8, 26], dictatorship: [6, 24], junta: [3, 8], regency: [3, 10] }[P.gov] || [4, 10];
      until = s.y + span[0] + Math.floor(AH.hash(s.seed, tag, 4) * (span[1] - span[0] + 1));
    }
    P.hist = P.hist.filter((h) => h[1] > s.y);
    const t = title(s, p, name);
    P.leader = { name, title: t, from: s.y, until };
    (s.rulers[p] = s.rulers[p] || []).push({ name, title: t, from: s.y, to: null });
    const list = s.rulers[p];
    if (list.length > 1) list[list.length - 2].to = s.y;
  };
  AH.leaderOf = (s, p) => (s.P[p] && s.P[p].leader ? `${s.P[p].leader.title} ${s.P[p].leader.name}` : AH.powerName(s, p));

  // Set a power's government; installs a new leader.
  AH.setGov = function (s, p, gov, name) {
    const P = s.P[p];
    if (!P) return;
    P.gov = gov;
    P.hist = [];
    if (name) s.name(p, name);
    AH.newLeader(s, p);
  };

  // ---- yearly drift
  AH.worldDrift = function (s) {
    const y = s.y;
    const lead = Math.max(...AH.majorsAlive(s).map((p) => s.P[p].prod));
    for (const p of AH.majorsAlive(s)) {
      const P = s.P[p];
      // Mexico and the U.S. take their populations from the Americas model.
      if (p === 'MEX') P.pop = s.v.mx_pop + (s.oid('GTM') === 'MEX' ? s.v.mx_pop * 0.14 : 0);
      else if (p === 'USA') P.pop = s.v.us_pop;
      else {
        const age = P.takeoff ? y - P.takeoff : -1;
        const tm = TRANSITION[p] || 0.007;
        const trans = age < 0 ? 0 : age < 70 ? tm : age < 120 ? tm - (age - 70) * (tm - 0.001) / 50 : 0.001;
        P.pop *= 1 + P.growth + trans + (y > 1945 && !P.takeoff ? 0.012 : 0) - (P.atWar ? 0.004 : 0);
      }
      // Output per head: slow before takeoff; after, growth with catch-up.
      if (P.takeoff) {
        // Historical frontier growth: ~1.3%/yr to 1950, a postwar golden age, then ~2%.
        const catchup = clamp((lead / P.prod - 1) * 0.3, 0, 1);
        const era = y >= 1950 && y < 1974 ? 0.015 : y >= 1974 ? 0.007 : 0;
        // Mexico's haciendas and thin schooling hold it back until land reform and democracy.
        const inst = p === 'MEX' ? 0.75 + (s.f.land_reform ? 0.1 : 0) + (s.f.mx_democracy ? 0.1 : 0) : 1;
        // America's frontier and scale; Britain's early-starter slowdown after 1870.
        const special = p === 'USA' && y < 1930 ? 0.004 : p === 'GBR' && y > 1870 && y < 1980 ? -0.003 : 0;
        const g = (0.007 + 0.009 * P.stab + era) * (1 + catchup) * inst + special + (AH.hasOil(s, p) ? 0.002 : 0) - (P.atWar ? 0.025 : 0);
        P.prod *= 1 + g;
      } else P.prod *= 1.002;
      if (p === 'MEX') P.stab = s.v.mx_stab; else P.stab = clamp(P.stab + 0.04 * ((STAB_TARGET[p] || 0.6) - P.stab));
      P.mil = clamp(P.mil + 0.03 * (0.3 - P.mil));
      // Leaders.
      if (!P.leader || y >= P.leader.until) AH.newLeader(s, p);
    }
    // Mexico's government follows the Americas model's flags.
    if (s.P.MEX && !s.P.MEX.dead) {
      const n = s.names.MEX || '';
      const gov = s.f.republic || /Republic|United Mexican/.test(n) ? 'republic' : /Junta/.test(n) ? 'junta' : /Regency/.test(n) ? 'regency' : /Empire/.test(n) ? 'empire' : 'monarchy';
      if (gov !== s.P.MEX.gov) {
        s.P.MEX.gov = gov;
        if (s.f.bourbon_king && !s.f.mx_king_set) { s.f.mx_king_set = true; s.P.MEX.hist = []; AH.newLeader(s, 'MEX', ['Francisco I', 1861]); s.P.MEX.regnal.Francisco = 1; }
        else if (s.f.creole_emperor && !s.f.mx_king_set) { s.f.mx_king_set = true; s.P.MEX.hist = []; AH.newLeader(s, 'MEX', ['Agustín I', 1832]); s.P.MEX.regnal['Agustín'] = 1; }
        else { s.P.MEX.hist = []; AH.newLeader(s, 'MEX'); }
      }
    }
    // Rivalries relax toward a structural baseline: lost provinces, shared
    // borders, naval races and ideology keep them from ever reaching zero.
    // (Recomputed every other year, with a double step, to save time.)
    const ms = AH.majorsAlive(s);
    if (y % 2 === 0) for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) {
      const a = ms[i], b = ms[j], k = key2(a, b);
      const base = AH.baseTension(s, a, b);
      const cur = s.T[k] || 0;
      s.T[k] = clamp(cur + (cur > base ? 0.07 : 0.06) * (base - cur));
    }
    s.v.decol = clamp(s.v.decol + (y > 1900 ? 0.003 : 0));
    s.v.rev_wave = (s.v.rev_wave || 0) * 0.45;
  };

  // ---- rivalry baseline
  const NEIGH = new Set(['FRA|GER', 'FRA|PRU', 'GER|RUS', 'PRU|RUS', 'AUT|RUS', 'AUT|GER', 'AUT|PRU', 'AUT|ITA', 'AUT|SAR', 'FRA|ITA', 'FRA|SAR', 'OTT|RUS', 'AUT|OTT',
    'FRA|GBR', 'JPN|RUS', 'JPN|QNG', 'QNG|RUS', 'ESP|FRA', 'GBR|RUS', 'ITA|OTT', 'GBR|OTT']);
  // Nationalism and militarism rise after 1860, peak in the age of mass armies, then fade.
  const nationalism = (y) => (y < 1860 ? 0.3 : y < 1900 ? 0.3 + (y - 1860) * 0.012 : y < 1950 ? 0.8 : Math.max(0.3, 0.8 - (y - 1950) * 0.012));
  AH.democratic = (s, p) => { const P = s.P[p]; return !!P && (P.gov === 'republic' || (P.constitutional && P.gov === 'monarchy') || (p === 'GBR' && P.gov === 'monarchy')); };
  AH.baseTension = function (s, a, b) {
    let t = 0.05;
    const k = key2(a, b);
    if (NEIGH.has(k)) t += 0.12 * nationalism(s.y);
    // Irredenta: each side holds land the other claims.
    const irr = (w, l) => (CLAIMS[w + '>' + l] || []).some((x) => s.oid(x) === l);
    if (irr(a, b)) t += 0.14;
    if (irr(b, a)) t += 0.14;
    // Naval rivalry: Britain against the strongest industrial challenger.
    if (a === 'GBR' || b === 'GBR') {
      const o = a === 'GBR' ? b : a;
      if (s.P[o].takeoff) t += 0.35 * clamp(AH.strength(s, o) / (AH.strength(s, 'GBR') + 1e-9) - 0.35) * nationalism(s.y);
    }
    // Democracies rarely fight each other; Britain and America share language and trade.
    if (s.y > 1900 && AH.democratic(s, a) && AH.democratic(s, b)) t -= 0.2;
    if (k === 'GBR|USA' && s.y > 1870) t -= 0.15;
    const ca = s.P[a].gov === 'communist', cb = s.P[b].gov === 'communist';
    if (ca !== cb) t += 0.3;
    if ((s.P[a].gov === 'dictatorship' && s.f['beaten_' + a]) || (s.P[b].gov === 'dictatorship' && s.f['beaten_' + b])) t += 0.15;
    return clamp(t);
  };

  // ---- war
  // Probability that side A beats side B.
  AH.warOdds = function (s, A, B) {
    const sa = A.reduce((t, p) => t + AH.strength(s, p), 0), sb = B.reduce((t, p) => t + AH.strength(s, p), 0);
    return S(1.4 * Math.log((sa + 1e-6) / (sb + 1e-6)));
  };

  // Who gains what when `w` beats `l`. Keys go to w unless mapped to another owner.
  const CLAIMS = {
    'FRA>GER': ['ALSACE'], 'FRA>PRU': ['ALSACE', 'RHINE_L'], 'GER>FRA': ['ALSACE'], 'PRU>FRA': ['ALSACE'],
    'GER>RUS': ['WARSAW', 'W_GALICIA', 'EST', 'LVA', 'LTU', 'VOLHYNIA'], 'PRU>RUS': ['WARSAW'], 'AUT>RUS': ['W_GALICIA', 'VOLHYNIA'],
    'RUS>GER': ['E_PRUSSIA', 'KONIGSBERG', 'POSEN'], 'RUS>PRU': ['POSEN', 'E_PRUSSIA'], 'RUS>AUT': ['GALICIA', 'GALICIA_W', 'BUKOVINA'],
    'RUS>OTT': ['DOBRUJA', 'ROU', 'BGR', 'E_RUMELIA'], 'GBR>OTT': ['EGY', 'CYP', 'IRQ', 'ISR', 'PSX', 'JOR', 'KWT'], 'FRA>OTT': ['SYR', 'LBN', 'TUN'],
    'ITA>OTT': ['LBY'], 'ITA>AUT': ['IT_VEN', 'IT_LOMB', 'IT_TREN', 'IT_TRIESTE'], 'SAR>AUT': ['IT_LOMB', 'IT_VEN'], 'FRA>AUT': ['IT_LOMB'],
    'PRU>AUT': ['HOLSTEIN'], 'AUT>PRU': ['SAXONY', 'UPPER_SIL'], 'PRU>DEN': ['HOLSTEIN'],
    'JPN>QNG': ['TWN', 'KOR', 'PRK', 'MANCHURIA'], 'JPN>RUS': ['SAKHALIN', 'MANCHURIA', 'KOR', 'PRK', 'AMUR'], 'RUS>JPN': ['SAKHALIN', 'KOR', 'PRK'],
    'RUS>QNG': ['MANCHURIA', 'MNG', 'XINJIANG'], 'GBR>QNG': ['HKG'], 'FRA>QNG': ['SOUTH_COAST'], 'USA>JPN': ['TWN'], 'QNG>JPN': ['TWN', 'KOR', 'PRK', 'MANCHURIA'],
    'USA>MEX': ['US-CA', 'US-TX', 'GBASIN'], 'MEX>USA': ['US-TX', 'US-FL', 'US-AZ', 'US-OK'], 'USA>ESP': ['CUB', 'PRI', 'PHL'], 'MEX>ESP': ['CUB', 'PRI'],
    'GBR>USA': ['US-WA', 'US-ME'], 'USA>GBR': ['CA-BC', 'CA-ON'], 'GER>GBR': ['NGA', 'KEN', 'GHA'], 'GER>FRA+': ['CMR', 'CAF', 'GAB', 'COG'],
  };
  // Keys a power holds outside its homeland (colonies).
  AH.colonies = function (s, p) {
    const core = new Set(AH.CORE[p] || []);
    return Object.keys(s.owners).filter((k) => s.oid(k) === p && !core.has(k) && AH.COLONY_KEYS.has(k));
  };

  AH.makePeace = function (s, winners, losers, severity) {
    const moved = [];
    const liberated = (k, from) => {
      // Former subject nations re-emerge rather than passing to a new master.
      const rev = AH.SUCCESSOR[k];
      if (rev) { s.own(k, rev); moved.push(k); return true; }
      return false;
    };
    const wOrder = winners.slice().sort((a, b) => AH.strength(s, b) - AH.strength(s, a));
    for (const l of losers) {
      for (const w of wOrder) {
        const claims = (CLAIMS[w + '>' + l] || []).filter((k) => s.oid(k) === l || (l === 'GER' && s.oid(k) === 'GER'));
        for (const k of claims) {
          if (AH.hash(s.seed, 'claim' + k + w, s.y) > 0.35 + 0.6 * severity) continue;
          if (['ROU', 'BGR', 'E_RUMELIA', 'DOBRUJA', 'KOR', 'PRK'].includes(k) && w === 'RUS') { liberated(k, l) || s.own(k, w); continue; }
          if (['CUB', 'PHL'].includes(k)) { s.own(k, k === 'CUB' ? `CUB:Republic of Cuba (${AH.ADJ[w]}-backed)` : `LOCAL:Philippine Republic (${AH.ADJ[w]}-backed)`); moved.push(k); continue; }
          s.own(k, w); moved.push(k);
        }
      }
      // Colonies change hands in proportion to how badly the war went.
      for (const k of AH.colonies(s, l)) {
        if (AH.hash(s.seed, 'col' + k, s.y) > 0.25 * severity) continue;
        // Only winners with a navy and an interest in that region take it over.
        const region = AH.REGION_OF[k];
        const fit = wOrder.filter((w) => AH.alive(s, w) && s.P[w].takeoff && (region ? ((AH.AFFINITY[w] || {})[region] || 0) >= 1 : ['GBR', 'FRA', 'USA', 'MEX', 'ESP'].includes(w)));
        if (!fit.length) continue;
        const w = fit[Math.floor(AH.hash(s.seed, 'colw' + k, s.y) * fit.length)];
        s.own(k, w); moved.push(k);
      }
      const P = s.P[l];
      if (P) { P.stab = clamp(P.stab - 0.3 * severity); P.mil = clamp(P.mil - 0.2); s.f['beaten_' + l] = s.y; }
      // Revanche falls on the powers that actually took land.
      for (const w of winners) AH.addTension(s, w, l, moved.some((k) => s.oid(k) === w) ? 0.2 * severity : 0.05);
    }
    for (const w of winners) if (s.P[w]) s.P[w].stab = clamp(s.P[w].stab + 0.08);
    return moved;
  };

  // Break up a defeated multinational empire into successor states.
  AH.breakUp = function (s, p) {
    const plan = AH.BREAKUP[p];
    if (!plan) return [];
    const out = [];
    for (const [keys, owner] of plan(s)) {
      const ks = [].concat(keys).filter((k) => s.oid(k) === p);
      if (ks.length) { s.own(ks, owner); out.push(owner.split(':').pop()); }
    }
    return out;
  };

  // Keys that `w` claims and `l` holds.
  AH.claimsOn = (s, w, l) => (CLAIMS[w + '>' + l] || []).filter((k) => s.oid(k) === l);
})(globalThis.AH = globalThis.AH || {});
