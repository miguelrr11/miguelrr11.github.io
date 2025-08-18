const DEFAULT_WEIGHTS = [1.5, 0.6, 1.2, 1.2, 0.7, 1.2];

// -------------------------------------------------------------
// Species & Speciator (members are PLANTS, centroid is a VECTOR)
// -------------------------------------------------------------
class Species {
  constructor(id, centroidVec, plant) {
    this.id = id;
    this.centroid = centroidVec?.slice?.() ?? null; // [6]
    this.members = [];                 // Plant[]
    this.bestFitness = -Infinity;
    this.prevBestFitness = -Infinity;
    this.staleness = 0;                // gens since last improvement
    this.lowShareStrike = 0;           // consecutive gens with tiny share
    this.sizeHistory = [];             // optional for plots
    plotSp.addSeries([plant.ranges[0], plant.ranges[2], plant.ranges[4]])
    this.addMember(plant);
  }

  clearMembers() {
    this.members.length = 0;
    this.bestFitness = -Infinity;
  }

  addMember(plant) {
    this.members.push(plant);
    if ((plant.fitness ?? -Infinity) > this.bestFitness) {
      this.bestFitness = plant.fitness ?? -Infinity;
    }
  }
}

class Speciator {
  constructor({
    deltaThreshold = 0.6,
    weights = DEFAULT_WEIGHTS,
    metric = "euclidean",
    stalenessCap = 15,
    minChildrenFloor = 2,        // floor for decent-sized species
    floorMinSize = 5,            // species needs at least this many members to qualify for the floor
    tinyShareCutoff = 0.02,      // <2% adjusted share -> a strike
    tinyShareStrikesToCull = 10,  // cull after 5 consecutive tiny shares
    crossSpeciesProb = 0.05,     // optional diversity
    tournamentK = 3,
  } = {}) {
    this.deltaThreshold = deltaThreshold;
    this.weights = weights;
    this.metric = metric;
    this.stalenessCap = stalenessCap;
    this.minChildrenFloor = minChildrenFloor;
    this.floorMinSize = floorMinSize;
    this.tinyShareCutoff = tinyShareCutoff;
    this.tinyShareStrikesToCull = tinyShareStrikesToCull;
    this.crossSpeciesProb = crossSpeciesProb;
    this.tournamentK = tournamentK;

    this.species = []; // Species[]
    this.nextId = 1;
  }

  // Assign plant to nearest centroid or create a new species
  classifyPlant(plant, genRanges) {
    const v = plant.vec ?? toVector(plant.gen, genRanges);
    plant.vec = v;

    let bestIdx = -1, bestD = Infinity;
    for (let i = 0; i < this.species.length; i++) {
      const sp = this.species[i];
      const d = dstnce(v, sp.centroid, this.weights, this.metric);
    //   console.log('-----')
    //   console.log(v, sp.centroid, this.weights, this.metric)
    //   console.log(d)
      if (d < bestD) { bestD = d; bestIdx = i; }
    }


    if (bestD <= this.deltaThreshold && bestIdx >= 0) {
      const sp = this.species[bestIdx];
      sp.addMember(plant);
      plant.speciesId = sp.id;
      return sp.id;
    }
    

    // new species
    const sp = new Species(this.nextId++, v, plant);
    plant.speciesId = sp.id;
    this.species.push(sp);
    return sp.id;
  }

  // Update representatives (centroids) from current members
  updateRepresentatives({ useChampion = true } = {}) {
    for (const sp of this.species) {
      if (sp.members.length === 0) continue;
      if (useChampion) {
        const champ = chooseChampion(sp.members);
        if (champ?.vec) sp.centroid = champ.vec.slice();
      } else {
        const m = meanVector(sp.members.map(p => p.vec));
        if (m) sp.centroid = m;
      }
    }
  }

  // Update staleness; returns {totalAdj, perSpeciesAdj: Map}
  updateStalenessAndShares() {
    // prevBestFitness vs bestFitness
    for (const sp of this.species) {
      if (sp.bestFitness > sp.prevBestFitness) {
        sp.staleness = 0;
        sp.prevBestFitness = sp.bestFitness;
      } 
      else {
        sp.staleness += 1;
      }
    }

    // adjusted fitness sharing (simple: divide each member by species size)
    const perSpeciesAdj = new Map();
    let totalAdj = 0;
    for (const sp of this.species) {
      const sz = Math.max(1, sp.members.length);
      let adj = 0;
      for (const p of sp.members) {
        const f = p.fitness ?? 0;
        adj += f / sz;
      }
      perSpeciesAdj.set(sp.id, adj);
      totalAdj += adj;
    }

    // low-share strike accounting
    for (const sp of this.species) {
      const share = (perSpeciesAdj.get(sp.id) || 0) / Math.max(1e-12, totalAdj);
      if (share < this.tinyShareCutoff) sp.lowShareStrike += 1;
      else sp.lowShareStrike = 0;
      sp.sizeHistory.push(sp.members.length);
    }

    return { totalAdj, perSpeciesAdj };
  }

