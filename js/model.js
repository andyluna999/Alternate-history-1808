// State variables and their year-to-year drift. Every variable is on a 0–1
// scale except populations (millions). The events read these to set their
// odds, and write them back as consequences.
(function (AH) {
  AH.INITIAL_VARS = {
    mx_stab: 0.55,    // Mexican political stability
    mx_fisc: 0.6,     // Mexican fiscal strength (silver stays home after 1808)
    mx_mil: 0.35,     // Mexican military capacity
    mx_pop: 6.1,      // New Spain proper, millions (1810 estimate: 6.1M)
    us_pop: 7.0,      // United States, millions (1810 census: 7.2M)
    us_expan: 0.33,   // U.S. westward expansion pressure
    us_sect: 0.2,     // U.S. sectional (slavery) tension
    es_cap: 0.2,      // Spain's capacity to project force overseas
    gb_mx: 0.25,      // Anglo-Mexican alignment
    tx_anglo: 0.05,   // Anglo-American share of Texas settlers
    ca_anglo: 0.02,   // foreign share of California's population
    cu_unrest: 0.1,   // Cuban separatist pressure
    mx_church: 0.25,  // church–state / liberal–conservative tension
    cam_tension: 0.2, // Central American regional grievance
    sa_mom: 0.45,     // South American independence momentum
    mx_land: 0.3,     // agrarian tension: land concentrated in haciendas
    decol: 0,         // worldwide decolonization pressure (20th century)
  };

  AH.INITIAL_NAMES = { MEX: 'Governing Junta of New Spain' };

  // Reference series from our timeline, for the comparison chart (millions).
  AH.OTL = {
    mexico: [[1810, 6.1], [1821, 6.2], [1831, 6.4], [1842, 7.0], [1857, 8.3], [1869, 8.8], [1880, 9.6], [1895, 12.6], [1900, 13.6],
      [1910, 15.2], [1921, 14.3], [1930, 16.6], [1940, 19.7], [1950, 25.8], [1960, 34.9], [1970, 48.2], [1980, 66.8], [1990, 81.2], [2000, 97.5]],
    usa: [[1810, 7.2], [1820, 9.6], [1830, 12.9], [1840, 17.1], [1850, 23.2], [1860, 31.4], [1870, 38.6], [1880, 50.2], [1890, 62.9], [1900, 76.2],
      [1910, 92.2], [1920, 106.0], [1930, 123.2], [1940, 132.2], [1950, 151.3], [1960, 179.3], [1970, 203.2], [1980, 226.5], [1990, 248.7], [2000, 281.4]],
  };

  const clamp = (x) => Math.max(0, Math.min(1, x));

  AH.drift = function (s) {
    const v = s.v, f = s.f, y = s.y;
    const mexico = s.oid('MEX') === 'MEX';
    if (mexico) {
      v.mx_stab = clamp(v.mx_stab + 0.02 * (v.mx_fisc - 0.5) + 0.015 * (v.gb_mx - 0.3) - 0.03 * Math.max(0, v.mx_church - 0.45) + 0.05 * (0.55 - v.mx_stab));
      v.mx_fisc = clamp(v.mx_fisc + 0.015 * (v.mx_stab - 0.45) + (f.gb_trade ? 0.004 : 0) + (f.canal ? 0.006 : 0) + (f.railways ? 0.005 : 0) + 0.04 * (0.5 - v.mx_fisc) - (f.at_war ? 0.04 : 0));
      v.mx_mil = clamp(v.mx_mil + 0.02 * (v.mx_fisc - 0.45) + 0.04 * (0.4 - v.mx_mil));
      // Demographic transition: mortality falls from the 1930s, fertility from the 1970s.
      const boost = y < 1935 ? 0 : y < 1975 ? 0.01 : Math.max(-0.006, 0.01 - (y - 1975) * 0.0008);
      v.mx_pop *= 1 + 0.006 + 0.012 * v.mx_stab + boost - (f.at_war ? 0.004 : 0);
      v.mx_land = Math.max(0, Math.min(1, v.mx_land + (f.land_reform ? -0.01 : y > 1860 ? 0.008 : 0.002)));
      v.mx_church = clamp(v.mx_church + (f.reform_done ? -0.03 : y > 1830 ? 0.009 : 0.002));
      const camIn = s.oid('GTM') === 'MEX';
      v.cam_tension = clamp(v.cam_tension + (camIn ? (f.cam_autonomy ? -0.01 : 0.012) : -0.02));
      v.gb_mx = clamp(v.gb_mx + 0.02 * ((f.gb_alliance ? 0.6 : 0.3) - v.gb_mx));
    } else {
      v.mx_pop *= 1.008;
    }
    const usSplit = f.csa_independent ? 0.7 : 1;
    const usRate = y < 1861 ? 0.03 : y < 1900 ? 0.021 : y < 1930 ? 0.015 : y < 1946 ? 0.007 : y < 1965 ? 0.016 : 0.0095;
    v.us_pop *= 1 + usRate * (f.us_civil_war_active ? 0.5 : 1);
    v.us_expan = clamp(0.25 + 0.012 * v.us_pop * usSplit - (f.west_settled ? 0.15 : 0));
    v.us_sect = f.sect_resolved ? clamp(v.us_sect - 0.04) : clamp(v.us_sect + (y > 1819 ? 0.007 : 0));

    if (s.oid('US-TX') === 'MEX') {
      const rate = f.tx_closed ? 0.01 : f.tx_open ? (f.tx_catholic ? 0.06 : 0.12) : f.tx_catholic ? 0.015 : 0.02;
      v.tx_anglo = clamp(v.tx_anglo + rate * (1 - v.tx_anglo) - (f.tx_catholic ? 0.004 : 0));
    }
    if (f.gold) v.ca_anglo = clamp(v.ca_anglo + (y < 1857 ? 0.07 : 0.01) * (1 - v.ca_anglo));
    else if (y > 1840) v.ca_anglo = clamp(v.ca_anglo + 0.006);
    v.es_cap = clamp(v.es_cap + 0.04 * ((f.spain_turmoil ? 0.15 : 0.32) - v.es_cap));
    v.cu_unrest = clamp(v.cu_unrest + (y > 1840 ? 0.008 : 0.002));
    v.sa_mom = clamp(v.sa_mom + 0.01);
    if (y > 1945) v.decol = clamp(v.decol + 0.04);
  };
})(globalThis.AH = globalThis.AH || {});
