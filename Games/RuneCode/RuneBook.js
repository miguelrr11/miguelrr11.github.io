class RuneBook{
    constructor(x, y){
        this.runes = Array.from({ length: 7 }, () => new Rune());
        this.runeIndex = 0
        this.runeIndexViz = this.runeIndex   //future
        this.pos = createVector(x, y)
        this.wall = 100
        this.radius = 80

        this.hand = 0
        this.handViz = this.hand
        this.radiusHand = 65
    }

    update(){
        this.runeIndexViz = lerp(this.runeIndexViz, this.runeIndex, 0.08)
        if(Math.abs(this.runeIndex - this.runeIndexViz) < 0.01) {
            this.fetch()
        }

        this.handViz = lerp(this.handViz, this.hand, 0.08)
        if(Math.abs(this.runeIndex - this.runeIndexViz) < 0.01) {
            this.fetchHand()
        }
    }

    //absoulte position
    moveHand(pos){
        if(pos > this.runes.length - 1 || pos < 0){
            console.log('Invalid hand position')
            return  
        }
        this.hand = pos
    }

    fetchHand(){
        this.handViz = this.hand
    }

    // runeIndex++ and executes
    fetch(){
        this.runeIndexViz = this.runeIndex
        this.runeIndex++
        this.runes[this.runeIndexViz % this.runes.length].execute()
    }

    show(){
        push()
        translate(this.pos.x, this.pos.y)
        noStroke()
        fill(74, 170, 211, mapp(this.wall, 0, 100, 20, 80))
        ellipse(0, 0, this.radius * 2)

        push()
        noFill()
        stroke(249, 175, 55)
        strokeWeight(3)
        ellipse(0, 0, this.radiusHand * 2)
        let angleHand = ((TWO_PI / this.runes.length) * this.handViz) - HALF_PI
        let length = this.radiusHand
        let endXHand = Math.cos(angleHand) * length
        let endYHand = Math.sin(angleHand) * length
        noStroke()
        fill(248, 150, 30)
        translate(endXHand, endYHand)
        rotate(angleHand+0.8)
        rectMode(CENTER)
        rect(0, 0, 10, 10)
        pop()

        stroke(248, 150, 30)
        strokeWeight(17)
        length = 45
        let ang = ((TWO_PI / this.runes.length) * this.handViz) - HALF_PI
        let eX = Math.cos(ang) * length
        let eY = Math.sin(ang) * length
        let sX = Math.cos(ang) * 25
        let sY = Math.sin(ang) * 25
        line(sX, sY, eX, eY)
        strokeWeight(3)
        line(eX, eY, endXHand, endYHand)

        strokeWeight(12)
        stroke('#CE4760')
        let mult = (TWO_PI / this.runes.length)
        for(let i = 0; i < this.runes.length; i++){
            let angle = (mult * i) - HALF_PI
            let endX = Math.cos(angle) * length
            let endY = Math.sin(angle) * length
            let startX = Math.cos(angle) * 25
            let startY = Math.sin(angle) * 25
            line(startX, startY, endX, endY)
            this.runes[i].show(startX, startY, endX, endY)
        }


        fill(80)
        noStroke()
        ellipse(0, 0, 30)
        fill(255, 30, 80)
        let angle = ((TWO_PI / this.runes.length) * this.runeIndexViz) - HALF_PI
        length = 9
        let endX = Math.cos(angle) * length
        let endY = Math.sin(angle) * length
        ellipse(endX, endY, 8)

        noFill()
        stroke(74, 170, 211)
        strokeWeight(mapp(this.wall, 0, 100, 0, 5))
        ellipse(0, 0, this.radius * 2)

       

        pop()
    }
}