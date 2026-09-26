// The rest of the world. Far from Mexico's ripples, these mostly follow our
// timeline and run as near-certain background events. A few carry real odds,
// such as Adwa and the opening of Japan, or depend on the Americas.
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
  W(1853, 10, 'crimea', 'sevastopol', 'The Crimean War', [], 'Britain, France and the Ottomans against Russia; Sevastopol falls after a year-long siege.', war);
  W(1859, 1, 'romania', 'bucharest', 'The United Principalities', [[['ROU'], 'ROM:United Principalities (Ottoman vassal)']], 'Alexandru Ioan Cuza is elected prince of both Wallachia and Moldavia.', pol);
  W(1859, 6, 'solferino', 'solferino', 'Solferino: Lombardy to Piedmont', [['IT_LOMB', 'SAR']], '', war);
  W(1860, 3, 'central_italy', 'turin', 'Central Italy votes to join Piedmont; Savoy and Nice to France', [[['IT_DUCHY', 'IT_ROMAGNA'], 'SAR'], ['SAVOY', 'FRA']], '', pol);
  W(1860, 10, 'thousand', 'palermo', 'Garibaldi and the Thousand', [[['IT_SICILY', 'IT_SOUTH', 'IT_MARCHE'], 'SAR']], '', { kind: 'war', major: true });
  W(1861, 3, 'italy', 'turin', 'The Kingdom of Italy', [[['IT_PIED', 'IT_SARD', 'IT_LOMB', 'IT_DUCHY', 'IT_ROMAGNA', 'IT_MARCHE', 'IT_SOUTH', 'IT_SICILY'], 'ITA']], '', pol);
  W(1864, 5, 'ionian', 'corfu', 'Britain cedes the Ionian Islands to Greece', [['GR_IONIAN', 'GRE']], '', treaty);
  W(1864, 10, 'dybbol', 'dybbol', 'The Second Schleswig War', [['HOLSTEIN', 'PRU']], 'Prussia and Austria take Schleswig and Holstein from Denmark.', war);
  W(1866, 7, 'koniggratz', 'koniggratz', 'Königgrätz: Prussia defeats Austria', [[['HANOVER', 'HESSE'], 'PRU'], [['SAXONY', 'MECKLENBURG'], 'PRU:North German Confederation'], ['IT_VEN', 'ITA']], 'Prussia annexes Hanover and Hesse; Venetia goes to Italy.', { kind: 'war', major: true });
  W(1867, 2, 'ausgleich', 'budapest', 'The Austro-Hungarian Compromise', [[['AUT', 'CZE', 'SVK', 'HUN', 'SVN', 'HRV', 'CROATIA_S', 'DALMATIA', 'VOJVODINA', 'TRANSYLVANIA', 'GALICIA', 'RUTHENIA', 'IT_TRIESTE', 'IT_TREN'], 'AUT:Austria-Hungary']], '', pol);
  W(1870, 9, 'sedan', 'sedan', 'Sedan; Rome taken', [['IT_LAZIO', 'ITA']], 'Napoleon III is captured. French troops leave Rome, and Italian troops enter it.', { kind: 'war', major: true });
  W(1871, 1, 'german_empire', 'versailles', 'The German Empire proclaimed', [[['BRANDENBURG', 'PRU_EAST', 'POSEN', 'HOLSTEIN', 'BERG', 'RHINE_L', 'MAGDEBURG', 'HANOVER', 'HESSE', 'SAXONY', 'MECKLENBURG', 'SOUTH_DE'], 'GER'], ['ALSACE', 'GER']], 'Wilhelm I is proclaimed German Emperor in the Hall of Mirrors. Alsace-Lorraine is annexed.', { kind: 'politics', major: true });
  W(1878, 7, 'berlin_congress', 'plevna', 'The Congress of Berlin', [[['SRB', 'SRB_SOUTH'], 'SRB'], ['MNE', 'LOCAL:Principality of Montenegro'], [['ROU', 'DOBRUJA'], 'ROM'], ['BGR', 'BUL:Principality of Bulgaria'], ['E_RUMELIA', 'OTT:Eastern Rumelia (autonomous)'], ['BIH', 'AUT:Austria-Hungary (occupied Bosnia)'], ['CYP', 'GBR'], ['CYN', 'GBR'], ['ESB', 'GBR']], 'After the Russo-Turkish War, Serbia, Montenegro and Romania become independent and Bulgaria autonomous.', { kind: 'treaty', major: true });
  W(1881, 7, 'thessaly', 'larissa', 'Greece gains Thessaly', [['GR_THESSALY', 'GRE']], '', treaty);
  W(1885, 9, 'rumelia', 'plovdiv', 'Bulgaria unites with Eastern Rumelia', [['E_RUMELIA', 'BUL']], '', pol);
  W(1898, 11, 'crete', 'canea', 'The Cretan State', [['GR_CRETE', 'LOCAL:Cretan State (autonomous)']], '', pol);

  // ---------------- Russia & Asia
  W(1822, 1, 'kazakh', 'alma', 'Russia absorbs the Kazakh hordes', [['KAZ', 'RUS']], 'Speranskii\'s statute begins the absorption of the steppe, complete by the 1840s.', {});
  W(1859, 8, 'gunib', 'gunib', 'Imam Shamil surrenders at Gunib', [['N_CAUCASUS', 'RUS']], '', war);
  W(1858, 5, 'aigun', 'aigun', 'Treaties of Aigun and Peking: the Amur', [['AMUR', 'RUS']], 'Russia takes the Amur and the Ussuri coast and founds Vladivostok in 1860.', treaty);
  W(1868, 5, 'samarkand', 'samarkand', 'Russia takes Samarkand', [[['UZB', 'TJK'], 'RUS:Bukhara (Russian protectorate)']], '', war);
  W(1876, 2, 'kokand', 'tashkent', 'Russia annexes Kokand', [['KGZ', 'RUS']], '', war);
  W(1884, 2, 'merv', 'merv', 'Merv submits to Russia', [['TKM', 'RUS']], '', war);
  W(1875, 5, 'sakhalin', 'vladivostok', 'Treaty of St Petersburg: Sakhalin to Russia', [['SAKHALIN', 'RUS']], '', treaty);
  W(1818, 6, 'maratha', 'pune', 'The fall of the Peshwa', [['MARATHA', 'GBR:British India (East India Company)']], 'The Third Anglo-Maratha War leaves the Company paramount in India.', war);
  W(1818, 9, 'diriyah', 'diriyah', 'Egypt destroys the First Saudi State', [['SAU', 'EGY:Hejaz & Najd (Egyptian occupation)']], '', war);
  W(1824, 1, 'saudi2', 'diriyah', 'The Second Saudi State', [['SAU', L('Emirate of Nejd & Hejaz (Ottoman)')]], '', pol);
  W(1819, 7, 'kashmir_sikh', 'srinagar', 'Ranjit Singh takes Kashmir', [['KASHMIR', 'SIKH']], '', war);
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
  W(1846, 3, 'kashmir_raj', 'srinagar', 'Treaty of Amritsar: Kashmir under the Company', [['KASHMIR', 'GBR:Jammu & Kashmir (princely state)']], '', treaty);
  W(1847, 7, 'liberia', 'monrovia', 'Liberia declares independence', [['LBR', 'LOCAL:Republic of Liberia']], '', pol);
  W(1849, 3, 'punjab', 'lahore', 'The Company annexes the Punjab', [['PUNJAB', 'GBR:British India (East India Company)']], '', war);
  W(1852, 1, 'transvaal', 'pretoria', 'The South African Republic', [['TRANSVAAL', 'LOCAL:South African Republic (Transvaal)']], 'The Sand River Convention recognizes the Boer republic beyond the Vaal.', treaty);
  W(1854, 2, 'ofs', 'bloemfontein', 'The Orange Free State', [['ORANGE', 'LOCAL:Orange Free State']], '', treaty);
  W(1853, 3, 'taiping', 'nanjing', 'The Taiping take Nanjing', [['JIANGNAN', 'TAI']], 'Hong Xiuquan, who believes he is Christ\'s younger brother, makes Nanjing his Heavenly Capital. The war will kill 20–30 million people.', { kind: 'revolt', major: true });
  W(1864, 7, 'taiping_end', 'nanjing', 'Nanjing falls to Zeng Guofan', [['JIANGNAN', 'QNG']], '', war);
  W(1853, 9, 'new_caledonia', 'noumea', 'France annexes New Caledonia', [['NCL', 'FRA']], '', {});
  W(1857, 5, 'sepoy', 'meerut', 'The Indian Rebellion', [], 'Sepoys mutiny at Meerut and march on Delhi.', { kind: 'revolt', major: true });
  W(1858, 8, 'raj', 'calcutta', 'The Crown takes over India', [[['BENGAL', 'MADRAS', 'MARATHA', 'PUNJAB', 'ASSAM', 'SINDH', 'BGD'], RAJ]], 'The East India Company is abolished.', pol);
  W(1860, 10, 'peking', 'beijing', 'The Second Opium War ends', [], 'Anglo-French troops burn the Summer Palace.', war);
  W(1862, 6, 'cochinchina', 'saigon', 'France takes Cochinchina', [['COCHINCHINA', 'FRA:French Cochinchina']], '', war);
  W(1863, 8, 'cambodia', 'phnompenh', 'French protectorate over Cambodia', [['KHM', 'FRA:Cambodia (French protectorate)']], '', treaty);
  W(1865, 1, 'yakub', 'kashgar', 'Yakub Beg\'s Kashgaria', [['XINJIANG', 'LOCAL:Yettishar (Yakub Beg)']], '', { kind: 'revolt' });
  W(1877, 12, 'xinjiang_back', 'kashgar', 'Zuo Zongtang reconquers Xinjiang', [['XINJIANG', 'QNG']], '', war);
  W(1868, 1, 'meiji', 'tokyo', 'The Meiji Restoration', [], 'The shogunate falls. Japan begins a crash modernization.', { kind: 'politics', major: true });
  W(1868, 3, 'basutoland', 'bloemfontein', 'Basutoland a British protectorate', [['LSO', 'GBR']], '', {});
  W(1874, 1, 'malaya', 'kuala', 'The Pangkor Treaty: British residents in Malaya', [['MYS', 'GBR:British Malaya']], '', treaty);
  W(1874, 10, 'fiji', 'suva', 'Fiji ceded to Britain', [['FJI', 'GBR']], '', {});
  W(1876, 12, 'kalat', 'quetta', 'Britain takes Quetta and Kalat', [['KALAT', RAJ]], '', treaty);
  W(1882, 9, 'egypt', 'cairo', 'Britain occupies Egypt', [['EGY', 'GBR:Egypt (British occupation)']], 'Tel el-Kebir. The Suez Canal is now British-guarded.', { kind: 'war', major: true });
  W(1884, 11, 'berlin_conf', 'leopoldville', 'The Berlin Conference', [['TGO', 'GER'], ['CMR', 'GER'], ['NAM', 'GER:German South West Africa'], ['PNG', 'GER:New Guinea (German & British)'], ['SAH', 'ESP'], ['SOL', 'GBR']], 'Fourteen powers set the rules for partitioning Africa.', { kind: 'treaty', major: true });
  W(1885, 2, 'congo', 'leopoldville', 'The Congo Free State', [['COD', 'BEL:Congo Free State (Leopold II)']], '', {});
  W(1885, 1, 'mahdi', 'khartoum', 'Khartoum falls to the Mahdi', [['SDN', 'LOCAL:Mahdist State'], ['SDS', 'LOCAL:Mahdist State']], 'Gordon is killed.', war);
  W(1885, 3, 'bechuanaland', 'windhoek', 'Bechuanaland Protectorate', [['BWA', 'GBR']], '', {});
  W(1885, 6, 'tonkin', 'hanoi', 'French Indochina: Annam and Tonkin', [['VNM', 'FRA:French Indochina'], ['COCHINCHINA', 'FRA:French Indochina'], ['KHM', 'FRA:French Indochina']], '', war);
  W(1885, 11, 'mandalay', 'mandalay', 'Britain annexes Upper Burma', [['MMR', RAJ]], '', war);
  W(1885, 12, 'gea', 'dares', 'German East Africa', [['TZA', 'GER:German East Africa'], ['RWA', 'GER:German East Africa'], ['BDI', 'GER:German East Africa']], '', {});
  W(1886, 7, 'niger_co', 'lagos', 'The Royal Niger Company', [['NGA', 'GBR']], '', {});
  W(1886, 4, 'comoros', 'tananarive', 'French protectorate over the Comoros', [['COM', 'FRA']], '', {});
  W(1887, 6, 'senegal', 'stlouissen', 'French Senegal and Guinea', [['SEN', 'FRA:French West Africa'], ['GIN', 'FRA:French West Africa'], ['GMB', 'GBR']], '', {});
  W(1888, 3, 'djibouti', 'massawa', 'French Somaliland', [['DJI', 'FRA']], '', {});
  W(1888, 9, 'brunei', 'kinabalu', 'Brunei a British protectorate', [['BRN', 'GBR']], '', {});
  W(1889, 5, 'eritrea', 'massawa', 'Italian Eritrea and Somalia', [['ERI', 'ITA'], ['SOM', 'ITA']], '', {});
  W(1890, 9, 'rhodesia', 'salisbury', 'The British South Africa Company enters Mashonaland', [['ZWE', 'GBR:Rhodesia (BSAC)'], ['ZMB', 'GBR:Rhodesia (BSAC)'], ['MWI', 'GBR']], '', {});
  W(1890, 7, 'zanzibar', 'zanzibar', 'Zanzibar a British protectorate', [['KEN', 'GBR:British East Africa']], '', treaty);
  W(1892, 11, 'mali', 'timbuktu', 'France conquers the Niger bend', [['MLI', 'FRA:French West Africa'], ['CIV', 'FRA:French West Africa']], '', war);
  W(1893, 10, 'laos', 'vientiane', 'Siam cedes Laos to France', [['LAO', 'FRA:French Indochina']], '', treaty);
  W(1893, 3, 'solomons', 'suva', 'British Solomon Islands', [['SLB', 'GBR']], '', {});
  W(1894, 1, 'dahomey', 'abomey', 'France conquers Dahomey', [['BEN', 'FRA:French West Africa'], ['CAF', 'FRA:French Congo'], ['GAB', 'FRA:French Congo'], ['COG', 'FRA:French Congo']], '', war);
  W(1894, 6, 'uganda', 'zanzibar', 'Uganda Protectorate', [['UGA', 'GBR']], '', {});
  W(1895, 4, 'shimonoseki', 'shimonoseki', 'Treaty of Shimonoseki', [['TWN', 'JPN']], 'Japan defeats China and takes Taiwan. Korea is declared independent of China.', { kind: 'war', major: true });
  W(1895, 7, 'fmalay', 'kuala', 'The Federated Malay States', [], '', pol);
  W(1896, 1, 'ashanti', 'kumasi', 'Britain occupies Kumasi', [['GHA', 'GBR:Gold Coast'], ['SLE', 'GBR']], '', war);
  W(1896, 9, 'madagascar', 'tananarive', 'France annexes Madagascar', [['MDG', 'FRA']], '', war);
  W(1896, 9, 'upper_volta', 'timbuktu', 'The Mossi kingdoms fall to France', [['BFA', 'FRA:French West Africa']], '', war);
  W(1897, 10, 'korea', 'seoul', 'The Korean Empire', [[['KOR', 'PRK'], 'LOCAL:Korean Empire']], '', pol);
  W(1898, 9, 'omdurman', 'omdurman', 'Omdurman and Fashoda', [[['SDN', 'SDS'], 'GBR:Anglo-Egyptian Sudan']], 'Kitchener destroys the Mahdist army. At Fashoda, Marchand\'s French column backs down.', { kind: 'war', major: true });
  W(1899, 12, 'samoa', 'apia', 'Samoa partitioned', [['WSM', 'GER']], '', treaty);
  W(1899, 6, 'kuwait', 'aden', 'Kuwait under British protection', [['KWT', 'GBR:Kuwait (British protected)']], '', treaty);
  W(1899, 10, 'niger_chad', 'timbuktu', 'French columns reach Lake Chad', [['NER', 'FRA:French West Africa'], ['TCD', 'FRA:French Congo']], '', war);
  W(1900, 9, 'boer', 'pretoria', 'Britain annexes the Boer republics', [[['TRANSVAAL', 'ORANGE'], 'GBR']], 'Roberts takes Pretoria; the guerrilla war goes on until 1902.', { kind: 'war', major: true });
  W(1900, 6, 'boxers', 'beijing', 'The Boxer Rising', [], 'Eight powers march on Beijing to relieve the besieged legations.', { kind: 'revolt', major: true });

  // ---------------- A few with real odds
  E.push({ id: 'japan_opened', y: 1853, m: 7, place: 'uraga', kind: 'diplomacy', major: true,
    title: 'Black ships: Japan is opened',
    text: (s) => (s.oid('US-CA') === 'USA' ? 'With San Francisco as a Pacific base, Commodore Perry\'s squadron anchors at Uraga.' : 'Without a Pacific coast, the United States has no Pacific base to send a squadron from.'),
    outcomes: [
      { title: 'By Commodore Perry (United States)', w: (s) => (s.oid('US-CA') === 'USA' || s.oid('OREGON') === 'USA' ? 0.85 : 0.3) },
      { title: 'By Admiral Putyatin (Russia)', w: 0.3, place: 'shimonoseki' },
      { title: 'By a British squadron from Hong Kong', w: (s) => (s.oid('US-CA') === 'USA' ? 0.05 : 0.4) },
    ] });
  E.push({ id: 'adwa', y: 1896, m: 3, place: 'adwa', kind: 'war', major: true,
    title: 'Adwa',
    text: 'Menelik II meets the Italian army invading Ethiopia from Eritrea.',
    outcomes: [
      { title: 'Ethiopian victory', w: 0.8, text: 'The largest defeat of a European army in Africa. Ethiopia remains independent.', fx: (s) => s.own('ETH', 'LOCAL:Ethiopian Empire (Menelik II)') },
      { title: 'Italian victory', w: 0.2, fx: (s) => s.own('ETH', 'ITA:Italian Ethiopia') },
    ] });
  W(1855, 1, 'ethiopia', 'adwa', 'Tewodros II reunifies Ethiopia', [['ETH', 'LOCAL:Ethiopian Empire']], '', pol);
  W(1881, 5, 'tunisia', 'tunis', 'French protectorate over Tunisia', [['TUN', 'FRA']], '', treaty);
})(globalThis.AH = globalThis.AH || {});
