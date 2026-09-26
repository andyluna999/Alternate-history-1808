// The rest of the world, 1808–1850: events whose causes and actors were already
// in place before the divergence (Napoleon's wars, the Congress of Vienna,
// Greek independence, British India). After about 1850 the world runs on the
// great-power model and process events in js/world.js and js/events-process.js.
(function (AH) {
  const E = (AH.EVENTS = AH.EVENTS || []);
  // W(year, month, id, place, title, [[keys, owner], ...] | fx, text, extra)
  const W = (y, m, id, place, title, own, text, extra = {}) => E.push(Object.assign({
    id, y, m, place, title, text, bg: !extra.major, kind: extra.kind || 'colonial',
    fx: typeof own === 'function' ? own : (s) => { for (const [k, o] of own || []) s.own(k, o); },
  }, extra));
  const war = { kind: 'war' }, treaty = { kind: 'treaty' }, pol = { kind: 'politics' };
  const L = (n) => 'LOCAL:' + n;
  const RAJ = 'GBR:British India';

  // ---------------- Napoleonic Europe
  W(1808, 4, 'marche_italy', 'rome', 'The Marche annexed to the Kingdom of Italy', [['IT_MARCHE', 'FRC:Kingdom of Italy']], '', pol);
  W(1808, 12, 'madrid_retaken', 'madrid', 'Napoleon retakes Madrid', [['ESP_CENTER', 'FRC:Spain of Joseph Bonaparte']], 'The Emperor comes to Spain himself with 200,000 men. Sir John Moore\'s army retreats to Corunna.', war);
  W(1809, 2, 'zaragoza', 'zaragoza', 'Zaragoza falls after the second siege', [['ESP_ARA', 'FRC:Spain of Joseph Bonaparte']], '', war);
  W(1809, 5, 'papal_annex', 'rome', 'France annexes the Papal States', [['IT_LAZIO', 'FRA']], 'Pius VII excommunicates Napoleon and is taken prisoner to Savona.', pol);
  W(1809, 7, 'wagram', 'wagram', 'Wagram', [], 'Austria, which rose again partly on the example of Bailén, is beaten a second time.', { kind: 'war', major: true });
  W(1809, 9, 'finland', 'helsinki', 'Sweden cedes Finland to Russia', [['FIN', 'RUS:Grand Duchy of Finland (Russia)'], ['ALD', 'RUS']], 'Treaty of Fredrikshamn.', treaty);
  W(1809, 10, 'schonbrunn', 'vienna', 'Peace of Schönbrunn: the Illyrian Provinces', [[['IT_TRIESTE', 'CROATIA_S', 'SVN', 'DALMATIA'], 'FRA:Illyrian Provinces'], ['W_GALICIA', 'FRC:Duchy of Warsaw'], ['IT_TREN', 'FRC:Kingdom of Italy']], 'Austria loses its coast and western Galicia.', treaty);
  W(1810, 2, 'andalusia', 'seville', 'The French overrun Andalusia', [[['ESP_AND', 'ESP_EXT'], 'FRC:Spain of Joseph Bonaparte']], 'Only Cádiz, behind its isthmus, holds out. There the Cortes meet.', war);
  W(1810, 7, 'holland', 'paris', 'France annexes Holland and the North Sea coast', [['NLD', 'FRA'], ['HANOVER', 'FRA'], ['IDN', 'FRA:Dutch East Indies (French)']], 'Louis Bonaparte abdicates; Holland and the Hanseatic cities become French départements.', pol);
  W(1810, 12, 'mauritius', 'port_louis', 'Britain takes Mauritius', [['MUS', 'GBR'], ['SYC', 'GBR']], '', war);
  W(1811, 9, 'java', 'batavia', 'The British take Java', [['IDN', 'GBR:Java (British occupation)']], 'Stamford Raffles governs the Dutch East Indies until 1816.', war);
  W(1812, 1, 'valencia', 'zaragoza', 'Suchet takes Valencia; Catalonia annexed to France', [['ESP_VAL', 'FRC:Spain of Joseph Bonaparte'], ['ESP_CAT', 'FRA']], '', war);
  W(1812, 3, 'cadiz_const', 'cadiz', 'The Constitution of Cádiz', [], 'The besieged Cortes proclaim a liberal constitution for the Spanish nation "of both hemispheres". Mexico City notes it and declines to swear it.', pol);
  W(1812, 5, 'bessarabia', 'bucharest', 'Russia annexes Bessarabia', [['MDA', 'RUS']], 'Treaty of Bucharest.', treaty);
  W(1812, 7, 'salamanca', 'salamanca', 'Salamanca: Wellington frees the south', [[['ESP_AND', 'ESP_EXT'], 'ESP']], 'Soult evacuates Andalusia.', war);
  W(1812, 9, 'russia', 'borodino', 'Borodino and the burning of Moscow', [], 'The Grande Armée of 600,000 men enters Russia in June; fewer than 100,000 come back.', { kind: 'war', major: true });
  W(1813, 6, 'vitoria', 'vitoria', 'Vitoria: Joseph flees Spain', [[['ESP_CENTER', 'ESP_ARA', 'ESP_VAL'], 'ESP']], '', war);
  W(1813, 10, 'leipzig', 'leipzig', 'The Battle of the Nations', [[['BERG', 'MAGDEBURG'], 'PRU'], [['SAXONY', 'SOUTH_DE', 'HESSE', 'MECKLENBURG'], 'GDC'], ['HANOVER', 'GDC:Kingdom of Hanover'], ['SRB', 'OTT']], 'The Confederation of the Rhine collapses. In Serbia, the Ottomans crush Karađorđe\'s rising.', { kind: 'war', major: true });
  W(1813, 11, 'gulistan', 'tbilisi', 'Treaty of Gulistan', [['AZE', 'RUS']], 'Persia cedes the khanates north of the Aras.', treaty);
  W(1813, 11, 'holland_free', 'brussels', 'The Netherlands rise', [['NLD', 'NLD']], '', pol);
  W(1814, 1, 'kiel', 'oslo', 'Norway passes to Sweden', [['NOR', 'SWE:Sweden-Norway']], 'Denmark cedes Norway at Kiel; after a brief war, Norway enters a union with Sweden.', treaty);
  W(1814, 4, 'elba', 'elba', 'Napoleon abdicates', [[['ESP_CAT'], 'ESP'], [['IT_LOMB', 'IT_VEN', 'IT_TRIESTE', 'CROATIA_S', 'SVN', 'DALMATIA', 'IT_TREN'], 'AUT'], ['IT_PIED', 'SAR'], ['IT_DUCHY', 'ITD'], [['IT_ROMAGNA', 'IT_MARCHE', 'IT_LAZIO'], 'PAP'], ['RHINE_L', 'PRU'], [['BEL', 'LUX'], 'NLD:United Kingdom of the Netherlands'], ['CHE', 'SWZ'], ['GR_IONIAN', 'GBR:United States of the Ionian Islands (British)']], 'Exile to Elba. The old frontiers of 1792 return.', { kind: 'treaty', major: true });
  W(1815, 6, 'waterloo', 'waterloo', 'Waterloo; the Congress of Vienna', [['POSEN', 'PRU'], [['WARSAW', 'W_GALICIA'], 'RUS:Congress Poland (Russia)'], ['IT_SOUTH', 'NAP'], ['SAVOY', 'SAR'], ['MECKLENBURG', 'GDC']], 'The Hundred Days end at Waterloo. Vienna redraws Europe: Prussia gains the Rhineland, Russia takes Poland, and Austria takes northern Italy.', { kind: 'war', major: true });
  W(1817, 11, 'serbia', 'belgrade', 'Principality of Serbia', [['SRB', 'SRB:Principality of Serbia (Ottoman vassal)']], 'After the second Serbian uprising, Miloš Obrenović wins autonomy.', pol);
  W(1821, 3, 'greek_revolt', 'athens', 'The Greek War of Independence begins', [], '', { kind: 'revolt' });
  W(1827, 10, 'navarino', 'navarino', 'Navarino', [], 'A British, French and Russian fleet destroys the Ottoman–Egyptian navy.', war);
  W(1828, 2, 'turkmenchay', 'tehran', 'Treaty of Turkmenchay', [['ARM', 'RUS']], 'Persia cedes Erivan and Nakhichevan to Russia.', treaty);
  W(1829, 9, 'adrianople', 'constantinople', 'Treaty of Adrianople', [['ROU', 'OTT:Wallachia & Moldavia (Russian protectorate)']], '', treaty);
  W(1830, 2, 'greece', 'athens', 'Greece independent', [['GR_OLD', 'GRE']], 'The London Protocol recognizes a small Greek kingdom.', { kind: 'treaty', major: true });
  W(1830, 7, 'algiers', 'algiers', 'France takes Algiers', [['DZA', 'FRA:French Algeria']], 'Conquest of the interior will take seventeen years.', war);
  W(1830, 7, 'july_rev', 'paris', 'The July Revolution', [], 'Charles X falls; Louis-Philippe becomes King of the French.', { kind: 'revolt' });
  W(1830, 10, 'belgium', 'brussels', 'Belgian independence', [['BEL', 'BEL']], '', { kind: 'revolt' });
  W(1831, 9, 'poland_1831', 'warsaw', 'The November Uprising crushed', [], 'Warsaw falls to Paskevich.', war);
  W(1839, 4, 'luxembourg', 'brussels', 'Luxembourg a grand duchy', [['LUX', 'LOCAL:Grand Duchy of Luxembourg']], '', treaty);
  W(1846, 11, 'krakow', 'warsaw', 'Austria annexes Kraków', [], '', pol);
  W(1848, 3, 'revolutions_1848', 'paris', 'The Springtime of the Peoples', [], 'Revolution in Paris, Vienna, Berlin, Milan, Pest and Venice. Almost all of it is reversed within two years.', { kind: 'revolt', major: true });

  // ---------------- Russia & Asia
  W(1822, 1, 'kazakh', 'alma', 'Russia absorbs the Kazakh hordes', [['KAZ', 'RUS']], 'Speranskii\'s statute begins the absorption of the steppe, complete by the 1840s.', {});
  W(1818, 6, 'maratha', 'pune', 'The fall of the Peshwa', [['MARATHA', 'GBR:British India (East India Company)']], 'The Third Anglo-Maratha War leaves the Company paramount in India.', war);
  W(1818, 9, 'diriyah', 'diriyah', 'Egypt destroys the First Saudi State', [['SAU', 'EGY:Hejaz & Najd (Egyptian occupation)']], '', war);
  W(1824, 1, 'saudi2', 'diriyah', 'The Second Saudi State', [['SAU', L('Emirate of Nejd & Hejaz (Ottoman)')]], '', pol);
  W(1819, 7, 'kashmir_sikh', 'srinagar', 'Ranjit Singh takes Kashmir', [[AH.KASHMIR_ALL, 'SIKH']], '', war);
  W(1819, 2, 'singapore', 'singapore', 'Raffles founds Singapore', [['SGP', 'GBR']], '', {});
  W(1820, 1, 'trucial', 'aden', 'The General Maritime Treaty', [['ARE', 'GBR:Trucial States (British protected)']], '', treaty);
  W(1820, 11, 'sudan_egypt', 'khartoum', 'Egypt conquers the Sudan', [['SDN', 'EGY:Egyptian Sudan']], '', war);
  W(1826, 2, 'yandabo', 'guwahati', 'Treaty of Yandabo', [['ASSAM', 'GBR:British India (East India Company)']], 'Burma cedes Assam, Arakan and Tenasserim.', treaty);
  W(1832, 12, 'egypt_syria', 'cairo', 'Muhammad Ali takes Syria', [[['SYR', 'LBN', 'ISR', 'PSX', 'JOR'], 'EGY:Egypt of Muhammad Ali']], '', war);
  W(1835, 5, 'tripoli', 'tunis', 'Ottoman direct rule in Tripoli', [['LBY', 'OTT']], '', pol);
  W(1839, 1, 'aden', 'aden', 'Britain takes Aden', [], '', war);
  W(1840, 11, 'syria_back', 'alexandria', 'Syria returned to the Sultan', [[['SYR', 'LBN', 'ISR', 'PSX', 'JOR'], 'OTT']], 'British and Austrian ships force Muhammad Ali back to Egypt.', war);
  W(1840, 2, 'waitangi', 'waitangi', 'The Treaty of Waitangi', [['NZL', 'GBR:New Zealand']], '', treaty);
  W(1842, 8, 'nanking', 'hongkong', 'Treaty of Nanking', [['HKG', 'GBR']], 'The First Opium War ends; Hong Kong is ceded and five ports opened.', { kind: 'war', major: true });
  W(1842, 9, 'tahiti', 'papeete', 'French protectorate over Tahiti', [['PYF', 'FRA']], '', {});
  W(1843, 3, 'sindh', 'hyderabadsind', 'Napier conquers Sindh', [['SINDH', 'GBR:British India (East India Company)']], '', war);
  W(1843, 5, 'natal', 'durban', 'Britain annexes Natal', [['NATAL', 'GBR:Natal']], '', {});
  W(1846, 3, 'kashmir_raj', 'srinagar', 'Treaty of Amritsar: Kashmir under the Company', [[AH.KASHMIR_ALL, 'GBR:Jammu & Kashmir (princely state)']], '', treaty);
  W(1847, 7, 'liberia', 'monrovia', 'Liberia declares independence', [['LBR', 'LOCAL:Republic of Liberia']], '', pol);
  W(1849, 3, 'punjab', 'lahore', 'The Company annexes the Punjab', [[AH.PUNJAB_ALL, 'GBR:British India (East India Company)']], '', war);
  W(1852, 1, 'transvaal', 'pretoria', 'The South African Republic', [['TRANSVAAL', 'LOCAL:South African Republic (Transvaal)']], 'The Sand River Convention recognizes the Boer republic beyond the Vaal.', treaty);
  W(1854, 2, 'ofs', 'bloemfontein', 'The Orange Free State', [['ORANGE', 'LOCAL:Orange Free State']], '', treaty);

  // ---------------- A few with real odds
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
