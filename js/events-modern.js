// 1900–2000. The same machinery as the 19th century: Mexico-specific events
// with state-dependent odds and games, and a world layer that follows our
// timeline unless the divergence has changed its preconditions.
(function (AH) {
  const E = (AH.EVENTS = AH.EVENTS || []);
  const ev = (o) => E.push(o);
  const S = AH.sigmoid;
  const L = (n) => 'LOCAL:' + n;
  const mex = (s, k) => s.oid(k) === 'MEX';
  const NORTH = ['US-TX', 'US-CA', 'NEWMEX', 'GBASIN'];
  const holdsNorth = (s) => NORTH.some((k) => mex(s, k));
  // W(year, month, id, place, title, [[keys, owner], ...] | fx, text, extra): background event.
  const W = (y, m, id, place, title, own, text, extra = {}) => E.push(Object.assign({
    id, y, m, place, title, text, bg: !extra.major, kind: extra.kind || 'colonial',
    fx: typeof own === 'function' ? own : (s) => { for (const [k, o] of own || []) s.own(k, o); },
  }, extra));
  const war = { kind: 'war' }, treaty = { kind: 'treaty' }, pol = { kind: 'politics' };
  // Independence: only from whoever currently holds it (so earlier divergence is respected).
  const indep = (y, m, id, place, title, pairs, extra = {}) => W(y, m, id, place, title, (s) => {
    for (const [k, o] of pairs) if (!['LOCAL', 'MEX', 'USA'].includes(s.oid(k)) || extra.force) s.own(k, o);
  }, extra.text || '', Object.assign({ kind: 'politics' }, extra));

  // ================================================================ MEXICO, 1900–2000
  ev({ id: 'spindletop', y: 1901, m: 1, place: 'beaumont', kind: 'econ', major: true,
    title: 'Spindletop: oil in Texas',
    text: (s) => (mex(s, 'US-TX') ? 'The Lucas gusher near Beaumont blows 100,000 barrels a day, on Mexican soil. With the Tampico fields coming in soon after, Mexico is about to become an oil power.' : 'The Lucas gusher near Beaumont starts the Texas oil boom.'),
    fx: (s) => { if (mex(s, 'US-TX')) { s.set('mx_oil'); s.add('mx_fisc', 0.12); } } });

  ev({ id: 'golden_lane', y: 1910, m: 12, place: 'tampico', kind: 'econ',
    when: (s) => mex(s, 'MEX'),
    title: 'The Golden Lane',
    text: 'Potrero del Llano No. 4 comes in near Tampico. By 1921 Mexico produces a quarter of the world\'s oil.',
    fx: (s) => { s.set('mx_oil'); s.add('mx_fisc', 0.06); } });

  ev({ id: 'land_reform', win: [1880, 1940], m: 5, place: 'mexico', kind: 'politics',
    when: (s) => mex(s, 'MEX') && !s.f.land_reform,
    p: (s) => 0.012 + 0.06 * s.v.mx_stab * Math.max(0, s.v.mx_land - 0.5),
    title: 'An agrarian law breaks up the great haciendas',
    text: 'Congress buys out idle hacienda land with oil and silver revenue and returns it to villages as ejidos.',
    fx: (s) => { s.set('land_reform'); s.v.mx_land = Math.min(s.v.mx_land, 0.35); s.add('mx_stab', 0.05); } });

  ev({ id: 'mx_revolution', win: [1900, 1940], m: 11, place: 'mexico', kind: 'revolt', major: true,
    when: (s) => mex(s, 'MEX') && !s.f.land_reform,
    p: (s) => 0.008 + 0.25 * Math.max(0, s.v.mx_land - 0.6) + 0.15 * Math.max(0, 0.45 - s.v.mx_stab),
    title: 'The Mexican Revolution',
    text: 'Villages dispossessed by the haciendas rise in Morelos under Emiliano Zapata. In the north, ranch hands and miners follow Pancho Villa.',
    otl: 'In our timeline the Revolution of 1910–20 overthrew Porfirio Díaz and killed some 1–2 million people.',
    averted: 'No Mexican Revolution',
    outcomes: [
      { title: 'A decade of civil war', w: (s) => 1.2 - s.v.mx_stab, kind: 'war',
        text: 'The old order collapses. Armies of peasants, ranchers and generals fight across the country for ten years.',
        fx: (s) => { s.set('mx_rev_war'); s.set('at_war'); s.add('mx_stab', -0.3); s.add('mx_fisc', -0.2); s.mul('mx_pop', 0.94); s.after(9, 'mx_rev_end'); } },
      { title: 'The crown concedes land reform', w: (s) => 0.2 + s.v.mx_stab,
        text: 'Facing Zapata\'s Plan de Ayala, the government accepts land redistribution in exchange for peace.',
        fx: (s) => { s.set('land_reform'); s.v.mx_land = 0.3; s.add('mx_stab', -0.05); } },
      { title: 'The rising is crushed', w: (s) => 0.4 * s.v.mx_mil,
        text: 'Federal cavalry and machine guns break the rebel armies. Land hunger remains.',
        fx: (s) => { s.add('mx_land', 0.05); s.add('mx_stab', -0.08); } },
    ] });
  ev({ id: 'mx_rev_end', sched: true, m: 2, place: 'queretaro', kind: 'politics', major: true,
    title: 'A revolutionary constitution',
    text: 'The Constitution of Querétaro returns land to the villages, puts the subsoil and its oil in the nation\'s hands, and makes Mexico a republic.',
    fx: (s) => { delete s.f.at_war; s.set('land_reform'); s.v.mx_land = 0.25; s.set('republic'); s.name('MEX', 'United Mexican States'); s.add('mx_stab', 0.1); } });

  // A second U.S.–Mexican crisis: most likely while Mexico is in turmoil.
  ev({ id: 'crisis_1914', win: [1901, 1950], m: 4, place: 'veracruz', kind: 'diplomacy', major: true,
    when: (s) => holdsNorth(s) && !s.f.world_war && s.oid('US-VA') === 'USA',
    p: (s) => 0.01 + (s.f.mx_rev_war ? 0.35 : 0) + 0.05 * Math.max(0, s.v.us_expan - 0.9),
    title: 'Washington eyes the Mexican north again',
    text: (s) => (s.f.mx_rev_war ? 'With Mexico in civil war and American oil fields in Texas and mines in California under threat, Washington lands Marines at Veracruz.' : 'A border incident near El Paso becomes a crisis over the Mexican north.'),
    otl: 'In our timeline the U.S. occupied Veracruz in 1914 and sent Pershing after Villa in 1916, but annexed nothing.',
    game: {
      rowPlayer: 'Washington', colPlayer: 'Mexico City', rows: ['Occupy the north', 'Limited intervention'], cols: ['Fight', 'Concede autonomy guarantees'],
      payoffs: (s) => {
        const pw = AH.clamp(0.15 + 0.2 * (s.v.us_pop / s.v.mx_pop - 1) - 0.4 * s.v.mx_mil - 0.3 * s.v.gb_mx + (s.f.mx_rev_war ? 0.25 : 0));
        s.v.pw2 = pw;
        return [
          [[4 * pw - 1.2, 2 - 3 * pw], [2.5, 0.6]],
          [[1, 2.5], [1.8, 1.6]],
        ];
      },
      outcome: (i, j) => (i === 0 && j === 0 ? 0 : i === 0 ? 1 : 2),
    },
    outcomes: [
      { title: 'War over the north', kind: 'war', place: 'sanantonio', text: 'U.S. columns cross the Rio Grande and the Colorado.',
        fx: (s) => { s.set('mxus_war2'); s.after(2, 'mxus_peace2'); } },
      { title: 'The north under U.S. protection', text: 'Mexico cannot resist. U.S. troops garrison the oil and mining districts, and a plebiscite follows.',
        fx: (s) => { s.own(['US-CA', 'US-TX'].filter((k) => mex(s, k)), 'USA'); s.add('mx_stab', -0.1); } },
      { title: 'A punitive expedition, then withdrawal', text: 'The Marines leave Veracruz after seven months, and the border cavalry after a year.', fx: (s) => s.add('gb_mx', 0.05) },
    ] });
  ev({ id: 'mxus_peace2', sched: true, m: 6, place: 'washington', kind: 'treaty', major: true,
    title: 'The second U.S.–Mexican peace',
    outcomes: [
      { title: 'Mexico cedes California and Texas', w: (s) => s.v.pw2 || 0.4, fx: (s) => { s.own(['US-CA', 'US-TX', 'GBASIN'].filter((k) => mex(s, k)), 'USA'); s.add('mx_stab', -0.15); } },
      { title: 'Mexico cedes California only', w: (s) => 0.4 * (s.v.pw2 || 0.4), fx: (s) => { if (mex(s, 'US-CA')) s.own('US-CA', 'USA'); } },
      { title: 'Status quo, under British mediation', w: (s) => 1 - (s.v.pw2 || 0.4), text: 'London, needing Mexican oil for its navy, brokers a return to the prewar border.', fx: (s) => s.add('gb_mx', 0.1) },
    ] });

  ev({ id: 'mx_ww1', y: 1914, m: 9, place: 'mexico', kind: 'diplomacy', major: true,
    when: (s) => mex(s, 'MEX') && s.f.world_war,
    title: 'Mexico and the Great War',
    text: 'The Royal Navy has switched from coal to oil, and much of that oil is Mexican.',
    outcomes: [
      { title: 'Mexico joins the Allies', w: (s) => (s.f.mx_rev_war ? 0.1 : 1.2 * s.v.gb_mx),
        text: 'Mexico declares war on Germany. Its oil fuels the Grand Fleet, and a Mexican division reaches the Western Front in 1917.', fx: (s) => { s.set('mx_allied'); s.add('gb_mx', 0.1); } },
      { title: 'Armed neutrality', w: 0.6, text: 'Mexico sells oil, silver and beef to the Allies at high prices.', fx: (s) => s.add('mx_fisc', 0.08) },
    ] });

  ev({ id: 'zimmermann', y: 1917, m: 1, place: 'washington', kind: 'diplomacy', major: true,
    when: (s) => s.f.world_war && s.f.mx_allied && holdsNorth(s),
    title: 'The Zimmermann telegram, reversed',
    text: 'British codebreakers intercept a German offer to Washington: help Germany against Mexico, and take back Texas and California.',
    otl: 'In our timeline Germany offered Mexico the return of Texas, New Mexico and Arizona. The telegram helped bring the U.S. into the war.',
    outcomes: [
      { title: 'Washington publishes it and joins the Allies', w: 0.9, fx: (s) => s.set('us_in_ww1') },
      { title: 'Washington stays neutral', w: (s) => 0.1 * s.v.us_expan, fx: (s) => s.add('gb_mx', 0.05) },
    ] });

  ev({ id: 'oil_nat', win: [1920, 1965], m: 3, place: 'tampico', kind: 'econ', major: true,
    when: (s) => mex(s, 'MEX') && s.f.mx_oil && !s.f.oil_nationalized,
    p: (s) => 0.02 + (s.f.republic ? 0.05 : 0.01) + (s.f.mx_rev_war ? 0.05 : 0),
    title: 'Who owns Mexico\'s oil?',
    text: 'Mexican workers strike against Anglo-Dutch and American companies in Tampico and Beaumont. The government weighs expropriation.',
    otl: 'In our timeline Lázaro Cárdenas expropriated foreign oil companies on 18 March 1938 and founded PEMEX.',
    game: {
      rowPlayer: 'Mexico', colPlayer: 'Oil companies (London, New York)', rows: ['Expropriate', 'Renegotiate royalties'], cols: ['Accept compensation', 'Boycott'],
      payoffs: (s) => [
        [[3 + (s.f.republic ? 0.5 : 0), 1], [1.5 + s.v.mx_stab, 0.2]],
        [[2, 2.5], [2, 2.5]],
      ],
      outcome: (i, j) => (i === 0 ? (j === 0 ? 0 : 1) : 2),
    },
    outcomes: [
      { title: 'Nationalized with compensation', text: 'PEMEX is born; the companies accept bonds.', fx: (s) => { s.set('oil_nationalized'); s.add('mx_fisc', 0.1); } },
      { title: 'Nationalized; a boycott follows', text: 'The companies boycott Mexican oil for years. Mexico sells to whoever will buy.', fx: (s) => { s.set('oil_nationalized'); s.add('mx_fisc', -0.08); s.add('gb_mx', -0.15); } },
      { title: 'Royalties doubled instead', text: 'A new concession law doubles royalties and requires Mexican managers.', fx: (s) => s.add('mx_fisc', 0.05) },
    ] });

  ev({ id: 'depression', y: 1930, m: 1, place: 'newyork', kind: 'econ', major: true,
    title: 'The Great Depression',
    text: 'Wall Street crashes. Commodity prices collapse; Mexican silver and oil lose half their value.',
    fx: (s) => { s.add('mx_fisc', -0.12); s.add('mx_stab', -0.05); } });

  ev({ id: 'mx_ww2', y: 1940, m: 6, place: 'mexico', kind: 'diplomacy', major: true,
    when: (s) => mex(s, 'MEX') && s.f.ww2,
    title: 'Mexico and the Second World War',
    outcomes: [
      { title: 'Mexico goes to war beside Britain', w: (s) => s.v.gb_mx * 1.5, text: 'Mexico declares war in June 1940. Mexican oil, Pacific ports and airfields become vital to the Allies.', fx: (s) => { s.set('mx_ww2'); s.add('mx_fisc', 0.05); } },
      { title: 'Neutral until attacked', w: 0.6, text: 'Mexico stays out until German U-boats sink its tankers in the Gulf.', fx: (s) => s.after(2, 'mx_ww2_late') },
    ] });
  ev({ id: 'mx_ww2_late', sched: true, m: 5, place: 'veracruz', kind: 'war', title: 'U-boats sink the Potrero del Llano; Mexico declares war',
    fx: (s) => s.set('mx_ww2') });

  ev({ id: 'mx_miracle', win: [1946, 1975], m: 6, place: 'mexico', kind: 'econ',
    when: (s) => mex(s, 'MEX'), p: (s) => 0.05 + 0.2 * s.v.mx_stab,
    title: 'The Mexican miracle',
    text: 'Import substitution, oil and a postwar boom bring decades of 6% growth. Monterrey, Los Ángeles and Houston become industrial cities.',
    fx: (s) => { s.add('mx_fisc', 0.1); s.add('mx_stab', 0.05); s.set('mx_miracle'); } });

  ev({ id: 'north_referendum', win: [1962, 2000], m: 10, place: (s) => (mex(s, 'US-CA') ? 'sanfrancisco' : 'sanantonio'), kind: 'politics', major: true,
    when: (s) => holdsNorth(s),
    p: (s) => 0.02 + 0.12 * Math.max(0, ((s.v.tx_anglo + s.v.ca_anglo) / 2) * (1.3 - s.v.mx_stab) - 0.3),
    title: 'A referendum in the English-speaking north',
    text: 'After years of language disputes and a separatist party winning the state legislature, the north votes on sovereignty, much as Quebec would in our timeline.',
    otl: 'In our timeline Quebec held sovereignty referendums in 1980 and 1995; the second failed by 50.6% to 49.4%.',
    averted: 'No independence referendum in the north',
    outcomes: [
      { title: 'Rejected narrowly', w: (s) => 0.3 + s.v.mx_stab, text: 'The north stays, by a narrow margin. Mexico City concedes more autonomy.', fx: (s) => { s.add('mx_stab', 0.02); } },
      { title: 'California votes to leave', w: (s) => (mex(s, 'US-CA') ? s.v.ca_anglo * 0.6 : 0), text: 'California declares itself a sovereign republic after a negotiated separation.', fx: (s) => { s.own('US-CA', 'CAL:Republic of California'); s.add('mx_stab', -0.1); } },
      { title: 'Texas votes to join the United States', w: (s) => (mex(s, 'US-TX') ? s.v.tx_anglo * 0.3 : 0), text: 'Texas leaves; after five years of negotiation it enters the United States as the 49th state.', fx: (s) => { s.own('US-TX', 'USA'); s.add('mx_stab', -0.1); } },
    ] });

  ev({ id: 'mx_transition', win: [1970, 2000], m: 7, place: 'mexico', kind: 'politics',
    when: (s) => mex(s, 'MEX') && !s.f.mx_democracy,
    p: (s) => 0.04 + 0.08 * s.v.mx_stab,
    title: (s) => (s.f.republic ? 'The ruling party loses power' : 'The crown becomes ceremonial'),
    text: (s) => (s.f.republic ? 'For the first time since the revolution, an opposition candidate wins the presidency in a clean election.' : 'A new constitution leaves the monarch a figurehead, as in Spain or Britain. Parliament governs.'),
    fx: (s) => s.set('mx_democracy') });

  ev({ id: 'mx_debt', win: [1976, 1995], m: 8, place: 'mexico', kind: 'econ',
    when: (s) => mex(s, 'MEX'), p: (s) => 0.05 + 0.1 * (1 - s.v.mx_fisc),
    title: 'The peso crisis',
    text: 'Oil prices collapse after years of borrowing against them; the peso loses half its value.',
    fx: (s) => { s.add('mx_fisc', -0.15); s.add('mx_stab', -0.05); } });

  ev({ id: 'nafta', win: [1988, 2000], m: 1, place: 'washington', kind: 'treaty',
    when: (s) => mex(s, 'MEX') && s.oid('US-VA') === 'USA', p: 0.25,
    title: 'A North American free-trade treaty',
    text: 'Mexico, the United States and Canada abolish most tariffs between them. Car plants and maquiladoras move south.',
    fx: (s) => { s.add('mx_fisc', 0.05); s.set('nafta'); } });

  ev({ id: 'belize', y: 1981, m: 9, place: 'belize', kind: 'politics',
    when: (s) => s.oid('BLZ') === 'GBR',
    title: 'British Honduras decolonized',
    outcomes: [
      { title: 'Independent Belize', w: 0.7, fx: (s) => s.own('BLZ', L('Belize')) },
      { title: 'Belize votes to join Mexico', w: (s) => (mex(s, 'GTM') ? 0.3 : 0.05), fx: (s) => s.own('BLZ', 'MEX') },
    ] });

  // ================================================================ THE AMERICAS
  ev({ id: 'panama_us', win: [1903, 1914], m: 11, place: 'panama', kind: 'econ', major: true,
    when: (s) => !s.f.nic_canal && (s.oid('PAN') === 'COL' || s.oid('PAN') === 'GCO' || s.oid('PAN') === 'LOCAL') && s.oid('US-VA') === 'USA',
    p: 0.35,
    title: 'Panama secedes; the Americans dig the canal',
    otl: 'In our timeline the U.S. backed Panama\'s secession in 1903 and opened the canal in 1914.',
    fx: (s) => { s.own('PAN', L('Republic of Panama')); s.set('us_canal'); } });

  ev({ id: 'csa_fate', win: [1900, 1990], m: 7, place: 'richmond', kind: 'politics', major: true,
    when: (s) => s.oid('US-VA') === 'CSA',
    p: (s) => (s.y > 1945 ? 0.06 : 0.015),
    title: 'The two American republics reunite',
    text: 'Economic dependence, a shared war and the end of Jim Crow bring a treaty of reunion.',
    fx: (s) => s.take(AH.CSA_STATES.concat(['US-TX']), 'CSA', 'USA') });

  ev({ id: 'cuba_rev', win: [1953, 1962], m: 1, place: 'havana', kind: 'revolt', major: true,
    when: (s) => s.oid('CUB') === 'CUB',
    p: (s) => 0.04 + 0.2 * Math.max(0, s.v.cu_unrest - 0.4) + (/U\.S\./.test(s.owner('CUB')) ? 0.08 : 0),
    title: 'Castro enters Havana',
    text: 'A guerrilla war from the Sierra Maestra topples the dictatorship.',
    otl: 'In our timeline Castro took power on 1 January 1959, and Cuba joined the Soviet bloc.',
    outcomes: [
      { title: 'A Soviet-aligned Cuba', w: (s) => (/U\.S\./.test(s.owner('CUB')) ? 0.8 : 0.4), fx: (s) => { s.own('CUB', 'CUB:Republic of Cuba (socialist)'); s.set('cuba_soviet'); } },
      { title: 'A nationalist, non-aligned Cuba', w: (s) => (/Mexican/.test(s.owner('CUB')) ? 0.8 : 0.4), fx: (s) => s.own('CUB', 'CUB:Republic of Cuba (revolutionary)') },
    ] });
  ev({ id: 'missile_crisis', y: 1962, m: 10, place: 'havana', kind: 'diplomacy', major: true,
    when: (s) => s.f.cuba_soviet,
    title: 'The Cuban Missile Crisis', text: 'Thirteen days at the brink of nuclear war. The missiles are withdrawn.' });

  ev({ id: 'cam_late', win: [1946, 2000], m: 9, place: 'guatemala', kind: 'revolt', major: true,
    when: (s) => mex(s, 'GTM'),
    p: (s) => 0.005 + 0.03 * s.v.decol * Math.max(0, 1 - s.v.mx_stab),
    title: 'Central America goes its own way',
    text: 'In the age of decolonization, Guatemala City votes to leave the Mexican federation.',
    fx: (s) => s.own(['GTM', 'SLV', 'HND', 'NIC', 'CRI', 'MOSQUITO'].filter((k) => mex(s, k)), 'CAF:Central American Republic') });

  ev({ id: 'cuba_late', win: [1900, 1975], m: 5, place: 'havana', kind: 'revolt', major: true,
    when: (s) => s.oid('CUB') === 'ESP', p: (s) => 0.04 + 0.1 * s.v.decol,
    title: 'Cuba wins its independence from Spain',
    fx: (s) => s.own('CUB', 'CUB:Republic of Cuba') });
  ev({ id: 'pr_late', win: [1950, 1990], m: 7, place: 'sanjuan', kind: 'politics',
    when: (s) => s.oid('PRI') === 'ESP', p: 0.06,
    title: 'Puerto Rico decides its status',
    outcomes: [
      { title: 'An autonomous community of Spain', w: 0.45, fx: (s) => s.own('PRI', 'ESP:Puerto Rico (autonomous community)') },
      { title: 'Independent Puerto Rico', w: 0.35, fx: (s) => s.own('PRI', L('Republic of Puerto Rico')) },
      { title: 'Joins Mexico as a state', w: (s) => (s.oid('MEX') === 'MEX' ? 0.2 : 0), fx: (s) => s.own('PRI', 'MEX') },
    ] });

  W(1949, 3, 'newfoundland', 'quebec', 'Newfoundland joins Canada', [['CA-NL', 'CAN']], '', pol);
  W(1959, 1, 'us_states', 'washington', 'Alaska and Hawaii become states', [], '', pol);
  W(1964, 7, 'civil_rights', 'washington', 'The Civil Rights Act', [], 'Segregation is outlawed in the United States.', pol);
  indep(1962, 8, 'jamaica', 'kingston', 'Jamaica and Trinidad independent', [['JAM', L('Jamaica')], ['TTO', L('Trinidad and Tobago')]]);
  indep(1966, 5, 'guyana', 'georgetown', 'Guyana independent', [['GUY', L('Guyana')]]);
  indep(1973, 7, 'bahamas', 'kingston', 'The Bahamas independent', [['BHS', L('Bahamas')]]);
  indep(1975, 11, 'suriname', 'georgetown', 'Suriname independent', [['SUR', L('Suriname')]]);
  W(1982, 4, 'falklands_war', 'buenosaires', 'The Falklands War', [], 'Argentina invades; Britain retakes the islands.', war);

  // ================================================================ THE GREAT WAR
  W(1901, 1, 'australia', 'sydney', 'The Commonwealth of Australia', [['AUS', 'GBR:Commonwealth of Australia']], '', pol);
  W(1905, 6, 'norway', 'oslo', 'Norway independent', [['NOR', L('Norway')]], '', pol);
  W(1905, 9, 'russo_japanese', 'shimonoseki', 'Japan defeats Russia', [['SAKHALIN', 'JPN']], 'The first modern victory of an Asian power over a European one. Japan takes southern Sakhalin.', { kind: 'war', major: true });
  W(1908, 10, 'bosnia', 'sarajevo', 'Austria-Hungary annexes Bosnia', [['BIH', 'AUT:Austria-Hungary']], '', pol);
  W(1910, 5, 'south_africa', 'capetown', 'The Union of South Africa', [[['CAPE', 'NATAL', 'ORANGE', 'TRANSVAAL'], 'GBR:Union of South Africa']], '', pol);
  W(1910, 8, 'korea_annex', 'seoul', 'Japan annexes Korea', [[['KOR', 'PRK'], 'JPN']], '', pol);
  W(1911, 10, 'xinhai', 'nanjing', 'The Xinhai Revolution: the Republic of China', (s) => { s.take(AH.CHINA_ALL, 'QNG', 'ROC'); s.own('TIBET', L('Tibet')); s.own('MNG', L('Mongolia')); }, 'The Qing dynasty falls after 267 years.', { kind: 'revolt', major: true });
  W(1911, 10, 'libya', 'tunis', 'Italy invades Libya', [['LBY', 'ITA']], '', war);
  W(1912, 3, 'morocco', 'algiers', 'French protectorate over Morocco', [['MAR', 'FRA:Morocco (French protectorate)']], '', pol);
  W(1913, 8, 'balkan_wars', 'constantinople', 'The Balkan Wars', [[['GR_NORTH', 'GR_CRETE'], 'GRE'], [['MKD', 'KOS'], 'SRB'], ['ALB', L('Albania')], ['RHODOPE', 'BUL']], 'The Balkan League drives the Ottomans almost out of Europe.', war);
  ev({ id: 'ww1', y: 1914, m: 8, place: 'sarajevo', kind: 'war', major: true, p: 0.97,
    title: 'The Great War',
    text: 'The assassination of Archduke Franz Ferdinand in Sarajevo draws the alliances of Europe into a general war.',
    fx: (s) => { s.set('world_war'); s.after(4, 'ww1_end'); } });
  ev({ id: 'us_ww1', y: 1917, m: 4, place: 'washington', kind: 'war', major: true,
    when: (s) => s.f.world_war && !s.f.us_in_ww1 && s.oid('US-VA') === 'USA',
    p: (s) => (s.f.mx_allied ? 0.5 : 0.8),
    title: 'The United States enters the war', text: 'Unrestricted U-boat warfare brings America in on the Allied side.',
    fx: (s) => s.set('us_in_ww1') });
  ev({ id: 'russian_rev', y: 1917, m: 11, place: 'stpetersburg', kind: 'revolt', major: true,
    when: (s) => s.f.world_war, p: 0.9,
    title: 'The October Revolution',
    text: 'The Bolsheviks seize power in Petrograd. After a civil war they found the Soviet Union.',
    fx: (s) => { s.own(['FIN', 'ALD'], L('Finland')); s.set('soviet'); s.after(5, 'ussr'); } });
  ev({ id: 'ussr', sched: true, m: 12, place: 'moscow', kind: 'politics', title: 'The Union of Soviet Socialist Republics',
    fx: (s) => { const keys = Object.keys(s.owners).filter((k) => s.oid(k) === 'RUS'); s.own(keys, 'SOV'); s.own(['UKR', 'BLR', 'GEO', 'ARM', 'AZE', 'KAZ', 'UZB', 'TKM', 'KGZ', 'TJK'], 'SOV'); } });

  ev({ id: 'ww1_end', sched: true, m: 11, place: 'versailles', kind: 'treaty', major: true,
    title: 'The Armistice',
    outcomes: [
      { title: 'Allied victory: Versailles, Saint-Germain, Trianon', w: (s) => 0.7 + (s.f.us_in_ww1 ? 0.25 : 0) + (s.f.mx_allied ? 0.05 : 0),
        text: 'Germany loses Alsace-Lorraine, the Polish corridor and its colonies. Austria-Hungary and the Ottoman Empire are dismembered.',
        fx: (s) => {
          s.set('versailles');
          s.own('ALSACE', 'FRA');
          s.own(['WARSAW', 'W_GALICIA', 'POSEN', 'CORRIDOR', 'GALICIA_W', 'GALICIA', 'VOLHYNIA'], 'POL:Second Polish Republic');
          s.own('UPPER_SIL', 'POL:Second Polish Republic');
          s.own(['AUT'], L('Republic of Austria')); s.own(['HUN'], L('Kingdom of Hungary'));
          s.own(['CZE', 'SVK', 'RUTHENIA'], 'CZS');
          s.own(['SVN', 'HRV', 'CROATIA_S', 'DALMATIA', 'BIH', 'SRB', 'SRB_SOUTH', 'VOJVODINA', 'MNE', 'MKD', 'KOS'], 'YUG');
          s.own(['TRANSYLVANIA', 'BUKOVINA', 'MDA'], 'ROM:Greater Romania');
          s.own(['IT_TREN', 'IT_TRIESTE'], 'ITA');
          s.own(['EST', 'LVA', 'LTU'], L('Baltic republics'));
          s.own(['SYR', 'LBN'], 'FRA:French Mandate of Syria'); s.own(['ISR', 'PSX', 'JOR', 'IRQ'], 'GBR:British Mandate');
          s.own(['TGO', 'CMR'], 'FRA'); s.own('NAM', 'GBR:South West Africa (South African mandate)'); s.own('TZA', 'GBR:Tanganyika');
          s.own(['RWA', 'BDI'], 'BEL:Ruanda-Urundi'); s.own('PNG', 'GBR:New Guinea (Australian mandate)'); s.own('WSM', 'GBR');
          delete s.f.world_war;
        } },
      { title: 'A compromise peace', w: (s) => (s.f.us_in_ww1 ? 0.05 : 0.3),
        text: 'Exhausted, the powers make peace on the basis of the war map: Germany keeps its eastern conquests as client states.',
        fx: (s) => {
          s.own(['WARSAW', 'W_GALICIA'], 'GER:Kingdom of Poland (German client)'); s.own(['EST', 'LVA', 'LTU'], 'GER:United Baltic Duchy (German client)');
          s.own(['UKR', 'VOLHYNIA'], 'GER:Ukrainian State (German client)');
          s.own(['SYR', 'LBN', 'ISR', 'PSX', 'JOR', 'IRQ'], 'GBR:Arab lands (British occupied)');
          delete s.f.world_war;
        } },
    ] });

  W(1922, 12, 'ireland', 'london', 'The Irish Free State', [['IRL', L('Irish Free State')]], '', pol);
  W(1922, 2, 'egypt_indep', 'cairo', 'Egypt nominally independent', [['EGY', L('Kingdom of Egypt')]], '', pol);
  W(1923, 10, 'turkey', 'constantinople', 'The Republic of Turkey', (s) => { s.take(['TUR', 'CYN'], 'OTT', 'TUR'); s.own('TUR', 'TUR'); s.own(['YEM'], L('Kingdom of Yemen')); }, 'Mustafa Kemal founds a republic on the ruins of the Ottoman Empire.', { kind: 'politics', major: true });
  W(1932, 9, 'saudi', 'diriyah', 'The Kingdom of Saudi Arabia', [['SAU', L('Saudi Arabia')]], '', pol);
  W(1932, 10, 'iraq', 'aden', 'Iraq independent', [['IRQ', L('Kingdom of Iraq')]], '', pol);
  W(1931, 9, 'manchukuo', 'beijing', 'Japan seizes Manchuria', [['MANCHURIA', 'JPN:Manchukuo (Japanese puppet)']], '', war);
  W(1936, 5, 'ethiopia_it', 'adwa', 'Italy conquers Ethiopia', (s) => { if (s.oid('ETH') === 'LOCAL') s.own('ETH', 'ITA:Italian East Africa'); }, 'Mussolini avenges Adwa with poison gas.', war);
  W(1936, 7, 'spanish_cw', 'madrid', 'The Spanish Civil War', [], 'Franco\'s rising leads to three years of war and a dictatorship.', { kind: 'war', major: true });

  // ================================================================ THE SECOND WORLD WAR
  W(1937, 7, 'china_war', 'beijing', 'Japan invades China', [[['NORTH_CHINA', 'JIANGNAN'], 'JPN:Japanese-occupied China'], ['SOUTH_COAST', 'JPN:Japanese-occupied China']], '', { kind: 'war', major: true });
  W(1938, 3, 'anschluss', 'vienna', 'Anschluss', [['AUT', 'GER']], 'Germany annexes Austria.', pol);
  W(1939, 3, 'prague', 'vienna', 'Germany occupies Bohemia; Slovakia a client', [['CZE', 'GER:Protectorate of Bohemia-Moravia'], ['SVK', 'GER:Slovak State (German client)'], ['ALB', 'ITA']], '', war);
  ev({ id: 'ww2', y: 1939, m: 9, place: 'warsaw', kind: 'war', major: true, p: 0.95,
    title: 'Germany invades Poland',
    text: 'Britain and France declare war. The Soviet Union takes eastern Poland under its pact with Hitler.',
    fx: (s) => { s.set('ww2'); s.set('world_war'); s.own(['WARSAW', 'W_GALICIA', 'POSEN', 'CORRIDOR', 'UPPER_SIL', 'GALICIA_W'], 'GER:General Government / annexed Poland'); s.own(['GALICIA', 'VOLHYNIA'], 'SOV'); } });
  W(1940, 6, 'fall_france', 'paris', 'The fall of France', [[['FRA', 'ALSACE', 'SAVOY'], 'GER:France (German-occupied / Vichy)'], [['BEL', 'NLD', 'LUX', 'DNK', 'NOR'], 'GER:German-occupied Europe'], [['EST', 'LVA', 'LTU', 'MDA'], 'SOV']], 'Germany overruns France and the Low Countries in six weeks. Britain fights on.', { kind: 'war', major: true });
  W(1941, 6, 'barbarossa', 'moscow', 'Operation Barbarossa', [[['UKR', 'BLR', 'EST', 'LVA', 'LTU', 'GALICIA', 'VOLHYNIA', 'MDA'], 'GER:German-occupied USSR'], [['SVN', 'HRV', 'CROATIA_S', 'DALMATIA', 'BIH', 'SRB', 'SRB_SOUTH', 'VOJVODINA', 'GRC', 'GR_OLD', 'GR_NORTH', 'GR_THESSALY', 'GR_IONIAN', 'GR_CRETE'], 'GER:Axis-occupied Balkans']], 'Germany invades the Soviet Union with three million men.', { kind: 'war', major: true });
  ev({ id: 'pearl_harbor', y: 1941, m: 12, place: (s) => (s.oid('US-HI') === 'USA' ? 'honolulu' : 'manila'), kind: 'war', major: true,
    title: (s) => (s.oid('US-HI') === 'USA' ? 'Pearl Harbor' : 'Japan strikes south'),
    text: 'Japan attacks across the Pacific and overruns Southeast Asia in five months.',
    fx: (s) => { s.set('us_in_ww2'); s.own(['PHL', 'IDN', 'MYS', 'SGP', 'MMR', 'BRN', 'HKG', 'VNM', 'ANNAM_S', 'COCHINCHINA', 'KHM', 'LAO', 'TLS'], 'JPN:Japanese-occupied Asia'); } });
  W(1944, 8, 'liberation', 'paris', 'D-Day and the liberation of France', [[['FRA', 'ALSACE', 'SAVOY'], 'FRA'], [['BEL', 'NLD', 'LUX'], 'LOCAL:Liberated Benelux']], '', { kind: 'war', major: true });
  ev({ id: 'ww2_end', y: 1945, m: 5, place: 'berlin', kind: 'treaty', major: true,
    when: (s) => s.f.ww2,
    title: 'Victory in Europe; the atomic bombs; Japan surrenders',
    text: 'Germany surrenders in May, Japan in August after Hiroshima and Nagasaki. Europe is divided along the lines the armies reached.',
    fx: (s) => {
      delete s.f.world_war;
      s.own(['BEL'], L('Belgium')); s.own(['NLD'], 'NLD'); s.own(['LUX'], L('Luxembourg')); s.own('DNK', 'DEN'); s.own('NOR', L('Norway'));
      s.own(['BERG', 'RHINE_L', 'HANOVER', 'HESSE', 'SOUTH_DE', 'HOLSTEIN'], 'GER:Federal Republic of Germany');
      s.own(['BRANDENBURG', 'MAGDEBURG', 'SAXONY', 'MECKLENBURG'], 'GDR');
      s.own(['WARSAW', 'W_GALICIA', 'POSEN', 'CORRIDOR', 'UPPER_SIL', 'GALICIA_W', 'PRU_EAST', 'E_PRUSSIA'], 'POL:Polish People\'s Republic');
      s.own(['KONIGSBERG', 'GALICIA', 'VOLHYNIA', 'UKR', 'BLR', 'EST', 'LVA', 'LTU', 'MDA', 'RUTHENIA', 'SAKHALIN'], 'SOV');
      s.own('AUT', L('Republic of Austria')); s.own(['CZE', 'SVK'], 'CZS');
      s.own(['SVN', 'HRV', 'CROATIA_S', 'DALMATIA', 'BIH', 'SRB', 'SRB_SOUTH', 'VOJVODINA', 'MNE', 'MKD', 'KOS'], 'YUG');
      s.own(['GRC', 'GR_OLD', 'GR_NORTH', 'GR_THESSALY', 'GR_IONIAN', 'GR_CRETE'], 'GRE');
      s.own(['ROU', 'DOBRUJA', 'TRANSYLVANIA'], 'ROM:Romanian People\'s Republic'); s.own('BUKOVINA', 'SOV');
      s.own(['BGR', 'E_RUMELIA', 'RHODOPE'], 'BUL:People\'s Republic of Bulgaria'); s.own('HUN', L('Hungarian People\'s Republic'));
      s.own('ALB', L('People\'s Republic of Albania')); s.own('ETH', L('Ethiopian Empire'));
      s.own('PRK', L('North Korea')); s.own('KOR', L('South Korea'));
      s.own(['TWN', 'MANCHURIA', 'NORTH_CHINA', 'JIANGNAN', 'SOUTH_COAST'], 'ROC');
      s.own(['FRA', 'ALSACE', 'SAVOY'], 'FRA');
      // Japan's southern conquests return to their colonizers until decolonization.
      s.own(['VNM', 'ANNAM_S', 'COCHINCHINA', 'KHM', 'LAO'], 'FRA:French Indochina'); s.own('IDN', 'NLD:Dutch East Indies');
      s.own(['MYS', 'SGP', 'BRN', 'HKG', 'MMR'], 'GBR'); s.own('TLS', 'POR');
      s.own('PHL', s.fired.philippines && s.fired.philippines.o === 0 ? 'USA' : L('Republic of the Philippines'));
    } });

  // ================================================================ DECOLONIZATION & THE COLD WAR
  W(1946, 7, 'philippines46', 'manila', 'Philippine independence', (s) => { if (s.oid('PHL') === 'USA') s.own('PHL', L('Republic of the Philippines')); }, '', pol);
  W(1946, 4, 'levant', 'aden', 'Syria, Lebanon and Jordan independent', [['SYR', L('Syria')], ['LBN', L('Lebanon')], ['JOR', L('Jordan')]], '', pol);
  W(1947, 8, 'partition', 'delhi', 'Independence and Partition of India', [[['BENGAL', 'MADRAS', 'MARATHA', 'PUNJAB', 'ASSAM', 'KASHMIR', 'SIKKIM'], 'IND'], [['PUNJAB_PK', 'SINDH', 'KALAT', 'KASHMIR_PK', 'BGD'], 'PAK']], 'British India is divided. Up to two million die in the violence of Partition.', { kind: 'politics', major: true });
  W(1948, 1, 'burma', 'rangoon', 'Burma and Ceylon independent', [['MMR', L('Union of Burma')], ['LKA', L('Ceylon')]], '', pol);
  W(1948, 5, 'israel', 'aden', 'The State of Israel', [['ISR', L('Israel')], ['PSX', L('Jordan & Egypt (West Bank, Gaza)')]], '', pol);
  W(1949, 10, 'prc', 'beijing', 'The People\'s Republic of China', (s) => { s.take(AH.CHINA_ALL.concat(['MANCHURIA']), 'ROC', 'PRC'); s.own('TWN', 'ROC'); }, 'The Communists win the civil war. The Nationalists retreat to Taiwan.', { kind: 'revolt', major: true });
  W(1949, 12, 'indonesia', 'batavia', 'Indonesia independent', [['IDN', 'IDN']], '', pol);
  W(1950, 10, 'tibet', 'beijing', 'China occupies Tibet', [['TIBET', 'PRC']], '', war);
  W(1950, 6, 'korean_war', 'seoul', 'The Korean War', [], 'North Korea invades the South. Three years of war end where they began.', { kind: 'war', major: true });
  W(1951, 12, 'libya_ind', 'tunis', 'Libya independent', [['LBY', L('Kingdom of Libya')]], '', pol);
  W(1954, 7, 'geneva', 'hanoi', 'Dien Bien Phu; Vietnam divided', [['VNM', L('North Vietnam')], [['ANNAM_S', 'COCHINCHINA'], L('South Vietnam')], ['KHM', L('Cambodia')], ['LAO', L('Laos')]], '', { kind: 'war', major: true });
  W(1956, 3, 'maghreb', 'tunis', 'Morocco, Tunisia and Sudan independent', [['MAR', L('Morocco')], ['TUN', L('Tunisia')], [['SDN', 'SDS'], L('Sudan')]], '', pol);
  W(1957, 3, 'ghana', 'kumasi', 'Ghana independent; Malaya independent', [['GHA', L('Ghana')], ['MYS', L('Malaysia')]], '', pol);
  W(1958, 10, 'guinea', 'stlouissen', 'Guinea independent', [['GIN', L('Guinea')]], '', pol);
  W(1960, 8, 'africa_1960', 'leopoldville', 'The Year of Africa', [['SEN', L('Senegal')], ['MLI', L('Mali')], ['CIV', L("Côte d'Ivoire")], ['BFA', L('Upper Volta')], ['NER', L('Niger')], ['TCD', L('Chad')],
    ['BEN', L('Dahomey')], ['TGO', L('Togo')], ['CMR', L('Cameroon')], ['CAF', L('Central African Republic')], ['GAB', L('Gabon')], ['COG', L('Congo-Brazzaville')], ['COD', L('Congo')],
    ['NGA', L('Nigeria')], ['MDG', L('Madagascar')], ['SOM', L('Somalia')], ['SOL', L('Somalia')], ['MRT', L('Mauritania')], ['CYP', L('Cyprus')]], 'Seventeen African states win independence in one year.', { kind: 'politics', major: true });
  W(1961, 12, 'africa_1961', 'dares', 'Tanganyika, Sierra Leone, Kuwait independent', [['TZA', L('Tanzania')], ['SLE', L('Sierra Leone')], ['KWT', L('Kuwait')], ['ZAF', L('Republic of South Africa')], [['CAPE', 'NATAL', 'ORANGE', 'TRANSVAAL'], L('Republic of South Africa')]], '', pol);
  ev({ id: 'algeria', win: [1958, 1966], m: 7, place: 'algiers', kind: 'war', major: true,
    when: (s) => s.oid('DZA') === 'FRA', p: 0.5,
    title: 'Algerian independence', text: 'Eight years of war end with the Évian Accords.', fx: (s) => s.own('DZA', L('Algeria')) });
  W(1962, 7, 'africa_1962', 'zanzibar', 'Uganda, Rwanda and Burundi independent', [['UGA', L('Uganda')], ['RWA', L('Rwanda')], ['BDI', L('Burundi')]], '', pol);
  W(1963, 12, 'kenya', 'zanzibar', 'Kenya independent', [['KEN', L('Kenya')]], '', pol);
  W(1964, 7, 'zambia', 'salisbury', 'Zambia and Malawi independent', [['ZMB', L('Zambia')], ['MWI', L('Malawi')], ['MLT', L('Malta')]], '', pol);
  W(1965, 8, 'singapore_ind', 'singapore', 'Singapore independent', [['SGP', L('Singapore')], ['GMB', L('The Gambia')]], '', pol);
  W(1966, 9, 'botswana', 'windhoek', 'Botswana and Lesotho independent', [['BWA', L('Botswana')], ['LSO', L('Lesotho')]], '', pol);
  W(1968, 3, 'mauritius_ind', 'port_louis', 'Mauritius, Swaziland, Equatorial Guinea independent', [['MUS', L('Mauritius')], ['SWZ', L('Swaziland')], ['GNQ', L('Equatorial Guinea')]], '', pol);
  W(1971, 12, 'bangladesh', 'calcutta', 'Bangladesh independent; the Gulf states', [['BGD', L('Bangladesh')], ['ARE', L('United Arab Emirates')], ['QAT', L('Qatar')], ['BHR', L('Bahrain')]], '', { kind: 'war' });
  W(1975, 4, 'saigon_falls', 'saigon', 'Saigon falls', [[AH.VNM_ALL, L('Socialist Republic of Vietnam')]], '', { kind: 'war', major: true });
  W(1975, 11, 'lusophone', 'leopoldville', 'Portugal leaves Africa', [['AGO', L('Angola')], ['MOZ', L('Mozambique')], ['GNB', L('Guinea-Bissau')], ['CPV', L('Cape Verde')], ['STP', L('São Tomé')], ['TLS', 'IDN'], ['SAH', L('Morocco')]], 'After the Carnation Revolution, Portugal abandons its empire.', pol);
  W(1977, 6, 'djibouti_ind', 'massawa', 'Djibouti independent', [['DJI', L('Djibouti')]], '', pol);
  W(1980, 4, 'zimbabwe', 'salisbury', 'Zimbabwe', [['ZWE', L('Zimbabwe')]], '', pol);
  W(1984, 1, 'brunei_ind', 'kinabalu', 'Brunei independent', [['BRN', L('Brunei')]], '', pol);
  W(1990, 3, 'namibia', 'windhoek', 'Namibia independent', [['NAM', L('Namibia')]], '', pol);
  W(1993, 5, 'eritrea_ind', 'massawa', 'Eritrea independent', [['ERI', L('Eritrea')]], '', pol);
  W(1997, 7, 'hongkong', 'hongkong', 'Hong Kong returns to China', [['HKG', 'PRC']], '', treaty);
  W(1999, 12, 'macau', 'hongkong', 'Macau returns to China; East Timor votes to leave Indonesia', [['MAC', 'PRC'], ['TLS', L('East Timor')]], '', treaty);
  W(1957, 10, 'sputnik', 'moscow', 'Sputnik', [], 'The space age begins.', { kind: 'econ' });
  W(1969, 7, 'moon', 'washington', 'Apollo 11 lands on the Moon', [], '', { kind: 'econ', major: true });
  W(1973, 10, 'oil_shock', 'diriyah', 'The oil shock', (s) => { if (s.f.mx_oil && s.oid('MEX') === 'MEX') s.add('mx_fisc', 0.12); }, 'The Arab oil embargo quadruples oil prices; oil exporters boom.', { kind: 'econ' });

  ev({ id: 'ussr_end', win: [1989, 2000], m: 12, place: 'moscow', kind: 'politics', major: true,
    when: (s) => s.oid('RUS') === 'SOV', p: 0.6,
    title: 'The Soviet Union dissolves',
    text: 'The Berlin Wall falls; the Soviet bloc collapses; the USSR breaks into fifteen states.',
    otl: 'In our timeline the Soviet Union dissolved on 26 December 1991.',
    fx: (s) => {
      const keys = Object.keys(s.owners).filter((k) => s.oid(k) === 'SOV');
      const names = { UKR: 'Ukraine', GALICIA: 'Ukraine', VOLHYNIA: 'Ukraine', RUTHENIA: 'Ukraine', BUKOVINA: 'Ukraine', BLR: 'Belarus', EST: 'Estonia', LVA: 'Latvia', LTU: 'Lithuania', MDA: 'Moldova',
        GEO: 'Georgia', ARM: 'Armenia', AZE: 'Azerbaijan', KAZ: 'Kazakhstan', UZB: 'Uzbekistan', TKM: 'Turkmenistan', KGZ: 'Kyrgyzstan', TJK: 'Tajikistan' };
      for (const k of keys) s.own(k, names[k] ? L(names[k]) : 'RUS:Russian Federation');
      s.take(['BRANDENBURG', 'MAGDEBURG', 'SAXONY', 'MECKLENBURG'], 'GDR', 'GER:Federal Republic of Germany');
      s.take(['CZE', 'SVK'], 'CZS', 'CZS:Czech and Slovak Federal Republic');
      const pl = Object.keys(s.owners).filter((k) => s.oid(k) === 'POL'); s.own(pl, 'POL:Republic of Poland');
    } });
  W(1991, 6, 'yugoslavia', 'belgrade', 'Yugoslavia breaks apart', [[['SVN'], L('Slovenia')], [['HRV', 'CROATIA_S', 'DALMATIA'], L('Croatia')], ['BIH', L('Bosnia and Herzegovina')], ['MKD', L('North Macedonia')]], 'Wars follow in Croatia and Bosnia.', { kind: 'war', major: true });
  W(1993, 1, 'velvet', 'vienna', 'The Velvet Divorce', [['CZE', L('Czech Republic')], ['SVK', L('Slovakia')]], '', pol);
  W(1990, 5, 'yemen', 'aden', 'Yemen unified', [['YEM', L('Yemen')]], '', pol);
})(globalThis.AH = globalThis.AH || {});
