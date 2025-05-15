class Particle{
    constructor(x, y){
        this.pos = createVector(x, y)
        let angle = Math.random() * TWO_PI
        this.vel = createVector(Math.cos(angle), Math.sin(angle))
        this.isDying = false
    }

    transport(){
        this.pos.x = random(minPos.x, maxPos.x)
        this.pos.y = random(minPos.y, maxPos.y)
    }

    die(){
        this.transport()
    }

    update(){
        this.pos.add(this.vel)
        this.edges()
    }

    edges(){
        let minX = minPos.x  
        let maxX = maxPos.x
        let minY = minPos.y
        let maxY = maxPos.y
        let r = 5
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
        stroke(150)
        strokeWeight(4)
        point(this.pos.x, this.pos.y)
    }
}