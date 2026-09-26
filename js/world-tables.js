// Lookup tables for the world model: homelands, colonies, successor states,
// colonial frontiers and the names newly independent countries take.
(function (AH) {
  const L = (n) => 'LOCAL:' + n;
  const GERMANY = ['BRANDENBURG', 'PRU_EAST', 'CORRIDOR', 'UPPER_SIL', 'E_PRUSSIA', 'KONIGSBERG', 'POSEN', 'HOLSTEIN', 'BERG', 'RHINE_L', 'MAGDEBURG', 'HANOVER', 'HESSE', 'SAXONY', 'MECKLENBURG', 'SOUTH_DE'];
  AH.GERMANY = GERMANY;
  AH.GERMAN_STATES = ['HANOVER', 'HESSE', 'SAXONY', 'MECKLENBURG', 'SOUTH_DE', 'HOLSTEIN'];
  AH.ITALY = ['IT_PIED', 'IT_SARD', 'IT_LOMB', 'IT_VEN', 'IT_DUCHY', 'IT_ROMAGNA', 'IT_MARCHE', 'IT_LAZIO', 'IT_SOUTH', 'IT_SICILY'];
  AH.HABSBURG = ['AUT', 'CZE', 'SVK', 'HUN', 'SVN', 'HRV', 'CROATIA_S', 'DALMATIA', 'VOJVODINA', 'TRANSYLVANIA', 'GALICIA_W', 'GALICIA', 'BUKOVINA', 'RUTHENIA', 'IT_TRIESTE', 'IT_TREN', 'W_GALICIA'];

  AH.CORE = {
    GBR: ['GBR', 'IRL', 'IMN', 'JEY', 'MLT', 'GIB'], FRA: ['FRA', 'SAVOY', 'ALSACE', 'FR_OVERSEAS'],
    PRU: GERMANY, GER: GERMANY, AUT: AH.HABSBURG.concat(['IT_LOMB', 'IT_VEN']), ITA: AH.ITALY, SAR: ['IT_PIED', 'IT_SARD'],
    RUS: ['RUS', 'UKR', 'BLR', 'EST', 'LVA', 'LTU', 'FIN', 'ALD', 'MDA', 'GEO', 'ARM', 'AZE', 'VOLHYNIA', 'WARSAW', 'W_GALICIA', 'N_CAUCASUS', 'KONIGSBERG', 'GALICIA', 'BUKOVINA', 'RUTHENIA'],
    OTT: ['TUR', 'CYN'], ESP: ['ESP', 'ESP_CENTER', 'ESP_CAT', 'ESP_ARA', 'ESP_AND', 'ESP_EXT', 'ESP_VAL'], JPN: ['JPN'],
    QNG: ['CHN', 'JIANGNAN', 'MANCHURIA', 'NORTH_CHINA', 'SOUTH_COAST', 'TIBET', 'XINJIANG', 'MNG'],
  };

  const AFRICA = {
    NAF: ['MAR', 'DZA', 'TUN', 'LBY', 'EGY'],
    WAF: ['SEN', 'GMB', 'GIN', 'GNB', 'SLE', 'LBR', 'CIV', 'GHA', 'TGO', 'BEN', 'NGA', 'NER', 'MLI', 'BFA', 'MRT', 'SAH', 'TCD'],
    CAF: ['CMR', 'CAF', 'GAB', 'COG', 'COD', 'AGO', 'GNQ'],
    EAF: ['SDN', 'SDS', 'ETH', 'ERI', 'DJI', 'SOM', 'SOL', 'KEN', 'TZA', 'UGA', 'RWA', 'BDI'],
    SAF: ['MWI', 'ZMB', 'ZWE', 'MOZ', 'MDG', 'COM', 'NAM', 'BWA', 'LSO', 'SWZ', 'NATAL', 'ORANGE', 'TRANSVAAL'],
  };
  const ASIA = {
    SEA: ['MMR', 'THA', 'LAO', 'KHM', 'VNM', 'ANNAM_S', 'COCHINCHINA', 'MYS', 'SGP', 'BRN'],
    CAS: ['KAZ', 'UZB', 'TKM', 'KGZ', 'TJK', 'AFG'],
    EAS: ['KOR', 'PRK', 'MNG', 'SAKHALIN'],
    ARB: ['YEM', 'OMN', 'ARE', 'QAT', 'BHR', 'KWT', 'SAU'],
    PAC: ['FJI', 'SLB', 'VUT', 'NCL', 'PYF', 'WSM', 'TON', 'PNG'],
  };
  AH.FRONTIER = Object.assign({}, AFRICA, ASIA);
  AH.REGION_OF = {};
  for (const [r, ks] of Object.entries(AH.FRONTIER)) for (const k of ks) AH.REGION_OF[k] = r;

  // How strongly each would-be colonizer is drawn to each frontier.
  AH.AFFINITY = {
    GBR: { NAF: 0.7, WAF: 2, CAF: 1, EAF: 3, SAF: 4, SEA: 3, CAS: 0.15, ARB: 4, PAC: 3 },
    FRA: { NAF: 5, WAF: 4, CAF: 3, EAF: 1, SAF: 1, SEA: 3, PAC: 2, ARB: 0.3 },
    GER: { WAF: 1.5, CAF: 2.5, EAF: 2.5, SAF: 1.5, PAC: 2.5, EAS: 0.5 }, PRU: { WAF: 1, CAF: 1.5, EAF: 1.5, PAC: 1.5 },
    ITA: { NAF: 2.5, EAF: 3 }, SAR: { NAF: 1 }, ESP: { NAF: 2, WAF: 0.6, CAF: 0.6 }, POR: { CAF: 2, SAF: 2, WAF: 1 },
    NLD: { SEA: 1, PAC: 1 }, BEL: { CAF: 3 }, RUS: { CAS: 7, EAS: 2 }, JPN: { EAS: 6, SEA: 0.5, PAC: 1 },
    USA: { PAC: 2, EAS: 0.3 }, MEX: { PAC: 0.8 }, OTT: { ARB: 1.5, NAF: 1 }, EGY: { EAF: 2.5 },
  };
  AH.REGION_CULTURE = { NAF: 'ar', WAF: 'yo', CAF: 'yo', EAF: 'sw', SAF: 'zu', SEA: 'vi', CAS: 'fa', EAS: 'ko', ARB: 'ar', PAC: 'po' };
  AH.KEY_CULTURE = { ETH: 'am', ERI: 'am', SDN: 'ar', EGY: 'ar', MDG: 'sw', AFG: 'fa', MMR: 'hi', THA: 'vi', MYS: 'vi', SGP: 'zh', IDN: 'nl', PHL: 'es', LKA: 'hi', NPL: 'hi',
    BGD: 'hi', CYP: 'el', TWN: 'zh', HKG: 'zh', MAC: 'zh', MANCHURIA: 'zh', KOR: 'ko', PRK: 'ko', MNG: 'ko', JAM: 'en', BHS: 'en', TTO: 'en', BRB: 'en', GUY: 'en', SUR: 'nl',
    CUB: 'es', PRI: 'es', DOM: 'es', AGO: 'pt', MOZ: 'pt', GNB: 'pt', CPV: 'pt', STP: 'pt', TLS: 'pt', SYR: 'ar', LBN: 'ar', IRQ: 'ar', ISR: 'ar', PSX: 'ar', JOR: 'ar' };
  AH.COUNTRY = { GBR: 'Britain', FRA: 'France', PRU: 'Prussia', GER: 'Germany', AUT: 'Austria', RUS: 'Russia', OTT: 'the Ottoman Empire', ESP: 'Spain', SAR: 'Sardinia', ITA: 'Italy',
    USA: 'the United States', MEX: 'Mexico', JPN: 'Japan', QNG: 'China' };
  AH.MINOR_STRENGTH = { POR: 3, NLD: 4, BEL: 4, EGY: 2 };
  // Chance a target beats off an invasion.
  AH.RESIST = { ETH: 0.6, AFG: 0.65, THA: 0.55, SAU: 0.5, MAR: 0.3, LBR: 0.55, OMN: 0.3, KOR: 0.25, PRK: 0.25, TRANSVAAL: 0.35, ORANGE: 0.3, MNG: 0.4, YEM: 0.4, EGY: 0.3, TON: 0.4 };

  AH.COLONY_KEYS = new Set([].concat(...Object.values(AH.FRONTIER),
    ['CAPE', 'BENGAL', 'MADRAS', 'MARATHA', 'PUNJAB', 'PUNJAB_PK', 'ASSAM', 'SINDH', 'KALAT', 'KASHMIR', 'KASHMIR_PK', 'SIKKIM', 'GOA', 'PONDICHERRY', 'BGD', 'LKA', 'NPL',
      'IDN', 'TLS', 'PHL', 'HKG', 'MAC', 'TWN', 'CYP', 'SYR', 'LBN', 'IRQ', 'ISR', 'PSX', 'JOR', 'MUS', 'SYC', 'STP', 'CPV',
      'JAM', 'BHS', 'TTO', 'BRB', 'ATG', 'DMA', 'LCA', 'VCT', 'GRD', 'GUY', 'SUR', 'CUB', 'PRI', 'DOM', 'MANCHURIA', 'AMUR']));

  AH.COLONY_LIST = [...AH.COLONY_KEYS];
  // A liberated key's natural owner.
  AH.SUCCESSOR = { ROU: 'ROM:Romania', DOBRUJA: 'ROM:Romania', BGR: 'BUL:Bulgaria', E_RUMELIA: 'BUL:Bulgaria', KOR: L('Korea'), PRK: L('Korea') };

  AH.BREAKUP = {
    AUT: (s) => [[['AUT'], L('Republic of Austria')], [['CZE', 'SVK', 'RUTHENIA'], 'CZS'], [['HUN'], L('Hungary')],
      [['SVN', 'HRV', 'CROATIA_S', 'DALMATIA', 'BIH', 'VOJVODINA'], 'YUG'], [['TRANSYLVANIA', 'BUKOVINA'], 'ROM:Greater Romania'],
      [['GALICIA_W', 'GALICIA', 'W_GALICIA'], 'POL:Republic of Poland'], [['IT_TREN', 'IT_TRIESTE', 'IT_VEN', 'IT_LOMB'], AH.alive(s, 'ITA') ? 'ITA' : L('Venetian Republic')]],
    OTT: () => [[['SYR', 'LBN'], L('Arab Kingdom of Syria')], [['IRQ'], L('Iraq')], [['ISR', 'PSX', 'JOR'], L('Palestine & Transjordan')], [['SAU', 'YEM'], L('Arabia')],
      [['EGY'], L('Egypt')], [['LBY'], L('Libya')], [['BGR', 'E_RUMELIA', 'RHODOPE'], 'BUL:Bulgaria'], [['ROU', 'DOBRUJA'], 'ROM:Romania'],
      [['GR_NORTH', 'GR_THESSALY', 'GR_CRETE', 'GR_OLD', 'GR_IONIAN'], 'GRE'], [['SRB', 'SRB_SOUTH', 'MKD', 'KOS', 'BIH'], 'SRB:Serbia'], [['ALB'], L('Albania')], [['CYP'], L('Cyprus')]],
    RUS: (s) => [[['WARSAW', 'W_GALICIA', 'VOLHYNIA'], 'POL:Republic of Poland'], [['FIN', 'ALD'], L('Finland')], [['EST'], L('Estonia')], [['LVA'], L('Latvia')], [['LTU'], L('Lithuania')],
      [['GEO'], L('Georgia')], [['ARM'], L('Armenia')], [['AZE'], L('Azerbaijan')], [['MDA'], 'ROM:Greater Romania'],
      ...(AH.hash(s.seed, 'ukr', s.y) < 0.5 ? [[['UKR', 'GALICIA'], L('Ukraine')], [['BLR'], L('Belarus')]] : [])],
    QNG: () => [[['TIBET'], L('Tibet')], [['MNG'], L('Mongolia')], [['XINJIANG'], L('East Turkestan')]],
    JPN: () => [[['KOR', 'PRK'], L('Korea')], [['TWN'], 'QNG'], [['MANCHURIA'], 'QNG'], [['SAKHALIN'], 'RUS']],
    GER: () => [[['POSEN', 'CORRIDOR', 'UPPER_SIL'], 'POL:Republic of Poland']],
    GBR: () => [[['IRL'], L('Ireland')]],
  };

  // The final Soviet-style breakup when a communist Russia collapses.
  AH.RUS_REPUBLICS = { UKR: 'Ukraine', GALICIA: 'Ukraine', VOLHYNIA: 'Ukraine', RUTHENIA: 'Ukraine', BUKOVINA: 'Ukraine', BLR: 'Belarus', EST: 'Estonia', LVA: 'Latvia', LTU: 'Lithuania', MDA: 'Moldova',
    GEO: 'Georgia', ARM: 'Armenia', AZE: 'Azerbaijan', KAZ: 'Kazakhstan', UZB: 'Uzbekistan', TKM: 'Turkmenistan', KGZ: 'Kyrgyzstan', TJK: 'Tajikistan', FIN: 'Finland', WARSAW: 'Poland', W_GALICIA: 'Poland' };

  AH.KEY_NAMES = {
    MAR: 'Morocco', DZA: 'Algeria', TUN: 'Tunisia', LBY: 'Libya', EGY: 'Egypt', SEN: 'Senegal', GMB: 'The Gambia', GIN: 'Guinea', GNB: 'Guinea-Bissau', SLE: 'Sierra Leone', LBR: 'Liberia',
    CIV: 'Ivory Coast', GHA: 'Ghana', TGO: 'Togo', BEN: 'Dahomey', NGA: 'Nigeria', NER: 'Niger', MLI: 'Mali', BFA: 'Upper Volta', MRT: 'Mauritania', SAH: 'Western Sahara', TCD: 'Chad',
    CMR: 'Cameroon', CAF: 'Ubangi-Shari', GAB: 'Gabon', COG: 'Congo', COD: 'Congo', AGO: 'Angola', GNQ: 'Equatorial Guinea', SDN: 'Sudan', SDS: 'South Sudan', ETH: 'Ethiopia',
    ERI: 'Eritrea', DJI: 'Djibouti', SOM: 'Somalia', SOL: 'Somaliland', KEN: 'Kenya', TZA: 'Tanganyika', UGA: 'Uganda', RWA: 'Rwanda', BDI: 'Burundi', MWI: 'Malawi', ZMB: 'Zambia',
    ZWE: 'Zimbabwe', MOZ: 'Mozambique', MDG: 'Madagascar', COM: 'Comoros', NAM: 'Namibia', BWA: 'Botswana', LSO: 'Lesotho', SWZ: 'Eswatini', NATAL: 'Natal', ORANGE: 'Orange Free State',
    TRANSVAAL: 'Transvaal', CAPE: 'Cape', MMR: 'Burma', THA: 'Siam', LAO: 'Laos', KHM: 'Cambodia', VNM: 'Vietnam', ANNAM_S: 'Vietnam', COCHINCHINA: 'Vietnam', MYS: 'Malaya', SGP: 'Singapore',
    BRN: 'Brunei', KAZ: 'Kazakhstan', UZB: 'Uzbekistan', TKM: 'Turkmenistan', KGZ: 'Kyrgyzstan', TJK: 'Tajikistan', AFG: 'Afghanistan', KOR: 'Korea', PRK: 'Korea', MNG: 'Mongolia',
    SAKHALIN: 'Sakhalin', YEM: 'Yemen', OMN: 'Oman', ARE: 'Trucial Emirates', QAT: 'Qatar', BHR: 'Bahrain', KWT: 'Kuwait', SAU: 'Arabia', FJI: 'Fiji', SLB: 'Solomon Islands',
    VUT: 'Vanuatu', NCL: 'New Caledonia', PYF: 'Tahiti', WSM: 'Samoa', TON: 'Tonga', PNG: 'Papua New Guinea', BENGAL: 'India', MADRAS: 'India', MARATHA: 'India', PUNJAB: 'India',
    PUNJAB_PK: 'Pakistan', ASSAM: 'India', SINDH: 'Pakistan', KALAT: 'Pakistan', KASHMIR: 'India', KASHMIR_PK: 'Pakistan', SIKKIM: 'Sikkim', GOA: 'India', PONDICHERRY: 'India',
    BGD: 'Bengal', LKA: 'Ceylon', NPL: 'Nepal', IDN: 'Indonesia', TLS: 'East Timor', PHL: 'Philippines', HKG: 'Hong Kong', MAC: 'Macau', TWN: 'Taiwan', CYP: 'Cyprus', SYR: 'Syria',
    LBN: 'Lebanon', IRQ: 'Iraq', ISR: 'Palestine', PSX: 'Palestine', JOR: 'Transjordan', MUS: 'Mauritius', SYC: 'Seychelles', STP: 'São Tomé', CPV: 'Cape Verde', JAM: 'Jamaica',
    BHS: 'Bahamas', TTO: 'Trinidad', BRB: 'Barbados', ATG: 'Antigua', DMA: 'Dominica', LCA: 'Saint Lucia', VCT: 'Saint Vincent', GRD: 'Grenada', GUY: 'Guyana', SUR: 'Suriname',
    CUB: 'Cuba', PRI: 'Puerto Rico', DOM: 'Dominican Republic', MANCHURIA: 'Manchuria', AMUR: 'Amur',
    ROU: 'Wallachia & Moldavia', SRB: 'Serbia', BGR: 'Bulgaria', ALB: 'Albania', MKD: 'Macedonia', KOS: 'Kosovo', IRL: 'Ireland',
  };

  // A place to pin events about each frontier key.
  AH.KEY_PLACE = {
    MAR: 'algiers', DZA: 'algiers', TUN: 'tunis', LBY: 'tunis', EGY: 'cairo', SEN: 'stlouissen', GMB: 'stlouissen', GIN: 'freetown', GNB: 'stlouissen', SLE: 'freetown', LBR: 'monrovia',
    CIV: 'kumasi', GHA: 'kumasi', TGO: 'abomey', BEN: 'abomey', NGA: 'lagos', NER: 'timbuktu', MLI: 'timbuktu', BFA: 'timbuktu', MRT: 'stlouissen', SAH: 'stlouissen', TCD: 'timbuktu',
    CMR: 'lagos', CAF: 'leopoldville', GAB: 'leopoldville', COG: 'leopoldville', COD: 'leopoldville', AGO: 'leopoldville', GNQ: 'lagos', SDN: 'khartoum', SDS: 'fashoda', ETH: 'adwa',
    ERI: 'massawa', DJI: 'massawa', SOM: 'aden', SOL: 'aden', KEN: 'zanzibar', TZA: 'dares', UGA: 'zanzibar', RWA: 'dares', BDI: 'dares', MWI: 'salisbury', ZMB: 'salisbury',
    ZWE: 'salisbury', MOZ: 'salisbury', MDG: 'tananarive', COM: 'tananarive', NAM: 'windhoek', BWA: 'windhoek', LSO: 'bloemfontein', SWZ: 'pretoria', NATAL: 'durban',
    ORANGE: 'bloemfontein', TRANSVAAL: 'pretoria', CAPE: 'capetown', MMR: 'mandalay', THA: 'vientiane', LAO: 'vientiane', KHM: 'phnompenh', VNM: 'hanoi', ANNAM_S: 'hue',
    COCHINCHINA: 'saigon', MYS: 'kuala', SGP: 'singapore', BRN: 'kinabalu', KAZ: 'alma', UZB: 'samarkand', TKM: 'merv', KGZ: 'tashkent', TJK: 'samarkand', AFG: 'kabul',
    KOR: 'seoul', PRK: 'seoul', MNG: 'beijing', SAKHALIN: 'vladivostok', YEM: 'aden', OMN: 'aden', ARE: 'aden', QAT: 'aden', BHR: 'aden', KWT: 'aden', SAU: 'diriyah', FJI: 'suva',
    SLB: 'suva', VUT: 'noumea', NCL: 'noumea', PYF: 'papeete', WSM: 'apia', TON: 'apia', PNG: 'portmoresby', BENGAL: 'calcutta', PUNJAB_PK: 'lahore', IDN: 'batavia', PHL: 'manila',
    HKG: 'hongkong', TWN: 'taipei', CYP: 'nicosia', SYR: 'aden', IRQ: 'aden', ISR: 'aden', JAM: 'kingston', GUY: 'georgetown', SUR: 'georgetown', CUB: 'havana', PRI: 'sanjuan',
    LKA: 'calcutta', MANCHURIA: 'aigun', AMUR: 'aigun', MUS: 'port_louis', BHS: 'kingston', TTO: 'caracas',
  };
  AH.CAPITAL = { GBR: 'london', FRA: 'paris', PRU: 'berlin', GER: 'berlin', AUT: 'vienna', RUS: 'stpetersburg', OTT: 'constantinople', ESP: 'madrid', SAR: 'turin', ITA: 'rome',
    USA: 'washington', MEX: 'mexico', JPN: 'tokyo', QNG: 'beijing' };
  // Where each rivalry's wars are fought.
  AH.FLASHPOINT = {
    'FRA|PRU': ['strasbourg', 'Rhine'], 'FRA|GER': ['strasbourg', 'Rhine'], 'OTT|RUS': ['plevna', 'Danube'], 'AUT|PRU': ['koniggratz', 'Bohemian'], 'AUT|GER': ['koniggratz', 'Bohemian'],
    'AUT|SAR': ['solferino', 'Lombard'], 'AUT|ITA': ['venice', 'Venetian'], 'JPN|QNG': ['seoul', 'Korean'], 'JPN|RUS': ['aigun', 'Manchurian'], 'QNG|RUS': ['aigun', 'Amur'],
    'GBR|RUS': ['kabul', 'Afghan'], 'FRA|GBR': ['fashoda', 'Nile'], 'GBR|GER': ['copenhagen', 'North Sea'], 'GBR|PRU': ['copenhagen', 'North Sea'], 'AUT|RUS': ['warsaw', 'Galician'],
    'GER|RUS': ['warsaw', 'Vistula'], 'PRU|RUS': ['warsaw', 'Vistula'], 'FRA|ITA': ['nice', 'Alpine'], 'FRA|SAR': ['nice', 'Alpine'], 'GBR|QNG': ['canton', 'Canton'], 'FRA|QNG': ['canton', 'Tonkin'],
    'GBR|USA': ['york', 'Canadian'], 'ESP|FRA': ['madrid', 'Pyrenean'], 'AUT|FRA': ['milan', 'Lombard'], 'GER|JPN': ['shimonoseki', 'Pacific'], 'ITA|OTT': ['tunis', 'Libyan'],
    'GBR|OTT': ['cairo', 'Egyptian'], 'FRA|OTT': ['tunis', 'Syrian'], 'JPN|USA': ['honolulu', 'Pacific'], 'GBR|JPN': ['singapore', 'Pacific'], 'FRA|RUS': ['sevastopol', 'Black Sea'],
  };
})(globalThis.AH = globalThis.AH || {});
