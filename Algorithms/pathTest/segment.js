class Segment{
    constructor(x1, y1, x2, y2){
        this.a = createVector(x1, y1)
        this.b = createVector(x2, y2)
        this.len = p5.Vector.dist(this.a, this.b)
        this.dir = p5.Vector.sub(this.b, this.a).normalize()

        if(random() < 0.5 && this.len > 100) this.createRedLight()
        else {
            this.redLightPos = null
            this.redLightRelPos = null
            this.red = undefined
            this.hasRedLight = false
        }
    }

    createRedLight(){
        let r = random(0.1, 0.8)
        this.redLightPos = p5.Vector.add(this.a, p5.Vector.mult(this.dir, r * this.len))
        this.redLightRelPos = r * this.len
        this.redLightInterval = floor(random(220, 300))
        this.t = random(0, this.redLightInterval)
        this.red = false
        this.hasRedLight = true
    }

    show(){
        this.t++
        if(this.red != undefined && this.t > this.redLightInterval){
            this.red = !this.red
            this.t = 0
        }
        stroke(255)
        strokeWeight(2)
        line(this.a.x, this.a.y, this.b.x, this.b.y)

        this.hasRedLight && this.red ? stroke(255, 0, 0) : stroke(0, 255, 0)
        strokeWeight(8)
        this.hasRedLight ? point(this.redLightPos.x, this.redLightPos.y) : null
    }
}