class Segment{
    constructor(x1, y1, x2, y2){
        this.a = createVector(x1, y1)
        this.b = createVector(x2, y2)
        this.len = p5.Vector.dist(this.a, this.b)
        this.dir = p5.Vector.sub(this.b, this.a).normalize()
    }

    createRedLight(relPos, relT, dur, isOn){
        this.hasRedLight = true
        this.light = new Light(this, relPos, relT, dur, !isOn)
        return this.light
    }

    update(){
        if(this.light) this.light.update() 
    }

    show(col){
        stroke(col)
        strokeWeight(2)
        line(this.a.x, this.a.y, this.b.x, this.b.y)

        if(this.light) this.light.show()
    }
}