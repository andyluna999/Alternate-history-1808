// The Americas after the point of divergence: the Mexico City junta of
// September 1808 survives. Events carry a probability p (for a window, the
// chance per year), outcome weights, and sometimes a 2×2 game whose
// quantal-response equilibrium sets those weights.
//
// Fields: id, y | win:[from,to], m (month), place, kind, title, text,
//   when(s) precondition, p(s) probability, outcomes [{title, text, w(s), fx(s)}],
//   game {rowPlayer, colPlayer, rows, cols, payoffs(s) -> [[ [row,col] ]], outcome(i,j)},
//   otl: what happened in our timeline (logged as "averted" if the window closes),
//   sched: fires only when scheduled by s.after().
(function (AH) {
  const E = (AH.EVENTS = AH.EVENTS || []);
  const ev = (o) => E.push(o);
  const S = AH.sigmoid;
  const mex = (s, k) => s.oid(k) === 'MEX';
  const isMonarchy = (s) => !s.f.republic;

  // ------------------------------------------------------------------ 1808
  ev({ id: 'rio_court', y: 1808, m: 3, place: 'rio', kind: 'politics',
    title: 'The Portuguese court lands at Rio de Janeiro',
    text: 'Prince Regent João and some 10,000 courtiers, having fled Junot, make Rio the seat of a European empire. The precedent of a crown ruling from the Americas is now in plain view.' });

  ev({ id: 'bayonne', y: 1808, m: 5, place: 'bayonne', kind: 'politics', major: true,
    title: 'Abdications of Bayonne',
    text: 'Napoleon forces Charles IV and Ferdinand VII to abdicate and makes Joseph Bonaparte king of Spain. Madrid rose on the Dos de Mayo; juntas form across the peninsula claiming sovereignty reverts to the kingdoms while the king is captive.',
    fx: (s) => { s.own(['ESP_CENTER', 'ESP_CAT'], 'FRC:Spain of Joseph Bonaparte'); s.set('spain_turmoil'); } });

  ev({ id: 'bailen', y: 1808, m: 7, place: 'bailen', kind: 'war',
    title: 'Bailén: a French army surrenders',
    text: "Castaños forces Dupont's 18,000 men to capitulate, the first field defeat of Napoleonic France. Joseph abandons Madrid.",
    fx: (s) => { s.own('ESP_CENTER', 'ESP'); s.add('sa_mom', 0.03); } });

  ev({ id: 'vimeiro', y: 1808, m: 8, place: 'vimeiro', kind: 'war',
    title: 'Wellesley lands in Portugal',
    text: 'The British victory at Vimeiro and the Convention of Cintra clear Junot out of Portugal. The Peninsular War begins.',
    fx: (s) => s.own('PRT', 'POR:Portugal (Regency; court at Rio)') });

  ev({ id: 'junta', y: 1808, m: 9, place: 'mexico', kind: 'politics', major: true,
    title: 'The Mexico City junta holds',
    text: "Viceroy Iturrigaray, backed by the ayuntamiento, Primo de Verdad, Azcárate and Talamantes, and by enough creole officers and clergy to deter Gabriel de Yermo's merchant coup, convenes a governing junta. It swears loyalty to the captive Ferdinand VII and begins to govern New Spain as a de facto sovereign kingdom.",
    fx: (s) => { s.own(AH.NEW_SPAIN.filter((k) => s.oid(k) === 'ESP'), 'MEX'); s.name('MEX', 'Governing Junta of New Spain'); s.add('sa_mom', 0.08); } });

  ev({ id: 'guatemala', win: [1808, 1812], m: 11, place: 'guatemala', kind: 'politics',
    p: (s) => 0.7 + 0.2 * s.v.mx_stab,
    title: 'Guatemala adheres to the Mexico City junta',
    text: 'The Captaincy General of Guatemala, subordinate to Mexico City in most practical matters, recognizes the junta. The audiencia grumbles but the cabildos follow the money and the mail.',
    fx: (s) => s.own(AH.CENTAM.filter((k) => s.oid(k) === 'ESP'), 'MEX') });

  ev({ id: 'cuba_1808', y: 1808, m: 10, place: 'havana', kind: 'diplomacy', major: true,
    title: 'Havana weighs the Mexican invitation',
    text: 'Captain General Someruelos and the sugar planters, who watched Saint-Domingue burn fifteen years ago, must choose between Seville and Mexico City. Mexico can buy them in only by guaranteeing slavery.',
    game: {
      rowPlayer: 'Havana planters', colPlayer: 'Mexico City junta', rows: ['Stay loyal to Spain', 'Join Mexico'], cols: ['Guarantee slavery', 'No guarantee'],
      payoffs: (s) => [
        [[3, 1], [3, 2]],
        [[1.6 + 2 * s.v.mx_stab, 3], [0.4, 3.5]],
      ],
      outcome: (i, j) => (i === 0 ? 0 : j === 0 ? 1 : 2),
    },
    outcomes: [
      { title: 'Cuba stays with Spain', text: 'Havana declares for the Seville junta. Cuba will be absorbed later, if at all.' },
      { title: 'Planter pact: Cuba joins, slavery guaranteed', text: 'Havana joins the kingdom as an autonomous captaincy. The price is written into the pact: no abolition in Cuba.',
        fx: (s) => { s.own('CUB', 'MEX'); s.set('slavery_lock'); s.add('cu_unrest', -0.05); } },
      { title: 'Cuba joins without guarantees', text: 'A creole faction in Havana carries the day without the planters\' price. Their loyalty will be conditional.',
        fx: (s) => { s.own('CUB', 'MEX'); s.add('cu_unrest', 0.15); } },
    ] });

  ev({ id: 'santo_domingo', y: 1809, m: 7, place: 'santodomingo', kind: 'war',
    title: 'Spain retakes Santo Domingo',
    text: 'Creole planters, helped by a British squadron, expel the French garrison and return the eastern half of Hispaniola to Spain.',
    fx: (s) => s.own('DOM', 'ESP') });

  ev({ id: 'anglo_mex', win: [1809, 1813], m: 4, place: 'london', kind: 'diplomacy', major: true,
    p: (s) => 0.45 + 0.3 * s.v.mx_fisc,
    title: 'Anglo-Mexican commercial treaty',
    text: 'Canning needs silver to pay for the war in Spain and allies against Napoleon. London signs a trade treaty with the junta, formally "in the name of Ferdinand VII": Mexican silver for British goods, credit and naval protection.',
    fx: (s) => { s.set('gb_trade'); s.add('gb_mx', 0.3); s.add('mx_fisc', 0.08); s.add('mx_stab', 0.04); } });

  ev({ id: 'quito', y: 1809, m: 8, place: 'quito', kind: 'revolt',
    title: 'Quito proclaims a junta',
    text: 'Quito copies the Mexican formula: loyalty to Ferdinand, government by locals.',
    outcomes: [
      { title: 'Crushed by troops from Lima', w: (s) => 1 - s.v.sa_mom, text: 'Viceroy Abascal sends troops; the leaders are jailed and later massacred.' },
      { title: 'The junta survives', w: (s) => s.v.sa_mom * 0.6, fx: (s) => s.own('ECU', 'ECU:Junta of Quito') },
    ] });

  // ------------------------------------------------------------------ 1810–1814
  ev({ id: 'hidalgo', win: [1810, 1813], m: 9, place: 'dolores', kind: 'revolt', major: true,
    when: (s) => mex(s, 'MEX'),
    p: (s) => 0.05 + 0.3 * Math.max(0, 0.6 - s.v.mx_stab),
    title: 'Revolt in the Bajío',
    text: 'Father Miguel Hidalgo rings the bell at Dolores. The junta is creole and loyal to Ferdinand, but the Bajío\'s Indigenous and mestizo poor want land and relief from tribute.',
    otl: 'In our timeline the crushed 1808 junta pushed creole plotters toward revolution: Hidalgo\'s 1810 revolt began eleven years of war that killed perhaps 10% of the population and flooded the silver mines. Here the junta gave them a legal path, and the mass rising never came.',
    averted: 'No Grito de Dolores: the war of 1810–21 never happens',
    outcomes: [
      { title: 'Contained: tribute abolished, Hidalgo seated in Congress', w: (s) => 0.4 + s.v.mx_stab, text: 'The junta abolishes Indian tribute and sends troops to Guanajuato. Hidalgo, amnestied, becomes a deputy for the Bajío.',
        fx: (s) => { s.add('mx_stab', 0.05); s.set('tribute_abolished'); } },
      { title: 'Insurgency: the mines of Guanajuato flood', w: (s) => 1.1 - s.v.mx_stab, kind: 'war', text: 'The Alhóndiga falls; massacres follow. The revolt is put down by 1813, but mining is set back years.',
        fx: (s) => { s.add('mx_stab', -0.2); s.add('mx_fisc', -0.15); s.mul('mx_pop', 0.96); s.add('mx_mil', 0.05); } },
    ] });

  ev({ id: 'juntas_1810', y: 1810, m: 5, place: 'buenosaires', kind: 'revolt', major: true,
    title: 'Juntas across South America',
    text: 'Caracas (April), Buenos Aires (May), Bogotá (July) and Santiago (September) follow the New Spain precedent. Unlike Mexico\'s, these juntas face royalist strongholds in Lima and Montevideo.',
    fx: (s) => {
      const r = (k, o, base) => { if (s.roll('j' + k, base + 0.3 * s.v.sa_mom)) s.own(k, o); };
      r('VEN', 'VEN:Junta of Caracas', 0.6); r('ARG', 'ARG:United Provinces of the Río de la Plata', 0.65);
      r('COL', 'COL:United Provinces of New Granada', 0.55); r('CHL', 'CHL:Patria Vieja (Junta of Santiago)', 0.5);
    } });

  ev({ id: 'mx_congress', win: [1810, 1813], m: 2, place: 'mexico', kind: 'politics',
    p: (s) => 0.25 + 0.3 * s.v.mx_stab,
    title: 'The Congress of Anáhuac adopts a constitution',
    text: 'A constituent congress drafted by Talamantes and Azcárate adopts a charter: a limited monarchy "while the lawful king is captive," provincial deputations, and a free press.',
    fx: (s) => { s.set('constitution'); s.add('mx_stab', 0.08); } });

  ev({ id: 'paraguay', y: 1811, m: 5, place: 'asuncion', kind: 'revolt',
    title: 'Paraguay goes its own way',
    text: 'Asunción rejects both Buenos Aires and Spain.',
    fx: (s) => s.own('PRY', 'PAR') });

  ev({ id: 'mx_abolition', win: [1810, 1835], m: 12, place: 'mexico', kind: 'politics',
    p: (s) => (s.f.slavery_lock ? 0.01 : 0.06 + 0.12 * s.v.gb_mx),
    when: (s) => mex(s, 'MEX'),
    title: 'Mexico abolishes slavery',
    text: 'The Congress frees New Spain\'s remaining slaves, with compensation from silver revenues. Enslaved people in Louisiana and Texas now have a free border to the south.',
    fx: (s) => { s.set('mx_abolition'); s.add('gb_mx', 0.08); s.add('us_sect', 0.03); if (mex(s, 'CUB')) s.add('cu_unrest', 0.3); } });

  ev({ id: 'venezuela_fall', y: 1812, m: 7, place: 'caracas', kind: 'war',
    when: (s) => s.oid('VEN') === 'VEN',
    p: (s) => 0.95 - s.v.sa_mom * 0.5,
    title: 'The First Venezuelan Republic falls',
    text: 'After the Caracas earthquake, Monteverde\'s royalists retake the country and Miranda is handed over to Spain.',
    fx: (s) => s.own('VEN', 'ESP') });

  ev({ id: 'war_1812', y: 1812, m: 6, place: 'washington', kind: 'war',
    p: 0.85,
    title: 'The United States declares war on Britain',
    text: 'Impressment, trade seizures and frontier war with Tecumseh\'s confederacy lead Madison to war. Mexico stays neutral and sells to both sides.',
    fx: (s) => { s.set('war_1812'); s.add('us_expan', -0.05); s.after(2, 'ghent'); s.add('mx_fisc', 0.04); } });
  ev({ id: 'ghent', sched: true, m: 12, place: 'washington', kind: 'treaty',
    title: 'Treaty of Ghent', text: 'Status quo ante bellum. Tecumseh is dead; the Old Northwest is open to settlement.' });

  ev({ id: 'fort_ross', y: 1812, m: 3, place: 'fortross', kind: 'colonial',
    p: (s) => 0.95 - 0.4 * s.v.mx_mil,
    title: 'Russians build Fort Ross',
    text: 'The Russian-American Company plants a fortified post north of San Francisco Bay to grow grain for Alaska. Mexico protests.',
    fx: (s) => s.set('fort_ross') });

  ev({ id: 'gutierrez_magee', win: [1812, 1813], m: 8, place: 'nacogdoches', kind: 'war',
    p: 0.6,
    title: 'Filibusters cross the Sabine',
    text: 'The Republican Army of the North, raised in Louisiana by Bernardo Gutiérrez de Lara and Augustus Magee, marches on San Antonio.',
    outcomes: [
      { title: 'Routed at the Medina', w: (s) => 0.5 + s.v.mx_mil, text: 'Mexican regulars destroy the filibusters. Texas garrisons are doubled.', fx: (s) => { s.add('mx_mil', 0.04); s.set('tx_garrison'); } },
      { title: 'A short-lived Republic of Texas', w: 0.12, text: 'San Antonio falls and a republic is declared. It lasts until the junta\'s army arrives.', fx: (s) => { s.add('mx_stab', -0.03); s.add('tx_anglo', 0.03); } },
    ] });

  ev({ id: 'chile_fall', y: 1814, m: 10, place: 'santiago', kind: 'war',
    when: (s) => s.oid('CHL') === 'CHL',
    p: (s) => 0.9 - 0.45 * s.v.sa_mom,
    title: 'Rancagua: the Patria Vieja falls',
    text: 'Royalists from Peru defeat O\'Higgins; the patriots flee across the Andes to Mendoza.',
    fx: (s) => s.own('CHL', 'ESP') });

  // ------------------------------------------------------------------ Ferdinand returns
  ev({ id: 'ferdinand', y: 1814, m: 5, place: 'madrid', kind: 'politics', major: true,
    title: 'Ferdinand VII restored',
    text: 'Back from Valençay, Ferdinand annuls the Constitution of Cádiz and jails liberals. He summons the American juntas to submit.',
    fx: (s) => { s.set('ferdinand_restored'); s.v.es_cap = 0.45; delete s.f.spain_turmoil; } });

  ev({ id: 'ultimatum', y: 1814, m: 8, place: 'mexico', kind: 'diplomacy', major: true,
    when: (s) => mex(s, 'MEX'),
    title: "Ferdinand's ultimatum to Mexico",
    text: 'Madrid demands that the junta dissolve. Mexico City answers with an offer modeled on Rio: Ferdinand may reign in Mexico, under the Mexican constitution.',
    game: {
      rowPlayer: 'Ferdinand VII', colPlayer: 'Mexican Congress', rows: ['Accept a dual monarchy', 'Refuse and threaten'], cols: ['Offer the crown (Brazil model)', 'Declare independence'],
      payoffs: (s) => [
        [[2.2, 3], [0.5, 3.4]],
        [[3, 1.2], [2 + s.v.es_cap - s.v.mx_mil, 2 + s.v.mx_mil + s.v.gb_mx - s.v.es_cap]],
      ],
      outcome: (i, j) => (i === 0 && j === 0 ? 0 : i === 1 && j === 0 ? 1 : 2),
      lambda: 1.8,
    },
    outcomes: [
      { title: 'Dual monarchy: Ferdinand reigns as King of Mexico', text: 'Ferdinand accepts a Mexican crown under the Mexican constitution. The two kingdoms share a king and nothing else.',
        fx: (s) => { s.set('dual_monarchy'); s.name('MEX', 'Kingdom of Mexico (dual monarchy)'); s.add('mx_stab', 0.05); } },
      { title: 'Offer refused; Mexico declares independence', text: 'Ferdinand rejects the offer. In January the Congress declares the Kingdom of Mexico independent, keeping the crown open "for a prince of the house of Bourbon."',
        fx: (s) => { s.set('spain_hostile'); s.set('independent'); s.name('MEX', 'Kingdom of Mexico'); } },
      { title: 'Mexico declares independence', text: 'Mexico declares independence outright. Madrid refuses to recognize it.',
        fx: (s) => { s.set('spain_hostile'); s.set('independent'); s.name('MEX', 'Kingdom of Mexico'); } },
    ] });

  ev({ id: 'expedition', y: 1815, m: 2, place: 'cadiz', kind: 'war', major: true,
    when: (s) => s.f.spain_hostile,
    title: 'Where to send the Expeditionary Army?',
    text: 'Spain gathers 10,500 men at Cádiz under Pablo Morillo. Historically they sailed for Venezuela. Mexico is the richer prize, but also the better defended.',
    outcomes: [
      { title: 'To Tierra Firme (Venezuela and New Granada)', w: (s) => 0.4 + s.v.mx_mil, text: 'Morillo sails for Venezuela. Mexico is spared.',
        fx: (s) => { s.set('morillo'); } },
      { title: 'To Veracruz', w: (s) => 1 - s.v.mx_mil, place: 'veracruz', text: 'Morillo lands at Veracruz in the fever season.',
        fx: (s) => { s.set('invasion_1815'); s.after(1, 'veracruz'); s.add('sa_mom', 0.1); } },
    ] });

  ev({ id: 'veracruz', sched: true, m: 6, place: 'veracruz', kind: 'war', major: true,
    title: 'The campaign of Veracruz',
    text: 'Yellow fever and Mexican militia meet the Spanish regulars on the road to Jalapa.',
    outcomes: [
      { title: 'Spanish army destroyed by fever and siege', w: (s) => 0.6 + s.v.mx_mil, text: 'Morillo surrenders what is left of his army at Perote. Spain will not try again for years.',
        fx: (s) => { s.add('es_cap', -0.2); s.add('mx_stab', 0.08); s.add('mx_mil', 0.08); } },
      { title: 'Spain takes the coast; war drags on', w: (s) => 0.2 + s.v.es_cap, text: 'Veracruz and Tampico fall. The kingdom fights on from the plateau; British credit keeps it afloat.',
        fx: (s) => { s.add('mx_fisc', -0.15); s.add('mx_stab', -0.1); s.set('at_war'); s.after(3, 'veracruz_end'); } },
    ] });
  ev({ id: 'veracruz_end', sched: true, m: 3, place: 'veracruz', kind: 'treaty',
    title: 'Spain evacuates Veracruz', text: 'Starved of money and reinforcements, the Spanish garrison sails for Havana.',
    fx: (s) => { delete s.f.at_war; } });

  ev({ id: 'crown', win: [1815, 1822], m: 4, place: 'mexico', kind: 'politics',
    when: (s) => s.f.independent && !s.f.crown_settled,
    p: 0.35,
    title: 'Who will wear the Mexican crown?',
    text: 'Congress has kept the throne open. Ferdinand forbids any Bourbon to accept it.',
    otl: 'In our timeline Agustín de Iturbide had himself crowned Emperor of Mexico in 1822 and fell within a year.',
    outcomes: [
      { title: 'Infante Francisco de Paula accepts', w: (s) => 0.25 + 0.4 * s.v.gb_mx, text: "Ferdinand's youngest brother defies him and sails on a British frigate. He is crowned Francisco I of Mexico.",
        fx: (s) => { s.set('crown_settled'); s.set('bourbon_king'); s.name('MEX', 'Kingdom of Mexico'); s.add('mx_stab', 0.08); } },
      { title: 'A creole regency under Congress', w: 0.35, text: 'A three-man regency of Primo de Verdad, Azcárate and Bishop Abad y Queipo governs "until a prince is found."',
        fx: (s) => { s.set('crown_settled'); s.name('MEX', 'Kingdom of Mexico (Regency)'); } },
      { title: 'A general crowns himself', w: (s) => 0.35 * (1 - s.v.mx_stab), text: 'Colonel Agustín de Iturbide, the army\'s rising star, is acclaimed emperor by his regiments. Congress yields under protest.',
        fx: (s) => { s.set('crown_settled'); s.set('creole_emperor'); s.name('MEX', 'Mexican Empire (Iturbide)'); s.add('mx_stab', -0.1); s.add('mx_mil', 0.05); } },
      { title: 'Congress proclaims a republic', w: 0.12, text: 'Tired of waiting for a prince, Congress proclaims a federal republic.',
        fx: (s) => { s.set('crown_settled'); s.set('republic'); s.name('MEX', 'Mexican Republic'); } },
    ] });

  ev({ id: 'dual_split', win: [1820, 1832], m: 3, place: 'mexico', kind: 'politics',
    when: (s) => s.f.dual_monarchy && !s.f.independent,
    p: (s) => (s.f.spain_turmoil ? 0.3 : 0.08),
    title: 'Mexico ends the personal union',
    text: 'Spain\'s turmoil and Ferdinand\'s meddling persuade the Mexican Cortes to sever the last tie. The crown passes to a Mexican-born line.',
    fx: (s) => { s.set('independent'); s.set('crown_settled'); s.name('MEX', 'Kingdom of Mexico'); } });

  // ------------------------------------------------------------------ South America, 1815–1830
  ev({ id: 'morillo_ng', y: 1816, m: 5, place: 'cartagena', kind: 'war',
    when: (s) => s.f.morillo,
    title: 'Morillo reconquers New Granada',
    text: 'Cartagena falls after a 105-day siege; the "Pacificador" executes the leaders of the First Republic.',
    fx: (s) => { s.own(['COL', 'VEN'], 'ESP'); } });

  ev({ id: 'tucuman', y: 1816, m: 7, place: 'tucuman', kind: 'politics',
    when: (s) => s.oid('ARG') === 'ARG',
    title: 'Independence declared at Tucumán',
    text: 'The United Provinces of South America declare full independence from Spain.' });

  ev({ id: 'java_back', y: 1816, m: 8, place: 'batavia', kind: 'treaty', bg: true,
    title: 'Java and Suriname return to the Dutch',
    fx: (s) => { s.own('IDN', 'NLD:Dutch East Indies'); s.own('SUR', 'NLD'); } });

  ev({ id: 'cisplatina', y: 1817, m: 1, place: 'montevideo', kind: 'war',
    title: 'Portugal occupies the Banda Oriental',
    text: 'Lecor\'s Luso-Brazilian army takes Montevideo; Artigas retreats into the interior.',
    fx: (s) => s.own('URY', 'POR:Cisplatina (Portuguese Brazil)') });

  ev({ id: 'chacabuco', y: 1817, m: 2, place: 'chacabuco', kind: 'war',
    when: (s) => s.oid('CHL') === 'ESP',
    p: (s) => 0.6 + 0.4 * s.v.sa_mom,
    title: 'San Martín crosses the Andes',
    text: 'The Army of the Andes wins at Chacabuco; Chile declares independence the next year.',
    fx: (s) => s.own('CHL', 'CHL') });

  ev({ id: 'boyaca', win: [1819, 1821], m: 8, place: 'boyaca', kind: 'war', major: true,
    p: (s) => 0.55 + 0.4 * s.v.sa_mom,
    title: 'Bolívar at Boyacá: Gran Colombia',
    text: 'Bolívar crosses the flooded llanos and the Andes and takes Bogotá. The Congress of Angostura unites New Granada, Venezuela and later Quito and Panama as the Republic of Colombia.',
    fx: (s) => s.own(['COL', 'VEN', 'PAN', 'ECU'], 'GCO') });

  ev({ id: 'florida', win: [1819, 1821], m: 2, place: 'pensacola', kind: 'treaty',
    when: (s) => s.oid('US-FL') === 'ESP',
    p: 0.8,
    title: 'Spain cedes the Floridas',
    text: 'After Jackson\'s raids, a bankrupt Madrid cedes East and West Florida to the United States.',
    outcomes: [
      { title: 'Ceded to the United States', w: 0.9, fx: (s) => s.own('US-FL', 'USA') },
      { title: 'Sold to Mexico instead', w: (s) => (s.f.spain_hostile ? 0 : 0.15 * s.v.mx_fisc), text: 'Madrid, still hoping to keep its dual monarchy, sells the Floridas to Mexico to keep them from Washington.', fx: (s) => s.own('US-FL', 'MEX') },
    ] });

  ev({ id: 'boundary_1819', y: 1819, m: 2, place: 'washington', kind: 'diplomacy', major: true,
    when: (s) => mex(s, 'US-TX'),
    title: 'Setting the U.S.–Mexican boundary',
    text: 'John Quincy Adams negotiates the line across the continent, this time with a Mexican envoy. Washington claims Louisiana ran to the Rio Grande; Mexico wants the Sabine.',
    game: {
      rowPlayer: 'Washington (Adams)', colPlayer: 'Mexico', rows: ['Press the Rio Grande claim', 'Accept the Sabine'], cols: ['Hold firm (with British backing)', 'Concede Texas'],
      payoffs: (s) => [
        [[1.5 - s.v.gb_mx - s.v.mx_mil + s.v.us_expan, 2], [3, 0.5]],
        [[2, 3], [2.5, 1.5]],
      ],
      outcome: (i, j) => (i === 0 && j === 1 ? 1 : i === 0 && j === 0 ? 2 : 0),
    },
    outcomes: [
      { title: 'Sabine–Red–Arkansas line, to the 42nd parallel', text: 'The Adams–Verdad Treaty follows the line of our timeline\'s Adams–Onís Treaty. Mexico keeps Texas, New Mexico and the Californias.', fx: (s) => s.set('border_settled') },
      { title: 'Mexico concedes Texas', text: 'Short of money, Mexico trades Texas for a guaranteed western boundary.', fx: (s) => { s.own('US-TX', 'USA'); s.set('border_settled'); s.add('us_sect', 0.05); } },
      { title: 'Deadlock; Sabine line held under protest', text: 'Washington refuses to renounce its claim. The Sabine stays the de facto line, and the frontier stays tense.', fx: (s) => { s.set('border_tension'); } },
    ] });

  ev({ id: 'oregon_joint', y: 1818, m: 10, place: 'ftvancouver', kind: 'treaty',
    title: 'Joint occupation of the Oregon Country',
    text: 'The Anglo-American Convention of 1818 fixes the 49th parallel east of the Rockies and leaves Oregon open to both.',
    fx: (s) => s.own(['OREGON', 'CA-BC'], 'JOINT:Oregon Country (U.S.–British joint occupation)') });

  ev({ id: 'sa_mop_up', win: [1825, 1845], m: 6, place: 'lima', kind: 'war',
    when: (s) => ['VEN', 'COL', 'ECU', 'PER', 'BOL', 'CHL', 'ARG', 'PAN'].some((k) => s.oid(k) === 'ESP'),
    p: (s) => 0.2 + 0.4 * s.v.sa_mom,
    title: 'The last royalist strongholds fall',
    text: 'Spain, bankrupt and divided, cannot hold what remains of its mainland empire.',
    fx: (s) => {
      s.take(['VEN', 'COL', 'PAN', 'ECU'], 'ESP', 'COL:New Granada'); s.take(['PER', 'TARAPACA'], 'ESP', 'PERU');
      s.take(['BOL', 'ANTOFAGASTA'], 'ESP', 'BOL'); s.take('CHL', 'ESP', 'CHL'); s.take('ARG', 'ESP', 'ARG');
    } });

  ev({ id: 'riego', y: 1820, m: 1, place: 'cadiz', kind: 'revolt',
    p: 0.85,
    title: 'Riego\'s revolt: Spain\'s liberal triennium',
    text: 'The army massed at Cádiz for America mutinies and forces Ferdinand to restore the 1812 constitution. No more expeditions will sail.',
    fx: (s) => { s.set('spain_turmoil'); s.add('es_cap', -0.2); s.add('sa_mom', 0.1); } });

  ev({ id: 'peru', win: [1821, 1824], m: 7, place: 'lima', kind: 'war', major: true,
    when: (s) => s.oid('PER') === 'ESP' && s.oid('CHL') === 'CHL',
    p: (s) => 0.4 + 0.4 * s.v.sa_mom,
    title: 'Lima falls; Ayacucho',
    text: 'San Martín takes Lima; Sucre destroys the last royal army at Ayacucho. Upper Peru becomes Bolivia.',
    fx: (s) => { s.own(['PER', 'TARAPACA'], 'PERU'); s.own(['BOL', 'ANTOFAGASTA'], 'BOL'); } });

  ev({ id: 'brazil', y: 1822, m: 9, place: 'saopaulo', kind: 'politics', major: true,
    p: 0.92,
    title: 'Independence or death: the Empire of Brazil',
    text: 'Prince Pedro refuses to return to Lisbon and proclaims Brazil an empire.',
    fx: (s) => { s.own('BRA', 'BRA'); s.take('URY', 'POR', 'BRA:Cisplatina (Brazil)'); } });

  ev({ id: 'haiti_unify', y: 1822, m: 2, place: 'santodomingo', kind: 'war',
    title: 'Boyer unites Hispaniola',
    text: 'Haitian troops occupy Santo Domingo and abolish slavery there. The island is united for 22 years.',
    fx: (s) => s.own('DOM', 'HAI') });

  ev({ id: 'monroe', y: 1823, m: 12, place: 'washington', kind: 'diplomacy',
    title: 'The Monroe Doctrine',
    text: 'Monroe warns Europe off the hemisphere. In Mexico City, the Congress replies that the hemisphere\'s oldest independent crown needs no guardian.',
    fx: (s) => s.set('monroe') });

  ev({ id: 'tx_colonization', win: [1821, 1824], m: 1, place: 'sanantonio', kind: 'politics',
    when: (s) => mex(s, 'US-TX'),
    title: 'Colonization policy for Texas',
    text: 'Texas holds perhaps 3,000 settlers against the Comanche. Moses and Stephen Austin petition to bring in Anglo-American families.',
    outcomes: [
      { title: 'Open to American settlers (the Austin model)', w: (s) => 0.55 - 0.3 * s.v.gb_mx, text: 'Empresarios bring in families who swear allegiance and nominally convert. Many bring slaves.', fx: (s) => s.set('tx_open') },
      { title: 'European Catholic colonies, Anglo quotas', w: (s) => 0.25 + 0.5 * s.v.gb_mx, text: 'Irish, German and Canary Islander colonies are recruited through London and Hamburg; American empresarios get strict quotas.', fx: (s) => { s.set('tx_open'); s.set('tx_catholic'); } },
      { title: 'Military colonies only', w: (s) => 0.5 * s.v.mx_mil, text: 'Texas is settled by soldier-colonists from Coahuila and Nuevo León.', fx: (s) => s.set('tx_closed') },
    ] });

  ev({ id: 'law_1830', win: [1828, 1834], m: 4, place: 'mexico', kind: 'politics',
    when: (s) => mex(s, 'US-TX') && s.f.tx_open && !s.f.tx_catholic && s.v.tx_anglo > 0.5,
    p: 0.4,
    title: 'Mexico closes Texas to American immigration',
    text: 'General Mier y Terán reports that Texas is becoming American. Congress bans further immigration from the United States and garrisons the east.',
    fx: (s) => { s.set('tx_closed'); s.set('centralism'); } });

  ev({ id: 'cam_secession', win: [1822, 1850], m: 7, place: 'guatemala', kind: 'revolt',
    when: (s) => mex(s, 'GTM'),
    p: (s) => 0.01 + 0.2 * Math.max(0, s.v.cam_tension - 0.4) + 0.08 * Math.max(0, 0.45 - s.v.mx_stab),
    title: 'Central America secedes',
    text: 'Guatemala City\'s merchants and San Salvador\'s liberals, tired of paying for Mexico City\'s army, declare the United Provinces of Central America.',
    otl: 'In our timeline Central America broke away in 1823, after Iturbide\'s empire fell, and its federation collapsed into five republics by 1841.',
    averted: 'Central America stays in the kingdom',
    fx: (s) => { s.own(['GTM', 'SLV', 'HND', 'NIC', 'CRI'], 'CAF'); s.add('mx_stab', -0.05); s.add('mx_fisc', -0.03); } });

  ev({ id: 'cam_autonomy', win: [1826, 1845], m: 5, place: 'guatemala', kind: 'politics',
    when: (s) => mex(s, 'GTM') && !s.f.cam_autonomy,
    p: (s) => 0.04 + 0.1 * s.v.mx_stab,
    title: 'Statute of the Kingdom of Guatemala',
    text: 'Mexico grants Central America its own diet, treasury and captain general under the crown, much as Hungary would later bargain with Vienna.',
    fx: (s) => { s.set('cam_autonomy'); s.v.cam_tension = Math.min(s.v.cam_tension, 0.25); } });

  ev({ id: 'caf_dissolves', win: [1838, 1842], m: 5, place: 'guatemala', kind: 'politics',
    when: (s) => s.oid('GTM') === 'CAF', p: 0.5,
    title: 'The Central American federation dissolves',
    text: 'Carrera\'s peasant army takes Guatemala City; the federation splits into five small republics.',
    fx: (s) => { s.own('GTM', 'CAF:Guatemala'); s.own('SLV', 'CAF:El Salvador'); s.own('HND', 'CAF:Honduras'); s.own('NIC', 'CAF:Nicaragua'); s.own('CRI', 'CAF:Costa Rica'); } });

  ev({ id: 'cuba_1826', win: [1824, 1829], m: 4, place: 'havana', kind: 'war', major: true,
    when: (s) => s.oid('CUB') === 'ESP' && mex(s, 'MEX') && s.f.independent,
    p: 0.35,
    title: 'The Cuban expedition',
    text: 'Spain uses Havana as a base for raids and reconquest plans. Mexico and Colombia plan to take the island. Washington and London prefer Spanish Cuba to Mexican Cuba.',
    game: {
      rowPlayer: 'Mexico', colPlayer: 'U.S. and Britain', rows: ['Invade Cuba', 'Stand down'], cols: ['Tolerate', 'Block'],
      payoffs: (s) => [
        [[2.5 + s.v.mx_mil + (s.f.slavery_lock ? 0.3 : 0), s.f.mx_abolition ? 0.8 : 1.6], [0.3, 2.2]],
        [[1.8, 3], [1.8, 2.7]],
      ],
      outcome: (i, j) => (i === 0 && j === 0 ? 0 : i === 0 ? 1 : 2),
    },
    outcomes: [
      { title: 'Havana taken; Cuba joins the kingdom', text: 'A Mexican–Colombian squadron lands at Matanzas. Cuban creoles rise; the Spanish garrison capitulates.', fx: (s) => { s.own(['CUB'], 'MEX'); s.add('mx_fisc', 0.05); s.add('cu_unrest', 0.1); } },
      { title: 'Expedition turned back', text: 'A U.S. note and a Royal Navy squadron off Cabo San Antonio persuade the Mexican squadron to turn back.', fx: (s) => { s.add('mx_stab', -0.05); } },
      { title: 'Mexico stands down', text: 'Mexico settles for a naval war against Spanish commerce.' },
    ] });

  ev({ id: 'panama_congress', y: 1826, m: 6, place: 'panama', kind: 'diplomacy',
    when: (s) => mex(s, 'MEX') && s.f.independent,
    p: (s) => 0.3 + 0.4 * s.v.mx_stab,
    title: 'Congress of Panama: a Hispanic American league',
    text: 'Mexico, Colombia, Peru and Central America sign a perpetual defensive league, backed by Mexican silver.',
    fx: (s) => { s.set('league'); s.add('sa_mom', 0.05); } });

  ev({ id: 'barradas', win: [1827, 1830], m: 7, place: 'tampico', kind: 'war',
    when: (s) => s.f.spain_hostile && !s.f.spain_recognized && s.oid('CUB') === 'ESP' && mex(s, 'MEX'),
    p: 0.3,
    title: 'Barradas lands at Tampico',
    text: 'Ferdinand sends 3,500 men from Havana to reconquer Mexico.',
    outcomes: [
      { title: 'Surrender at Tampico', w: 0.85, text: 'Fever and a Mexican army force Barradas to surrender.', fx: (s) => { s.add('mx_stab', 0.05); s.add('es_cap', -0.1); } },
      { title: 'A foothold on the Gulf', w: 0.15, text: 'The Spanish hold Tampico for a year before sailing home.', fx: (s) => { s.add('mx_fisc', -0.05); } },
    ] });

  ev({ id: 'spain_recognizes', win: [1830, 1840], m: 12, place: 'madrid', kind: 'treaty',
    when: (s) => s.f.spain_hostile && !s.f.spain_recognized,
    p: (s) => (s.y > 1833 ? 0.4 : 0.1),
    title: 'Spain recognizes Mexico',
    text: 'After Ferdinand\'s death, the regency of María Cristina recognizes the Kingdom of Mexico.',
    fx: (s) => s.set('spain_recognized') });

  ev({ id: 'gc_split', win: [1830, 1831], m: 5, place: 'bogota', kind: 'politics',
    when: (s) => s.oid('COL') === 'GCO',
    p: (s) => (s.f.league ? 0.45 : 0.85),
    title: 'Gran Colombia breaks apart',
    text: 'Bolívar resigns and dies at Santa Marta. Venezuela and Ecuador go their own way.',
    otl: 'In our timeline Gran Colombia dissolved in 1830–31.',
    averted: 'Gran Colombia survives',
    fx: (s) => { s.own('VEN', 'VEN'); s.own('ECU', 'ECU'); s.own(['COL', 'PAN'], 'COL'); } });

  ev({ id: 'cisplatine', y: 1828, m: 8, place: 'montevideo', kind: 'treaty',
    when: (s) => s.oid('URY') === 'BRA', p: 0.85,
    title: 'Uruguay is born',
    text: 'British mediation ends the Cisplatine War with an independent buffer state.',
    fx: (s) => s.own('URY', 'URU') });

  // ------------------------------------------------------------------ Texas, Yucatán, the Plains
  ev({ id: 'texas_revolt', win: [1830, 1848], m: 3, place: 'sanantonio', kind: 'revolt', major: true,
    when: (s) => mex(s, 'US-TX'),
    p: (s) => 0.4 * S(9 * (s.v.tx_anglo - 0.55) - 7 * (s.v.mx_mil - 0.4) + (s.f.centralism ? 1 : 0) - (s.f.tx_autonomy ? 2 : 0)),
    title: 'Revolt in Texas',
    text: 'Anglo-Texan colonists, protesting centralism, customs duties and the ban on slavery, rise at Gonzales and besiege San Antonio.',
    otl: 'In our timeline Texas won independence at San Jacinto in 1836 and joined the United States in 1845.',
    averted: 'No Texas Revolution',
    outcomes: [
      { title: 'The Republic of Texas', w: (s) => s.v.tx_anglo * (1.2 - s.v.mx_mil), text: 'The Mexican army is beaten at San Jacinto; Texas declares independence.', fx: (s) => { s.own('US-TX', 'TEX'); s.add('mx_stab', -0.08); s.set('tx_lost'); } },
      { title: 'Crushed at the Alamo and Goliad', w: (s) => 0.2 + s.v.mx_mil, kind: 'war', text: 'The rebellion is broken. Texas is flooded with troops and European colonists.', fx: (s) => { s.set('tx_closed'); s.set('tx_catholic'); s.v.tx_anglo *= 0.8; s.add('us_sect', 0.03); } },
      { title: 'Autonomous State of Texas', w: 0.35, text: 'Mexico concedes a separate state, local juries, English in the courts and a "labor contract" loophole for slavery.', fx: (s) => { s.set('tx_autonomy'); s.add('mx_church', 0.03); } },
    ] });

  ev({ id: 'texas_annex', win: [1837, 1860], m: 3, place: 'washington', kind: 'politics', major: true,
    when: (s) => s.oid('US-TX') === 'TEX',
    p: (s) => 0.1 + 0.25 * s.v.us_expan,
    title: 'The United States annexes Texas',
    text: 'A joint resolution of Congress admits Texas as a slave state.',
    fx: (s) => { s.own('US-TX', 'USA'); s.add('us_sect', 0.1); s.set('border_tension'); } });

  ev({ id: 'yucatan', win: [1838, 1850], m: 3, place: 'merida', kind: 'revolt',
    when: (s) => mex(s, 'YUCATAN'),
    p: (s) => 0.02 + 0.2 * Math.max(0, 0.5 - s.v.mx_stab) + (s.f.centralism ? 0.04 : 0),
    title: 'Yucatán secedes',
    text: 'Mérida\'s henequen planters, angered by tariffs and conscription, declare the Republic of Yucatán.',
    otl: 'In our timeline Yucatán was independent from 1841 to 1848 and rejoined Mexico to get help against the Maya rising.',
    fx: (s) => s.own(['YUCATAN', 'QROO'], 'YUC') });

  ev({ id: 'caste_war', win: [1847, 1849], m: 7, place: 'merida', kind: 'revolt', major: true,
    p: (s) => (s.oid('YUCATAN') === 'YUC' ? 0.7 : 0.25 + 0.2 * (1 - s.v.mx_stab)),
    title: 'The Caste War of Yucatán',
    text: 'Maya peasants, squeezed off their land by sugar and henequen, rise at Tepich and nearly take Mérida.',
    otl: 'In our timeline the Caste War began in 1847; the Maya state of Chan Santa Cruz held out in the east until 1901.',
    outcomes: [
      { title: 'Chan Santa Cruz: a Maya state in the east', w: 0.6, text: 'Driven back from Mérida, the rebels hold the eastern forests around the Talking Cross.', fx: (s) => { s.own('QROO', 'NATIVE:Chan Santa Cruz Maya'); if (s.oid('YUCATAN') === 'YUC') s.own('YUCATAN', 'MEX'); } },
      { title: 'Rising suppressed', w: (s) => 0.2 + 0.4 * s.v.mx_mil, text: 'Mexican troops shipped from Veracruz break the siege of Mérida.', fx: (s) => { if (s.oid('YUCATAN') === 'YUC') s.own(['YUCATAN', 'QROO'], 'MEX'); } },
    ] });

  ev({ id: 'chan_santa_cruz_end', win: [1880, 1900], m: 5, place: 'merida', kind: 'war',
    when: (s) => s.oid('QROO') === 'NATIVE', p: (s) => 0.04 + 0.1 * s.v.mx_mil,
    title: 'Mexican troops take Chan Santa Cruz',
    fx: (s) => s.own('QROO', 'MEX') });

  ev({ id: 'ross_sale', y: 1841, m: 12, place: 'fortross', kind: 'treaty',
    when: (s) => s.f.fort_ross,
    title: 'Russia sells Fort Ross',
    text: 'With Alaska now fed by the Hudson\'s Bay Company, the Russians sell their California post.',
    outcomes: [
      { title: 'Bought by the Mexican crown', w: (s) => s.v.mx_fisc, text: 'Mexico buys the fort and its cannon and garrisons it.', fx: (s) => s.add('mx_mil', 0.02) },
      { title: 'Bought by John Sutter', w: 0.5, text: 'The Swiss adventurer John Sutter buys the fort for his colony of New Helvetia on the Sacramento.', fx: (s) => s.add('ca_anglo', 0.02) },
    ] });

  ev({ id: 'oregon', y: 1846, m: 6, place: 'ftvancouver', kind: 'treaty',
    when: (s) => s.oid('OREGON') === 'JOINT',
    title: 'The Oregon Treaty',
    text: '"Fifty-four forty or fight" gives way to a compromise.',
    outcomes: [
      { title: 'Split at the 49th parallel', w: 0.8, fx: (s) => { s.own('OREGON', 'USA'); s.own('CA-BC', 'GBR:Columbia Department (HBC)'); } },
      { title: 'Britain keeps the Columbia line', w: (s) => 0.1 + 0.2 * s.v.gb_mx, text: 'With Mexico as an ally on the Pacific, London holds out for the Columbia River. Washington state stays British.', fx: (s) => { s.own(['US-OR', 'US-ID'], 'USA'); s.own(['US-WA', 'CA-BC'], 'GBR:Columbia Department (HBC)'); } },
    ] });

  ev({ id: 'crisis_1846', win: [1844, 1852], m: 5, place: 'washington', kind: 'diplomacy', major: true,
    when: (s) => mex(s, 'US-CA') && !s.f.mxus_war && s.v.us_expan > 0.45,
    p: (s) => 0.2 + 0.4 * s.v.us_expan + (s.f.border_tension ? 0.2 : 0),
    title: 'Manifest destiny meets the Mexican frontier',
    text: 'President Polk wants San Francisco Bay. He can offer to buy California or provoke a war on the border.',
    otl: 'In our timeline the Mexican–American War (1846–48) cost Mexico half its territory.',
    game: {
      rowPlayer: 'Washington (Polk)', colPlayer: 'Mexico', rows: ['Force the issue (war)', 'Offer to buy'], cols: ['Refuse and mobilize', 'Sell the far north'],
      payoffs: (s) => {
        const pw = AH.clamp(0.25 + 0.3 * (s.v.us_pop / s.v.mx_pop - 1) - 0.35 * s.v.mx_mil - 0.3 * s.v.gb_mx + (s.f.tx_lost ? 0.1 : 0));
        s.v.pw = pw;
        return [
          [[4 * pw - 0.9 + (s.f.border_tension ? 0.6 : 0), 2 - 3 * pw], [3, 0.4]],
          [[1, 3], [2.4, 1 + (s.v.mx_fisc < 0.35 ? 1.5 : 0)]],
        ];
      },
      outcome: (i, j) => (i === 0 && j === 0 ? 0 : j === 1 ? 1 : 2),
    },
    outcomes: [
      { title: 'War: U.S. troops cross the Rio Grande', kind: 'war', place: 'monterrey', text: 'Taylor marches on Monterrey; the Pacific Squadron lands at Monterey.', fx: (s) => { s.set('mxus_war'); s.set('at_war'); s.after(2, 'mxus_peace'); s.add('us_sect', 0.05); } },
      { title: 'Mexico sells Alta California and New Mexico', place: 'mexico', text: 'A bankrupt treasury accepts $40 million for the far north. Riots follow in Mexico City.', fx: (s) => { s.own(['US-CA', 'NEWMEX', 'GBASIN'], 'USA'); s.add('mx_stab', -0.15); s.add('mx_fisc', 0.2); s.set('cession'); s.add('us_sect', 0.1); } },
      { title: 'Rebuffed; an armed peace', text: 'Mexico refuses to sell. London warns Washington that California is not for sale. Polk turns to Oregon.', fx: (s) => { s.set('cold_peace'); s.add('gb_mx', 0.1); s.set('gb_alliance'); } },
    ] });

  ev({ id: 'mxus_peace', sched: true, m: 2, place: 'mexico', kind: 'treaty', major: true,
    title: 'The peace of 1848',
    text: 'After two years of war the belligerents sign a peace.',
    outcomes: [
      { title: 'U.S. victory: the Mexican Cession', w: (s) => s.v.pw || 0.4, text: 'Scott takes Mexico City. Mexico cedes Alta California, New Mexico and Texas.', fx: (s) => { s.own(['US-CA', 'NEWMEX', 'GBASIN', 'US-TX'], 'USA'); s.set('cession'); s.add('mx_stab', -0.2); s.add('us_sect', 0.15); } },
      { title: 'Stalemate: status quo ante', w: (s) => 0.6 * (1 - (s.v.pw || 0.4)), text: 'Yellow fever and guerrillas stop Taylor at Saltillo; the Royal Navy keeps the Pacific ports open. Peace on the old line.', fx: (s) => { s.add('mx_stab', 0.05); s.add('us_sect', 0.05); } },
      { title: 'Mexican victory', w: (s) => 0.4 * (1 - (s.v.pw || 0.4)), text: 'An American army surrenders near Monterrey. If Texas was American, Mexico recovers it.', fx: (s) => { if (s.oid('US-TX') !== 'MEX') s.own('US-TX', 'MEX'); s.add('mx_stab', 0.1); s.add('mx_mil', 0.1); } },
    ],
    fx: (s) => { delete s.f.at_war; } });

  ev({ id: 'gold', y: 1848, m: 1, place: 'sutter', kind: 'econ', major: true,
    title: "Gold at Sutter's Mill",
    text: (s) => (mex(s, 'US-CA') ? 'Gold in the American River, on Mexican soil. Within a year 90,000 forty-niners arrive, most of them from the United States, and they do not ask for passports.' : 'Gold in the American River. The rush turns California into a state within two years.'),
    fx: (s) => { if (mex(s, 'US-CA')) { s.set('gold'); s.add('mx_fisc', 0.12); } else s.set('west_settled'); } });

  ev({ id: 'gold_policy', y: 1849, m: 3, place: 'monterey', kind: 'politics',
    when: (s) => s.f.gold,
    title: 'Mexico decides what to do with the forty-niners',
    text: 'Monterey\'s governor has 400 soldiers and 90,000 miners.',
    outcomes: [
      { title: 'Naturalize and tax them', w: (s) => 0.3 + 0.5 * s.v.mx_stab, text: 'Miners who register pay a mining tax and get a land title; after five years, citizenship. Silver-standard Mexico now mints gold.', fx: (s) => { s.set('ca_naturalize'); s.add('mx_fisc', 0.1); } },
      { title: 'Expel foreign miners', w: 0.3, text: 'A foreign miners\' ban is proclaimed, which cannot be enforced.', fx: (s) => s.add('ca_anglo', 0.05) },
      { title: 'Lease the goldfields to a British company', w: (s) => s.v.gb_mx, text: 'A London syndicate takes the concession and brings in Cornish miners and Royal Navy visits.', fx: (s) => { s.add('gb_mx', 0.1); s.add('mx_fisc', 0.06); s.set('gb_alliance'); } },
    ] });

  ev({ id: 'ca_crisis', win: [1850, 1862], m: 6, place: 'sanfrancisco', kind: 'revolt', major: true,
    when: (s) => mex(s, 'US-CA') && s.f.gold,
    p: (s) => 0.03 + 0.35 * s.v.ca_anglo * (1 - s.v.mx_mil) - (s.f.ca_naturalize ? 0.05 : 0) - (s.f.gb_alliance ? 0.05 : 0),
    title: 'The Bear Flag over San Francisco',
    text: 'Miners\' committees and filibusters seize the Presidio and proclaim a California Republic.',
    outcomes: [
      { title: 'The California Republic stands', w: (s) => s.v.ca_anglo * (1.2 - s.v.mx_mil), fx: (s) => { s.own('US-CA', 'CAL'); s.add('mx_stab', -0.1); } },
      { title: 'Suppressed with British help', w: (s) => 0.2 + s.v.mx_mil + 0.5 * s.v.gb_mx, text: 'Mexican troops arrive by the Panama route; HMS ships cover San Francisco Bay.', fx: (s) => { s.add('mx_mil', 0.03); } },
      { title: 'Home rule for California', w: 0.4, text: 'Mexico grants California its own legislature, English-language courts and a gold royalty kept in the state.', fx: (s) => { s.set('ca_home_rule'); s.v.ca_anglo *= 0.9; } },
    ] });

  ev({ id: 'ca_annex', win: [1851, 1875], m: 9, place: 'sanfrancisco', kind: 'politics',
    when: (s) => s.oid('US-CA') === 'CAL' && s.oid('US-VA') === 'USA' && !s.f.us_civil_war_active,
    p: 0.3,
    title: 'California joins the Union',
    text: 'The California Republic votes for annexation. It enters the United States as a free state.',
    fx: (s) => { s.own('US-CA', 'USA'); s.add('us_sect', 0.08); } });

  // US internal development
  const usOrg = (id, y, keys, title, place, extra = {}) => ev(Object.assign({ id, y, m: 5, place, kind: 'politics', bg: true, title,
    when: (s) => [].concat(keys).some((k) => s.oid(k) === 'NATIVE'),
    fx: (s) => s.take(keys, 'NATIVE', 'USA') }, extra));
  usOrg('iowa', 1838, 'US-IA', 'Iowa Territory organized', 'stlouis');
  usOrg('minnesota', 1849, 'US-MN', 'Minnesota Territory organized', 'stlouis');

  ev({ id: 'missouri', y: 1820, m: 3, place: 'washington', kind: 'politics',
    title: 'The Missouri Compromise',
    text: 'Missouri enters as a slave state, Maine as free; slavery is barred north of 36°30′ in the Louisiana Purchase.',
    fx: (s) => s.add('us_sect', 0.05) });

  ev({ id: 'removal', y: 1830, m: 5, place: 'washington', kind: 'politics',
    title: 'The Indian Removal Act',
    text: 'The Cherokee, Creek, Chickasaw, Choctaw and Seminole are forced west along the Trail of Tears to Indian Territory.',
    fx: (s) => s.own('US-OK', 'NATIVE:Indian Territory (Five Tribes)') });

  ev({ id: 'nullification', y: 1832, m: 11, place: 'charleston', kind: 'politics',
    title: 'The Nullification Crisis', text: 'South Carolina declares federal tariffs void; Jackson threatens force.', fx: (s) => s.add('us_sect', 0.03) });

  ev({ id: 'kansas_nebraska', win: [1850, 1856], m: 5, place: 'lawrence', kind: 'politics', major: true,
    when: (s) => s.oid('US-KS') === 'NATIVE',
    p: 0.35,
    title: 'Kansas–Nebraska Act',
    text: (s) => (s.f.cession ? 'Popular sovereignty in Kansas and Nebraska reopens the question the Missouri Compromise closed.' : 'With no Mexican Cession to fight over, the whole struggle over slavery\'s expansion concentrates on Kansas. "Bleeding Kansas" bleeds more.'),
    fx: (s) => { s.take(['US-KS', 'US-NE'], 'NATIVE', 'USA'); s.add('us_sect', s.f.cession ? 0.12 : 0.16); } });

  ev({ id: 'ostend', win: [1851, 1858], m: 10, place: 'havana', kind: 'diplomacy',
    when: (s) => s.oid('CUB') === 'ESP' && s.oid('US-VA') === 'USA',
    p: (s) => 0.12 + (s.f.cession ? 0 : 0.2),
    title: 'The Ostend Manifesto',
    text: (s) => 'American ministers urge buying Cuba from Spain, or seizing it.' + (s.f.cession ? '' : ' Blocked in the west by Mexico, the South looks to the Caribbean.'),
    fx: (s) => { s.add('us_sect', 0.05); s.add('cu_unrest', 0.05); } });

  ev({ id: 'dred_scott', y: 1857, m: 3, place: 'washington', kind: 'politics', p: 0.9,
    when: (s) => !s.f.sect_resolved,
    title: 'Dred Scott v. Sandford', text: 'The Supreme Court rules that Congress cannot bar slavery from the territories.', fx: (s) => s.add('us_sect', 0.05) });

  ev({ id: 'walker', win: [1855, 1857], m: 6, place: 'granada', kind: 'war',
    p: (s) => (s.oid('NIC') === 'CAF' ? 0.7 : 0.15),
    title: 'William Walker in Nicaragua',
    text: 'The Tennessee filibuster lands with his "Immortals" and makes himself president of Nicaragua, reintroducing slavery.',
    otl: 'In our timeline Walker ruled Nicaragua in 1856–57 before a Central American coalition expelled him.',
    outcomes: [
      { title: 'Walker rules Granada for a year', w: (s) => (s.oid('NIC') === 'CAF' ? 0.7 : 0.1), fx: (s) => { s.own('NIC', 'LOCAL:Walker\'s filibuster regime'); s.after(1, 'walker_out'); } },
      { title: 'Intercepted at San Juan del Norte', w: (s) => (mex(s, 'NIC') ? 0.9 : 0.3), place: 'sanjuannorte', text: 'Walker\'s ships are taken at sea and his men interned.' },
    ] });
  ev({ id: 'walker_out', sched: true, m: 5, place: 'granada', kind: 'war', title: 'Walker driven out of Nicaragua',
    fx: (s) => s.own('NIC', AH.CENTAM.some((k) => mex(s, k)) ? 'MEX' : 'CAF:Nicaragua') });

  // ------------------------------------------------------------------ The US sectional crisis
  ev({ id: 'civil_war', win: [1856, 1872], m: 4, place: 'charleston', kind: 'war', major: true,
    when: (s) => !s.f.sect_resolved && s.oid('US-VA') === 'USA',
    p: (s) => 0.55 * S(14 * (s.v.us_sect - 0.8)) * (s.f.cession || s.oid('US-TX') === 'USA' ? 1 : 0.7),
    title: 'Fort Sumter: the Southern states secede',
    text: (s) => `Eleven slave states form the Confederate States of America. Sectional tension index at secession: ${s.v.us_sect.toFixed(2)}.`,
    otl: 'In our timeline the Civil War broke out in 1861 over the expansion of slavery into the territories taken from Mexico and beyond.',
    averted: 'No American Civil War: slavery ends by compromise',
    fx: (s) => { s.take(AH.CSA_STATES.concat(['US-TX']), 'USA', 'CSA'); s.set('us_civil_war_active'); s.after(4, 'civil_war_end'); } });

  ev({ id: 'mx_stance', win: [1856, 1872], m: 9, place: 'mexico', kind: 'diplomacy',
    when: (s) => s.f.us_civil_war_active && mex(s, 'MEX'),
    title: 'Mexico and the American war',
    text: 'Confederate envoys in Mexico City offer cotton, and a free hand in the Caribbean, for recognition.',
    outcomes: [
      { title: 'Strict neutrality', w: 0.55, text: 'Mexico sells mules and lead to both sides through Matamoros.', fx: (s) => s.add('mx_fisc', 0.05) },
      { title: 'Quiet support for the Union', w: (s) => (s.f.mx_abolition ? 0.4 : 0.1) + 0.2 * (s.f.cession ? 1 : 0), text: 'Mexico closes its ports to Confederate blockade runners.', fx: (s) => s.set('mx_union') },
      { title: 'Recognition of the Confederacy', w: (s) => (s.f.mx_abolition ? 0.05 : 0.2) + (s.f.tx_lost || s.f.cession ? 0.25 : 0), text: 'Mexico recognizes the Confederacy, hoping to recover its lost north from a weakened Union.', fx: (s) => { s.set('mx_csa'); s.add('gb_mx', -0.05); } },
    ] });

  ev({ id: 'civil_war_end', sched: true, m: 4, place: 'appomattox', kind: 'war', major: true,
    title: 'The American war ends',
    outcomes: [
      { title: 'Union victory at Appomattox', w: (s) => 0.8 + (s.f.mx_union ? 0.1 : 0) - (s.f.mx_csa ? 0.15 : 0), text: 'Lee surrenders. The Thirteenth Amendment abolishes slavery.',
        fx: (s) => { s.take(AH.CSA_STATES.concat(['US-TX']), 'CSA', 'USA'); s.set('sect_resolved'); s.mul('us_pop', 0.98); } },
      { title: 'A negotiated Confederate independence', w: (s) => 0.2 + (s.f.mx_csa ? 0.15 : 0), place: 'richmond', text: 'War-weariness brings Peace Democrats to power. An armistice leaves the Confederacy independent.',
        fx: (s) => { s.set('csa_independent'); s.set('sect_resolved'); s.mul('us_pop', 0.7); } },
    ],
    fx: (s) => { delete s.f.us_civil_war_active; } });

  ev({ id: 'compromise_end', win: [1858, 1885], m: 6, place: 'washington', kind: 'politics',
    when: (s) => !s.f.sect_resolved && !s.fired.civil_war,
    p: (s) => (s.y < 1866 ? 0.04 : 0.12),
    title: 'Compensated emancipation',
    text: 'Pushed by falling cotton prices, British and Mexican abolition, and a free-soil majority, Congress passes gradual, compensated emancipation.',
    fx: (s) => s.set('sect_resolved') });

  ev({ id: 'dakota', y: 1861, m: 3, place: 'stjoseph', kind: 'politics', bg: true,
    title: 'Dakota Territory organized', fx: (s) => s.take(['US-ND', 'US-SD'], 'NATIVE', 'USA') });
  ev({ id: 'montana', y: 1864, m: 5, place: 'stjoseph', kind: 'politics', bg: true,
    title: 'Montana Territory organized', fx: (s) => s.take('US-MT', 'NATIVE', 'USA') });
  ev({ id: 'wyoming', y: 1868, m: 7, place: 'stjoseph', kind: 'politics', bg: true,
    title: 'Wyoming Territory organized', fx: (s) => s.take('US-WY', 'NATIVE', 'USA') });
  ev({ id: 'transcontinental', win: [1866, 1875], m: 5, place: (s) => (s.oid('US-CA') === 'USA' ? 'promontory' : 'ftvancouver'), kind: 'econ',
    when: (s) => s.oid('OREGON') === 'USA' || s.oid('US-OR') === 'USA', p: 0.4,
    title: (s) => (s.oid('US-CA') === 'USA' ? 'Golden spike at Promontory Summit' : 'The Northern Pacific reaches Portland'),
    text: (s) => (s.oid('US-CA') === 'USA' ? 'The first transcontinental railroad joins at Promontory Summit, Utah.' : 'With California Mexican, America\'s first transcontinental line runs to the Columbia River instead.'),
    fx: (s) => s.set('west_settled') });
  ev({ id: 'bighorn', y: 1876, m: 6, place: 'bighorn', kind: 'war', p: 0.8,
    when: (s) => s.oid('US-MT') === 'USA',
    title: 'Little Bighorn', text: 'Lakota and Cheyenne warriors wipe out Custer\'s command. The Black Hills are seized anyway the next year.' });
  ev({ id: 'oklahoma', y: 1889, m: 4, place: 'guthrie', kind: 'politics', bg: true,
    when: (s) => s.oid('US-OK') === 'NATIVE',
    title: 'The Oklahoma land run', fx: (s) => s.own('US-OK', 'USA') });

  // Utah & Nevada: the Mormon exodus goes to Mexican soil
  ev({ id: 'deseret', win: [1846, 1848], m: 7, place: 'promontory', kind: 'colonial',
    when: (s) => s.oid('GBASIN') === 'NATIVE' || mex(s, 'GBASIN'),
    p: 0.6,
    title: 'Brigham Young reaches the Great Salt Lake',
    text: (s) => 'The Latter-day Saints leave the United States for the Great Basin' + (s.oid('GBASIN') === 'USA' ? '.' : ', on Mexican-claimed soil, and bargain with Mexico City for self-rule.'),
    outcomes: [
      { title: 'Deseret under the Mexican crown', w: (s) => (s.oid('GBASIN') === 'USA' ? 0 : 0.6), fx: (s) => s.own('GBASIN', 'MEX') },
      { title: 'State of Deseret declares itself independent', w: 0.25, fx: (s) => s.own('GBASIN', 'LOCAL:State of Deseret') },
      { title: 'Settlement under U.S. rule', w: (s) => (s.oid('GBASIN') === 'USA' ? 1 : 0) },
    ] });
  ev({ id: 'deseret_end', win: [1858, 1890], m: 6, place: 'promontory', kind: 'war',
    when: (s) => s.owner('GBASIN') === 'LOCAL:State of Deseret',
    p: 0.08,
    title: 'Deseret loses its independence',
    outcomes: [
      { title: 'Annexed by the United States', w: (s) => s.v.us_expan, fx: (s) => s.own('GBASIN', 'USA') },
      { title: 'Rejoins Mexico as an autonomous territory', w: (s) => s.v.mx_mil, fx: (s) => s.own('GBASIN', 'MEX') },
    ] });

  // ------------------------------------------------------------------ Mexico's own century
  ev({ id: 'railway', win: [1837, 1865], m: 7, place: 'veracruz', kind: 'econ',
    when: (s) => mex(s, 'MEX'),
    p: (s) => 0.02 + 0.12 * s.v.mx_fisc * s.v.mx_stab,
    title: 'The Veracruz–Mexico City railway opens',
    text: 'British engineers and Mexican silver finish the line up the escarpment to the plateau.',
    otl: 'In our timeline, civil wars delayed the Veracruz line until 1873.',
    averted: 'Mexico\'s first railway is delayed',
    fx: (s) => { s.set('railways'); s.add('mx_stab', 0.03); } });

  ev({ id: 'pastry_war', y: 1838, m: 4, place: 'veracruz', kind: 'war',
    when: (s) => mex(s, 'MEX'),
    p: (s) => 0.5 * (1 - s.v.mx_fisc) * (1 - s.v.gb_mx),
    title: 'The Pastry War',
    text: 'A French squadron bombards San Juan de Ulúa to collect damages claimed by a French pastry cook and other creditors.',
    fx: (s) => { s.add('mx_fisc', -0.04); s.add('mx_stab', -0.03); } });

  ev({ id: 'reforma', win: [1845, 1880], m: 1, place: 'mexico', kind: 'politics', major: true,
    when: (s) => mex(s, 'MEX') && !s.f.reform_done,
    p: (s) => 0.02 + 0.35 * Math.max(0, s.v.mx_church - 0.45),
    title: 'The Reform: church lands and the fueros',
    text: 'A liberal Congress moves to sell the Church\'s estates and end the clergy\'s and army\'s special courts.',
    otl: 'In our timeline the Reform provoked the War of the Reform (1857–61), which opened the door to the French intervention.',
    outcomes: [
      { title: 'Reform laws pass peacefully', w: (s) => 0.2 + s.v.mx_stab, text: 'Crown and Congress strike a concordat: church lands are sold with compensation, and clergy are paid a state salary.', fx: (s) => { s.set('reform_done'); s.add('mx_fisc', 0.08); } },
      { title: 'War of the Reform', w: (s) => 1.1 - s.v.mx_stab, kind: 'war', text: 'Conservative generals and bishops rise under the banner "Religión y Fueros."', fx: (s) => { s.set('reform_war'); s.set('at_war'); s.add('mx_stab', -0.2); s.add('mx_fisc', -0.2); s.after(3, 'reform_end'); } },
    ] });
  ev({ id: 'reform_end', sched: true, m: 1, place: 'mexico', kind: 'war', title: 'Liberals win the War of the Reform',
    text: 'The liberal army enters Mexico City. The Church\'s properties are nationalized; the treasury is empty.',
    fx: (s) => { s.set('reform_done'); delete s.f.at_war; s.set('default'); } });

  ev({ id: 'intervention', win: [1859, 1867], m: 12, place: 'veracruz', kind: 'war', major: true,
    when: (s) => mex(s, 'MEX') && s.f.default && !s.f.intervened,
    p: (s) => (s.f.us_civil_war_active ? 0.6 : 0.1),
    title: 'European intervention',
    text: 'Mexico suspends payments on its foreign debt. Napoleon III, seeing the United States at war with itself, sends an army.',
    otl: 'In our timeline France occupied Mexico from 1862 and installed Maximilian of Habsburg as emperor (1864–67).',
    averted: 'No French intervention, and no Maximilian',
    outcomes: [
      { title: 'Maximilian installed', w: (s) => 0.9 - s.v.mx_mil, text: 'French troops take Puebla on the second try. Maximilian of Habsburg is crowned in Mexico City.', fx: (s) => { s.set('intervened'); s.name('MEX', 'Second Mexican Empire (Maximilian)'); s.after(5, 'intervention_end'); s.add('mx_stab', -0.15); } },
      { title: 'Cinco de Mayo: the French are beaten', w: (s) => 0.3 + s.v.mx_mil, place: 'puebla', text: 'The French are defeated at Puebla and go home.', fx: (s) => { s.set('intervened'); s.add('mx_stab', 0.05); } },
    ] });
  ev({ id: 'intervention_end', sched: true, m: 6, place: 'queretaro', kind: 'war', title: 'Maximilian shot at Querétaro',
    text: 'With the French gone and U.S. arms flowing south, the empire collapses. A republic is restored.',
    fx: (s) => { s.set('republic'); s.name('MEX', 'Mexican Republic'); } });

  ev({ id: 'mx_republic', win: [1830, 1900], m: 9, place: 'mexico', kind: 'revolt',
    when: (s) => mex(s, 'MEX') && isMonarchy(s) && s.f.independent,
    p: (s) => 0.004 + 0.15 * Math.max(0, 0.42 - s.v.mx_stab) + (s.f.creole_emperor ? 0.03 : 0),
    title: 'The monarchy falls',
    text: 'After a pronunciamiento in the capital\'s garrison, the king sails into exile on a British packet boat. Congress proclaims the Mexican Republic.',
    fx: (s) => { s.set('republic'); s.name('MEX', 'Mexican Republic'); s.add('mx_stab', -0.05); } });

  ev({ id: 'empire_title', win: [1860, 1890], m: 1, place: 'mexico', kind: 'politics',
    when: (s) => mex(s, 'MEX') && isMonarchy(s) && s.f.independent && s.v.mx_stab > 0.62 && s.oid('GTM') === 'MEX',
    p: 0.1,
    title: 'The kingdom becomes an empire',
    text: 'On the fiftieth anniversary of the junta, the crown adopts the style "Emperor of Mexico and Guatemala".',
    fx: (s) => s.name('MEX', 'Empire of Mexico') });

  ev({ id: 'canal', win: [1868, 1898], m: 8, place: (s) => (mex(s, 'NIC') ? 'sanjuannorte' : 'tehuantepec'), kind: 'econ', major: true,
    when: (s) => mex(s, 'MEX'),
    p: (s) => 0.005 + 0.15 * s.v.mx_fisc * s.v.gb_mx * s.v.mx_stab,
    title: 'An interoceanic route under the Mexican flag',
    otl: 'In our timeline the French Panama Canal company failed in 1889; the United States finished the canal in 1914.',
    outcomes: [
      { title: 'The Nicaragua Canal', w: (s) => (mex(s, 'NIC') ? 0.6 : 0), text: 'An Anglo-Mexican company begins a lock canal from San Juan del Norte through Lake Nicaragua.', fx: (s) => { s.set('canal'); s.set('nic_canal'); } },
      { title: 'The Tehuantepec railway', w: 0.5, place: 'tehuantepec', text: 'A double-track railway across the Isthmus of Tehuantepec carries freight between Coatzacoalcos and Salina Cruz.', fx: (s) => s.set('canal') },
    ] });

  ev({ id: 'panama_french', y: 1881, m: 1, place: 'panama', kind: 'econ',
    p: (s) => (s.f.nic_canal ? 0.3 : 0.85),
    title: 'De Lesseps begins at Panama',
    text: 'The builder of Suez starts a sea-level canal through Panama. Malaria and yellow fever will kill some 22,000 workers.',
    fx: (s) => s.after(8, 'panama_crash') });
  ev({ id: 'panama_crash', sched: true, m: 2, place: 'panama', kind: 'econ', title: 'The Panama Canal Company collapses',
    text: 'Bankruptcy and scandal in Paris. The half-dug ditch is abandoned.' });

  // Russian America
  ev({ id: 'alaska', win: [1859, 1872], m: 3, place: 'sitka', kind: 'treaty',
    when: (s) => s.oid('US-AK') === 'RUS' && !s.f.us_civil_war_active,
    p: 0.25,
    title: 'Russia sells Alaska',
    text: 'After the Crimean War, St Petersburg would rather sell Russian America than lose it to the Royal Navy.',
    outcomes: [
      { title: 'Seward\'s purchase: to the United States', w: (s) => (s.f.csa_independent ? 0.5 : 0.85), fx: (s) => s.own('US-AK', 'USA') },
      { title: 'Sold to Britain', w: (s) => 0.1 + (s.f.csa_independent ? 0.3 : 0), fx: (s) => s.own('US-AK', 'GBR:Alaska (British)') },
    ] });

  // Canada
  ev({ id: 'bc_colony', y: 1858, m: 8, place: 'victoria', kind: 'colonial', bg: true,
    when: (s) => s.oid('CA-BC') !== 'GBR',
    title: 'Colony of British Columbia', text: 'The Fraser River gold rush brings a crown colony.',
    fx: (s) => s.own('CA-BC', 'GBR:British Columbia') });
  ev({ id: 'confederation', y: 1867, m: 7, place: 'ottawa', kind: 'politics', major: true,
    p: (s) => (s.f.csa_independent ? 0.98 : 0.92),
    title: 'Canadian Confederation',
    text: 'Ontario, Quebec, New Brunswick and Nova Scotia unite as the Dominion of Canada.',
    fx: (s) => { s.own(['CA-ON', 'CA-QC', 'CA-NB', 'CA-NS'], 'CAN'); s.after(3, 'rupert'); s.after(4, 'bc_joins'); s.after(6, 'pei'); } });
  ev({ id: 'rupert', sched: true, m: 7, place: 'redriver', kind: 'politics', title: "Rupert's Land joins Canada",
    text: 'After the Red River Resistance led by Louis Riel, Manitoba becomes a province.',
    fx: (s) => s.own('RUPERT', 'CAN') });
  ev({ id: 'bc_joins', sched: true, m: 7, place: 'victoria', kind: 'politics', title: 'British Columbia joins Canada',
    fx: (s) => { s.own('CA-BC', 'CAN'); if (s.oid('US-WA') === 'GBR') s.own('US-WA', 'CAN'); if (s.oid('US-AK') === 'GBR') s.own('US-AK', 'CAN'); } });
  ev({ id: 'pei', sched: true, m: 7, place: 'quebec', kind: 'politics', title: 'Prince Edward Island joins Canada', fx: (s) => s.own('CA-PE', 'CAN') });
  ev({ id: 'klondike', y: 1896, m: 8, place: 'klondike', kind: 'econ', title: 'Klondike gold', text: 'Gold on Bonanza Creek draws 100,000 stampeders north.' });

  // ------------------------------------------------------------------ Caribbean, 1840–1900
  ev({ id: 'dominican', y: 1844, m: 2, place: 'santodomingo', kind: 'revolt',
    when: (s) => s.oid('DOM') === 'HAI',
    title: 'Dominican independence', text: 'La Trinitaria expels the Haitians.', fx: (s) => s.own('DOM', 'DOM') });
  ev({ id: 'dom_spain', y: 1861, m: 3, place: 'santodomingo', kind: 'politics',
    when: (s) => s.oid('DOM') === 'DOM',
    p: (s) => (s.oid('CUB') === 'ESP' ? 0.7 : 0.3),
    title: 'Santana returns Santo Domingo to Spain', fx: (s) => { s.own('DOM', 'ESP'); s.after(4, 'dom_restore'); } });
  ev({ id: 'dom_restore', sched: true, m: 7, place: 'santodomingo', kind: 'war', title: 'Dominican Restoration War ends', text: 'Spain withdraws after a guerrilla war.', fx: (s) => s.own('DOM', 'DOM') });

  ev({ id: 'ten_years', win: [1866, 1872], m: 10, place: 'yara', kind: 'revolt', major: true,
    when: (s) => s.oid('CUB') === 'ESP',
    p: (s) => S(8 * (s.v.cu_unrest - 0.35)),
    title: "Grito de Yara: the Ten Years' War",
    text: 'Carlos Manuel de Céspedes frees his slaves and calls Cubans to arms against Spain.',
    fx: (s) => { s.set('cuba_war_1868'); s.add('cu_unrest', 0.1); s.after(10, 'zanjon'); } });
  ev({ id: 'zanjon', sched: true, m: 2, place: 'santiagocuba', kind: 'treaty', title: 'Pact of Zanjón',
    text: 'The rebellion ends in exhaustion. Spain promises reforms; slavery is abolished in 1886.', fx: (s) => s.add('cu_unrest', -0.1) });

  ev({ id: 'cuba_mx_revolt', win: [1840, 1895], m: 5, place: 'havana', kind: 'revolt',
    when: (s) => mex(s, 'CUB') && !s.f.cuba_statute,
    p: (s) => 0.01 + 0.12 * Math.max(0, s.v.cu_unrest - 0.35) + (s.f.mx_abolition && s.f.slavery_lock ? 0.02 : 0),
    title: 'Cuban planters test the pact',
    text: 'Havana\'s sugar barons, alarmed by Mexico\'s abolitionist Congress and courted by U.S. annexationists, challenge Mexican rule.',
    outcomes: [
      { title: 'A home-rule statute for Cuba', w: (s) => 0.4 + s.v.mx_stab, fx: (s) => { s.set('cuba_statute'); s.v.cu_unrest = 0.2; } },
      { title: 'Cuba breaks away', w: (s) => s.v.cu_unrest, fx: (s) => s.own('CUB', 'CUB:Republic of Cuba') },
    ] });

  ev({ id: 'cuba_1895', win: [1894, 1897], m: 2, place: 'santiagocuba', kind: 'revolt', major: true,
    when: (s) => s.oid('CUB') === 'ESP',
    p: (s) => 0.2 + S(8 * (s.v.cu_unrest - 0.5)) * 0.6,
    title: 'Martí and the War of Independence',
    text: 'José Martí and Máximo Gómez land in Oriente. Weyler\'s reconcentration camps kill perhaps 170,000 civilians.',
    fx: (s) => s.set('cuba_war_1895') });

  ev({ id: 'war_1898', win: [1896, 1900], m: 4, place: 'havana', kind: 'war', major: true,
    when: (s) => s.f.cuba_war_1895 && s.oid('CUB') === 'ESP',
    p: 0.6,
    title: 'Who will intervene in Cuba?',
    text: 'The USS Maine is in Havana harbor; the Mexican navy is at Veracruz. Both capitals are under public pressure to act.',
    otl: 'In our timeline the United States fought Spain alone in 1898 and took Puerto Rico, Guam and the Philippines.',
    averted: 'No "splendid little war" in 1898',
    game: {
      rowPlayer: 'Washington', colPlayer: 'Mexico City', rows: ['Intervene', 'Stay out'], cols: ['Intervene', 'Stay out'],
      payoffs: (s) => {
        const us = s.v.us_expan - (s.f.csa_independent ? 0.6 : 0);
        const mx = s.v.mx_mil + s.v.mx_fisc - 0.5;
        // Both intervening risks a U.S.–Mexican clash that favors the stronger side.
        return [
          [[1 + us - mx, mx - us], [1.2 + 1.5 * us, 1]],
          [[1, 2 + mx], [1.5, 1.5]],
        ];
      },
      outcome: (i, j) => (i === 0 && j === 1 ? 0 : i === 1 && j === 0 ? 1 : i === 0 ? 2 : 3),
    },
    outcomes: [
      { title: 'The Spanish–American War', text: 'Dewey sinks the Spanish fleet at Manila; Santiago falls. Cuba becomes independent under U.S. tutelage.', fx: (s) => { s.own('CUB', 'CUB:Republic of Cuba (U.S. protectorate)'); s.own('PRI', 'USA'); s.set('us_empire'); } },
      { title: 'The Spanish–Mexican War', place: 'santiagocuba', text: 'The Mexican fleet destroys Cervera\'s squadron off Santiago. Cuba becomes independent in alliance with Mexico, and Puerto Rico joins the kingdom.', fx: (s) => { s.own('CUB', 'CUB:Republic of Cuba (Mexican alliance)'); s.own('PRI', 'MEX'); s.add('mx_stab', 0.05); } },
      { title: 'Joint intervention and a guaranteed Cuba', text: 'A tense joint intervention. Washington and Mexico City guarantee Cuban independence and split the spoils: Puerto Rico to the U.S.', fx: (s) => { s.own('CUB', 'CUB:Republic of Cuba (jointly guaranteed)'); s.own('PRI', 'USA'); } },
      { title: 'Nobody intervenes; Spain grants autonomy', text: 'Madrid concedes a Cuban autonomous government. The war grinds on in the east.', fx: (s) => s.add('cu_unrest', 0.1) },
    ] });

  ev({ id: 'philippines', win: [1898, 1899], m: 6, place: 'manila', kind: 'war',
    when: (s) => s.oid('PHL') === 'ESP',
    p: 0.7,
    title: 'The Philippine Revolution',
    outcomes: [
      { title: 'Annexed by the United States', w: (s) => (s.f.us_empire ? 1 : 0), text: 'Spain sells the islands for $20 million; Aguinaldo\'s republic fights the new colonizers.', fx: (s) => s.own('PHL', 'USA') },
      { title: 'The First Philippine Republic', w: (s) => (s.f.us_empire ? 0.1 : 0.6), text: 'Aguinaldo proclaims independence at Kawit and holds Luzon.', fx: (s) => s.own('PHL', 'LOCAL:First Philippine Republic') },
      { title: 'Spain sells the islands to Germany', w: (s) => (s.f.us_empire ? 0 : 0.3), fx: (s) => s.own('PHL', 'GER') },
    ] });

  ev({ id: 'hawaii', win: [1887, 1900], m: 8, place: 'honolulu', kind: 'colonial',
    when: (s) => s.oid('US-HI') === 'LOCAL',
    p: (s) => (s.f.us_empire ? 0.6 : s.oid('US-CA') === 'USA' ? 0.15 : 0.08),
    title: 'The end of the Hawaiian Kingdom',
    text: 'Sugar planters overthrow Queen Liliʻuokalani.',
    outcomes: [
      { title: 'Annexed by the United States', w: (s) => (s.oid('US-CA') === 'USA' ? 0.85 : 0.5), fx: (s) => s.own('US-HI', 'USA') },
      { title: 'A British protectorate', w: (s) => (s.oid('US-CA') === 'USA' ? 0.1 : 0.35), fx: (s) => s.own('US-HI', 'GBR:Hawaii (British protectorate)') },
      { title: 'Japanese protectorate', w: 0.1, fx: (s) => s.own('US-HI', 'JPN') },
    ] });

  // ------------------------------------------------------------------ South America, late century
  ev({ id: 'falklands', y: 1833, m: 1, place: 'buenosaires', kind: 'colonial', bg: true, title: 'Britain seizes the Falklands', fx: (s) => s.own('FLK', 'GBR') });
  ev({ id: 'magallanes', y: 1843, m: 9, place: 'puntaarenas', kind: 'colonial', bg: true, title: 'Chile founds Fuerte Bulnes on the Strait of Magellan', fx: (s) => s.own('MAGALLANES', 'CHL') });
  ev({ id: 'paraguayan_war', y: 1864, m: 12, place: 'humaita', kind: 'war', p: 0.85,
    title: 'The War of the Triple Alliance', text: 'Paraguay under Solano López fights Brazil, Argentina and Uruguay; it loses perhaps half its population.' });
  ev({ id: 'pacific_war', win: [1879, 1883], m: 2, place: 'antofagasta', kind: 'war', major: true, p: 0.7,
    when: (s) => s.oid('ANTOFAGASTA') === 'BOL',
    title: 'The War of the Pacific',
    text: 'Chile occupies the nitrate port of Antofagasta and defeats Bolivia and Peru.',
    outcomes: [
      { title: 'Chile takes the nitrate coast', w: 0.85, fx: (s) => s.own(['ANTOFAGASTA', 'TARAPACA'], 'CHL') },
      { title: 'A compromise peace', w: 0.15, fx: (s) => s.own('ANTOFAGASTA', 'CHL') },
    ] });
  ev({ id: 'desert', y: 1879, m: 5, place: 'patagones', kind: 'war', title: 'The Conquest of the Desert',
    text: 'Roca\'s army pushes Argentina\'s frontier to the Río Negro and beyond, killing or displacing the Mapuche and Tehuelche.', fx: (s) => s.own(['PATAGONIA', 'CHACO'], 'ARG') });
  ev({ id: 'araucania', y: 1883, m: 1, place: 'temuco', kind: 'war', title: 'Chile occupies the Araucanía', fx: (s) => s.own('ARAUCANIA', 'CHL') });
  ev({ id: 'aysen', y: 1885, m: 1, place: 'puntaarenas', kind: 'colonial', bg: true, title: 'Chile claims Aysén', fx: (s) => s.own('MAGALLANES', 'CHL') });
  ev({ id: 'brazil_abolition', y: 1888, m: 5, place: 'rio', kind: 'politics', title: 'The Golden Law: Brazil abolishes slavery', text: 'The last slave society in the Western world ends slavery.' });
  ev({ id: 'brazil_republic', y: 1889, m: 11, place: 'rio', kind: 'politics', title: 'Brazil becomes a republic',
    fx: (s) => s.own('BRA', 'BRA:United States of Brazil') });
  ev({ id: 'panama_sep', win: [1885, 1900], m: 11, place: 'panama', kind: 'revolt',
    when: (s) => s.oid('PAN') === 'COL' || s.oid('PAN') === 'GCO',
    p: (s) => (s.f.nic_canal ? 0.01 : 0.02),
    title: 'Panama secedes', fx: (s) => s.own('PAN', 'LOCAL:Republic of Panama') });
})(globalThis.AH = globalThis.AH || {});