  // Cull extinct / stale species
  cullExtinct() {
    for(let i = this.species.length - 1; i >= 0; i--){
        const species = this.species[i];
        // if(species.members.length === 0 || species.staleness > this.stalenessCap || species.lowShareStrike >= this.tinyShareStrikesToCull){
        if(species.members.length === 0){
            this.species.splice(i, 1);
            //plotSp.removeSeries(species.id);
            console.log('extinct')
        }
    }
//     this.species = this.species.filter(sp => {
//       if (sp.members.length === 0) return false; // extinct by emptiness
//       if (sp.staleness > this.stalenessCap) return false;
//       if (sp.lowShareStrike >= this.tinyShareStrikesToCull) return false;
//       return true;
//     });
  }

  // Allocate children per species with floors and rounding
  allocateChildren(popSize, elitesCount, perSpeciesAdj, totalAdj) {
    const remaining = Math.max(0, popSize - elitesCount);
    const raw = [];
    let sumRaw = 0;

    // initial proportional shares
    for (const sp of this.species) {
      const adj = perSpeciesAdj.get(sp.id) || 0;
      const share = (totalAdj <= 0) ? (1 / Math.max(1, this.species.length)) : (adj / totalAdj);
      const alloc = share * remaining;
      raw.push({ sp, alloc });
      sumRaw += alloc;
    }

    // floors for decent-sized species
    let budgets = new Map();
    let used = 0;
    for (const { sp, alloc } of raw) {
      let base = Math.floor(alloc);
      if (sp.members.length >= this.floorMinSize) {
        base = Math.max(base, this.minChildrenFloor);
      }
      budgets.set(sp.id, base);
      used += base;
    }

    // distribute leftovers to species with largest fractional part of alloc
    let leftover = Math.max(0, remaining - used);
    raw.sort((a, b) => (b.alloc - Math.floor(b.alloc)) - (a.alloc - Math.floor(a.alloc)));
    let i = 0;
    while (leftover > 0 && raw.length > 0) {
      const sid = raw[i % raw.length].sp.id;
      budgets.set(sid, (budgets.get(sid) || 0) + 1);
      leftover--;
      i++;
    }

    return budgets; // Map(speciesId -> num children)
  }
}

// -------------------------------------------
// Global-ish handles (use your own structure)
// -------------------------------------------
let speciator;       // instance of Speciator
let POP_SIZE = 100;  // set your desired pop size

// -------------------------------------------
// Public API you asked for
// -------------------------------------------

function initSimSp(initialPlants, speciatorCfg = {}) {
  plants = initialPlants;
  // compute vec for all
  for (const p of plants) p.vec = toVector(p.gen, genRanges);

  speciator = new Speciator(speciatorCfg);

// seed first species with the first plant
  const first = plants[0];
  const sp = new Species(speciator.nextId++, first.vec, first);
  speciator.species.push(sp);

// OR

// start with one species per plant
//   for(let plant of plants){
//     let sp = new Species(speciator.nextId++, plant.vec, plant)
//     sp.addMember(plant)
//     speciator.species.push(sp)
//   }
}

// Call this at the **start** of each generation
function startGen() {
  // (re)clear members; recompute vecs (genes may have mutated last gen)
  for (const sp of speciator.species) sp.clearMembers();
  for (const p of plants) {
    p.vec = toVector(p.gen, genRanges);
  }

  // assign all plants
  for (const p of plants) {
    speciator.classifyPlant(p, genRanges);
  }

  for(let species of speciator.species){
    let speciesId = species.id;
    //if its id is not in plot, add it
    if(!plotSp.hasSeries(speciesId)){
        plotSp.addSeries(species.members[0].ranges);
    }
  }
  //remove series that are no longer needed
  for(let species of speciator.species){
    let speciesId = species.id;
    if(!species.members.length){
      //plotSp.removeSeries(speciesId);
    }
  }

  updateSpeciesPlot()
}

// Your sim runs, fills p.fitness for each plant …

// Call this at the **end** of the generation
function endGen() {
    // 1) Update representatives (champion-as-centroid is most stable)
    speciator.updateRepresentatives({ useChampion: true });

    // 2) Update staleness + compute adjusted shares
    const { totalAdj, perSpeciesAdj } = speciator.updateStalenessAndShares();

    // 3) Extinction pass
    speciator.cullExtinct({ totalAdj, perSpeciesAdj });

    // 4) Build next generation via species-aware reproduction
    plants = reproduce(POP_SIZE, perSpeciesAdj, totalAdj);

    for(let i = 0; i < nPlantsPerGen; i++){
        let pos = getCircularPos(i, RAD_PLANT_TO_SUN);
        plants[i].restartPos(pos)
    }

    
  
}

