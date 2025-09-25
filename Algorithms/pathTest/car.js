class Car{
    constructor(path){
        this.path = path
        this.pos = null
        this.vel = 0
        this.acc = 0.05
        this.maxSpeed = 1.5
        this.currentSeg = 0
        this.segPos = 0

        this.chosenIntersection = undefined
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

    show(bool){
        let hover = dist(mouseX, mouseY, this.pos.x, this.pos.y) < 15
        if(this.pos){
            stroke(255, 100)
            if(hover) stroke(255, 0, 0)
            //if(this.path.redLightAhead(this, 30)) stroke(255, 255, 0)
            strokeWeight(12)
            if(bool) strokeWeight(20)
            point(this.pos.x, this.pos.y)
        }
        if(hover){
            noStroke()
            fill(255)
            textSize(16)
            textAlign(LEFT, BOTTOM)
            let str = `path: ${this.path.id}\nseg: ${this.currentSeg}\npos: ${this.segPos.toFixed(2)}\nvel: ${this.vel.toFixed(2)}`
            let bbox = textBounds(str, this.pos.x + 10, this.pos.y - 10)
            fill(0)
            rect(bbox.x - 5, bbox.y - bbox.h - 5, bbox.w + 10, bbox.h + 10)
            fill(255)
            text(str, this.pos.x + 10, this.pos.y - 20)

            for(let c of this.carsAhead){
                stroke(0, 255, 0)
                strokeWeight(4)
                line(this.pos.x, this.pos.y, c.pos.x, c.pos.y)
            }
        }
    }
}