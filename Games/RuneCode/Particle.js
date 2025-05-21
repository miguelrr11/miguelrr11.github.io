const R_PART = 5
const PROB_PENETRATE = 0.05
const PROB_TRANSPORT = 0.001
const TOTAL_TIME_TRANS = 60
const HALF_TIME_TRANS = TOTAL_TIME_TRANS * 0.5

class Particle{
    constructor(x, y){
        this.pos = createVector(x, y)
        let angle = Math.random() * TWO_PI
        this.vel = createVector(Math.cos(angle), Math.sin(angle))
        this.speed = 1
        this.out = false
        this.dead = false
        this.insideRuneBook = false
        this.rnd = Math.random() * 1000
        this.rnd2 = Math.random() * 1000

        this.transportCounter = 0
    }

    die(){
        this.dead = true
    }

    transport() {
        while (true) {
            let randomPos = createVector(random(minPos.x, maxPos.x), random(minPos.y, maxPos.y));
            let insideAny = false;
            for (let rb of runeBooks) {
                if (rb && squaredDistance(randomPos.x, randomPos.y, rb.pos.x, rb.pos.y) <= (SQ_BOTH_RADII + 0)) {
                    insideAny = true;
                    break;
                }
            }
            if (!insideAny) {
                return randomPos.copy()
            }
        }
    }

    // true if the particle is outside the rune book
    checkCollisionOutideRuneBook(){
        return squaredDistance(this.pos.x, this.pos.y, this.insideRuneBook.pos.x, this.insideRuneBook.pos.y) >= SQ_BOTH_RADII
    }

    // returns the rune book if the particle is inside it
    checkCollisionRuneBooks(){
        let rbs = runeBooks
        for(let i = 0; i < rbs.length; i++){
            let rb = rbs[i]
            if(!rb) continue
            let d = squaredDistance(this.pos.x, this.pos.y, rb.pos.x, rb.pos.y)
            if(d < SQ_BOTH_RADII){
                rbs[i].hit()
                return rbs[i]
            }
        }
        return false
    }

    setOut(){
		let [minX, maxX, minY, maxY] = currentEdges
		this.out = this.pos.x < minX - R_PART ||
		this.pos.x > maxX + R_PART || 
		this.pos.y < minY - R_PART || 
		this.pos.y > maxY + R_PART
	}

    updateMovement(){
        if(this.dead) return
        if(Math.random() < PROB_TRANSPORT && !this.insideRuneBook) this.transportCounter = TOTAL_TIME_TRANS
        if(this.transportCounter > 0){
            this.transportCounter--
            if(this.transportCounter == HALF_TIME_TRANS){
                this.pos = this.transport()
            }
        }
        if(this.insideRuneBook && this.insideRuneBook.dead){
            this.out = true
            this.insideRuneBook = undefined
        }
        this.pos.add(this.vel)
        const maxDev = 0.01
        let devX = (noise(this.pos.x * 0.1 + this.rnd) - 0.5) * 2 * maxDev
        let devY = (noise(this.pos.y * 0.1 + this.rnd2) - 0.5) * 2 * maxDev
        this.vel.x += devX
        this.vel.y += devY
        this.vel.setMag(this.speed)
        this.edges()
        this.setOut()
    }

    edges(){
        let minX = minPos.x  
        let maxX = maxPos.x
        let minY = minPos.y
        let maxY = maxPos.y
        let r = R_PART
        if(this.pos.x < minX + r) {
            this.pos.x = maxX - r
        }
        else if(this.pos.x > maxX - r) {
            this.pos.x = minX + r
        }
        if(this.pos.y < minY + r) {
            this.pos.y = maxY - r
        }
        else if(this.pos.y > maxY - r) {
            this.pos.y = minY + r
        }
    }


}

// SHARDS
class AttackParticle extends Particle{
    constructor(x, y){
        super(x, y)
        //this.vel.mult(2)
        this.out = false
        this.coolDown = 0
    }

    // some shards penetrate the shield and just bounce inside the rune book
    update(){
        this.updateMovement()
        this.coolDown--
        
        if(!this.insideRuneBook){
            let collisionRB = this.checkCollisionRuneBooks()
            if(collisionRB){
                let rand = Math.random()
                if(rand <= PROB_PENETRATE){
                    this.insideRuneBook = collisionRB
                    this.speed = 0.7
                }
                else{
                    let dir = p5.Vector.sub(this.pos, collisionRB.pos)
                    dir.setMag(1)
                    this.vel = dir
                }
            }
        }
        else {
            let rb = this.insideRuneBook;
            let delta = p5.Vector.sub(rb.pos, rb.oldPos);
            this.pos.add(delta);
            // rebota al centro del rune book con una pequeña desviación
            if (this.checkCollisionOutideRuneBook()) {
                const toCenter = p5.Vector.sub(rb.pos, this.pos).normalize()
                const maxDev = PI / 12
                const deviation = random(-maxDev, maxDev)
                toCenter.rotate(deviation)
                this.vel = toCenter.mult(this.speed)
                if(this.coolDown <= 0) {
                    this.insideRuneBook.hit()
                    this.coolDown = 60
                }
            }
        }

    }

    show(){
        if(this.out) return
        stroke(123, 44, 191, 150)
        let mult = this.transportCounter > 0 ? (this.transportCounter > HALF_TIME_TRANS ? 
            mapp(this.transportCounter, TOTAL_TIME_TRANS, HALF_TIME_TRANS, 1, 0) : 
            mapp(this.transportCounter, 0, HALF_TIME_TRANS, 1, 0)) : 1
        strokeWeight((R_PART + 2) * mult)
        point(this.pos.x, this.pos.y)
        stroke(90, 24, 154, 200)
        strokeWeight((R_PART - 1) * mult)
        point(this.pos.x, this.pos.y)
    }
}

// MANA
class FoodParticle extends Particle{
    constructor(x, y){
        super(x, y)
        //this.vel.mult(2)
        this.out = false
    }

    update(){
        this.updateMovement()
    }

    show(){
        if(this.out) return
        stroke(114, 239, 221, 150)
        let mult = this.transportCounter > 0 ? (this.transportCounter > HALF_TIME_TRANS ? 
            mapp(this.transportCounter, TOTAL_TIME_TRANS, HALF_TIME_TRANS, 1, 0) : 
            mapp(this.transportCounter, 0, HALF_TIME_TRANS, 1, 0)) : 1
        strokeWeight((R_PART + 2) * mult)
        point(this.pos.x, this.pos.y)
        stroke(100, 223, 223, 200)
        strokeWeight((R_PART - 1) * mult)
        point(this.pos.x, this.pos.y)
    }
}