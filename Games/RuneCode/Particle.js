const R_PART = 5
const PROB_PENETRATE = 0.05

class Particle{
    constructor(x, y){
        this.pos = createVector(x, y)
        let angle = Math.random() * TWO_PI
        this.vel = createVector(Math.cos(angle), Math.sin(angle))
        this.out = false
        this.dead = false
        this.insideRuneBook = false
    }

    die(){
        this.dead = true
    }

    // true if the particle is outside the rune book
    checkCollisionOutideRuneBook(){
        return squaredDistance(this.pos.x, this.pos.y, this.insideRuneBook.pos.x, this.insideRuneBook.pos.y) > SQ_BOTH_RADII
    }

    // returns the rune book if the particle is inside it
    checkCollisionRuneBooks(){
        for(let i = 0; i < runeBooks.length; i++){
            let rb = runeBooks[i]
            let d = squaredDistance(this.pos.x, this.pos.y, rb.pos.x, rb.pos.y)
            if(d < SQ_BOTH_RADII){
                runeBooks[i].hit()
                return runeBooks[i]
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
        this.pos.add(this.vel)
        this.edges()
        this.setOut()
    }

    transport(){
        this.pos.x = random(minPos.x, maxPos.x)
        this.pos.y = random(minPos.y, maxPos.y)
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

    show(){
        if(this.out) return
        stroke(150)
        strokeWeight(R_PART)
        point(this.pos.x, this.pos.y)
    }
}

// SHARDS
class AttackParticle extends Particle{
    constructor(x, y){
        super(x, y)
        //this.vel.mult(2)
        this.out = false
    }

    // some shards penetrate the shield and just bounce inside the rune book
    update(){
        this.updateMovement()
        
        if(!this.insideRuneBook){
            let collisionRB = this.checkCollisionRuneBooks()
            if(collisionRB){
                let rand = Math.random()
                if(rand < PROB_PENETRATE){
                    this.insideRuneBook = collisionRB
                }
                else{
                    let dir = p5.Vector.sub(this.pos, collisionRB.pos)
                    dir.setMag(1)
                    this.vel = dir
                }
            }
        }
        else{
            this.collision = this.checkCollisionOutideRuneBook()
            if(this.collision){
                this.vel.mult(-1)
                this.insideRuneBook.hit()
            }
        }
    }

    show(){
        if(this.out) return
        stroke(123, 44, 191, 150)
        strokeWeight(R_PART + 2)
        point(this.pos.x, this.pos.y)
        stroke(90, 24, 154, 200)
        strokeWeight(R_PART - 1)
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
        strokeWeight(R_PART + 2)
        point(this.pos.x, this.pos.y)
        stroke(100, 223, 223, 200)
        strokeWeight(R_PART - 1)
        point(this.pos.x, this.pos.y)
    }
}