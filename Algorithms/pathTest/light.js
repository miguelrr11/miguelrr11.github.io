class Light{
    constructor(segment, relPos, relT, dur, off){
        this.segment = segment
        let r = relPos != undefined ? relPos : random(0.3, 0.8)
        this.redLightPos = p5.Vector.add(this.segment.a, p5.Vector.mult(this.segment.dir, r * this.segment.len))
        this.redLightRelPos = r * this.segment.len
        this.redLightInterval = dur != undefined ? dur : floor(random(220, 300))
        this.t = this.redLightInterval * relT != undefined ? relT : random(0, this.redLightInterval)
        this.red = off != undefined ? off : random() < 0.5 ? true : false

        //lights can either be part of a system (not individual) or individual (not part of a system)
        this.individual = true
    }

    starts(otherLight){
        this.startsLight = otherLight
    }

    update(){
        if(this.individual){
            this.t++
            if(this.red != undefined && this.t > this.redLightInterval){
                this.red = !this.red
                this.t = 0
            }
        }
        else{
            if(!this.red){
                this.t++
                if(this.t > this.redLightInterval){
                    this.red = true
                    this.t = 0
                    if(this.startsLight){
                        this.startsLight.red = false
                    }
                }
            }

        }
    }

    show(){
        stroke(this.red ? 'red' : 'green')
        strokeWeight(8)
        point(this.redLightPos.x, this.redLightPos.y)
    }
}