function updateSpeciesPlot(){
    let sum = 0
    for(let species of speciator.species){
        plotSp.feed(species.members.length, species.id)
        sum += species.members.length
    }
    console.log('Total species members:', sum);
}

// -------------------------------------------
// Reproduction (species-aware)
// -------------------------------------------
function reproduce(popSize, perSpeciesAdj, totalAdj) {
  // 0) Elites: keep 1 champion per species
  const elites = [];
  for (const sp of speciator.species) {
    const champ = chooseChampion(sp.members);
    if (champ) {
      elites.push(clonePlant(champ)); // deep-ish copy (defined below)
    }
  }

  // 1) Allocate offspring per species
  const budgets = speciator.allocateChildren(popSize, elites.length, perSpeciesAdj, totalAdj);

    // --- Cull species that received zero children this generation ---
    (function cullZeroBudget() {
        let filteredSpecies = [];
        for (let sp of speciator.species) {
            if ((budgets.get(sp.id) || 0) > 0) {
                filteredSpecies.push(sp);
            }
            //else plotSp.removeSeries(sp.id);
        }
        speciator.species = filteredSpecies;
    })();


  // 2) Create intra-species offspring
  const kids = [];
  for (const sp of speciator.species) {
    const need = budgets.get(sp.id) || 0;
    if (need <= 0) continue;

    for (let k = 0; k < need; k++) {
      let parentA = selectParent(sp.members, speciator.tournamentK);
      let parentB = parentA;

      // Either pick another same-species parent, or (rarely) cross-species
      const doCross = Math.random() < (speciator.crossSpeciesProb ?? 0);
      if (doCross && speciator.species.length > 1) {
        const mateSp = nearestOtherSpecies(sp);
        parentB = selectParent(mateSp.members, speciator.tournamentK);
      } else {
        // same species partner
        let tries = 0;
        while (parentB === parentA && tries++ < 5) {
          parentB = selectParent(sp.members, speciator.tournamentK);
        }
      }

      const child = makeChildFromParents(parentA, parentB);
      kids.push(child);
    }
  }

  // 3) Assemble next population, trim or pad
  let nextPop = elites.concat(kids);

  // pad with immigrants if short (random mutants of global best)
  while (nextPop.length < popSize) {
    const donor = globalBestPlant() || nextPop[Math.floor(Math.random() * nextPop.length)];
    nextPop.push(mutantFrom(donor));
  }
  if (nextPop.length > popSize) nextPop.length = popSize;

  // ensure vec is ready for next gen’s start
  for (const p of nextPop) p.vec = toVector(p.gen, genRanges);

  console.log('Next population:', nextPop.length);

  return nextPop;
}

// -------------------------------------------
// Helpers for reproduction / selection
// -------------------------------------------
function selectParent(members, k = 3) {
  // tournament selection
  const n = members.length;
  if (n === 0) return null;
  if (n === 1) return members[0];

  let best = null;
  for (let i = 0; i < k; i++) {
    const cand = members[Math.floor(Math.random() * n)];
    if (!best || (cand.fitness ?? -Infinity) > (best.fitness ?? -Infinity)) {
      best = cand;
    }
  }
  return best;
}

function nearestOtherSpecies(sp) {
  let best = null, bestD = Infinity;
  for (const other of speciator.species) {
    if (other === sp) continue;
    const d = dstnce(sp.centroid, other.centroid, speciator.weights, speciator.metric);
    if (d < bestD) { bestD = d; best = other; }
  }
  return best || sp;
}

function clonePlant(p) {
    // Make a fresh individual carrying the same genome (no mutation for elites)
    const baby = new Plant(createVector(0, 0), p.ranges); // adapt to your constructor args
    baby.gen = clampGen(structuredClone ? structuredClone(p.gen) : JSON.parse(JSON.stringify(p.gen)));
    baby.ranges = Array.isArray(p.ranges) ? p.ranges.slice() : p.ranges;
    baby.energy = 1000;
    baby.dead = false;
    baby.offsprings = [];
    baby.primordial = true;
    baby.vec = toVector(baby.gen, genRanges);
    return baby;
}

