const RAD_RUNEBOOK = 80
const R_OUT = RAD_RUNEBOOK + 50
const BUT_W = 95
const BUT_H = 25

class RuneBook{
    constructor(x, y){
        this.runes = Array.from({ length: Math.max(Math.floor(Math.random() * 14), 1) }, () => new Rune());
        this.runeIndex = 0
        this.runeIndexViz = this.runeIndex   //future
        this.pos = createVector(x, y)

        this.wall = 100         //wall hp
        this.energy = 100       //energy

        this.radius = RAD_RUNEBOOK
        this.runeRadius = mapp(this.runes.length, 1, 15, 15, 9)

        this.hand = 0
        this.handViz = this.hand
        this.radiusHand = RAD_RUNEBOOK - 15

        this.trans = 255

        this.out = false
        this.beat = 0

        this.id = null

        this.createButtons()
    }

    createButtons(){
        let buttons = []
        let wButton = BUT_W
        let hButton = BUT_H
        let horPadding = 10
        let verPadding = 10
        let x = WIDTH + 40
        let y = 260
        for(let i = 0; i < this.runes.length; i++){
            let bLeft = new Button(x, y, wButton, hButton, LEFT_RUNES[this.runes[i].left], LEFT_RUNES_COLS[this.runes[i].left])
            let bRight = new Button(x + wButton + horPadding, y, wButton, hButton, RIGHT_RUNES[this.runes[i].right], RIGHT_RUNES_COLS[this.runes[i].right])
            bLeft.setProperties(this, i, 'left')
            bRight.setProperties(this, i, 'right')
            buttons.push(bLeft)
            buttons.push(bRight)
            y += hButton + verPadding
        }
        this.buttons = buttons
    }

    mouseInBounds(){
        let d = dist(mousePos.x, mousePos.y, this.pos.x, this.pos.y)
        if(d < this.radius){
            return true
        }
        return false
    }

    update(){
        this.beat = Math.sin(frameCount * 0.1)
        this.trans += 10

        this.setOut()

        this.runeIndexViz = lerp(this.runeIndexViz, this.runeIndex, 0.05)
        if(Math.abs(this.runeIndex - this.runeIndexViz) < 0.01) {
            this.fetch()
        }

        this.handViz = lerp(this.handViz, this.hand, 0.08)
        if(Math.abs(this.runeIndex - this.runeIndexViz) < 0.01) {
            this.fetchHand()
        }

        if(this.energy <= 0){
            this.energy = 0
            this.die()
        }
    }

    die(){
        return
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
        this.energy--
        this.trans = 0
    }

    setOut(){
		let [minX, maxX, minY, maxY] = currentEdges
		this.out = this.pos.x < minX - R_OUT ||
		this.pos.x > maxX + R_OUT || 
		this.pos.y < minY - R_OUT || 
		this.pos.y > maxY + R_OUT
	}

    show(){
        if(this.out) return
        push()
        translate(this.pos.x, this.pos.y)
        noStroke()
        if(this != selectedRuneBook) fill(74, 170, 211, mapp(this.wall, 0, 100, 20, 80))
        else fill(74, 170, 211, mapp(this.beat, -PI, PI, 0, 120))
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
        strokeWeight(this.runeRadius + 5)
        length = 45
        let ang = ((TWO_PI / this.runes.length) * this.handViz) - HALF_PI
        let eX = Math.cos(ang) * length
        let eY = Math.sin(ang) * length
        let sX = Math.cos(ang) * 25
        let sY = Math.sin(ang) * 25
        line(sX, sY, eX, eY)
        strokeWeight(3)
        line(eX, eY, endXHand, endYHand)

        
        let mult = (TWO_PI / this.runes.length)
        for(let i = 0; i < this.runes.length; i++){
            let angle = (mult * i) - HALF_PI
            let endX = Math.cos(angle) * length
            let endY = Math.sin(angle) * length
            let startX = Math.cos(angle) * 25
            let startY = Math.sin(angle) * 25
            strokeWeight(this.runeRadius)
            stroke(80)
            line(startX, startY, endX, endY)
            strokeWeight(mapp(this.runes[i].hp, 0, 100, 0, this.runeRadius))
            stroke('#CE4760')
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

    drawInstructions(){
        push()
        
        fill(255, 0, 0, this.trans)
        noStroke()
        let x = WIDTH + 20
        let y = this.buttons[(Math.floor(this.runeIndex) % this.runes.length) * 2].y + BUT_H * .5
        ellipse(x, y, 20)
        
        fill(220, 0, 0, this.trans)
        rect(x + 17, y - BUT_H * .5 - 3,
            BUT_W * 2 + 16, BUT_H + 6, 12
        )
        pop()
        for(let b of this.buttons) b.show()
    }
}