const nPetals = 6
const anglePetal = (Math.PI * 2) / nPetals

class Flower{
    constructor(pos, ranges){
        this.pos = pos 
        this.insideCol = color(ranges[0], ranges[2], ranges[4])
        this.outsideCol = color(ranges[1], ranges[3], ranges[5])
        this.timer = 0
        this.rnd = Math.random()
        this.sizeRnd = randomm(-1.5, 1.5)
    }

    show(){
        if(this.timer < 0.995) this.timer = lerpp(this.timer, 1, 0.1)

        strokeWeight(this.timer * 7 + this.sizeRnd)
        stroke(this.outsideCol)
        for(let i = 0; i < TWO_PI; i += anglePetal){
            let x = this.pos.x + fastCos(i + this.timer + this.rnd) * (6 + this.sizeRnd) * this.timer
            let y = this.pos.y + fastSin(i + this.timer + this.rnd) * (6 + this.sizeRnd) * this.timer
            point(x, y)
        }

        stroke(this.insideCol)
        strokeWeight(this.timer * 8 + this.sizeRnd)
        point(this.pos.x, this.pos.y)
    }
}