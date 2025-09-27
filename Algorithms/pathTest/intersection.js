//fromPath always yields to toPath

class Intersection{
    constructor(fromPath, fromSeg, toPath, toSeg, pos){
        this.fromPath = fromPath
        this.fromSeg = fromSeg
        this.toPath = toPath
        this.toSeg = toSeg
        this.pos = pos
        this.rnd1 = 0
        this.rnd2 = 0
    }
    
    show(){
        if(!SHOW_DEBUG) return
        //stroke(this.fromPath.col)
        fill(255, 100)
        stroke(255)
        strokeWeight(1.5)
        ellipse(this.pos.x + this.rnd1, this.pos.y + this.rnd2, 12)

        let hover = dist(mouseX, mouseY, this.pos.x, this.pos.y) < 10
        if(hover){
            stroke(0, 255, 0)
            line(this.fromSeg.a.x, this.fromSeg.a.y, this.fromSeg.b.x, this.fromSeg.b.y)
            stroke(255, 0, 0)
            line(this.toSeg.a.x, this.toSeg.a.y, this.toSeg.b.x, this.toSeg.b.y)
            console.log(this)
        }
    }
}