const AGE_MAX = 1200
const AGE_MAX_ENERGY = AGE_MAX * 0.8
const MIN_W = 2
const MAX_W = 10

class Section{
    constructor(pos, angle, ratio, ranges){
        this.pos = pos ? pos : createVector(random(0, WIDTH), random(HEIGHT - 200, HEIGHT))
        this.insideSun = squaredDistance(this.pos.x, this.pos.y, sun.x, sun.y) < INNER_RAD_SUN_SQ
        this.lastPos = this.pos.copy()
        this.angle = angle ? angle : random(-PI, PI)
        this.long = 0
        this.age = 0

        this.dead = false
        this.dieTimer = 60 * 5

        this.ratio = ratio ? ratio : 1
        this.rnd = random(0, 1)
        this.turn = Math.floor(Math.random() * MAX_TURNS)

        this.a = constrainn(this.age / AGE_MAX, 0, 1)
        this.ranges = ranges
        this.r = lerpp(this.ranges[0], this.ranges[1], this.a)
        this.g = lerpp(this.ranges[2], this.ranges[3], this.a)
        this.b = lerpp(this.ranges[4], this.ranges[5], this.a)
        this.alpha = 1
        this.w = lerpp(MIN_W, MAX_W, this.a*this.a)
        this.energy = getEnergy(this.pos)
    }

    die(){
        this.dead = true
    }

    getLastPos(){
        this.lastPos.x = fastCos(this.angle) * this.long + this.pos.x;
        this.lastPos.y = fastSin(this.angle) * this.long + this.pos.y;
        return this.lastPos
    }

    grow(delta){
        if(this.dead) return
        this.long += delta
    }

    updateVars(){
        if(this.dead){
            this.alpha = lerpp(this.alpha, 0, 0.01)
            return
        }
        this.a = constrainn(this.age / AGE_MAX, 0, 1)
        this.r = lerpp(this.ranges[0], this.ranges[1], this.a)
        this.g = lerpp(this.ranges[2], this.ranges[3], this.a)
        this.b = lerpp(this.ranges[4], this.ranges[5], this.a)
        this.w = lerpp(MIN_W, MAX_W, this.a*this.a)
    }

    update(){
        this.age += 0.1

        if(this.outOfBounds){
            return
        }

        this.updateVars()
    }

}