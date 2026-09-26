// Mexico and the Americas, 1900–2000. The wider world (general wars,
// revolutions, decolonization) comes from js/events-process.js; these events
// read its results, such as whether a general war is on or which powers are
// communist, and add the Americas-specific story.
(function (AH) {
  const E = (AH.EVENTS = AH.EVENTS || []);
  const ev = (o) => E.push(o);
  const L = (n) => 'LOCAL:' + n;
  const mex = (s, k) => s.oid(k) === 'MEX';
  const NORTH = ['US-TX', 'US-CA', 'NEWMEX', 'GBASIN'];
  const holdsNorth = (s) => NORTH.some((k) => mex(s, k));
  const communistNuclear = (s) => (s.f.nukes || []).some((p) => s.P[p] && s.P[p].gov === 'communist');

  ev({ id: 'spindletop', y: 1901, m: 1, place: 'beaumont', kind: 'econ', major: true,
    title: 'Spindletop: oil in Texas',
    text: (s) => (mex(s, 'US-TX') ? 'The Lucas gusher near Beaumont blows 100,000 barrels a day, on Mexican soil. With the Tampico fields coming in soon after, Mexico is about to become an oil power.' : 'The Lucas gusher near Beaumont starts the Texas oil boom.'),
    fx: (s) => { if (mex(s, 'US-TX')) { s.set('mx_oil'); s.add('mx_fisc', 0.12); } } });

  ev({ id: 'golden_lane', y: 1910, m: 12, place: 'tampico', kind: 'econ',
    when: (s) => mex(s, 'MEX'),
    title: 'The Golden Lane',
    text: 'A gusher comes in near Tampico. Within a decade Mexico produces a quarter of the world\'s oil, just as navies switch from coal.',
    fx: (s) => { s.set('mx_oil'); s.add('mx_fisc', 0.06); } });

  ev({ id: 'land_reform', win: [1880, 1940], m: 5, place: 'mexico', kind: 'politics',
    when: (s) => mex(s, 'MEX') && !s.f.land_reform,
    p: (s) => 0.012 + 0.06 * s.v.mx_stab * Math.max(0, s.v.mx_land - 0.5),
    title: 'An agrarian law breaks up the great haciendas',
    text: (s) => `${AH.leaderOf(s, 'MEX')} signs a law, drafted by ${s.fig('mx:agrarian', 'es', 'Author of the agrarian law', 'MEX')}, that buys out idle hacienda land with oil and silver revenue and returns it to villages as ejidos.`,
    fx: (s) => { s.set('land_reform'); s.v.mx_land = Math.min(s.v.mx_land, 0.35); s.add('mx_stab', 0.05); } });

  ev({ id: 'mx_revolution', win: [1895, 1940], m: 11, place: 'mexico', kind: 'revolt', major: true,
    when: (s) => mex(s, 'MEX') && !s.f.land_reform,
    p: (s) => 0.008 + 0.25 * Math.max(0, s.v.mx_land - 0.6) + 0.15 * Math.max(0, 0.45 - s.v.mx_stab),
    title: 'The Mexican Revolution',
    text: (s) => `Villages stripped of their land by the haciendas rise in Morelos under ${s.fig('mx:rev:south', 'nah', 'Agrarian rebel leader of the south', 'MEX')}; in the north, ranch hands and miners follow ${s.fig('mx:rev:north', 'es', 'Rebel general of the north', 'MEX')}.`,
    otl: 'In our timeline the Revolution of 1910–20 overthrew Porfirio Díaz and killed some 1–2 million people.',
    averted: 'No Mexican Revolution',
    outcomes: [
      { title: 'A decade of civil war', w: (s) => 1.2 - s.v.mx_stab, kind: 'war',
        text: 'The old order collapses; armies of peasants, ranchers and generals fight across the country for a decade.',
        fx: (s) => { s.set('mx_rev_war'); s.set('at_war'); s.add('mx_stab', -0.3); s.add('mx_fisc', -0.2); s.mul('mx_pop', 0.94); s.after(9, 'mx_rev_end'); } },
      { title: 'The government concedes land reform', w: (s) => 0.2 + s.v.mx_stab,
        text: 'Facing the southern rebels\' plan for land, the government accepts redistribution in exchange for peace.',
        fx: (s) => { s.set('land_reform'); s.v.mx_land = 0.3; s.add('mx_stab', -0.05); } },
      { title: 'The rising is crushed', w: (s) => 0.4 * s.v.mx_mil,
        text: 'Federal cavalry and machine guns break the rebel armies. Land hunger remains.',
        fx: (s) => { s.add('mx_land', 0.05); s.add('mx_stab', -0.08); } },
    ] });
  ev({ id: 'mx_rev_end', sched: true, m: 2, place: 'queretaro', kind: 'politics', major: true,
    title: 'A revolutionary constitution',
    text: (s) => `The victorious convention, chaired by ${s.fig('mx:rev:constitution', 'es', 'President of the revolutionary constitutional convention', 'MEX')}, returns land to the villages, vests the subsoil and its oil in the nation, and makes Mexico a republic.`,
    fx: (s) => { delete s.f.at_war; s.set('land_reform'); s.v.mx_land = 0.25; s.set('republic'); s.name('MEX', 'United Mexican States'); s.add('mx_stab', 0.1); } });

  ev({ id: 'crisis_1914', win: [1901, 1950], m: 4, place: 'veracruz', kind: 'diplomacy', major: true,
    when: (s) => holdsNorth(s) && !s.f.world_war && s.oid('US-VA') === 'USA',
    p: (s) => 0.01 + (s.f.mx_rev_war ? 0.35 : 0) + 0.05 * Math.max(0, s.v.us_expan - 0.9),
    title: 'Washington eyes the Mexican north again',
    text: (s) => (s.f.mx_rev_war ? `With Mexico in civil war and American-owned oil fields in Texas and mines in California under threat, ${AH.leaderOf(s, 'USA')} lands Marines at Veracruz.` : 'A border incident near El Paso becomes a crisis over the Mexican north.'),
    otl: 'In our timeline the U.S. occupied Veracruz in 1914 and sent a punitive expedition into Chihuahua in 1916, but annexed nothing.',
    game: {
      rowPlayer: 'Washington', colPlayer: 'Mexico City', rows: ['Occupy the north', 'Limited intervention'], cols: ['Fight', 'Concede autonomy guarantees'],
      payoffs: (s) => {
        const pw = AH.clamp(0.15 + 0.2 * (s.v.us_pop / s.v.mx_pop - 1) - 0.4 * s.v.mx_mil - 0.3 * s.v.gb_mx + (s.f.mx_rev_war ? 0.25 : 0));
        s.v.pw2 = pw;
        return [[[4 * pw - 1.2, 2 - 3 * pw], [2.5, 0.6]], [[1, 2.5], [1.8, 1.6]]];
      },
      outcome: (i, j) => (i === 0 && j === 0 ? 0 : i === 0 ? 1 : 2),
    },
    outcomes: [
      { title: 'War over the north', kind: 'war', place: 'sanantonio', text: 'U.S. columns cross the Rio Grande and the Colorado.', fx: (s) => { s.set('mxus_war2'); s.after(2, 'mxus_peace2'); } },
      { title: 'The north under U.S. protection', text: 'Mexico cannot resist. U.S. troops garrison the oil and mining districts, and a plebiscite follows.', fx: (s) => { s.own(['US-CA', 'US-TX'].filter((k) => mex(s, k)), 'USA'); s.add('mx_stab', -0.1); } },
      { title: 'A punitive expedition, then withdrawal', text: 'The Marines leave Veracruz after seven months, and the border cavalry after a year.', fx: (s) => s.add('gb_mx', 0.05) },
    ] });
  ev({ id: 'mxus_peace2', sched: true, m: 6, place: 'washington', kind: 'treaty', major: true,
    title: 'The second U.S.–Mexican peace',
    outcomes: [
      { title: 'Mexico cedes California and Texas', w: (s) => s.v.pw2 || 0.4, fx: (s) => { s.own(['US-CA', 'US-TX', 'GBASIN'].filter((k) => mex(s, k)), 'USA'); s.add('mx_stab', -0.15); } },
      { title: 'Mexico cedes California only', w: (s) => 0.4 * (s.v.pw2 || 0.4), fx: (s) => { if (mex(s, 'US-CA')) s.own('US-CA', 'USA'); } },
      { title: 'Status quo, under British mediation', w: (s) => 1 - (s.v.pw2 || 0.4), text: 'London, which needs Mexican oil for its navy, brokers a return to the prewar border.', fx: (s) => s.add('gb_mx', 0.1) },
    ] });

  ev({ id: 'oil_nat', win: [1920, 1965], m: 3, place: 'tampico', kind: 'econ', major: true,
    when: (s) => mex(s, 'MEX') && s.f.mx_oil && !s.f.oil_nationalized,
    p: (s) => 0.02 + (s.f.republic ? 0.05 : 0.01) + (s.f.mx_rev_war ? 0.05 : 0),
    title: 'Who owns Mexico\'s oil?',
    text: (s) => `Oil workers strike against Anglo-Dutch and American companies in Tampico and Beaumont. ${AH.leaderOf(s, 'MEX')} weighs expropriation.`,
    otl: 'In our timeline President Lázaro Cárdenas expropriated the foreign oil companies on 18 March 1938.',
    game: {
      rowPlayer: 'Mexico', colPlayer: 'Oil companies (London, New York)', rows: ['Expropriate', 'Renegotiate royalties'], cols: ['Accept compensation', 'Boycott'],
      payoffs: (s) => [[[3 + (s.f.republic ? 0.5 : 0), 1], [1.5 + s.v.mx_stab, 0.2]], [[2, 2.5], [2, 2.5]]],
      outcome: (i, j) => (i === 0 ? (j === 0 ? 0 : 1) : 2),
    },
    outcomes: [
      { title: 'Nationalized with compensation', text: 'A national oil company is born; the companies accept bonds.', fx: (s) => { s.set('oil_nationalized'); s.add('mx_fisc', 0.1); } },
      { title: 'Nationalized; a boycott follows', text: 'The companies boycott Mexican oil for years; Mexico sells to whoever will buy.', fx: (s) => { s.set('oil_nationalized'); s.add('mx_fisc', -0.08); s.add('gb_mx', -0.15); } },
      { title: 'Royalties doubled instead', text: 'A new concession law doubles royalties and requires Mexican managers.', fx: (s) => s.add('mx_fisc', 0.05) },
    ] });

  ev({ id: 'mx_miracle', win: [1946, 1975], m: 6, place: 'mexico', kind: 'econ',
    when: (s) => mex(s, 'MEX') && !s.f.world_war, p: (s) => 0.05 + 0.2 * s.v.mx_stab,
    title: 'The Mexican miracle',
    text: 'Oil money, protected industry and a postwar boom bring decades of fast growth. Monterrey, Los Ángeles and Houston become industrial cities.',
    fx: (s) => { s.add('mx_fisc', 0.1); s.add('mx_stab', 0.05); s.set('mx_miracle'); if (s.P.MEX) s.P.MEX.prod *= 1.15; } });

  ev({ id: 'north_referendum', win: [1962, 2000], m: 10, place: (s) => (mex(s, 'US-CA') ? 'sanfrancisco' : 'sanantonio'), kind: 'politics', major: true,
    when: (s) => holdsNorth(s),
    p: (s) => 0.02 + 0.12 * Math.max(0, ((s.v.tx_anglo + s.v.ca_anglo) / 2) * (1.3 - s.v.mx_stab) - 0.3),
    title: 'A referendum in the English-speaking north',
    text: (s) => `After years of language disputes, the separatist party of ${s.fig('north:separatist', 'en', 'Leader of the northern sovereignty movement', 'MEX')} wins the state legislature and calls a vote on sovereignty, as Quebec did in our timeline.`,
    otl: 'In our timeline Quebec held sovereignty referendums in 1980 and 1995; the second failed by 50.6% to 49.4%.',
    averted: 'No independence referendum in the north',
    outcomes: [
      { title: 'Rejected narrowly', w: (s) => 0.3 + s.v.mx_stab, text: 'The north stays, narrowly. Mexico City concedes more autonomy.', fx: (s) => s.add('mx_stab', 0.02) },
      { title: 'California votes to leave', w: (s) => (mex(s, 'US-CA') ? s.v.ca_anglo * 0.6 : 0), text: 'California negotiates its separation and becomes a sovereign republic.', fx: (s) => { s.own('US-CA', 'CAL:Republic of California'); s.add('mx_stab', -0.1); } },
      { title: 'Texas votes to join the United States', w: (s) => (mex(s, 'US-TX') ? s.v.tx_anglo * 0.3 : 0), text: 'Texas leaves; after five years of negotiation it enters the United States as a state.', fx: (s) => { s.own('US-TX', 'USA'); s.add('mx_stab', -0.1); } },
    ] });

  ev({ id: 'mx_transition', win: [1960, 2000], m: 7, place: 'mexico', kind: 'politics',
    when: (s) => mex(s, 'MEX') && !s.f.mx_democracy,
    p: (s) => 0.03 + 0.08 * s.v.mx_stab,
    title: (s) => (s.f.republic ? 'The ruling party loses power' : 'The crown becomes ceremonial'),
    text: (s) => (s.f.republic ? `In the first clean election in decades, ${s.fig('mx:opposition', 'es', 'First opposition president of Mexico', 'MEX')} wins the presidency.` : `A new constitution leaves ${AH.leaderOf(s, 'MEX')} a figurehead, as in Britain. Parliament governs.`),
    fx: (s) => s.set('mx_democracy') });

  ev({ id: 'mx_debt', win: [1970, 1998], m: 8, place: 'mexico', kind: 'econ',
    when: (s) => mex(s, 'MEX'), p: (s) => 0.04 + 0.1 * (1 - s.v.mx_fisc),
    title: 'The peso crisis',
    text: 'Oil prices collapse after years of borrowing against them; the peso loses half its value.',
    fx: (s) => { s.add('mx_fisc', -0.15); s.add('mx_stab', -0.05); } });

  ev({ id: 'oil_shock', win: [1950, 1990], m: 10, place: 'tampico', kind: 'econ', p: 0.04,
    title: 'An oil shock',
    text: 'War in an oil region quadruples the price of oil. Exporters boom and importers stagnate.',
    fx: (s) => { if (s.f.mx_oil && mex(s, 'MEX')) s.add('mx_fisc', 0.12); for (const p of AH.majorsAlive(s)) if (!AH.hasOil(s, p)) s.P[p].prod *= 0.97; } });

  ev({ id: 'nafta', win: [1975, 2000], m: 1, place: 'washington', kind: 'treaty',
    when: (s) => mex(s, 'MEX') && s.oid('US-VA') === 'USA' && s.v.mx_stab > 0.5, p: 0.1,
    title: 'A North American free-trade treaty',
    text: 'Mexico, the United States and Canada abolish most tariffs between them. Factories move south; oil and grain move north.',
    fx: (s) => { s.add('mx_fisc', 0.05); s.set('nafta'); } });

  ev({ id: 'belize', win: [1950, 1990], m: 9, place: 'belize', kind: 'politics',
    when: (s) => s.oid('BLZ') === 'GBR', p: (s) => 0.02 + 0.1 * s.v.decol,
    title: 'British Honduras decolonized',
    outcomes: [
      { title: 'Independent Belize', w: 0.7, fx: (s) => s.own('BLZ', L('Belize')) },
      { title: 'Belize votes to join Mexico', w: (s) => (mex(s, 'GTM') ? 0.3 : 0.05), fx: (s) => s.own('BLZ', 'MEX') },
    ] });

  ev({ id: 'panama_us', win: [1900, 1925], m: 11, place: 'panama', kind: 'econ', major: true,
    when: (s) => !s.f.nic_canal && ['COL', 'GCO', 'LOCAL'].includes(s.oid('PAN')) && s.oid('US-VA') === 'USA',
    p: 0.12,
    title: 'Panama secedes; the Americans dig the canal',
    otl: 'In our timeline the U.S. backed Panama\'s secession in 1903 and opened the canal in 1914.',
    fx: (s) => { s.own('PAN', L('Republic of Panama')); s.set('us_canal'); } });

  ev({ id: 'csa_fate', win: [1900, 1990], m: 7, place: 'richmond', kind: 'politics', major: true,
    when: (s) => s.oid('US-VA') === 'CSA',
    p: (s) => (s.y > 1945 ? 0.06 : 0.015),
    title: 'The two American republics reunite',
    text: (s) => `Economic dependence, a shared war and the end of segregation bring a treaty of reunion, negotiated by ${s.fig('csa:reunion', 'en', 'Negotiator of American reunion', 'CSA')}.`,
    fx: (s) => s.take(AH.CSA_STATES.concat(['US-TX']), 'CSA', 'USA') });

  ev({ id: 'cuba_late', win: [1900, 1975], m: 5, place: 'havana', kind: 'revolt', major: true,
    when: (s) => s.oid('CUB') === 'ESP', p: (s) => 0.04 + 0.1 * s.v.decol,
    title: 'Cuba wins its independence from Spain',
    text: (s) => `The rebellion led by ${s.fig('cuba:liberator', 'es', 'Liberator of Cuba', 'CUB')} ends four centuries of Spanish rule.`,
    fx: (s) => s.own('CUB', 'CUB:Republic of Cuba') });
  ev({ id: 'pr_late', win: [1950, 1990], m: 7, place: 'sanjuan', kind: 'politics',
    when: (s) => s.oid('PRI') === 'ESP', p: 0.06,
    title: 'Puerto Rico decides its status',
    outcomes: [
      { title: 'An autonomous community of Spain', w: 0.45, fx: (s) => s.own('PRI', 'ESP:Puerto Rico (autonomous community)') },
      { title: 'Independent Puerto Rico', w: 0.35, fx: (s) => s.own('PRI', L('Republic of Puerto Rico')) },
      { title: 'Joins Mexico as a state', w: (s) => (s.oid('MEX') === 'MEX' ? 0.2 : 0), fx: (s) => s.own('PRI', 'MEX') },
    ] });

  ev({ id: 'cuba_rev', win: [1920, 1990], m: 1, place: 'havana', kind: 'revolt', major: true,
    when: (s) => s.oid('CUB') === 'CUB',
    p: (s) => 0.01 + 0.15 * Math.max(0, s.v.cu_unrest - 0.4) + (/U\.S\.|American/.test(s.owner('CUB')) ? 0.03 : 0),
    title: 'Revolution in Cuba',
    text: (s) => `A guerrilla army led by ${s.fig('cuba:guerrilla', 'es', 'Cuban revolutionary leader', 'CUB')} comes down from the Sierra Maestra and topples the dictatorship.`,
    otl: 'In our timeline Fidel Castro took power in 1959 and aligned Cuba with the Soviet Union.',
    outcomes: [
      { title: 'A socialist Cuba', w: (s) => (AH.majorsAlive(s).some((p) => s.P[p].gov === 'communist') ? 0.6 : 0.1), fx: (s) => { s.own('CUB', 'CUB:Republic of Cuba (socialist)'); s.set('cuba_socialist'); } },
      { title: 'A nationalist, non-aligned Cuba', w: 0.5, fx: (s) => s.own('CUB', 'CUB:Republic of Cuba (revolutionary)') },
    ] });
  ev({ id: 'missile_crisis', win: [1950, 1995], m: 10, place: 'havana', kind: 'diplomacy', major: true,
    when: (s) => s.f.cuba_socialist && communistNuclear(s), p: 0.25,
    title: 'A missile crisis over Cuba',
    text: (s) => { const p = s.f.nukes.find((q) => s.P[q] && s.P[q].gov === 'communist'); return `${AH.powerName(s, p)} places nuclear missiles in Cuba. Thirteen days at the brink; the missiles are withdrawn.`; } });

  ev({ id: 'cam_late', win: [1946, 2000], m: 9, place: 'guatemala', kind: 'revolt', major: true,
    when: (s) => mex(s, 'GTM'),
    p: (s) => 0.005 + 0.03 * s.v.decol * Math.max(0, 1 - s.v.mx_stab),
    title: 'Central America goes its own way',
    text: (s) => `In the age of decolonization, Guatemala City votes to leave the Mexican federation. ${s.fig('cam:president', 'es', 'First president of the Central American Republic', 'CAF')} becomes president of a new Central American Republic.`,
    fx: (s) => s.own(['GTM', 'SLV', 'HND', 'NIC', 'CRI', 'MOSQUITO'].filter((k) => mex(s, k)), 'CAF:Central American Republic') });

  ev({ id: 'newfoundland', win: [1930, 1960], m: 3, place: 'quebec', kind: 'politics', p: 0.06, bg: true,
    when: (s) => s.oid('CA-NL') === 'GBR' && s.oid('CA-QC') === 'CAN',
    title: 'Newfoundland joins Canada', fx: (s) => s.own('CA-NL', 'CAN') });
  ev({ id: 'civil_rights', win: [1945, 1975], m: 7, place: 'washington', kind: 'politics',
    when: (s) => s.oid('US-VA') === 'USA', p: 0.1,
    title: 'The American civil rights movement wins',
    text: (s) => `Marches led by ${s.fig('usa:civilrights', 'en', 'Civil rights leader', 'USA')} end legal segregation in the United States.` });
})(globalThis.AH = globalThis.AH || {});
