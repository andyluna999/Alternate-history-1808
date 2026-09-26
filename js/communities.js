// Peoples: ethnic and national communities living under someone else's rule.
//
// Each community has three linked quantities:
//   hardship     economic distress: the ruler's relative poverty, war, depression, local shocks
//   segregation  exclusion by language, religion, law or race, set by regime type,
//                cultural distance and the ruler's own policy choices
//   mobilization national consciousness: spreads with schooling, cities and neighbors' success
// Grievance = mobilization × (hardship + segregation) / 2, reduced by autonomy.
// Unrest feeds back. It damages the local economy, raising hardship. It pushes
// rulers toward repression, raising segregation. It drains the ruler's stability.
// When grievance is high, a separatist crisis is played as a game between the
// movement and the state (js/actors.js).
(function (AH) {
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const L = (n) => 'LOCAL:' + n;

  // [id, people, keys, successor owner (string or fn), culture, awakening year, cultural distance, options]
  const DEFS = [
    // Europe
    ['POLES', 'Poles', ['WARSAW', 'W_GALICIA', 'POSEN', 'GALICIA_W', 'CORRIDOR', 'UPPER_SIL'], 'POL:Kingdom of Poland', 'pl', 1808, 0.7],
    ['GREEKS', 'Greeks', ['GR_OLD', 'GR_THESSALY', 'GR_NORTH', 'GR_CRETE', 'GR_IONIAN'], 'GRE', 'el', 1812, 0.8],
    ['SERBS', 'Serbs', ['SRB', 'SRB_SOUTH'], 'SRB:Principality of Serbia', 'sl', 1808, 0.8],
    ['ROMANIANS', 'Romanians', ['ROU', 'DOBRUJA', 'TRANSYLVANIA', 'BUKOVINA', 'MDA'], 'ROM:Romania', 'ro', 1825, 0.7],
    ['BULGARIANS', 'Bulgarians', ['BGR', 'E_RUMELIA', 'RHODOPE'], 'BUL:Bulgaria', 'sl', 1840, 0.8],
    ['ALBANIANS', 'Albanians', ['ALB', 'KOS'], L('Albania'), 'tr', 1870, 0.5],
    ['MACEDONIANS', 'Macedonians', ['MKD'], L('Macedonia'), 'sl', 1890, 0.5],
    ['SOUTH_SLAVS', 'Croats and Slovenes', ['HRV', 'CROATIA_S', 'DALMATIA', 'SVN'], 'YUG', 'sl', 1835, 0.5],
    ['BOSNIANS', 'Bosnians', ['BIH'], L('Bosnia'), 'sl', 1870, 0.6],
    ['CZECHS', 'Czechs', ['CZE'], 'CZS', 'sl', 1840, 0.5],
    ['SLOVAKS', 'Slovaks and Ruthenes', ['SVK', 'RUTHENIA'], 'CZS', 'sl', 1860, 0.5],
    ['HUNGARIANS', 'Hungarians', ['HUN', 'VOJVODINA'], L('Kingdom of Hungary'), 'hu', 1825, 0.45],
    ['ITALIANS', 'Italians under foreign rule', ['IT_LOMB', 'IT_VEN', 'IT_TREN', 'IT_TRIESTE', 'IT_PIED', 'IT_DUCHY', 'IT_ROMAGNA'], (s) => (AH.alive(s, 'ITA') ? 'ITA' : AH.alive(s, 'SAR') ? 'SAR' : L('Italian Republic')), 'it', 1808, 0.5, { foreignOnly: ['AUT', 'FRA', 'FRC', 'GER'] }],
    ['GERMANS', 'Germans under French rule', ['RHINE_L', 'BERG', 'MAGDEBURG', 'HANOVER', 'HESSE', 'SAXONY', 'MECKLENBURG', 'SOUTH_DE'], (s) => (AH.alive(s, 'GER') ? 'GER' : 'GDC:German states'), 'de', 1808, 0.5, { foreignOnly: ['FRA', 'FRC'] }],
    ['BELGIANS', 'Belgians', ['BEL', 'LUX'], 'BEL', 'fr', 1815, 0.45],
    ['IRISH', 'Irish', ['IRL'], L('Irish Republic'), 'en', 1808, 0.55],
    ['NORWEGIANS', 'Norwegians', ['NOR'], L('Norway'), 'sv', 1814, 0.25],
    ['FINNS', 'Finns', ['FIN', 'ALD'], L('Finland'), 'sv', 1850, 0.5],
    ['BALTS', 'Estonians, Latvians and Lithuanians', ['EST', 'LVA', 'LTU'], L('Baltic Federation'), 'pl', 1860, 0.5],
    ['UKRAINIANS', 'Ukrainians', ['UKR', 'GALICIA', 'VOLHYNIA'], L('Ukraine'), 'ru', 1860, 0.3],
    ['CAUCASIANS', 'Georgians, Armenians and Azeris', ['GEO', 'ARM', 'AZE'], L('Transcaucasian Federation'), 'ru', 1860, 0.6],
    ['CHECHENS', 'Chechens and Dagestanis', ['N_CAUCASUS'], L('North Caucasian Imamate'), 'tr', 1808, 0.9],
    ['CATALANS', 'Catalans', ['ESP_CAT'], L('Catalan Republic'), 'es', 1870, 0.3],
    ['SPANIARDS', 'Spaniards under Joseph Bonaparte', ['ESP_CENTER', 'ESP_ARA', 'ESP_AND', 'ESP_EXT', 'ESP_VAL', 'ESP_CAT'], 'ESP', 'es', 1808, 0.7, { foreignOnly: ['FRA', 'FRC'] }],
    // Middle East, Asia
    ['EGYPTIANS', 'Egyptians', ['EGY'], L('Egypt'), 'ar', 1860, 0.5, { foreignOnly: ['OTT', 'GBR', 'FRA', 'ITA'] }],
    ['LEVANTINES', 'Arabs of Syria and Palestine', ['SYR', 'LBN', 'JOR', 'ISR', 'PSX'], L('Arab Kingdom of Syria'), 'ar', 1880, 0.6],
    ['IRAQIS', 'Arabs of Iraq', ['IRQ', 'KWT'], L('Iraq'), 'ar', 1890, 0.6],
    ['ARABIANS', 'Arabs of the peninsula', ['SAU', 'YEM'], L('Arabia'), 'ar', 1808, 0.7],
    ['KOREANS', 'Koreans', ['KOR', 'PRK'], L('Korea'), 'ko', 1880, 0.8],
    ['TIBETANS', 'Tibetans', ['TIBET'], L('Tibet'), 'ko', 1900, 0.8],
    ['TURKESTANIS', 'Uyghurs and Turkestanis', ['XINJIANG'], L('East Turkestan'), 'tr', 1860, 0.8],
    ['MONGOLS', 'Mongols', ['MNG'], L('Mongolia'), 'ko', 1900, 0.7],
    ['INDIANS', 'Indians', ['BENGAL', 'MADRAS', 'MARATHA', 'PUNJAB', 'ASSAM', 'KASHMIR', 'SIKKIM', 'PUNJAB_PK', 'SINDH', 'KALAT', 'KASHMIR_PK', 'BGD'], 'IND', 'hi', 1870, 0.8, { custom: true }],
    ['BENGALIS', 'East Bengalis', ['BGD'], L('Bangladesh'), 'hi', 1940, 0.45, { foreignOnly: ['PAK'] }],
    ['KASHMIRIS', 'Kashmiris', ['KASHMIR'], L('Kashmir'), 'hi', 1930, 0.5, { foreignOnly: ['IND', 'PAK'] }],
    // The Americas
    ['QUEBECOIS', 'Québécois', ['CA-QC'], L('Québec'), 'fr', 1830, 0.5],
    ['AFRICAN_AMERICANS', 'African Americans', ['US-GA', 'US-AL', 'US-MS', 'US-SC', 'US-LA'], null, 'en', 1865, 0.7, { minority: true, only: ['USA', 'CSA'] }],
    ['ANGLO_TEXANS', 'Anglo-Texans', ['US-TX'], null, 'en', 1825, 0.6, { custom: true, only: ['MEX'] }],
    ['ANGLO_CALIFORNIANS', 'Anglo-Californians', ['US-CA'], null, 'en', 1849, 0.55, { custom: true, only: ['MEX'] }],
    ['MAYA', 'Maya of Yucatán', ['YUCATAN', 'QROO'], null, 'nah', 1808, 0.8, { custom: true, only: ['MEX', 'YUC'] }],
    ['CENTRAL_AMERICANS', 'Central Americans', ['GTM', 'SLV', 'HND', 'NIC', 'CRI'], null, 'es', 1808, 0.25, { custom: true, only: ['MEX'] }],
    ['PEASANTS_MX', 'Indigenous and mestizo peasants', ['MEX'], null, 'nah', 1808, 0.6, { custom: true, minority: true, only: ['MEX'] }],
    ['CUBANS', 'Cuban creoles', ['CUB'], null, 'es', 1808, 0.4, { custom: true, only: ['ESP', 'MEX'] }],
  ];

  // Movements already alive in 1808: Polish legions, Greek and Serb risings,
  // the United Irishmen, the Spanish guerrilla, German and Italian patriots.
  const M0 = { POLES: 0.55, GREEKS: 0.45, SERBS: 0.6, IRISH: 0.5, SPANIARDS: 0.8, GERMANS: 0.25, ITALIANS: 0.3, CHECHENS: 0.5, ARABIANS: 0.4, CUBANS: 0.2 };
  AH.COMMUNITIES = DEFS.map(([id, name, keys, succ, culture, awaken, dist, opt = {}]) => Object.assign({ id, name, keys, succ, culture, awaken, dist }, opt));
  AH.COMMUNITY_BY_ID = Object.fromEntries(AH.COMMUNITIES.map((c) => [c.id, c]));

  // Every colony is also a community: the colonized.
  AH.buildColonyCommunities = function () {
    const taken = new Set(AH.COMMUNITIES.flatMap((c) => c.keys));
    const SETTLER = new Set(['NZL', 'CAPE', 'NATAL', 'ORANGE', 'TRANSVAAL']);
    for (const k of AH.COLONY_LIST) {
      if (taken.has(k) || SETTLER.has(k)) continue;
      const name = AH.KEY_NAMES[k] || k;
      const region = AH.REGION_OF[k];
      const COLONIAL = ['GBR', 'FRA', 'ESP', 'POR', 'NLD', 'BEL', 'GER', 'PRU', 'ITA', 'SAR', 'USA', 'MEX', 'JPN', 'RUS', 'OTT', 'EGY', 'DEN', 'SWE', 'AUT'];
      const c = { id: 'COL_' + k, only: COLONIAL, name: `People of ${name}`, keys: [k], succ: k === 'CUB' ? 'CUB:Republic of Cuba' : L(name), culture: AH.KEY_CULTURE[k] || AH.REGION_CULTURE[region] || 'en',
        awaken: ['JAM', 'BHS', 'TTO', 'BRB', 'GUY', 'SUR', 'PRI', 'DOM', 'PHL', 'CYP'].includes(k) ? 1860 : 1885, dist: 0.9, colony: true };
      AH.COMMUNITIES.push(c);
      AH.COMMUNITY_BY_ID[c.id] = c;
    }
    AH.KEY_COMMS = {};
    for (const c of AH.COMMUNITIES) for (const k of c.keys) (AH.KEY_COMMS[k] = AH.KEY_COMMS[k] || []).push(c.id);
    AH.COMMUNITY_OF_KEY = {};
    for (const c of AH.COMMUNITIES) for (const k of c.keys) if (!AH.COMMUNITY_OF_KEY[k] || c.foreignOnly) AH.COMMUNITY_OF_KEY[k] = AH.COMMUNITY_OF_KEY[k] || c.id;
  };

  AH.successor = (s, c) => (typeof c.succ === 'function' ? c.succ(s) : c.succ);
  const succId = (s, c) => { const o = AH.successor(s, c); return o ? AH.ownerId(o) : null; };

  // Who rules the community now: the owner of most of its keys that aren't
  // already held by its own nation-state.
  AH.communityRuler = function (s, c) {
    const own = succId(s, c);
    const counts = {};
    for (const k of c.keys) {
      const o = s.oid(k);
      if (o === own || o === 'LOCAL' || o === 'NATIVE' || o === 'JOINT') continue;
      if (c.foreignOnly && !c.foreignOnly.includes(o)) continue;
      if (c.only && !c.only.includes(o)) continue;
      counts[o] = (counts[o] || 0) + 1;
    }
    let best = null, n = 0;
    for (const [o, v] of Object.entries(counts)) if (v > n) { best = o; n = v; }
    return best;
  };

  AH.initCommunities = function (s) {
    s.C = {};
    for (const c of AH.COMMUNITIES) s.C[c.id] = { hard: 0.4, segr: 0.4, mob: M0[c.id] !== undefined ? M0[c.id] : c.awaken <= 1808 ? 0.3 : 0.05, auto: 0, policy: 0, shock: 0, griev: 0, cool: 0 };
    s.v.nat_wave = s.v.nat_wave || 0;
  };

  // Segregation a regime imposes, before cultural distance.
  function regimeSegregation(s, ruler, c) {
    if (c.colony) return s.y > 1950 ? 0.6 : 0.78;
    const P = s.P && s.P[ruler];
    if (!P) return ['FRC', 'FRA'].includes(ruler) ? 0.55 : 0.45;
    const g = P.gov;
    // Some rulers are harsher toward subject peoples: the Ottoman millets, Russification.
    const extra = { OTT: 0.12, RUS: 0.08, FRA: 0.04 }[ruler] || 0;
    let base = extra + g === 'dictatorship' ? 0.68 : g === 'communist' ? 0.55 : g === 'empire' || g === 'monarchy' ? (P.constitutional ? 0.38 : 0.52) : g === 'republic' ? 0.34 : 0.45;
    if (AH.democratic(s, ruler) && s.y > 1950) base -= 0.08;
    return base;
  }

  // Hardship: the ruler's relative poverty, war, depression, local shocks.
  function hardship(s, ruler, c) {
    const P = s.P && s.P[ruler];
    const lead = s.leadProd || 2;
    const rel = P ? clamp(P.prod / lead) : 0.35;
    let h = 0.25 + 0.45 * (1 - rel);
    if (P && P.atWar) h += 0.15;
    if (s.f.crash_y && s.y - s.f.crash_y < 6) h += 0.15;
    if (c.colony) h += 0.1;
    return h;
  }

  // Custom Mexican communities read the Americas model's own variables.
  function customInputs(s, c) {
    const v = s.v, f = s.f;
    switch (c.id) {
      case 'ANGLO_TEXANS': return { segr: (f.tx_closed ? 0.6 : 0.35) + (f.centralism ? 0.15 : 0) - (f.tx_autonomy ? 0.25 : 0), hard: 0.55 - 0.3 * v.mx_fisc, mob: v.tx_anglo };
      case 'ANGLO_CALIFORNIANS': return { segr: 0.45 - (f.ca_naturalize ? 0.15 : 0) - (f.ca_home_rule ? 0.2 : 0), hard: 0.5 - 0.3 * v.mx_fisc, mob: v.ca_anglo };
      case 'MAYA': return { segr: f.land_reform ? 0.45 : 0.75, hard: 0.35 + 0.4 * v.mx_land, mob: null };
      case 'CENTRAL_AMERICANS': return { segr: f.cam_autonomy ? 0.2 : 0.4, hard: 0.55 - 0.3 * v.mx_fisc, mob: null };
      case 'PEASANTS_MX': return { segr: f.tribute_abolished ? 0.45 : 0.6, hard: 0.2 + 0.7 * v.mx_land, mob: null };
      case 'CUBANS': return { segr: f.slavery_lock ? 0.35 : 0.5, hard: 0.35 + 0.3 * v.cu_unrest, mob: v.cu_unrest + 0.2 };
      default: return null;
    }
  }

  AH.communityDrift = function (s) {
    const first = !s.dirtyComm;
    s.v.nat_wave = clamp(s.v.nat_wave * 0.8);
    const ms = AH.majorsAlive(s);
    s.leadProd = Math.max(...ms.map((p) => s.P[p].prod));
    for (const c of AH.COMMUNITIES) {
      const st = s.C[c.id];
      // Rulers only change when a community's territory changes hands (or a successor appears).
      if (!s.dirtyComm || s.dirtyComm.has(c.id) || typeof c.succ === 'function') st.ruler = AH.communityRuler(s, c);
      if (!st.ruler || s.y < c.awaken) { st.griev *= 0.9; st.hard *= 0.98; continue; }
      const P = s.P && s.P[st.ruler];
      // National awakening: schooling, cities, newspapers, and others' success.
      // National awakening: schooling, newspapers, cities, and others' success.
      if (s.y === c.awaken || st.mob < 0.12) st.mob = Math.max(st.mob, 0.12);
      const urban = 0.016 + (P && P.takeoff ? 0.01 : 0);
      st.mob = clamp(st.mob + (urban + 0.02 * s.v.nat_wave + (s.y > 1900 ? 0.006 : 0)) * (1 - st.mob));
      const cu = c.custom ? customInputs(s, c) : null;
      const segT = clamp(cu && cu.segr !== undefined ? cu.segr : regimeSegregation(s, st.ruler, c) * (0.55 + 0.45 * c.dist) + st.policy);
      const hardT = clamp((cu && cu.hard !== undefined ? cu.hard : hardship(s, st.ruler, c)) + st.shock);
      st.segr += 0.15 * (segT - st.segr);
      st.hard += 0.15 * (hardT - st.hard);
      if (cu && cu.mob !== null && cu.mob !== undefined) st.mob = clamp(cu.mob);
      st.griev = clamp(st.mob * (st.hard + st.segr) / 2 * 1.35 * (1 - 0.5 * st.auto));
      // Feedback: unrest damages the local economy and the ruler's stability.
      if (st.griev > 0.45) {
        st.shock = clamp(st.shock + 0.03 * (st.griev - 0.45));
        if (P && st.ruler !== 'MEX') P.stab = clamp(P.stab - 0.006 * (st.griev - 0.45) * Math.min(3, c.keys.length));
      }
      st.shock *= 0.92;
      st.policy *= 0.97;
      if (st.cool > 0) st.cool--;
    }
    s.dirtyComm = new Set();
  };

  AH.buildColonyCommunities();

  // Grievance of the community that contains a key, for the map's tension view.
  AH.keyGrievance = (C, k) => { const id = AH.COMMUNITY_OF_KEY && AH.COMMUNITY_OF_KEY[k]; return id && C && C[id] ? C[id] : null; };
})(globalThis.AH = globalThis.AH || {});
