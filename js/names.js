// People who never existed. Anyone conceived after the divergence, from about
// 1810 in the Americas and 1815 elsewhere, is a different person. So from the
// mid-century on, leaders, rebels, generals and inventors are generated from
// name pools for their culture. Names are deterministic for a given seed.
(function (AH) {
  const P = {
    es: { g: ['José', 'Juan', 'Manuel', 'Francisco', 'Miguel', 'Ignacio', 'Rafael', 'Carlos', 'Luis', 'Antonio', 'Joaquín', 'Ramón', 'Tomás', 'Andrés', 'Vicente', 'Pedro', 'Leonor', 'Josefa', 'Carmen', 'Isabel', 'Dolores', 'Rosario'],
      s: ['Garza', 'Treviño', 'Villaseñor', 'Ortiz', 'Echeverría', 'Iturbe', 'Salcedo', 'Arriaga', 'Montiel', 'Zavala', 'Bustamante', 'Lerdo', 'Anaya', 'Olvera', 'Cortina', 'Navarrete', 'Quiroga', 'Uribe', 'Belmonte', 'Aldama'] },
    nah: { g: ['Cuauhtli', 'Tomás', 'Juan', 'Domingo', 'Mateo', 'Felipe', 'Gregorio', 'Marcos'],
      s: ['Tecuanhuey', 'Xicoténcatl', 'Tezcucano', 'Ixtlilxóchitl', 'Cuautle', 'Tlapanco', 'Mazahua', 'Tepozteco'] },
    en: { g: ['John', 'William', 'Thomas', 'Henry', 'Edward', 'Samuel', 'James', 'Robert', 'Charles', 'George', 'Walter', 'Arthur', 'Harriet', 'Eleanor', 'Margaret', 'Clara', 'Josiah', 'Nathaniel'],
      s: ['Whitcombe', 'Harrow', 'Ellery', 'Pembroke', 'Caldwell', 'Ashby', 'Thorne', 'Merriweather', 'Holloway', 'Beckett', 'Radley', 'Fairbanks', 'Crane', 'Sutcliffe', 'Hale', 'Winslow', 'Bramwell', 'Cotter'] },
    fr: { g: ['Louis', 'Jean', 'Pierre', 'Henri', 'Émile', 'Paul', 'Charles', 'Jules', 'Marcel', 'Gustave', 'Camille', 'Marguerite', 'Adèle', 'Étienne'],
      s: ['Morvan', 'Delacroix', 'Barrault', 'Fontenay', 'Lemaître', 'Ducasse', 'Villiers', 'Rochambeau', 'Marchetti', 'Aubert', 'Garnier', 'Brissac', 'Lassalle', 'Thévenin'] },
    de: { g: ['Friedrich', 'Wilhelm', 'Karl', 'Heinrich', 'Otto', 'Ludwig', 'Ernst', 'Hermann', 'Georg', 'Johann', 'Auguste', 'Luise', 'Margarethe'],
      s: ['von Hallerstein', 'Brenner', 'Kessler', 'von Arnim-Loewe', 'Dornbach', 'Falkenrath', 'Weidmann', 'Ostermann', 'Riedl', 'Hartwig', 'Lindemann', 'Voss', 'Eckhardt', 'Graubner'] },
    it: { g: ['Giuseppe', 'Giovanni', 'Carlo', 'Vittorio', 'Luigi', 'Francesco', 'Enrico', 'Alessandro', 'Emilia', 'Teresa'],
      s: ['Ferrante', 'Montaldo', 'Castelli', 'Barberis', 'Salvi', 'Guidotti', 'Lombardini', 'Albanese', 'Rinaldi', 'Corsetti'] },
    ru: { g: ['Nikolai', 'Aleksandr', 'Mikhail', 'Pavel', 'Sergei', 'Dmitri', 'Konstantin', 'Ivan', 'Pyotr', 'Yelena', 'Anna', 'Vera'],
      s: ['Obolensky', 'Tarasov', 'Volkonsky', 'Zhdanovich', 'Kurbatov', 'Belyaev', 'Shuvalin', 'Rostovtsev', 'Gorchak', 'Lvovich', 'Mezentsev', 'Kovrin'] },
    pl: { g: ['Jan', 'Stanisław', 'Józef', 'Tadeusz', 'Kazimierz', 'Wanda'], s: ['Zaremba', 'Dąbrowiecki', 'Lisowski', 'Mrozek', 'Kordecki', 'Wielopolak'] },
    tr: { g: ['Mehmed', 'Ahmed', 'Mustafa', 'Hasan', 'Selim', 'Osman', 'Rıza', 'Kemal', 'Halil', 'Enver'], s: ['Pasha', 'Bey', 'Efendi', 'Pasha', 'Bey'] },
    ar: { g: ['Muhammad', 'Ahmad', 'Ali', 'Yusuf', 'Ibrahim', 'Khalid', 'Faisal', 'Hussein', 'Abd al-Rahman', 'Umar'], s: ['al-Hashimi', 'al-Masri', 'al-Tikriti', 'al-Shammari', 'al-Kinani', 'al-Idrisi', 'al-Azhari', 'al-Rifai'] },
    fa: { g: ['Reza', 'Mohammad', 'Hossein', 'Mahmud', 'Nasser', 'Farhad'], s: ['Qajar', 'Tabrizi', 'Esfahani', 'Kermani', 'Shirazi', 'Mazandarani'] },
    zh: { g: ['Wenzheng', 'Guofan', 'Zhongshan', 'Deming', 'Yuanhong', 'Shaoyi', 'Kaishi', 'Lianjie', 'Huaqing', 'Meiling'], s: ['Zhang', 'Li', 'Wang', 'Chen', 'Liu', 'Zhao', 'Huang', 'Zhou', 'Wu', 'Sun'], family: true },
    ja: { g: ['Tadashi', 'Hiroshi', 'Kenzō', 'Masahiro', 'Takeo', 'Yoshinobu', 'Shigenori', 'Ichirō', 'Hanako'], s: ['Okubo', 'Saionji', 'Matsudaira', 'Kuroda', 'Hayashi', 'Yamanouchi', 'Tsukada', 'Ōmura'], family: true },
    ko: { g: ['Yeong-su', 'Jae-ho', 'Seung-man', 'Dong-hyun'], s: ['Kim', 'Park', 'Yi', 'Choi'], family: true },
    vi: { g: ['Văn Minh', 'Đức Thắng', 'Quang Huy', 'Thị Lan'], s: ['Nguyễn', 'Trần', 'Lê', 'Phạm'], family: true },
    hi: { g: ['Ram', 'Mohan', 'Bal', 'Jawahar', 'Rajendra', 'Subhas', 'Sarojini', 'Vallabh', 'Aurobindo', 'Muhammad'], s: ['Tilak', 'Banerjee', 'Iyer', 'Deshmukh', 'Rao', 'Chatterjee', 'Naidu', 'Khan', 'Mehta', 'Singh'] },
    pt: { g: ['João', 'Pedro', 'Manuel', 'Joaquim', 'Afonso', 'Teresa'], s: ['Albuquerque', 'Vasconcelos', 'Moreira', 'Barreto', 'Sampaio', 'Queiroz'] },
    am: { g: ['Tewolde', 'Mengesha', 'Tekle', 'Haile', 'Gebre', 'Wolde', 'Taytu'], s: ['Giyorgis', 'Mariam', 'Selassie', 'Iyasus', 'Mikael'] },
    yo: { g: ['Adewale', 'Olufemi', 'Kwame', 'Kofi', 'Samori', 'Ahmadu', 'Nnamdi', 'Amina'], s: ['Adebayo', 'Mensah', 'Touré', 'Okonkwo', 'Diallo', 'Keita', 'Asante', 'Oyelaran'] },
    sw: { g: ['Juma', 'Rashidi', 'Mwangi', 'Kabaka', 'Omari', 'Wanjiru'], s: ['Kariuki', 'Mwinyi', 'Kenyatta', 'Mutesa', 'Nyerere', 'Odinga'] },
    zu: { g: ['Sipho', 'Themba', 'Mandla', 'Nomsa'], s: ['Dlamini', 'Ndlovu', 'Khumalo', 'Mthembu'] },
    nl: { g: ['Willem', 'Jan', 'Pieter', 'Hendrik'], s: ['van der Berg', 'Hoekstra', 'de Vries', 'Kuiper'] },
    el: { g: ['Georgios', 'Konstantinos', 'Eleftherios', 'Ioannis'], s: ['Venizakis', 'Mavrides', 'Kolettis', 'Trikoupides'] },
    sl: { g: ['Milan', 'Petar', 'Stefan', 'Nikola', 'Tomáš', 'Jozef'], s: ['Obrenić', 'Karadžić', 'Masarek', 'Pašić', 'Štefánik', 'Jelačić'] },
    ro: { g: ['Ion', 'Mihail', 'Alexandru', 'Carol'], s: ['Brătescu', 'Cuzeanu', 'Golescu', 'Rosetti'] },
    hu: { g: ['Lajos', 'Ferenc', 'Gyula', 'István'], s: ['Kossuthy', 'Andrássy', 'Deákos', 'Tisza'] },
    po: { g: ['Kamakau', 'Tuʻi', 'Malietoa', 'Tamasese', 'Pomare', 'Ratu Seru'], s: ['Taufaʻahau', 'Mataʻafa', 'Cakobau', 'Teriʻi', 'Lavaka', 'Tupou'] },
    sv: { g: ['Gustaf', 'Oscar', 'Carl', 'Karin'], s: ['Lindqvist', 'Bergström', 'Nordenfelt', 'Åkerlund'] },
  };
  AH.NAME_POOLS = P;

  // Which culture a power's people come from.
  AH.CULTURE = {
    MEX: 'es', CAF: 'es', ESP: 'es', USA: 'en', CSA: 'en', GBR: 'en', CAN: 'en', CAL: 'en', TEX: 'en', FRA: 'fr', FRC: 'fr', PRU: 'de', GER: 'de', GDC: 'de', GDR: 'de',
    AUT: 'de', ITA: 'it', SAR: 'it', PAP: 'it', NAP: 'it', RUS: 'ru', SOV: 'ru', POL: 'pl', OTT: 'tr', TUR: 'tr', EGY: 'ar', PERS: 'fa', QNG: 'zh', PRC: 'zh', ROC: 'zh', TAI: 'zh',
    JPN: 'ja', IND: 'hi', PAK: 'hi', SIKH: 'hi', POR: 'pt', BRA: 'pt', NLD: 'nl', BEL: 'fr', GRE: 'el', SRB: 'sl', YUG: 'sl', CZS: 'sl', ROM: 'ro', SWE: 'sv', DEN: 'sv',
    ARG: 'es', CHL: 'es', PERU: 'es', BOL: 'es', COL: 'es', GCO: 'es', VEN: 'es', ECU: 'es', URU: 'es', PAR: 'es', CUB: 'es', YUC: 'es', HAI: 'fr', DOM: 'es', IDN: 'nl',
  };

  // Deterministic pick from a pool.
  function pick(s, tag, arr, salt = 0) { return arr[Math.floor(AH.hash(s.seed, tag, 97 + salt) * arr.length)]; }

  AH.makeName = function (s, tag, culture) {
    const c = P[culture] || P.en;
    const g = pick(s, tag, c.g, 1), sn = pick(s, tag, c.s, 2);
    if (c.family) return `${sn} ${g}`;
    if (culture === 'tr') return `${g} ${sn}`;
    if (culture === 'ar') return `${g} ${sn}`;
    if (culture === 'es' && AH.hash(s.seed, tag, 5) < 0.35) return `${g} ${sn} ${pick(s, tag, c.s, 3)}`;
    return `${g} ${sn}`;
  };

  // A named figure in this history. The same tag always returns the same
  // person within a run, and each new person is recorded for the People tab.
  AH.figure = function (s, tag, culture, role, power) {
    s.figs = s.figs || {};
    if (!s.figs[tag]) {
      const name = AH.makeName(s, tag, culture || 'en');
      const age = 28 + Math.floor(AH.hash(s.seed, tag, 11) * 30);
      s.figs[tag] = { name, role: role || '', power: power || '', born: s.y - age, first: s.y, place: s.cur ? s.cur.place : '' };
      s.people.push(s.figs[tag]);
    }
    return s.figs[tag].name;
  };
})(globalThis.AH = globalThis.AH || {});
