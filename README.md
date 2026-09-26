# Reino de México, 1808–1900

An interactive, animated map of an alternate nineteenth century. It starts from one change: in September 1808 the Mexico City junta (Iturrigaray, Primo de Verdad, Azcárate, Talamantes) survives Gabriel de Yermo's coup. It then governs New Spain as a de facto sovereign kingdom, in the name of the captive Ferdinand VII.

The map works at state and province level. Press play and watch a statistically simulated history spread outward from Mexico City. Every event is pinned to the city or province where it happens.

## Run it

```sh
python3 -m http.server 8080   # or: npm run serve
# open http://localhost:8080
```

There is no build step. D3 and topojson-client are vendored in `vendor/`, and the map data is in `data/`. The page must be served over HTTP (not opened as a `file://` URL), because it fetches its map data.

## What you can do

- **Play / scrub** from 1808 to 1900. Borders re-color province by province, and markers pulse where events happen.
- **Chronicle**: every event in this history, with its probability. Open an event to see its possible outcomes, their weights, and, for strategic decisions, the payoff matrix with its Nash equilibrium. Pick a different outcome, prevent the event, or force an "averted" one, and the rest of the century is re-simulated.
- **Odds**: 200 sampled histories run in the background with your choices. The tab shows who holds Texas, California, Cuba and other territories in any year, and how often our timeline's landmarks happen (the Texas Revolution, the Mexican–American War, Maximilian, 1898…). Switch the map to **Odds across runs** to color every province by its most likely owner.
- **Kingdom**: Mexican population and territory against our timeline's census figures, plus the state variables that drive the model.
- **Seed / New history / Most likely**: change the dice, or take the modal path.

## How the model works

`js/model.js` holds a small set of state variables: Mexican stability, treasury and army; U.S. population, expansion pressure and sectional tension; Spain's overseas capacity; Anglo-Mexican alignment; the Anglo share of Texas settlers; Cuban separatism; and others. They drift every year.

Events in `js/events-americas.js` and `js/events-world.js` have:

| field | meaning |
|---|---|
| `y` / `win` | the year, or a window of years (then `p` is a yearly hazard) |
| `when(s)` | preconditions on the state |
| `p(s)` | probability, usually a logistic function of the state variables |
| `outcomes` | weighted outcomes that transfer territory and change the state |
| `game` | an optional 2×2 game. Outcome weights come from its logit quantal-response equilibrium |
| `otl` | what happened in our timeline. If the window closes without the event, the chronicle logs it as averted |

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
js/events-*.js                 the event scripts
js/map.js, js/app.js           D3 renderer and UI
data/world.topo.json           Natural Earth admin-1 (+ rivers, lakes), simplified
tools/build-map.mjs            rebuilds the map data (npm run build:map)
tools/test-engine.mjs          headless checks and Monte Carlo summary (npm test)
```

## Data and credits

Boundaries, rivers and lakes are from [Natural Earth](https://www.naturalearthdata.com/) (public domain). Rendering uses [D3](https://d3js.org/) and [topojson-client](https://github.com/topojson/topojson-client) (ISC). Population reference series come from the U.S. censuses of 1810–1900, and for Mexico from Humboldt's 1810 estimate and the censuses of 1895 and 1900.
