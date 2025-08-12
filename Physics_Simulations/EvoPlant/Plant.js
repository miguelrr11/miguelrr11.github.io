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

class Plant{
    constructor(pos, ranges){
        this.gen = {
            long_sec: random(3, 22),
            prob_repro: random(0.0003, 0.0005),
            precision_light: random(0, 0.5),     //1 is max precision, 0 lowest random(0.2, 05)
            angle_mult: random(0.01, 0.5),         //1 is max aperture (best) random(0.3, 0.5),      
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
    }

    getFitness(){
        return this.energy
    }

    getBeauty(){
        return (this.gen.precision_light + this.gen.angle_mult) / 2
    }

    getNewAngle(oldAngle, pos){
        let angle = oldAngle
        let dirSun = p5.Vector.sub(sun, pos).heading()
        let maxError = radians(this.gen.max_turn_angle) * (1 - this.gen.precision_light);
        let error = randomGaussian(0, maxError);
        let deltaAngle = (dirSun - angle) * this.gen.angle_mult + error;
        angle += deltaAngle
        return angle
    }

    getEnergy(pos){
        let d = Math.min(squaredDistance(pos.x, pos.y, sun.x, sun.y), RAD_PLANT_TO_SUN_SQ)
        let val = mapp(d, 0, RAD_PLANT_TO_SUN_SQ, 1, 0)
        return val*val
        // if(d < rad1) return 0.22
        // if(d < rad2) return 0.08
        // if(d < rad3) return 0.02
        // return 0
    }

    update(){
        let lastSec = this.stem[this.stem.length - 1]
        let lastPos = lastSec.getLastPos()

        this.energy -= (this.gen.growth_rate * 0.25)
        this.energy += this.getEnergy(lastPos)
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
            if(this.stem.length > MAX_SECTIONS){
                this.stem.shift()
            }
        }

        if(Math.random() < this.gen.prob_repro && this.stem.length > 1 && !this.dead && this.offsprings.length < MAX_OFFSPRINGS){
            let newPlant = new Plant(lastPos, this.ranges.map(color => Math.min(Math.max(color + random(-10, 10), 0), 255)))
            totalPlantsCreated++
            newPlant.gen = this.getNewGen()
            newPlant.gen.prob_repro *= 0.1
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
            sec.show()
            if(sec.age > AGE_MAX){
                this.stem.splice(i, 1)
            }
        }
    }
}