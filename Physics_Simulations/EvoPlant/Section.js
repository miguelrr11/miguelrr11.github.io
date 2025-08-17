const AGE_MAX = 1500
const AGE_MAX_ENERGY = AGE_MAX * 0.8
const MIN_W = 2
const MAX_W = 10
let MAX_TURNS = 10

class Section{
    constructor(pos, angle, ratio, ranges){
        this.pos = pos ? pos : createVector(random(0, WIDTH), random(HEIGHT - 200, HEIGHT))
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
        return createVector(
            Math.cos(this.angle) * this.long + this.pos.x,
            Math.sin(this.angle) * this.long + this.pos.y
        )   
    }

    grow(delta){
        if(this.dead) return
        this.long += delta
    }

    updateVars(){
        if((frameCount + this.turn) % MAX_TURNS != 0) return
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

    // show(){

    //     this.age += 0.1

    //     if(this.pos.x < 0 || this.pos.x > WIDTH || this.pos.y < 0 || this.pos.y > HEIGHT){
    //         return
    //     }

    //     this.updateVars()

    //     const endX = fastCos(this.angle) * this.long + this.pos.x;
    //     const endY = fastSin(this.angle) * this.long + this.pos.y;


    //     ctx.beginPath();
    //     ctx.strokeStyle = `rgb(${this.r}, ${this.g}, ${this.b})`;
    //     ctx.lineWidth = this.w;                                  
    //     ctx.moveTo(this.pos.x, this.pos.y);                      
    //     ctx.lineTo(endX, endY);                                  
    //     ctx.stroke();    
    // }

    update(){
        this.age += 0.1
       // if(this.dead) this.dieTimer--

        if(this.outOfBounds){
            return
        }

        this.updateVars()
    }

}