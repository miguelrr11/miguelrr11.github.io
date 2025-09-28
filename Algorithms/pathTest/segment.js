class Segment{
    constructor(x1, y1, x2, y2, id){
        this.a = createVector(x1, y1)
        this.b = createVector(x2, y2)
        this.len = p5.Vector.dist(this.a, this.b)
        this.dir = p5.Vector.sub(this.b, this.a).normalize()
        this.id = id

        // if(random() < 0.5 && this.len > 50){
        //     this.createRedLight(
        //         0.8, //relative position on segment
        //         0,
        //         floor(random(220, 300)), //duration of red light
        //         random() < 0.5 //is it on at start
        //     )
        // }
    }

    createRedLight(relPos, relT, dur, isOn){
        this.hasRedLight = true
        this.light = new Light(this, relPos, relT, dur, !isOn)
        return this.light
    }

    update(){
        if(this.light) this.light.update() 
    }

    show(col, index){
        stroke(col)
        strokeWeight(2)
        line(this.a.x, this.a.y, this.b.x, this.b.y)

        if(this.light) this.light.show()
        if(index !== undefined && SHOW_DEBUG){
            return
            fill(255)
            noStroke()
            textSize(12)
            textAlign(CENTER, CENTER)
            text(index, (this.a.x + this.b.x) / 2, (this.a.y + this.b.y) / 2)
        }
    }
}