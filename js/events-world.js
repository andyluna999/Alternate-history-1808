// The wider world, 1808–1850, downstream of the Mexico City junta.
//
// Nothing after September 1808 is fixed. The coup reaches Europe through three
// channels, each a state variable:
//   gb_chest    Britain's war chest. It rises once Mexican silver flows to London
//               under the Anglo-Mexican treaty instead of to Spain's Seville Junta.
//   esp_resist  Spanish patriot resistance. It loses the American remittances that
//               paid its armies, and gains from British subsidies.
//   coalition   the anti-French coalition's cohesion and funding.
// Events close to 1808 depend on them weakly, because news crossed the Atlantic
// in six to eight weeks and campaigns were planned months ahead. Later events
// depend on them more, and on each other.
(function (AH) {
  const E = (AH.EVENTS = AH.EVENTS || []);
  const ev = (o) => E.push(o);
  const L = (n) => 'LOCAL:' + n;
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const EIC = 'GBR:British India (East India Company)';
  const own = (pairs) => (s) => { for (const [k, o] of pairs) s.own(k, o); };
  const allied = (s) => s.f.coalition_won;
  // Napoleon (born 1769) dies between his fifties and sixties; a son reigns after him.
  const napHist = (s, from) => { const d = from + Math.floor(AH.hash(s.seed, 'nap', 0) * 12); return [['Napoleon I', d], ['Napoléon II', d + 15 + Math.floor(AH.hash(s.seed, 'nap2', 0) * 25)]]; };

  // ---------------------------------------------------------------- Spain and Austria, 1808–1810
  ev({ id: 'madrid_retaken', y: 1808, m: 12, place: 'madrid', kind: 'war', p: 0.95,
    title: 'Napoleon retakes Madrid',
    text: 'The Emperor comes to Spain himself with 200,000 men; the campaign was planned before any news from Mexico arrived. A British army retreats to Corunna.',
    fx: own([['ESP_CENTER', 'FRC:Spain of Joseph Bonaparte']]) });

  ev({ id: 'zaragoza', y: 1809, m: 2, place: 'zaragoza', kind: 'war',
    p: (s) => 0.95 - 0.35 * s.v.esp_resist,
    title: 'Zaragoza falls after the second siege',
    text: 'Without the silver that used to arrive from Veracruz, the patriot juntas cannot pay their armies.',
    fx: own([['ESP_ARA', 'FRC:Spain of Joseph Bonaparte']]) });

  ev({ id: 'austria_1809', y: 1809, m: 4, place: 'wagram', kind: 'war', major: true,
    p: (s) => 0.55 + 0.3 * s.v.gb_chest,
    title: 'Austria rises again',
    text: (s) => `Encouraged by Bailén${s.v.gb_chest > 0.6 ? ' and British subsidies paid in Mexican silver' : ''}, Vienna declares war on France.`,
    outcomes: [
      { title: 'Wagram: Austria is beaten', w: (s) => s.v.fr_power, text: 'The Peace of Schönbrunn strips Austria of its coast and western Galicia.',
        fx: own([[['IT_TRIESTE', 'CROATIA_S', 'SVN', 'DALMATIA'], 'FRA:Illyrian Provinces'], ['W_GALICIA', 'FRC:Duchy of Warsaw'], ['IT_TREN', 'FRC:Kingdom of Italy']]) },
      { title: 'Aspern holds: a draw on the Danube', w: (s) => 0.2 * (1 - s.v.fr_power) + 0.2 * s.v.gb_chest, text: 'Napoleon\'s crossing of the Danube fails. An armistice leaves Austria intact and the coalition encouraged.',
        fx: (s) => { s.add('fr_power', -0.15); s.add('coalition', 0.2); } },
    ] });

  ev({ id: 'papal_annex', y: 1809, m: 5, place: 'rome', kind: 'politics', p: 0.85,
    title: 'France annexes the Papal States', text: 'Pius VII excommunicates Napoleon and is taken prisoner to Savona.',
    fx: own([['IT_LAZIO', 'FRA'], ['IT_MARCHE', 'FRC:Kingdom of Italy']]) });
  ev({ id: 'finland', y: 1809, m: 9, place: 'helsinki', kind: 'treaty', p: 0.95, bg: true,
    title: 'Sweden cedes Finland to Russia', text: 'The war begun in February 1808 ends with the Treaty of Fredrikshamn.',
    fx: own([['FIN', 'RUS:Grand Duchy of Finland (Russia)'], ['ALD', 'RUS']]) });

  ev({ id: 'andalusia', y: 1810, m: 2, place: 'seville', kind: 'war',
    p: (s) => 0.9 - 0.4 * s.v.esp_resist,
    title: 'The French overrun Andalusia', text: 'Only Cádiz, behind its isthmus, holds out. There the Cortes meet.',
    fx: own([[['ESP_AND', 'ESP_EXT'], 'FRC:Spain of Joseph Bonaparte']]) });
  ev({ id: 'holland', y: 1810, m: 7, place: 'paris', kind: 'politics',
    p: (s) => 0.65 + 0.25 * s.v.gb_chest,
    title: 'France annexes Holland and the North Sea coast',
    text: 'British goods, paid for with Mexican silver, pour through Dutch ports. Napoleon annexes the coast to seal the Continental System.',
    fx: own([['NLD', 'FRA'], ['HANOVER', 'FRA'], ['IDN', 'FRA:Dutch East Indies (French)']]) });
  ev({ id: 'mauritius', y: 1810, m: 12, place: 'port_louis', kind: 'war', p: 0.85, bg: true,
    title: 'Britain takes Mauritius', fx: own([['MUS', 'GBR'], ['SYC', 'GBR']]) });
  ev({ id: 'java', win: [1811, 1813], m: 9, place: 'batavia', kind: 'war', bg: true,
    p: (s) => 0.3 + 0.3 * s.v.gb_chest,
    title: 'The British take Java', fx: own([['IDN', 'GBR:Java (British occupation)']]) });
  ev({ id: 'valencia', y: 1812, m: 1, place: 'zaragoza', kind: 'war',
    p: (s) => 0.85 - 0.35 * s.v.esp_resist,
    title: 'Suchet takes Valencia; Catalonia annexed to France',
    fx: own([['ESP_VAL', 'FRC:Spain of Joseph Bonaparte'], ['ESP_CAT', 'FRA']]) });
  ev({ id: 'cadiz_const', y: 1812, m: 3, place: 'cadiz', kind: 'politics', p: 0.8,
    title: 'The Constitution of Cádiz',
    text: 'The besieged Cortes proclaim a liberal constitution for "the Spaniards of both hemispheres". Mexico City, already governing itself, declines to swear it.' });
  ev({ id: 'bessarabia', y: 1812, m: 5, place: 'bucharest', kind: 'treaty', p: 0.9, bg: true,
    title: 'Russia annexes Bessarabia', fx: own([['MDA', 'RUS']]) });

  // ---------------------------------------------------------------- 1812–1815
  ev({ id: 'russia_1812', y: 1812, m: 6, place: 'borodino', kind: 'war', major: true,
    p: (s) => 0.5 + 0.4 * s.v.gb_chest,
    title: 'Napoleon invades Russia',
    text: 'Russia has quit the Continental System; smuggled British goods, much of them bought with Mexican silver, flood its ports. The Grande Armée of 600,000 crosses the Niemen.',
    outcomes: [
      { title: 'Borodino, Moscow burns, the retreat', w: (s) => 0.7 + 0.2 * s.v.coalition, text: 'Fewer than 100,000 men come back.',
        fx: (s) => { s.set('russia_disaster'); s.add('fr_power', -0.35); s.add('coalition', 0.35); } },
      { title: 'Winter at Smolensk; a negotiated peace', w: (s) => 0.25 * s.v.fr_power, text: 'Napoleon halts at Smolensk and the Tsar negotiates. The Continental System is patched up.',
        fx: (s) => { s.add('coalition', -0.1); } },
    ] });

  ev({ id: 'salamanca', win: [1812, 1813], m: 7, place: 'salamanca', kind: 'war',
    when: (s) => s.oid('ESP_AND') === 'FRC',
    p: (s) => 0.25 + 0.35 * s.v.gb_chest + (s.f.russia_disaster ? 0.25 : 0),
    title: 'Salamanca: Wellington frees the south', fx: (s) => { s.own(['ESP_AND', 'ESP_EXT'], 'ESP'); s.add('esp_resist', 0.15); } });
  ev({ id: 'vitoria', win: [1813, 1816], m: 6, place: 'vitoria', kind: 'war', major: true,
    when: (s) => ['ESP_CENTER', 'ESP_ARA', 'ESP_VAL', 'ESP_CAT'].some((k) => ['FRC', 'FRA'].includes(s.oid(k))),
    p: (s) => 0.2 + 0.3 * s.v.esp_resist + (s.f.russia_disaster ? 0.35 : 0) + 0.2 * s.v.gb_chest,
    title: 'Vitoria: Joseph Bonaparte flees Spain', fx: (s) => { s.own(['ESP_CENTER', 'ESP_ARA', 'ESP_VAL', 'ESP_AND', 'ESP_EXT', 'ESP_CAT'], 'ESP'); s.set('spain_free'); } });
  ev({ id: 'serbia_1813', y: 1813, m: 10, place: 'belgrade', kind: 'war', p: 0.8, bg: true,
    title: 'The Ottomans crush the Serbian rising', text: 'With Russia busy in Europe, the Sultan retakes Belgrade.',
    fx: own([['SRB', 'OTT']]) });
  ev({ id: 'gulistan', y: 1813, m: 11, place: 'tbilisi', kind: 'treaty', p: 0.85, bg: true,
    title: 'Treaty of Gulistan', text: 'Persia cedes the khanates north of the Aras to Russia.', fx: own([['AZE', 'RUS']]) });

  ev({ id: 'coalition_war', win: [1813, 1825], m: 10, place: 'leipzig', kind: 'war', major: true,
    when: (s) => !s.f.coalition_decided,
    p: (s) => (s.f.russia_disaster ? 0.9 : 0.05 + 0.25 * s.v.coalition),
    title: 'The coalition against Napoleon',
    text: (s) => `Russia, Prussia, Austria and Sweden, paid by a British treasury ${s.v.gb_chest > 0.6 ? 'swollen with Mexican silver' : 'stretched thin'}, march on the Confederation of the Rhine.`,
    outcomes: [
      { title: 'The Battle of the Nations: Napoleon routed', w: (s) => (s.f.russia_disaster ? 0.85 : 0.45) + 0.2 * s.v.gb_chest + 0.2 * s.v.coalition, text: 'The Confederation of the Rhine collapses; the allies cross into France.',
        fx: (s) => { s.set('coalition_won'); s.set('coalition_decided'); s.own(['BERG', 'MAGDEBURG'], 'PRU'); s.own(['SAXONY', 'SOUTH_DE', 'HESSE', 'MECKLENBURG'], 'GDC'); s.own('HANOVER', 'GDC:Kingdom of Hanover'); s.own('NLD', 'NLD'); } },
      { title: 'Napoleon holds Germany: the Peace of Prague', w: (s) => (s.f.russia_disaster ? 0.06 : 0.25) * s.v.fr_power / 0.85, text: 'Napoleon beats the allies piecemeal. A negotiated peace leaves the Napoleonic order standing from the Rhine to the Vistula.',
        fx: (s) => { s.set('coalition_decided'); s.set('napoleonic'); s.add('fr_power', 0.1); s.P.FRA.hist = napHist(s, 1819); } },
    ] });

  ev({ id: 'abdication', win: [1814, 1826], m: 4, place: 'elba', kind: 'treaty', major: true,
    when: (s) => allied(s) && !s.f.napoleon_gone && !s.f.frankfurt,
    title: 'The allies take Paris',
    outcomes: [
      { title: 'Napoleon abdicates and goes to Elba', w: 0.8, text: 'The Bourbons return under Louis XVIII.',
        fx: (s) => { s.set('napoleon_gone'); s.P.FRA.gov = 'monarchy'; s.P.FRA.mtitle = 'King'; s.P.FRA.hist = [['Louis XVIII', 1824], ['Charles X', 1836]]; AH.newLeader(s, 'FRA'); s.name('FRA', 'Kingdom of France'); } },
      { title: 'The Frankfurt terms: France keeps the Rhine', w: (s) => 0.02 + 0.1 * s.v.fr_power, text: 'Napoleon accepts France\'s "natural frontiers", the Rhine, the Alps and the Pyrenees, and keeps his throne.',
        fx: (s) => { s.set('frankfurt'); s.set('napoleonic'); s.P.FRA.hist = napHist(s, 1819); } },
    ] });
  ev({ id: 'hundred_days', win: [1815, 1816], m: 3, place: 'waterloo', kind: 'war', major: true,
    when: (s) => s.f.napoleon_gone && !s.fired.hundred_days, p: 0.6,
    title: 'Napoleon escapes from Elba',
    outcomes: [
      { title: 'Waterloo', w: 0.85, text: 'The Hundred Days end in Belgium; Napoleon is exiled to St Helena.' },
      { title: 'The Empire restored within France\'s old borders', w: (s) => 0.04 + 0.06 * s.v.fr_power, text: 'The allied armies are beaten piecemeal; exhausted, they recognize Napoleon within the frontiers of 1792.',
        fx: (s) => { s.set('napoleonic'); s.P.FRA.gov = 'empire'; s.P.FRA.hist = napHist(s, 1821); AH.newLeader(s, 'FRA'); s.name('FRA', 'French Empire'); } },
    ] });
  ev({ id: 'vienna', win: [1815, 1827], m: 6, place: 'vienna', kind: 'treaty', major: true,
    when: (s) => allied(s) && !s.fired.vienna && (s.f.napoleon_gone || s.f.frankfurt),
    title: 'The Congress of Vienna',
    text: (s) => `Vienna redraws Europe${s.f.frankfurt ? ' around a France that keeps the Rhine' : ''}: Prussia gains the Rhineland and Posen, Russia takes Poland, Austria takes northern Italy.`,
    fx: (s) => {
      const fk = s.f.frankfurt;
      s.own(['IT_LOMB', 'IT_VEN', 'IT_TRIESTE', 'CROATIA_S', 'SVN', 'DALMATIA', 'IT_TREN'], 'AUT');
      s.own('IT_PIED', 'SAR'); s.own('IT_DUCHY', 'ITD'); s.own(['IT_ROMAGNA', 'IT_MARCHE', 'IT_LAZIO'], 'PAP'); s.own('IT_SOUTH', 'NAP');
      s.own('POSEN', 'PRU'); s.own(['WARSAW', 'W_GALICIA'], 'RUS:Congress Poland (Russia)'); s.own('MECKLENBURG', 'GDC'); s.own('CHE', 'SWZ');
      s.own('GR_IONIAN', 'GBR:United States of the Ionian Islands (British)'); s.own('NOR', 'SWE:Sweden-Norway');
      if (!fk) { s.own('RHINE_L', 'PRU'); s.own(['BEL', 'LUX'], 'NLD:United Kingdom of the Netherlands'); s.own('SAVOY', 'SAR'); }
      if (s.oid('IDN') === 'GBR' && AH.hash(s.seed, 'java', s.y) < 0.75) s.own('IDN', 'NLD:Dutch East Indies');
      s.own('SUR', 'NLD');
    } });
  ev({ id: 'peace_prague', win: [1815, 1826], m: 6, place: 'paris', kind: 'treaty', major: true,
    when: (s) => s.f.napoleonic && !allied(s) && !s.fired.peace_prague,
    title: 'Napoleonic Europe endures',
    text: 'The Grand Empire survives: a French Rhineland and Low Countries, client kingdoms in Germany, Italy and Poland, and a Spain freed only if its guerrillas won it back themselves.',
    fx: (s) => { s.own(['NOR'], 'DEN'); } });
  ev({ id: 'napoleon_death', win: [1817, 1835], m: 5, place: 'paris', kind: 'politics', major: true,
    when: (s) => s.f.napoleonic && s.P.FRA.leader && s.P.FRA.leader.name !== 'Napoleon I' && (s.rulers.FRA || []).some((r) => r.name === 'Napoleon I'),
    title: 'Napoleon I dies',
    text: (s) => `The Emperor dies at Saint-Cloud. His son, a boy of the imperial house, succeeds as ${AH.leaderOf(s, 'FRA')}, under a regency. From Madrid to Warsaw, subject peoples take note.`,
    fx: (s) => { s.P.FRA.stab -= 0.15; s.v.nat_wave = Math.min(1, s.v.nat_wave + 0.4); } });

  // ---------------------------------------------------------------- Ottoman lands, Persia, Arabia
  ev({ id: 'egypt_arabia', win: [1811, 1825], m: 9, place: 'diriyah', kind: 'war', p: 0.15, bg: true,
    when: (s) => s.oid('SAU') === 'LOCAL',
    title: 'Egypt destroys the Saudi state', fx: own([['SAU', 'EGY:Hejaz & Najd (Egyptian occupation)']]) });
  ev({ id: 'saudi2', win: [1822, 1845], m: 1, place: 'diriyah', kind: 'politics', p: 0.1, bg: true,
    when: (s) => s.oid('SAU') === 'EGY',
    title: 'A second Saudi state', fx: own([['SAU', L('Emirate of Nejd')]]) });
  ev({ id: 'sudan_egypt', win: [1815, 1835], m: 11, place: 'khartoum', kind: 'war', p: 0.1, bg: true,
    when: (s) => s.oid('SDN') === 'LOCAL', title: 'Egypt conquers the Sudan', fx: own([['SDN', 'EGY:Egyptian Sudan']]) });
  ev({ id: 'egypt_syria', win: [1825, 1848], m: 12, place: 'cairo', kind: 'war', major: true,
    when: (s) => s.oid('EGY') === 'EGY' && s.oid('SYR') === 'OTT', p: 0.07,
    title: 'Egypt against the Sultan',
    text: 'The Pasha of Egypt, with a modern army and navy, marches on Syria.',
    outcomes: [
      { title: 'Egypt takes Syria; the powers force it back', w: (s) => 0.5 + 0.3 * (1 - AH.tension(s, 'GBR', 'OTT')), text: 'British and Austrian ships compel Egypt to withdraw.', fx: (s) => { s.P.OTT.stab -= 0.05; } },
      { title: 'Egypt keeps Syria', w: 0.35, fx: own([[['SYR', 'LBN', 'ISR', 'PSX', 'JOR'], 'EGY:Egypt and Syria']]) },
    ] });
  ev({ id: 'turkmenchay', win: [1824, 1840], m: 2, place: 'tehran', kind: 'war', p: 0.1, bg: true,
    when: (s) => s.oid('ARM') === 'PERS', title: 'Russia takes Erivan from Persia', fx: own([['ARM', 'RUS']]) });

  // ---------------------------------------------------------------- British India
  const RAJ_TARGETS = [['MARATHA', 0.3, 'pune', 'the Maratha Confederacy'], ['ASSAM', 0.3, 'guwahati', 'Burmese Assam'], ['SINDH', 0.3, 'hyderabadsind', 'the Talpur amirs of Sindh'],
    ['PUNJAB', 0.5, 'lahore', 'the Sikh Empire'], ['KALAT', 0.45, 'quetta', 'the Khan of Kalat']];
  ev({ id: 'sikh_rise', win: [1808, 1830], m: 7, place: 'lahore', kind: 'war', p: 0.15, bg: true,
    when: (s) => s.oid('KASHMIR') === 'LOCAL',
    title: 'Ranjit Singh takes Kashmir', fx: own([[AH.KASHMIR_ALL, 'SIKH']]) });
  ev({ id: 'company_raj', repeat: true, win: [1812, 1880], m: 3, place: 'calcutta', kind: 'war',
    when: (s) => s.oid('BENGAL') === 'GBR' && RAJ_TARGETS.some(([k]) => s.oid(k) !== 'GBR'),
    p: (s) => 0.07 + 0.08 * s.v.gb_chest,
    title: 'The East India Company expands',
    fx: (s) => {
      const t = RAJ_TARGETS.find(([k]) => s.oid(k) !== 'GBR' && !(s.f['raj_fail_' + k] && s.y - s.f['raj_fail_' + k] < 12));
      if (!t) { s.cur.cancel = true; return; }
      const [k, resist, place, foe] = t;
      s.cur.place = place;
      const gen = s.fig('eic:' + k, 'en', `Company general against ${foe}`, 'GBR');
      if (AH.hash(s.seed, 'raj' + k, s.y) < resist * (1.2 - s.v.gb_chest)) {
        s.f['raj_fail_' + k] = s.y;
        s.cur.title = `The Company's army is beaten by ${foe}`;
        s.cur.text = `${gen}'s column is destroyed. The directors in London call a halt.`;
        return;
      }
      const keys = k === 'PUNJAB' ? AH.PUNJAB_ALL.concat(AH.KASHMIR_ALL) : [k];
      s.own(keys, EIC);
      s.cur.title = `The Company conquers ${foe}`;
      s.cur.text = `${gen} wins the decisive battle; ${AH.GROUP_LABEL[k] || k} passes under Company rule.`;
    } });

  // ---------------------------------------------------------------- Europe's hungry forties
  ev({ id: 'famine', win: [1840, 1852], m: 9, place: 'london', kind: 'econ', major: true, p: 0.15,
    title: 'Blight and hunger',
    text: 'A potato blight and failed harvests bring famine to Ireland and dearth across Europe. Emigrants crowd the ships to New York, New Orleans and Veracruz.',
    fx: (s) => { s.C.IRISH.shock = 0.6; s.v.rev_wave = Math.min(1, (s.v.rev_wave || 0) + 0.6); for (const p of AH.majorsAlive(s)) if (!['USA', 'MEX'].includes(p)) s.P[p].stab -= 0.06; s.add('mx_pop', 0.1); } });

  // ---------------------------------------------------------------- Africa and the Pacific
  ev({ id: 'liberia', win: [1820, 1850], m: 7, place: 'monrovia', kind: 'colonial', p: 0.06, bg: true,
    when: (s) => s.oid('LBR') === 'LOCAL', title: 'Freed Americans found Liberia', fx: own([['LBR', L('Republic of Liberia')]]) });
  ev({ id: 'great_trek', win: [1834, 1865], m: 2, place: 'bloemfontein', kind: 'colonial', p: 0.08,
    when: (s) => s.oid('CAPE') === 'GBR' && s.oid('TRANSVAAL') === 'LOCAL',
    title: 'The Great Trek',
    text: (s) => `Boer farmers, resentful of British rule and the end of slavery, trek north under ${s.fig('boer:trek', 'nl', 'Leader of the Great Trek', '')} and found republics beyond the Orange and the Vaal.`,
    fx: own([['TRANSVAAL', L('South African Republic (Transvaal)')], ['ORANGE', L('Orange Free State')]]) });

  // ---------------------------------------------------------------- China
  ev({ id: 'opium_war', win: [1834, 1870], m: 6, place: 'canton', kind: 'war', major: true,
    when: (s) => s.oid('HKG') === 'QNG' && s.P.QNG.gov === 'monarchy',
    p: (s) => 0.05 + 0.08 * s.v.gb_chest,
    title: 'Britain and China: the opium trade',
    text: 'Canton\'s commissioner burns 20,000 chests of opium. The trade pays for Britain\'s tea; the silver drain, whose Mexican silver flows are now London\'s, bleeds the Qing.',
    game: {
      rowPlayer: 'London', colPlayer: 'Beijing', rows: ['Send a fleet', 'Accept restrictions'], cols: ['Hold firm', 'Open ports'],
      payoffs: (s) => [[[2.2 + s.v.gb_chest, 0.3], [2.8, 1.2]], [[0.6, 2.5], [2, 1.4]]],
      outcome: (i, j) => (i === 0 && j === 0 ? 0 : j === 1 ? 1 : 2),
    },
    outcomes: [
      { title: 'The Opium War: Hong Kong ceded', kind: 'war', text: 'British steamers destroy the Qing fleet; the treaty cedes Hong Kong and opens five ports.', fx: (s) => { s.own('HKG', 'GBR'); s.P.QNG.stab -= 0.12; s.f.beaten_QNG = s.y; } },
      { title: 'Treaty ports opened without war', text: 'Beijing opens ports rather than fight.', fx: (s) => { s.P.QNG.stab -= 0.05; } },
      { title: 'The Qing suppress the trade', text: 'London declines to fight for opium. The Qing stamp out the trade.', fx: (s) => { s.P.QNG.stab += 0.08; } },
    ] });

  // ---------------------------------------------------------------- Japan
  E.push({ id: 'japan_opened', win: [1846, 1880], m: 7, place: 'uraga', kind: 'diplomacy', major: true,
    p: (s) => 0.05 + (s.oid('US-CA') === 'USA' || s.oid('OREGON') === 'USA' ? 0.1 : 0) + (s.oid('HKG') === 'GBR' ? 0.04 : 0),
    title: 'Black ships: Japan is opened',
    text: (s) => (s.oid('US-CA') === 'USA' ? 'With San Francisco as a Pacific base, Commodore Perry\'s squadron anchors at Uraga.' : 'Without a Pacific coast, the United States has no Pacific base to send a squadron from.'),
    outcomes: [
      { title: 'By Commodore Perry (United States)', w: (s) => (s.oid('US-CA') === 'USA' || s.oid('OREGON') === 'USA' ? 0.85 : 0.3) },
      { title: 'By Admiral Putyatin (Russia)', w: 0.3, place: 'shimonoseki' },
      { title: 'By a British squadron from Hong Kong', w: (s) => (s.oid('US-CA') === 'USA' ? 0.05 : 0.4) },
    ] });
})(globalThis.AH = globalThis.AH || {});
