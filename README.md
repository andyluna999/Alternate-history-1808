# Reino de México, 1808–2000

An interactive, animated map of an alternate nineteenth century. It starts from one change: in September 1808 the Mexico City junta (Iturrigaray, Primo de Verdad, Azcárate, Talamantes) survives Gabriel de Yermo's coup. It then governs New Spain as a de facto sovereign kingdom, in the name of the captive Ferdinand VII. The simulation runs from there to the year 2000.

The map works at state and province level. Press play and watch a statistically simulated history spread outward from Mexico City. Every event is pinned to the city or province where it happens.

## Run it

```sh
python3 -m http.server 8080   # or: npm run serve
# open http://localhost:8080
```

There is no build step. D3 and topojson-client are vendored in `vendor/`, and the map data is in `data/`. The page must be served over HTTP (not opened as a `file://` URL), because it fetches its map data.

## What you can do

- **Play / scrub** from 1808 to 2000. Borders re-color province by province, and markers pulse where events happen.
- **Chronicle**: every event in this history, with its probability. Open an event to see its possible outcomes, their weights, and, for strategic decisions, the payoff matrix with its Nash equilibrium. Pick a different outcome, prevent the event, or force an "averted" one, and the rest of the century is re-simulated.
- **Odds**: 80 sampled histories run in the background with your choices. The tab shows who holds Texas, California, Cuba and other territories in any year, and how often our timeline's landmarks happen (the Texas Revolution, the Mexican–American War, Maximilian, 1898…). Switch the map to **Odds across runs** to color every province by its most likely owner, or to **Tensions** to color it by the grievance of the people living there.
- **Kingdom**: Mexican population and territory against our timeline's census figures, plus the state variables that drive the model.
- **Seed / New history / Most likely**: change the dice, or take the modal path.

## How the model works

`js/model.js` holds a small set of state variables: Mexican stability, treasury and army; U.S. population, expansion pressure and sectional tension; Spain's overseas capacity; Anglo-Mexican alignment; the Anglo share of Texas settlers; Cuban separatism; and others. They drift every year.

Events in `js/events-americas.js`, `js/events-world.js` and `js/events-modern.js` (1900–2000) have:

| field | meaning |
|---|---|
| `y` / `win` | the year, or a window of years (then `p` is a yearly hazard) |
| `when(s)` | preconditions on the state |
| `p(s)` | probability, usually a logistic function of the state variables |
| `outcomes` | weighted outcomes that transfer territory and change the state |
| `game` | an optional 2×2 game. Outcome weights come from its logit quantal-response equilibrium |
| `otl` | what happened in our timeline. If the window closes without the event, the chronicle logs it as averted |

### How the divergence spreads

Nothing after September 1808 is scripted. The early European events (`js/events-world.js`) read four variables the junta moves: Britain's war chest, fed by Mexican silver; Spanish resistance; French power; and coalition cohesion. So Wagram, the Russian campaign, Leipzig and the fate of Napoleon's throne are rolled, not replayed. In about 1 run in 5, Napoleon keeps his empire past 1815. The wider world is **simulated** (`js/world.js`, `js/events-process.js`, `js/actors.js`, `js/communities.js`):

- **Twelve great powers** (Britain, France, Prussia/Germany, Austria, Russia, the Ottoman Empire, Spain, Sardinia/Italy, the U.S., Mexico, Japan, China). Each has population, output per head, stability, militarization, government and a ruler. Military strength ≈ population^0.6 × output per head^2.5.
- **Every state is an actor** (`js/actors.js`):
  - Each year each power picks a policy (reform, repression, rearmament, expansion, development, détente) by logit choice over utilities computed from its situation.
  - Crises between two powers are 2×2 bargaining games.
  - In a general war, each power weighs joining either bloc or staying neutral.
  - Minor states face coups, played as a game between the ruler and the army.
- **Peoples** (`js/communities.js`): about 90 peoples ruled by others carry three numbers.
  - *Economic hardship*: the ruler's relative poverty, war, crashes and colonial extraction.
  - *Segregation*: the regime type (colonial, imperial, democratic).
  - *Mobilization*: national awakening, which spreads with industry and waves of revolt.
  - Grievance ≈ mobilization × (hardship + segregation) / 2, damped by autonomy.
  - Feedback: unrest brings crackdowns (more segregation) and economic damage (more hardship).
  - Grievance sets the hazard of a separatist crisis, played between the movement (revolt / negotiate) and the state (repress / concede), with foreign backers. The outcome can be independence, autonomy, rights, a crushed revolt or a crackdown.
- **Recurring processes**:
  - industrial take-off
  - Italian and German unification
  - general wars
  - revolutions, which are contagious
  - colonial expansion by regional affinity
  - the fall of the Chinese empire, the opening of Japan
  - inventions and nuclear weapons
- **New people** (`js/names.js`): rulers, rebels, generals and inventors conceived after the divergence are generated from each culture's naming traditions.

The Americas events keep their state-driven odds and games. They read the world model too, for example whether a general war is on or which powers have gone socialist.

Randomness is hashed from `(seed, event, year)`. Changing one outcome alters later history only through the state it leaves behind, the "butterfly" path. Far from Mexico, events mostly follow our timeline as background.

Territories are groups of Natural Earth admin-1 units, defined in `js/regions.js`. For example, Alta California is `US-CA`, and the Confederation of the Rhine is made of German Länder.

## Files

```
index.html, css/style.css      page and styles
js/powers.js                   owners and atlas colors
js/regions.js                  historical territories and the 1808 world
js/places.js                   cities and provinces events point to
js/model.js                    state variables and yearly drift
js/engine.js                   simulation, game solver, Monte Carlo
js/names.js                    generated people
js/world.js, world-tables.js   great-power model, wars, peace terms, successor states
js/communities.js              peoples: hardship, segregation, mobilization, grievance
js/actors.js                   policy choices, separatist and coup games, war alignments
js/events-*.js                 event scripts: Americas, pre-1850 world, world processes, 1900–2000 Americas
js/map.js, js/app.js           D3 renderer and UI
data/world.topo.json           Natural Earth admin-1 (+ rivers, lakes), simplified
tools/build-map.mjs            rebuilds the map data (npm run build:map)
tools/test-engine.mjs          headless checks and Monte Carlo summary (npm test)
```

## Data and credits

Boundaries, rivers and lakes are from [Natural Earth](https://www.naturalearthdata.com/) (public domain). Rendering uses [D3](https://d3js.org/) and [topojson-client](https://github.com/topojson/topojson-client) (ISC). Population reference series come from the U.S. censuses of 1810–1900, and for Mexico from Humboldt's 1810 estimate and the censuses of 1895 and 1900.