function mutantFrom(p, mutScale = 1.0) {
    const baby = clonePlant(p);
    // small Gaussian-ish tweaks in your units (reuse your clampGen afterward)
    const g = baby.gen;
    g.long_sec        += random(-0.5, 0.5) * mutScale;
    g.prob_repro      += random(-0.00005, 0.00005) * mutScale;
    g.precision_light += random(-0.05, 0.05) * mutScale;
    g.angle_mult      += random(-0.05, 0.05) * mutScale;
    g.growth_rate     += random(-0.001, 0.001) * mutScale;
    g.max_turn_angle  += random(-10, 10) * mutScale;
    baby.gen = clampGen(g);
    baby.vec = toVector(baby.gen, genRanges);
    return baby;
}

function makeChildFromParents(parentA, parentB) {
    // Use your own crossover functions:
    const childGen = crossGen(parentA.gen, parentB.gen);        // you provided this
    const childRanges = crossRanges(parentA.ranges, parentB.ranges);

    const pos = parentA.stem?.[0]?.pos ?? createVector(0, 0);            // spawn near A (adapt as needed)
    const child = new Plant(pos, childRanges);                   // uses your constructor
    child.gen = childGen;                                        // override any constructor gen
    child.gen = clampGen(child.gen);
    child.vec = toVector(child.gen, genRanges);
    child.energy = 1000;
    child.dead = false;
    child.primordial = true;
    return child;
}

// Replace with your own global best logic if you keep a hall-of-fame
function globalBestPlant() {
    if (!plants || plants.length === 0) return null;
    let best = plants[0];
    for (let i = 1; i < plants.length; i++) {
        if ((plants[i].fitness ?? -Infinity) > (best.fitness ?? -Infinity)) best = plants[i];
    }
    return best;
}

// --- Config: define the canonical gene order once ---
const GENE_KEYS = [
  "long_sec",
  "prob_repro",
  "precision_light",
  "angle_mult",
  "growth_rate",
  "max_turn_angle",
];


// --- Utils ---
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const safeDiv = (a, b) => (Math.abs(b) < 1e-12 ? 0 : a / b);

/**
 * Normalize a single scalar given [min, max] range.
 */
function normalizeScalar(value, [min, max]) {
  if (min === max) return 0.5; // degenerate range; park in the middle
  return clamp01((value - min) / (max - min));
}

/**
 * toVector(gen, genRanges) -> [6]
 * Returns a normalized vector in fixed order (GENE_KEYS), each in [0,1].
 * Unknown/missing values become 0.5 in normalized space.
 */
function toVector(gen, genRanges) {
    const v = new Array(GENE_KEYS.length);
    for (let i = 0; i < GENE_KEYS.length; i++) {
        const key = GENE_KEYS[i];
        const range = genRanges[key];
        const raw = gen[key];
        v[i] = mapp(raw, range[0], range[1], 0, 1)
    }
    return v;
}

/**
 * dstnce(a, b, weights?, metric?) -> number
 * Weighted Euclidean (default) or cosine dstnce in normalized space.
 * - a, b are same-length number arrays
 * - weights defaults to DEFAULT_WEIGHTS (must match length)
 * - metric: "euclidean" | "cosine"
 */
function dstnce(a, b, weights = DEFAULT_WEIGHTS, metric = "euclidean") {
  if (a.length !== b.length) throw new Error("Vectors must have same length");
  if (weights.length !== a.length) throw new Error("Weights length mismatch");

  if (metric === "cosine") {
    // cosine dstnce = 1 - cosine similarity
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
      const wa = Math.sqrt(Math.max(weights[i], 0)); // turn weights into scale
      const ai = a[i] * wa, bi = b[i] * wa;
      dot += ai * bi;
      na += ai * ai;
      nb += bi * bi;
    }
    const sim = safeDiv(dot, Math.sqrt(na) * Math.sqrt(nb));
    return 1 - Math.max(-1, Math.min(1, sim));
  }

  // weighted Euclidean
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += Math.max(weights[i], 0) * d * d;
  }
  return Math.sqrt(sum);
}

/**
 * chooseChampion(members) -> Plant | null
 * Returns the member with maximum fitness (ties: first encountered).
 * Expects objects like { fitness: number, ... }.
 */
function chooseChampion(members) {
  if (!members || members.length === 0) return null;
  let best = members[0];
  for (let i = 1; i < members.length; i++) {
    if ((members[i].fitness ?? -Infinity) > (best.fitness ?? -Infinity)) {
      best = members[i];
    }
  }
  return best;
}

/**
 * meanVector(vectors) -> [n] | null
 * Component-wise mean; returns null for empty input.
 */
function meanVector(vectors) {
  if (!vectors || vectors.length === 0) return null;
  const n = vectors[0].length;
  const acc = new Array(n).fill(0);
  for (const v of vectors) {
    if (!v || v.length !== n) throw new Error("Vector length mismatch");
    for (let i = 0; i < n; i++) acc[i] += v[i];
  }
  for (let i = 0; i < n; i++) acc[i] /= vectors.length;
  return acc;
}


