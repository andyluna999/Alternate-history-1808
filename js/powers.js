// Powers (map owners). Colors follow the hand-tinted conventions of 19th-century
// school atlases: British pink, Spanish yellow, French violet, Russian green.
// The Kingdom of Mexico takes indigo, after the añil dye of Guatemala and Oaxaca.
(function (AH) {
  AH.POWERS = {
    MEX: { name: 'Kingdom of Mexico', color: '#3a55a8', major: true },
    CAF: { name: 'Central American Federation', color: '#7c93d6' },
    YUC: { name: 'Republic of Yucatán', color: '#8d7cc4' },
    ESP: { name: 'Spain', color: '#e6c95a', major: true },
    POR: { name: 'Portugal', color: '#6fae96' },
    BRA: { name: 'Empire of Brazil', color: '#9ccc84' },
    GBR: { name: 'British Empire', color: '#ec9ea4', major: true },
    CAN: { name: 'Dominion of Canada', color: '#f3c3c6' },
    FRA: { name: 'France', color: '#9a80c9', major: true },
    FRC: { name: 'French client state', color: '#cbbce6' },
    USA: { name: 'United States', color: '#dca65e', major: true },
    CSA: { name: 'Confederate States', color: '#a99277' },
    TEX: { name: 'Republic of Texas', color: '#e0785a' },
    CAL: { name: 'California Republic', color: '#e9b562' },
    RUS: { name: 'Russian Empire', color: '#b5c98a', major: true },
    AUT: { name: 'Austrian Empire', color: '#cda57e', major: true },
    PRU: { name: 'Prussia', color: '#8e98a6', major: true },
    GER: { name: 'German Empire', color: '#7f8a99', major: true },
    GDC: { name: 'German states', color: '#bcc3cc' },
    OTT: { name: 'Ottoman Empire', color: '#86c2b3', major: true },
    EGY: { name: 'Khedivate of Egypt', color: '#d7b775' },
    SWE: { name: 'Sweden(-Norway)', color: '#93b6db' },
    DEN: { name: 'Denmark', color: '#dd9a86' },
    NLD: { name: 'Netherlands', color: '#efb56c' },
    BEL: { name: 'Belgium', color: '#e3c992' },
    SWZ: { name: 'Switzerland', color: '#d9cfc0' },
    SAR: { name: 'Kingdom of Sardinia', color: '#78b58a' },
    ITA: { name: 'Kingdom of Italy', color: '#62a878' },
    PAP: { name: 'Papal States', color: '#f0e3a8' },
    NAP: { name: 'Two Sicilies', color: '#c9809e' },
    ITD: { name: 'Italian duchies', color: '#d8c5a4' },
    GRE: { name: 'Greece', color: '#86b6e3' },
    SRB: { name: 'Serbia', color: '#bb8080' },
    ROM: { name: 'Romania', color: '#d9c570' },
    BUL: { name: 'Bulgaria', color: '#93b27c' },
    HAI: { name: 'Haiti', color: '#7ea8c7' },
    DOM: { name: 'Dominican Republic', color: '#a7c2d8' },
    CUB: { name: 'Republic of Cuba', color: '#58b8c9' },
    GCO: { name: 'Gran Colombia', color: '#e8d660' },
    COL: { name: 'New Granada / Colombia', color: '#e8d660' },
    VEN: { name: 'Venezuela', color: '#d2bd57' },
    ECU: { name: 'Ecuador', color: '#c9b764' },
    PERU: { name: 'Peru', color: '#d98e8e' },
    BOL: { name: 'Bolivia', color: '#bba36c' },
    CHL: { name: 'Chile', color: '#c97474' },
    ARG: { name: 'United Provinces / Argentina', color: '#91c5e2' },
    PAR: { name: 'Paraguay', color: '#a5a5d4' },
    URU: { name: 'Uruguay', color: '#b0d5ea' },
    QNG: { name: 'Qing China', color: '#e8bd72', major: true },
    TAI: { name: 'Taiping Heavenly Kingdom', color: '#c8715e' },
    JPN: { name: 'Japan', color: '#e2938f' },
    PERS: { name: 'Qajar Persia', color: '#ccb58d' },
    SIKH: { name: 'Sikh Empire', color: '#d6ab6c' },
    SOV: { name: 'Soviet Union', color: '#c96a5f', major: true },
    PRC: { name: "People's Republic of China", color: '#dcae62', major: true },
    ROC: { name: 'Republic of China', color: '#9fc4a0' },
    IND: { name: 'India', color: '#e7a576', major: true },
    PAK: { name: 'Pakistan', color: '#8fbf8a' },
    IDN: { name: 'Indonesia', color: '#d98585' },
    TUR: { name: 'Republic of Turkey', color: '#86c2b3' },
    POL: { name: 'Poland', color: '#d7a3bb' },
    YUG: { name: 'Yugoslavia', color: '#9aa9d6' },
    CZS: { name: 'Czechoslovakia', color: '#a7c8d8' },
    GDR: { name: 'East Germany', color: '#a88f8f' },
    LOCAL: { name: 'Independent state', color: '#d9d1be' },
    NATIVE: { name: 'Indigenous nations', color: '#cbbd9f', hatch: true },
    JOINT: { name: 'Jointly claimed', color: '#d3cab6', hatch: true },
  };

  // Owner strings may carry a custom polity name: "LOCAL:Sultanate of Morocco".
  AH.ownerId = (o) => (o ? o.split(':')[0] : 'LOCAL');
  AH.ownerName = (o, fallback) => {
    if (!o) return 'Unclaimed';
    const i = o.indexOf(':');
    if (i > -1) return o.slice(i + 1);
    const p = AH.POWERS[o];
    return p ? p.name : fallback || o;
  };
})(globalThis.AH = globalThis.AH || {});
