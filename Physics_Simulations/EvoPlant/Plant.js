/*
GENES PLANTA
- Longitud de secciones
- Probabilidad de reproduccion
- Precision de direccion a luz (la mas importante)
- Rango apertura angulo (a la direccion calculada se multiplica este numero para cerrar el angulo)
- ¿Probabilidad de ramificacion?
*/

const MAX_SECTIONS = 100
const MAX_ENERGY = Infinity
const MAX_OFFSPRINGS = 3
const MIN_ENERGY_REPRO = 400
const COST_ENERGY_REPRO = 150

const mult = 1

let idCounter = 0

class Plant{
    constructor(pos, ranges){
        this.gen = {
            long_sec: constrain(round(randomGaussian(14, 5)), genRanges.long_sec[0], genRanges.long_sec[1]) * mult,
            prob_repro: random(genRanges.prob_repro[0], genRanges.prob_repro[1]),
            precision_light: random(genRanges.precision_light[0], genRanges.precision_light[1]),     //1 is max precision, 0 lowest
            angle_mult: random(genRanges.angle_mult[0], genRanges.angle_mult[1]),         //1 is max aperture (best) 
            growth_rate: random(genRanges.growth_rate[0], genRanges.growth_rate[1]) * mult,
            max_turn_angle: random(genRanges.max_turn_angle[0], genRanges.max_turn_angle[1])
        }   
        this.vec = undefined
        this.ranges = ranges ? ranges : Array(6).fill().map((_, i) => {
            return Math.floor(Math.random() * 255)
        })
        this.stem = [new Section(pos, undefined, undefined, this.ranges)]
        this.energy = 1000
        this.dead = false
        this.offsprings = []
        this.id = idCounter
        this.energyAcumulator = 0
        this.primordial = true
        this.flowered = false
        this.radRnd = random(INNER_RAD_SUN_SQ)
        idCounter++
        this.fitness = 0
        //plotAllEnergy.addSeries()
    }

    restartPos(pos){
        this.stem = [new Section(pos, undefined, undefined, this.ranges)]
    }


    getFitness(){
        return this.energy
    }

    getBeauty(){
        return (this.gen.precision_light + this.gen.angle_mult) / 2
    }
    

    getNewAngle(oldAngle, pos){
        function wrapPi(a){
            return Math.atan2(fastSin(a), fastCos(a));
        }

        let angle = oldAngle;

        const dirSun = p5.Vector.sub(sun, pos).heading()

        const diff = wrapPi(dirSun - angle);

        
        const sigma = lerpp(sigmaMax, sigmaMin, this.gen.precision_light);
        const error = randomGaussian(0, sigma);

        const maxTurn = radians(this.gen.max_turn_angle || 10); 
        const delta = constrainn(this.gen.angle_mult * diff + error, -maxTurn, maxTurn);


        angle = wrapPi(angle + delta);
        return angle;
    }


    getEnergy(pos){
        let d = Math.min(squaredDistance(pos.x, pos.y, sun.x, sun.y), RAD_PLANT_TO_SUN_SQ)
        let val = mapp(d, 0, RAD_PLANT_TO_SUN_SQ, 1, 0)
        return val*val*val
    }

    update(){
        if(this.dead) return    
        let lastSec = this.stem[this.stem.length - 1]
        let lastPos = lastSec.getLastPos()

        if(!this.primordial && !this.flowered){
            if(squaredDistance(lastPos.x, lastPos.y, sun.x, sun.y) < INNER_RAD_SUN_SQ - this.radRnd){
                this.flowered = true
                addFlower(lastPos, lastSec.ranges)
            }
        }
        
        let oldSections = 0
        // for(let sec of this.stem){
        //     if(sec.age > AGE_MAX_ENERGY){
        //         oldSections++;
        //     }
        // }

        this.energy -= (this.gen.growth_rate * 0.5)
        this.energy -= (this.stem.length - oldSections) * 0.01
        this.energy -= this.offsprings.length * 0.05
        this.energy += this.energyAcumulator
        this.energy = Math.min(this.energy, MAX_ENERGY)

        if(this.energy < 0){
            this.dead = true
            lastSec.dead = true
        }
        if(!this.flowered) lastSec.grow(this.gen.growth_rate)

        if(!this.flowered && !this.dead && lastSec.long > this.gen.long_sec){
            let oldAngle = lastSec.angle
            let newAngle = this.getNewAngle(oldAngle, lastPos)
            this.stem.push(new Section(createVector(lastPos.x, lastPos.y), newAngle, 1/this.stem.length, this.ranges))
            this.energyAcumulator += this.getEnergy(lastPos) * mapp(this.gen.long_sec, 4, 25, rnd, rnd2)
            if(this.stem.length > MAX_SECTIONS){
                let old = this.stem.shift()
                this.energyAcumulator -= this.getEnergy(old.pos)
            }
        }

        if(Math.random() < this.gen.prob_repro && this.energy > MIN_ENERGY_REPRO && this.stem.length > 1 && !this.dead && this.offsprings.length < MAX_OFFSPRINGS){
            let newPlant = new Plant(lastPos, this.ranges.map(color => Math.min(Math.max(color + random(-10, 10), 0), 255)))
            this.energy -= COST_ENERGY_REPRO
            totalPlantsCreated++
            newPlant.gen = this.getNewGen()
            newPlant.gen.prob_repro *= 0.1
            newPlant.energy = this.energy
            newPlant.primordial = false
            plants.push(newPlant)
            this.offsprings.push(newPlant)
        }
    }

