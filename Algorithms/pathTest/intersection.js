//fromPath always yields to toPath

class Intersection{
    constructor(fromPath, fromSeg, toPath, toSeg, pos){
        this.fromPath = fromPath
        this.fromSeg = fromSeg
        this.toPath = toPath
        this.toSeg = toSeg
        this.pos = pos
        this.rnd1 = random(-5, 5)
        this.rnd2 = random(-5, 5)
    }
    
    show(){
        //stroke(this.fromPath.col)
        fill(255, 100)
        stroke(255)
        strokeWeight(1.5)
        ellipse(this.pos.x + this.rnd1, this.pos.y + this.rnd2, 12)
    }
}