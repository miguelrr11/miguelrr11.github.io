class Car{
    constructor(path){
        this.path = path
        this.pos = null
        this.vel = 0
        this.acc = 0.05
        this.maxSpeed = random(1, 1.8)
        this.currentSeg = 0
        this.segPos = 0
    }
    
    break(){
        this.vel -= this.acc * 1.5
        this.vel = constrain(this.vel, 0, this.maxSpeed)
        this.segPos += this.vel
    }

    step(){
        this.vel += this.acc
        this.vel = constrain(this.vel, 0, this.maxSpeed)
        this.segPos += this.vel
    }

    show(){
        if(this.pos){
            stroke(255)
            //if(this.path.redLightAhead(this, 30)) stroke(255, 255, 0)
            strokeWeight(12)
            point(this.pos.x, this.pos.y)
        }
    }
}