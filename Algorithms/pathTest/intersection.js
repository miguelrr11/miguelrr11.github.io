//fromPath always yields to toPath

class Intersection{
    constructor(fromPath, fromSeg, toPath, toSeg, pos){
        this.fromPath = fromPath
        this.fromSeg = fromSeg
        this.toPath = toPath
        this.toSeg = toSeg
        this.pos = pos
    }
    
    show(){
        stroke(this.fromPath.col)
        strokeWeight(13)
        point(this.pos.x, this.pos.y)
    }
}