    getNewGen(){
        let gen = {
            long_sec: genRanges.long_sec[2] ? this.gen.long_sec : this.gen.long_sec + random(-0.5, 0.5),
            prob_repro: genRanges.prob_repro[2] ? this.gen.prob_repro : this.gen.prob_repro + random(-0.00005, 0.00005),
            precision_light: genRanges.precision_light[2] ? this.gen.precision_light : this.gen.precision_light + random(-0.05, 0.05),
            angle_mult: genRanges.angle_mult[2] ? this.gen.angle_mult : this.gen.angle_mult + random(-0.05, 0.05),
            growth_rate: genRanges.growth_rate[2] ? this.gen.growth_rate : this.gen.growth_rate + random(-0.001, 0.001),
            max_turn_angle: genRanges.max_turn_angle[2] ? this.gen.max_turn_angle : this.gen.max_turn_angle + random(-10, 10)
        }
        return clampGen(gen);
    }

    show(){
        for(let i = this.stem.length - 1; i >= 0; i--){
            let sec = this.stem[i]
            sec.update()
            if(sec.age > AGE_MAX && !sec.dead){
                sec.die()
            }
            if(sec.dead && sec.dieTimer <= 0){
                this.stem.splice(i, 1)
            }
        }
    }
}

function getEnergy(pos){
    let d = Math.min(squaredDistance(pos.x, pos.y, sun.x, sun.y), RAD_PLANT_TO_SUN_SQ)
    let val = mapp(d, 0, RAD_PLANT_TO_SUN_SQ, 1, 0)
    return val*val
}

// --- CONFIG ---
let numColors = 24;
let colorsBuc = 256 / numColors;

// --- LUTs ---
const RGB_LUT = new Float32Array(256);    // numeric bucket value per 0..255
const RGB_STR_LUT = new Array(256);       // same but stringified to avoid toString cost
const ALPHA_LUT = new Float32Array(101);  // 0.00..1.00 in 0.01 steps

function rebuildLUTs() {
    for (let i = 0; i < 256; i++) {
        const v = Math.floor(i / colorsBuc) * colorsBuc; 
        RGB_LUT[i] = v;
        RGB_STR_LUT[i] = String(v); 
    }
    for (let i = 0; i <= 100; i++) {
        ALPHA_LUT[i] = i / 100; 
    }
}

rebuildLUTs();

const clamp255i = x => (x <= 0 ? 0 : x >= 255 ? 255 : x | 0);

// --- Fast bucketizer using LUTs ---
function bucketizeColor(r, g, b, a = 1) {
    const ri = clamp255i(r);
    const gi = clamp255i(g);
    const bi = clamp255i(b);

    let ai = (a * 100 + 0.5) | 0;
    if (ai < 0) ai = 0;
    else if (ai > 100) ai = 100;

    return `${RGB_STR_LUT[ri]},${RGB_STR_LUT[gi]},${RGB_STR_LUT[bi]},${ALPHA_LUT[ai]}`;
}


function bucketizeWidth(w){
    return Math.floor(w);
}

function renderSectionsBatched(sections){
    const batches = new Map(); // key: "r,g,b,a|w" 

    for (let s of sections) {
        if (s.outOfBounds || s.insideSun) continue;
        if (s.dead) s.dieTimer--;

        const x1 = s.pos.x, y1 = s.pos.y;
        const x2 = fastCos(s.angle) * s.long + x1;
        const y2 = fastSin(s.angle) * s.long + y1;

        // assume each section has s.r, s.g, s.b, s.a
        const colorKey = bucketizeColor(s.r, s.g, s.b, s.alpha); 
        const widthKey = bucketizeWidth(s.w);
        const key = `${colorKey}|${widthKey}`;

        let arr = batches.get(key);
        if (!arr) { 
            arr = []; 
            batches.set(key, arr); 
        }
        arr.push(x1, y1, x2, y2);
    }

    for (const [key, lines] of batches) {
        const [rgba, wStr] = key.split('|');
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${rgba})`;
        ctx.lineWidth = Number(wStr);

        for (let i = 0; i < lines.length; i += 4) {
            ctx.moveTo(lines[i], lines[i+1]);
            ctx.lineTo(lines[i+2], lines[i+3]);
        }
        ctx.stroke();
    }

    return batches.size;
}
