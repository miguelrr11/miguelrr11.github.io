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
const MIN_ENERGY_REPRO = 300
const COST_ENERGY_REPRO = 100

let idCounter = 0

class Plant{
    constructor(pos, ranges){
        this.gen = {
            long_sec: constrain(round(randomGaussian(14, 5)), 4, 25),
            prob_repro: random(0.0003, 0.0005),
            precision_light: random(0, 0.2),     //1 is max precision, 0 lowest random(0.2, 05)
            angle_mult: random(0.01, 0.3),         //1 is max aperture (best) random(0.3, 0.5),      
            growth_rate: random(0.005, 0.03),
            max_turn_angle: random(20, 120)
        }
        this.ranges = ranges ? ranges : Array(6).fill().map((_, i) => {
            return Math.floor(Math.random() * 255)
        })
        this.stem = [new Section(pos, undefined, undefined, this.ranges)]
        this.energy = 1000
        this.dead = false
        this.offsprings = []
        this.id = idCounter
        this.energyAcumulator = 0
        idCounter++
        //plotAllEnergy.addSeries()
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
        return val*val
    }

    update(){
        if(this.dead) return    
        let lastSec = this.stem[this.stem.length - 1]
        let lastPos = lastSec.getLastPos()

        this.energy -= (this.gen.growth_rate * 0.25)
        this.energy -= this.stem.length * 0.01
        //this.energy += this.getEnergy(lastPos)
        this.energy += this.energyAcumulator
        this.energy = Math.min(this.energy, MAX_ENERGY)
        if(this.energy < 0){
            this.dead = true
            lastSec.dead = true
        }
        lastSec.grow(this.gen.growth_rate)

        if(!this.dead && lastSec.long > this.gen.long_sec){
            let oldAngle = lastSec.angle
            let newAngle = this.getNewAngle(oldAngle, lastPos)
            this.stem.push(new Section(createVector(lastPos.x, lastPos.y), newAngle, 1/this.stem.length, this.ranges))
            this.energyAcumulator += this.getEnergy(lastPos)
            if(this.stem.length > MAX_SECTIONS){
                let old = this.stem.shift()
                this.energyAcumulator -= this.getEnergy(old.pos)
            }
        }

        if(this.energy > MIN_ENERGY_REPRO && Math.random() < this.gen.prob_repro && this.stem.length > 1 && !this.dead && this.offsprings.length < MAX_OFFSPRINGS){
            let newPlant = new Plant(lastPos, this.ranges.map(color => Math.min(Math.max(color + random(-10, 10), 0), 255)))
            this.energy -= COST_ENERGY_REPRO
            totalPlantsCreated++
            newPlant.gen = this.getNewGen()
            newPlant.gen.prob_repro *= 0.1
            newPlant.energy = this.energy
            plants.push(newPlant)
            this.offsprings.push(newPlant)
        }
    }

    getNewGen(){
        let gen = {
            long_sec: this.gen.long_sec + random(-0.5, 0.5),
            prob_repro: this.gen.prob_repro + random(-0.00005, 0.00005),
            precision_light: this.gen.precision_light + random(-0.05, 0.05),
            angle_mult: this.gen.angle_mult + random(-0.05, 0.05),
            growth_rate: this.gen.growth_rate + random(-0.001, 0.001),
            max_turn_angle: this.gen.max_turn_angle + random(-10, 10)
        }
        return clampGen(gen);
    }

    show(){
        for(let i = this.stem.length - 1; i >= 0; i--){
            let sec = this.stem[i]
            sec.update()
            if(sec.age > AGE_MAX){
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

const numColors = 12
let colorsBuc = 256/numColors
function bucketizeColor(r,g,b){
    const Q = x => Math.floor(x / colorsBuc) * colorsBuc;
    return `${Q(r)},${Q(g)},${Q(b)}`; // "r,g,b"
}
function bucketizeWidth(w){
    return Math.floor(w)
}
function renderSectionsBatched(sections){
    const batches = new Map(); // key: "r,g,b|w" 
    for (let s of sections) {
        if (s.outOfBounds || s.dead) continue;

        const x1 = s.pos.x, y1 = s.pos.y;
        const x2 = fastCos(s.angle) * s.long + x1;
        const y2 = fastSin(s.angle) * s.long + y1;

        const colorKey = bucketizeColor(s.r, s.g, s.b); 
        const widthKey = bucketizeWidth(s.w);
        const key = `${colorKey}|${widthKey}`;

        let arr = batches.get(key);
        if (!arr) { 
            arr = []; 
            batches.set(key, arr); 
        }
        arr.push(x1, y1, x2, y2);
    }
    ctx.lineJoin = 'miter'
    for (const [key, lines] of batches) {
        const [rgb, wStr] = key.split('|');
        ctx.beginPath();
        ctx.strokeStyle = `rgb(${rgb})`;
        ctx.lineWidth = Number(wStr);
        // opcional: ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; (más rápidos)
        //ctx.lineCap = 'butt'
        
        for (let i = 0; i < lines.length; i += 4) {
            ctx.moveTo(lines[i], lines[i+1]);
            ctx.lineTo(lines[i+2], lines[i+3]);
        }
        ctx.stroke();
    }
    return batches.size
}
