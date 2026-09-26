// Historical territories built from Natural Earth admin-1 units.
// A unit is matched to the first group whose selector includes it:
//   'US-TX'           a unit id (ISO 3166-2 code)
//   '@ITA/Lombardia'  every unit of a country in a Natural Earth region
// Unmatched units fall back to their country code (e.g. 'BRA'); in the United
// States and Canada each state or province is its own key.
(function (AH) {
  const G = [
    // ---- New Spain and its frontier ----
    ['YUCATAN', 'Yucatán & Campeche', ['MX-YUC', 'MX-CAM']],
    ['QROO', 'Eastern Yucatán (Quintana Roo)', ['MX-ROO']],
    ['CHIAPAS', 'Chiapas', ['MX-CHP']],
    ['MOSQUITO', 'Mosquito Coast', ['HN-GD', 'NI-AN', 'NI-AS']],
    ['NEWMEX', 'Santa Fe de Nuevo México', ['US-NM', 'US-AZ', 'US-CO']],
    ['GBASIN', 'Great Basin (Utah & Nevada)', ['US-NV', 'US-UT']],
    ['OREGON', 'Oregon Country', ['US-WA', 'US-OR', 'US-ID']],
    ['RUPERT', "Rupert's Land & North-Western Territory", ['CA-MB', 'CA-SK', 'CA-AB', 'CA-NT', 'CA-NU', 'CA-YT']],

    // ---- South America ----
    ['PATAGONIA', 'Pampas & Patagonia', ['AR-Q', 'AR-R', 'AR-U', 'AR-Z', 'AR-V', 'AR-L']],
    ['CHACO', 'Gran Chaco', ['AR-P', 'AR-H']],
    ['ANTOFAGASTA', 'Atacama littoral (Antofagasta)', ['CL-AN']],
    ['TARAPACA', 'Tarapacá & Arica', ['CL-TA', 'CL-AP']],
    ['ARAUCANIA', 'Araucanía (Wallmapu)', ['CL-AR']],
    ['MAGALLANES', 'Aysén & Magallanes', ['CL-AI', 'CL-MA']],

    // ---- Iberia (for the French occupation) ----
    ['ESP_CENTER', 'Castile, Madrid & the north', ['@ESP/Madrid', '@ESP/Castilla y León', '@ESP/Castilla-La Mancha', '@ESP/Foral de Navarra', '@ESP/País Vasco', '@ESP/La Rioja']],
    ['ESP_CAT', 'Catalonia', ['@ESP/Cataluña']],
    ['ESP_ARA', 'Aragon', ['@ESP/Aragón']],
    ['ESP_AND', 'Andalusia', ['@ESP/Andalucía']],
    ['ESP_EXT', 'Extremadura', ['@ESP/Extremadura']],
    ['ESP_VAL', 'Valencia & Murcia', ['@ESP/Valenciana', '@ESP/Murcia']],

    // ---- France's moving frontiers ----
    ['SAVOY', 'Savoy & Nice', ['FR-73', 'FR-74', 'FR-06']],
    ['FR_OVERSEAS', 'French overseas colonies', ['FR-GF', 'FR-MQ', 'FR-GP', 'FR-RE', 'FR-YT']],
    ['ALSACE', 'Alsace-Lorraine', ['FR-67', 'FR-68', 'FR-57']],

    // ---- Germany ----
    ['RHINE_L', 'Left bank of the Rhine', ['DE-RP', 'DE-SL']],
    ['BERG', 'Berg & Westphalia (Rhine-Ruhr)', ['DE-NW']],
    ['MAGDEBURG', 'Magdeburg & Prussian Saxony', ['DE-ST']],
    ['HANOVER', 'Hanover & the Hanseatic cities', ['DE-NI', 'DE-HB', 'DE-HH']],
    ['HESSE', 'Hesse & Nassau', ['DE-HE']],
    ['SAXONY', 'Saxony & Thuringia', ['DE-SN', 'DE-TH']],
    ['MECKLENBURG', 'Mecklenburg & Swedish Pomerania', ['DE-MV']],
    ['SOUTH_DE', 'Bavaria, Württemberg & Baden', ['DE-BY', 'DE-BW']],
    ['HOLSTEIN', 'Schleswig-Holstein', ['DE-SH']],
    ['BRANDENBURG', 'Brandenburg', ['DE-BB', 'DE-BE']],
    ['PRU_EAST', 'Pomerania & Lower Silesia', ['PL-ZP', 'PL-DS', 'PL-OP', 'PL-LB']],
    ['CORRIDOR', 'West Prussia & Danzig', ['PL-PM']],
    ['UPPER_SIL', 'Upper Silesia', ['PL-SL']],
    ['E_PRUSSIA', 'Southern East Prussia (Masuria)', ['PL-WN']],
    ['KONIGSBERG', 'Königsberg', ['RU-KGD']],
    ['POSEN', 'Posen & West Prussia', ['PL-WP', 'PL-KP']],
    ['WARSAW', 'Masovia (Warsaw)', ['PL-MZ', 'PL-LD', 'PL-PD']],
    ['W_GALICIA', 'Kraków, Lublin & Sandomierz', ['PL-SK', 'PL-LU', 'PL-MA']],
    ['GALICIA_W', 'Western Galicia (Rzeszów)', ['PL-PK']],
    ['GALICIA', 'Eastern Galicia (Lviv)', ['UA-46', 'UA-26', 'UA-61']],
    ['BUKOVINA', 'Bukovina', ['UA-77', 'RO-SV']],
    ['VOLHYNIA', 'Volhynia', ['UA-07', 'UA-56']],
    ['RUTHENIA', 'Carpathian Ruthenia', ['UA-21']],

    // ---- Italy ----
    ['IT_PIED', 'Piedmont & Liguria', ['@ITA/Piemonte', "@ITA/Valle d'Aosta", '@ITA/Liguria']],
    ['IT_SARD', 'Sardinia', ['@ITA/Sardegna']],
    ['IT_LOMB', 'Lombardy', ['@ITA/Lombardia']],
    ['IT_TRIESTE', 'Trieste & Gorizia', ['IT-TS', 'IT-GO']],
    ['IT_VEN', 'Venetia & Friuli', ['@ITA/Veneto', '@ITA/Friuli-Venezia Giulia']],
    ['IT_TREN', 'Trentino & South Tyrol', ['@ITA/Trentino-Alto Adige']],
    ['IT_ROMAGNA', 'Bologna & the Legations', ['IT-BO', 'IT-FE', 'IT-RA', 'IT-FC', 'IT-RN']],
    ['IT_DUCHY', 'Parma, Modena & Tuscany', ['@ITA/Emilia-Romagna', '@ITA/Toscana']],
    ['IT_MARCHE', 'Marche & Umbria', ['@ITA/Marche', '@ITA/Umbria']],
    ['IT_LAZIO', 'Rome & Lazio', ['@ITA/Lazio']],
    ['IT_SOUTH', 'Naples (mainland south)', ['@ITA/Abruzzo', '@ITA/Molise', '@ITA/Campania', '@ITA/Apulia', '@ITA/Basilicata', '@ITA/Calabria']],
    ['IT_SICILY', 'Sicily', ['@ITA/Sicily']],

    // ---- Danube & Balkans ----
    ['DALMATIA', 'Dalmatia & Ragusa', ['HR-13', 'HR-15', 'HR-17', 'HR-19']],
    ['CROATIA_S', 'Military Frontier & Istria', ['HR-18', 'HR-08', 'HR-09', 'HR-04']],
    ['VOJVODINA', 'Banat, Bačka & Syrmia', ['RS-01', 'RS-02', 'RS-03', 'RS-04', 'RS-05', 'RS-06', 'RS-07']],
    ['SRB_SOUTH', 'Niš & Pirot', ['RS-20', 'RS-21', 'RS-22', 'RS-23', 'RS-24']],
    ['TRANSYLVANIA', 'Transylvania & the Banat', ['RO-SM', 'RO-AR', 'RO-BH', 'RO-TM', 'RO-CS', 'RO-MM', 'RO-CJ', 'RO-BN', 'RO-SJ', 'RO-HD', 'RO-CV', 'RO-BV', 'RO-SB', 'RO-MS', 'RO-HR', 'RO-AB']],
    ['DOBRUJA', 'Dobruja', ['RO-CT', 'RO-TL']],
    ['E_RUMELIA', 'Eastern Rumelia', ['BG-16', 'BG-24', 'BG-26', 'BG-02', 'BG-20', 'BG-28', 'BG-13']],
    ['RHODOPE', 'Rhodopes & Pirin', ['BG-09', 'BG-21', 'BG-01']],
    ['GR_OLD', 'Morea, Attica & the Cyclades', ['GR-J', 'GR-G', 'GR-A1', 'GR-H', 'GR-L']],
    ['GR_IONIAN', 'Ionian Islands', ['GR-F']],
    ['GR_THESSALY', 'Thessaly', ['GR-E']],
    ['GR_CRETE', 'Crete', ['GR-M']],
    ['GR_NORTH', 'Macedonia, Epirus & Thrace', ['GR-C', 'GR-D', 'GR-B', 'GR-A', 'GR-69', 'GR-K']],

    // ---- Russia's frontiers ----
    ['N_CAUCASUS', 'Chechnya & Dagestan', ['RU-DA', 'RU-CE', 'RU-IN']],
    ['AMUR', 'Amur & Ussuri (Outer Manchuria)', ['RU-AMU', 'RU-YEV', 'RU-PRI', 'RU-KHA']],
    ['SAKHALIN', 'Sakhalin', ['RU-SAK']],

    // ---- South Asia ----
    ['BENGAL', 'Bengal Presidency & the Doab', ['IN-WB', 'IN-BR', 'IN-JH', 'IN-OR', 'IN-UP', 'IN-DL', 'IN-UT', 'IN-TR', 'IN-ML']],
    ['MADRAS', 'Madras, Mysore & Hyderabad', ['IN-TN', 'IN-AP', 'IN-TG', 'IN-KL', 'IN-KA', 'IN-AN']],
    ['MARATHA', 'Maratha & Rajput lands', ['IN-MH', 'IN-MP', 'IN-GJ', 'IN-CT', 'IN-RJ']],
    ['PUNJAB', 'East Punjab', ['IN-PB', 'IN-HR', 'IN-HP']],
    ['PUNJAB_PK', 'West Punjab & Peshawar', ['PK-PB', 'PK-IS', 'PK-KP']],
    ['KASHMIR', 'Jammu, Kashmir & Ladakh', ['IN-JK', 'IN-LA']],
    ['KASHMIR_PK', 'Azad Kashmir & Gilgit', ['PK-JK', 'PK-GB']],
    ['ASSAM', 'Assam & the north-east hills', ['IN-AS', 'IN-AR', 'IN-NL', 'IN-MN', 'IN-MZ']],
    ['SIKKIM', 'Sikkim', ['IN-SK']],
    ['GOA', 'Goa, Daman & Diu', ['IN-GA', 'IN-DH']],
    ['PONDICHERRY', 'Pondichéry', ['IN-PY']],
    ['SINDH', 'Sindh', ['PK-SD']],
    ['KALAT', 'Kalat & the frontier tribes', ['PK-BA', 'PK-TA']],

    // ---- East Asia ----
    ['JIANGNAN', 'Jiangnan (Nanjing)', ['CN-JS', 'CN-AH', 'CN-ZJ', 'CN-JX', 'CN-SH']],
    ['MANCHURIA', 'Manchuria', ['CN-HL', 'CN-JL', 'CN-LN']],
    ['NORTH_CHINA', 'North China Plain', ['CN-BJ', 'CN-TJ', 'CN-HE', 'CN-SD', 'CN-SX', 'CN-HA']],
    ['SOUTH_COAST', 'Guangdong & Fujian coast', ['CN-GD', 'CN-FJ', 'CN-HI']],
    ['TIBET', 'Tibet', ['CN-XZ']],
    ['XINJIANG', 'Xinjiang (Kashgaria)', ['CN-XJ']],
    ['COCHINCHINA', 'Cochinchina', [(p) => p.c === 'VNM' && p.y < 11.9]],
    ['ANNAM_S', 'Southern Annam', [(p) => p.c === 'VNM' && p.y < 17.1]],

    // ---- Southern Africa ----
    ['CAPE', 'Cape Colony', ['ZA-WC', 'ZA-EC', 'ZA-NC']],
    ['NATAL', 'Natal & Zululand', ['ZA-NL']],
    ['ORANGE', 'Orange River lands', ['ZA-FS']],
    ['TRANSVAAL', 'Highveld beyond the Vaal', ['ZA-GT', 'ZA-LP', 'ZA-MP', 'ZA-NW']],
  ];

  // Per-unit keys in these countries.
  const PER_UNIT = new Set(['USA', 'CAN']);

  AH.GROUPS = G.map(([key, label, sel]) => ({ key, label, sel }));
  AH.GROUP_LABEL = Object.fromEntries(G.map(([k, l]) => [k, l]));

  // Resolve a unit's properties to its group key.
  AH.groupOf = function (p) {
    for (const g of AH.GROUPS) {
      for (const s of g.sel) {
        if (typeof s === 'function') { if (s(p)) return g.key; continue; }
        if (s[0] === '@') {
          const [c, r] = s.slice(1).split('/');
          if (p.c === c && (!r || p.r === r)) return g.key;
        } else if (s === p.id) return g.key;
      }
    }
    return PER_UNIT.has(p.c) ? p.id : p.c;
  };

  // Shorthands for the event scripts.
  AH.CENTAM = ['GTM', 'SLV', 'HND', 'NIC', 'CRI', 'CHIAPAS'];
  AH.NEW_SPAIN = ['MEX', 'YUCATAN', 'QROO', 'US-TX', 'NEWMEX', 'US-CA', 'GBASIN'];
  AH.PRUSSIA_ALL = ['PRU_EAST', 'CORRIDOR', 'UPPER_SIL', 'E_PRUSSIA', 'KONIGSBERG'];
  AH.PUNJAB_ALL = ['PUNJAB', 'PUNJAB_PK'];
  AH.KASHMIR_ALL = ['KASHMIR', 'KASHMIR_PK'];
  AH.VNM_ALL = ['VNM', 'ANNAM_S', 'COCHINCHINA'];
  AH.CHINA_ALL = ['CHN', 'JIANGNAN', 'MANCHURIA', 'NORTH_CHINA', 'SOUTH_COAST', 'TIBET', 'XINJIANG'];
  AH.CSA_STATES = ['US-SC', 'US-MS', 'US-FL', 'US-AL', 'US-GA', 'US-LA', 'US-VA', 'US-AR', 'US-TN', 'US-NC'];

  // ---- The world on 1 January 1808 ----
  const L = (n) => 'LOCAL:' + n;
  const init = {
    // New Spain (a Spanish viceroyalty until the September junta)
    MEX: 'ESP', YUCATAN: 'ESP', QROO: 'ESP', CHIAPAS: 'ESP', 'US-TX': 'ESP', NEWMEX: 'ESP', 'US-CA': 'ESP', GBASIN: 'NATIVE:Ute, Paiute & Shoshone lands (Spanish claim)',
    GTM: 'ESP', SLV: 'ESP', HND: 'ESP', NIC: 'ESP', CRI: 'ESP', MOSQUITO: 'GBR:Mosquito Coast (British protectorate)', BLZ: 'GBR:British Honduras (Belize settlement)',
    'US-KS': 'NATIVE:Kansa, Osage & Pawnee lands (U.S. claim)', 'US-OK': 'NATIVE:Comanche, Wichita & Osage lands (U.S. claim)', 'US-NE': 'NATIVE:Pawnee & Omaha lands (U.S. claim)',
    'US-SD': 'NATIVE:Lakota lands (U.S. claim)', 'US-ND': 'NATIVE:Mandan, Hidatsa & Lakota lands (U.S. claim)', 'US-MT': 'NATIVE:Blackfeet & Crow lands (U.S. claim)',
    'US-WY': 'NATIVE:Shoshone, Crow & Arapaho lands (U.S. claim)', 'US-IA': 'NATIVE:Sauk, Meskwaki & Ioway lands (U.S. claim)', 'US-MN': 'NATIVE:Dakota & Ojibwe lands (U.S. claim)',
    OREGON: 'NATIVE:Chinook, Nez Perce & Salish lands', 'US-FL': 'ESP', 'US-AK': 'RUS', 'US-HI': L('Kingdom of Hawaiʻi'),
    RUPERT: "GBR:Rupert's Land (Hudson's Bay Company)", 'CA-BC': 'NATIVE:Pacific Northwest nations (HBC trade)', 'CA-NL': 'GBR',
    CUB: 'ESP', PRI: 'ESP', DOM: 'FRA', HTI: 'HAI', JAM: 'GBR', BHS: 'GBR', TTO: 'GBR', BRB: 'GBR', ATG: 'GBR', DMA: 'GBR', LCA: 'GBR', VCT: 'GBR', GRD: 'GBR', KNA: 'GBR', CYM: 'GBR', TCA: 'GBR', ABW: 'NLD', CUW: 'NLD', VIR: 'DEN', PAN: 'ESP',
    VEN: 'ESP', COL: 'ESP', ECU: 'ESP', PER: 'ESP', BOL: 'ESP', CHL: 'ESP', ARG: 'ESP', PRY: 'ESP', URY: 'ESP', BRA: 'POR:Portuguese court at Rio', GUY: 'GBR', SUR: 'GBR', FLK: L('Falkland Islands (abandoned)'),
    PATAGONIA: 'NATIVE:Mapuche, Ranquel & Tehuelche lands', CHACO: 'NATIVE:Qom & Wichí lands (Gran Chaco)', ANTOFAGASTA: 'ESP', TARAPACA: 'ESP',
    ARAUCANIA: 'NATIVE:Mapuche (Wallmapu)', MAGALLANES: 'NATIVE:Tehuelche & Kawésqar lands',
    // Europe
    ESP: 'ESP', ESP_CENTER: 'ESP', ESP_CAT: 'ESP', ESP_ARA: 'ESP', ESP_AND: 'ESP', ESP_EXT: 'ESP', ESP_VAL: 'ESP', PRT: 'FRA:Portugal (French occupation)',
    FRA: 'FRA', FR_OVERSEAS: 'FRA', SAVOY: 'FRA', ALSACE: 'FRA', BEL: 'FRA', LUX: 'FRA', NLD: 'FRC:Kingdom of Holland', CHE: 'FRC:Swiss Confederation (French protectorate)',
    GBR: 'GBR', IRL: 'GBR', IMN: 'GBR', JEY: 'GBR', MLT: 'GBR', GIB: 'GBR',
    RHINE_L: 'FRA', BERG: 'FRC:Grand Duchy of Berg', MAGDEBURG: 'FRC:Kingdom of Westphalia', HANOVER: 'FRC:Kingdom of Westphalia', HESSE: 'FRC:Confederation of the Rhine',
    SAXONY: 'FRC:Kingdom of Saxony (Rhine Confederation)', MECKLENBURG: 'FRC:Mecklenburg (Rhine Confederation)', SOUTH_DE: 'FRC:Bavaria & Württemberg (Rhine Confederation)',
    HOLSTEIN: 'DEN', BRANDENBURG: 'PRU', PRU_EAST: 'PRU', CORRIDOR: 'PRU', UPPER_SIL: 'PRU', E_PRUSSIA: 'PRU', KONIGSBERG: 'PRU', VOLHYNIA: 'RUS', POSEN: 'FRC:Duchy of Warsaw', WARSAW: 'FRC:Duchy of Warsaw', W_GALICIA: 'AUT', GALICIA_W: 'AUT', GALICIA: 'AUT', BUKOVINA: 'AUT', RUTHENIA: 'AUT',
    DNK: 'DEN', NOR: 'DEN', ISL: 'DEN', FRO: 'DEN', GRL: 'DEN', SWE: 'SWE', FIN: 'SWE', ALD: 'SWE',
    IT_PIED: 'FRA', IT_SARD: 'SAR', IT_LOMB: 'FRC:Kingdom of Italy', IT_TRIESTE: 'AUT', IT_VEN: 'FRC:Kingdom of Italy', IT_TREN: 'FRC:Kingdom of Bavaria',
    IT_ROMAGNA: 'FRC:Kingdom of Italy', IT_DUCHY: 'FRA', IT_MARCHE: 'PAP', IT_LAZIO: 'PAP', IT_SOUTH: 'FRC:Kingdom of Naples', IT_SICILY: 'NAP',
    AUT: 'AUT', CZE: 'AUT', SVK: 'AUT', HUN: 'AUT', SVN: 'AUT', HRV: 'AUT', CROATIA_S: 'AUT', DALMATIA: 'FRC:Dalmatia (Kingdom of Italy)', VOJVODINA: 'AUT', TRANSYLVANIA: 'AUT',
    SRB: L('Revolutionary Serbia (Karađorđe)'), SRB_SOUTH: 'OTT', BIH: 'OTT', MNE: L('Prince-Bishopric of Montenegro'), ALB: 'OTT', MKD: 'OTT', KOS: 'OTT',
    ROU: 'OTT:Wallachia & Moldavia (Ottoman vassals)', MDA: 'OTT:Moldavia (Ottoman vassal)', DOBRUJA: 'OTT', BGR: 'OTT', E_RUMELIA: 'OTT', RHODOPE: 'OTT',
    GRC: 'OTT', GR_OLD: 'OTT', GR_IONIAN: 'FRA', GR_THESSALY: 'OTT', GR_CRETE: 'OTT', GR_NORTH: 'OTT', TUR: 'OTT', CYP: 'OTT', CYN: 'OTT', ESB: 'OTT',
    RUS: 'RUS', UKR: 'RUS', BLR: 'RUS', LTU: 'RUS', LVA: 'RUS', EST: 'RUS', GEO: 'RUS', AZE: 'PERS', ARM: 'PERS',
    N_CAUCASUS: L('North Caucasus highlanders'), AMUR: 'QNG', SAKHALIN: L('Ainu Sakhalin'),
    // Middle East & Africa
    SYR: 'OTT', LBN: 'OTT', ISR: 'OTT', PSX: 'OTT', JOR: 'OTT', IRQ: 'OTT', KWT: 'OTT:Kuwait (Ottoman suzerainty)',
    EGY: 'EGY:Egypt of Muhammad Ali', LBY: 'OTT:Regency of Tripoli', TUN: 'OTT:Beylik of Tunis', DZA: 'OTT:Regency of Algiers',
    SAU: L('First Saudi State'), YEM: L('Imamate of Yemen'), OMN: L('Sultanate of Muscat & Oman'), ARE: L('Qawasim sheikhdoms'), QAT: L('Qatar'), BHR: L('Bahrain (Al Khalifa)'),
    IRN: 'PERS', AFG: L('Durrani Empire'), MAR: L('Sultanate of Morocco'), SAH: L('Sahrawi tribes'), MRT: L('Moorish emirates'),
    SEN: L('Wolof & Futa Toro states'), GMB: L('Gambia river kingdoms'), GNB: 'POR', GIN: L('Futa Jallon imamate'), SLE: 'GBR', LBR: L('Grain Coast peoples'),
    CIV: L('Akan & Kru states'), GHA: L('Ashanti Empire'), TGO: L('Ewe states'), BEN: L('Kingdom of Dahomey'), NGA: L('Sokoto Caliphate & Oyo'), NER: L('Sokoto Caliphate & Tuareg'),
    MLI: L('Bambara & Massina states'), BFA: L('Mossi kingdoms'), TCD: L('Kanem-Bornu & Wadai'), CMR: L('Duala & Adamawa'), CAF: L('Ubangi peoples'),
    GNQ: 'ESP', GAB: L('Orungu & Mpongwe states'), COG: L('Loango & Tio kingdoms'), COD: L('Kongo, Luba & Lunda'), AGO: 'POR', STP: 'POR', CPV: 'POR',
    SDN: L('Funj Sultanate & Darfur'), SDS: L('Nilotic peoples'), ETH: L('Ethiopia (Zemene Mesafint)'), ERI: L('Tigray & Afar lands'), DJI: L('Afar sultanates'),
    SOM: L('Somali sultanates'), SOL: L('Isaaq Somali lands'), KEN: L('Swahili coast & Maasai'), TZA: L('Omani Zanzibar & inland chiefdoms'), UGA: L('Buganda & Bunyoro'),
    RWA: L('Kingdom of Rwanda'), BDI: L('Kingdom of Burundi'), MWI: L('Maravi chiefdoms'), ZMB: L('Lozi & Bemba'), ZWE: L('Rozvi & Shona states'), MOZ: 'POR',
    MDG: L('Merina Kingdom'), COM: L('Comoro sultanates'), MUS: 'FRA:Île de France (Mauritius)', SYC: 'FRA', NAM: L('Nama, Herero & Ovambo'), BWA: L('Tswana chiefdoms'),
    LSO: L('Sotho chiefdoms'), SWZ: L('Swazi kingdom'), CAPE: 'GBR:Cape Colony', NATAL: L('Zulu Kingdom'), ORANGE: L('Sotho & Griqua lands'), TRANSVAAL: L('Ndebele & Pedi lands'),
    // Asia & Oceania
    BENGAL: 'GBR:British India (East India Company)', MADRAS: 'GBR:British India (East India Company)', MARATHA: L('Maratha Confederacy & Rajput states'),
    PUNJAB: 'SIKH', PUNJAB_PK: 'SIKH', KASHMIR: L('Durrani Kashmir'), KASHMIR_PK: L('Durrani Kashmir'), ASSAM: L('Ahom Kingdom'), SIKKIM: L('Sikkim'), GOA: 'POR', PONDICHERRY: 'GBR:Pondichéry (British occupied)',
    SINDH: L('Talpur Sindh'), KALAT: L('Khanate of Kalat'), BGD: 'GBR:British India (East India Company)', LKA: 'GBR:Ceylon', NPL: L('Gorkha Nepal'), BTN: L('Bhutan'),
    MMR: L('Konbaung Burma'), THA: L('Siam'), LAO: L('Lao kingdoms (Siamese vassals)'), KHM: L('Cambodia'), VNM: L('Đại Việt / Đại Nam (Nguyễn)'), COCHINCHINA: L('Đại Việt / Đại Nam (Nguyễn)'), ANNAM_S: L('Đại Việt / Đại Nam (Nguyễn)'),
    MYS: L('Malay sultanates'), SGP: L('Johor Sultanate'), BRN: L('Sultanate of Brunei'), IDN: 'FRC:Dutch East Indies (Kingdom of Holland)', TLS: 'POR', PHL: 'ESP',
    CHN: 'QNG', JIANGNAN: 'QNG', MANCHURIA: 'QNG', NORTH_CHINA: 'QNG', SOUTH_COAST: 'QNG', TIBET: 'QNG', XINJIANG: 'QNG', MNG: 'QNG', TWN: 'QNG', HKG: 'QNG', MAC: 'POR', KOR: L('Joseon Korea'), PRK: L('Joseon Korea'), JPN: 'JPN',
    KAZ: L('Kazakh Hordes'), UZB: L('Khanates of Bukhara, Khiva & Kokand'), TKM: L('Turkmen tribes'), KGZ: L('Khanate of Kokand'), TJK: L('Emirate of Bukhara'),
    AUS: 'GBR:New South Wales', NZL: L('Māori iwi'), PNG: L('Papuan peoples'), FJI: L('Fijian chiefdoms'), SLB: L('Solomon Islanders'), VUT: L('Ni-Vanuatu'), NCL: L('Kanak chiefdoms'),
    PYF: L('Kingdom of Tahiti'), WSM: L('Samoan chiefdoms'), TON: L('Tongan chiefdoms'), KIR: L('Gilbertese'), FSM: L('Carolinians'), PLW: L('Palau'),
  };
  AH.INITIAL_OWNERS = init;
  // Anything not listed: the modern country's region is treated as local polities.
  AH.defaultOwner = (key) => (/^US-/.test(key) ? 'USA' : /^CA-/.test(key) ? 'GBR' : L('Local polities'));
})(globalThis.AH = globalThis.AH || {});
