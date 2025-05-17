const RAD_RUNEBOOK = 80
const R_OUT = RAD_RUNEBOOK + 50
const BUT_W = 110
const BUT_H = 25

const SQ_BOTH_RADII = (RAD_RUNEBOOK + R_PART) * (RAD_RUNEBOOK + R_PART)

let startingRunes = [
    [4, 3],
    [5, 4],
    [4, 5],
    [0, 1],
    [3, 0],
    [3, 0]
]

class RuneBook{
    constructor(x, y){
        this.runes = Array.from({ length: startingRunes.length }, (_, i) => new Rune(startingRunes[i][0], startingRunes[i][1]));
        //this.runes = Array.from({ length: Math.floor(Math.random() * 14 + 1) }, () => new Rune());
        this.runeIndex = 0
        this.runeIndexViz = this.runeIndex   //future
        this.pos = createVector(x, y)
        this.oldPos = this.pos.copy()

        this.shield = 100       //shield hp
        this.energy = 100       //energy

        this.radius = RAD_RUNEBOOK
        this.runeRadius = mapp(this.runes.length, 1, 15, 15, 9)

        this.hand = 0
        this.handViz = this.hand
        this.radiusHand = RAD_RUNEBOOK - 15
        this.handSide = 'INWARD'
        this.handTrans = [255, 0]
        this.handTransGoing = 'INWARD'

        this.trans = 255

        this.out = false
        this.beat = 0

        this.id = null
        this.attackShow = null
        this.dead = false

        this.memory = [[6, 8], [6, 8], [6, 8]]

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
            let bLeft = new Button(x, y, wButton, hButton, this.runes[i].getText('left'), LEFT_RUNES_COLS[this.runes[i].left])
            let bRight = new Button(x + wButton + horPadding, y, wButton, hButton, this.runes[i].getText('right'), RIGHT_RUNES_COLS[this.runes[i].right])
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

    checkForFood(){
        for(let fp of foodParticles){
            if(squaredDistance(this.pos.x, this.pos.y, fp.pos.x, fp.pos.y) < SQ_BOTH_RADII){
                return fp
            }
        }
        return false
    }

    checkForShard(){
        for(let sp of attackParticles){
            if(squaredDistance(this.pos.x, this.pos.y, sp.pos.x, sp.pos.y) < SQ_BOTH_RADII){
                return sp
            }
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
        if(this.shield <= 0){
            this.shield = 0
            this.die()
        }
        this.shield = constrain(this.shield, 0, 100)
        this.energy = constrain(this.energy, 0, 100)
    }

    die(){
        this.dead = true
    }

    hit(){
        this.shield--
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
        if(this.runes.length == 0) return
        this.runeIndexViz = this.runeIndex
        this.runeIndex++
        let rune = this.runes[this.runeIndex % this.runes.length]
        let result = rune.execute()
        let left, right
        if(result != undefined){
            left = result[0]
            right = result[1]
        }
        if(left == 'ABSORB' && right == 'MANA'){
            let food = this.checkForFood()
            if(food){
                this.energy += (100 - this.energy) * 0.3
                this.attackShow = {
                    pos: food.pos.copy(),
                    timer: 30
                }
                food.die()
            }
        }
        else if(left == 'ATTACK'){
            if(right == 'SHARD'){
                let shard = this.checkForShard()
                if(shard){
                    this.attackShow = {
                        pos: shard.pos.copy(),
                        timer: 30
                    }
                    shard.die()
                }
            }
            else if(right == 'MANA'){
                let food = this.checkForFood()
                if(food){
                    this.attackShow = {
                        pos: food.pos.copy(),
                        timer: 30
                    }
                    food.die()
                }
            }
            else if(right == 'SHIELD'){
                this.shield -= 10
            }
            else if(right == 'SPELL'){
                let index = this.hand
                this.runes.splice(index, 1)
                this.runeIndex = indexOf(rune, this.runes)
                this.createButtons()
            }
        }
        else if(left == 'REPAIR'){
            if(right == 'SHIELD'){
                this.shield += (100 - this.shield) * 0.3
            }
            if(right == 'SPELL'){
                this.runes[this.hand].repair()
            }

        }
        else if(left == 'GO TO'){
            if(right == 'WEAK'){
                let index = this.getWeakestRune()
                this.moveHand(index)
            }
            else if(right.includes('RPOS')){
                let from = rune.startPos
                let to = rune.endPos
                if(from == to){
                    this.moveHand((from + this.hand) % this.runes.length)
                }
            }
            else if(right == 'INWARD'){
                this.handSide = 'INWARD'
                this.handTransGoing = 'INWARD'
            }
            else if(right == 'OUTWARD'){
                this.handSide = 'OUTWARD'
                this.handTransGoing = 'OUTWARD'
            }
        }
        else if(left == 'WRITE'){
            if(this.handSide == 'INWARD'){
                //write the memory to its runes
                if(right.includes('RPOS')){
                    let from = rune.startPos
                    let to = rune.endPos
                    if(from == to){
                        //introduce the runes of the memory into this.runes at the position of the hand
                        let newRunes = this.getNewRunesFromMemory()
                        let index = mod(from + this.hand + 1, this.runes.length)
                        console.log(index)
                        this.runes = insertAtIndex(index, this.runes, newRunes)
                        this.runeIndex = indexOf(rune, this.runes)
                        this.createButtons()
                    }
                }
            }
        }
        this.energy--
        this.trans = 0
    }

    getNewRunesFromMemory(){
        let newRunes = []
        for(let i = 0; i < this.memory.length; i++){
            newRunes.push(new Rune(this.memory[i][0], this.memory[i][1]))
        }
        return newRunes
    }

    getWeakestRune(){
        let min = 100
        let index = -1
        for(let i = 0; i < this.runes.length; i++){
            if(this.runes[i].hp < min){
                min = this.runes[i].hp
                index = i
            }
        }
        return index
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

        if(this.handTransGoing == 'INWARD') this.handTrans[0] = lerp(this.handTrans[0], 255, 0.1)
        else this.handTrans[0] = lerp(this.handTrans[0], 0, 0.1)
        if(this.handTransGoing == 'OUTWARD') this.handTrans[1] = lerp(this.handTrans[1], 255, 0.1)
        else this.handTrans[1] = lerp(this.handTrans[1], 0, 0.1)

        push()
        translate(this.pos.x, this.pos.y)
        noStroke()
        if(this != selectedRuneBook) fill(74, 170, 211, mapp(this.shield, 0, 100, 20, 80))
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


        // inward hand
        if(this.handTrans[0] > 1){
            length = 45
            stroke(248, 150, 30, this.handTrans[0])
            strokeWeight(this.runeRadius + 5)
            let ang = ((TWO_PI / this.runes.length) * this.handViz) - HALF_PI
            let eX = Math.cos(ang) * length
            let eY = Math.sin(ang) * length
            let sX = Math.cos(ang) * 25
            let sY = Math.sin(ang) * 25
            line(sX, sY, eX, eY)
            strokeWeight(3)
            line(eX, eY, endXHand, endYHand)
        }
        
        // outward hand
        if(this.handTrans[1] > 1){
            length = 30
            stroke(248, 150, 30, this.handTrans[1])
            strokeWeight(this.runeRadius + 5)
            let ang = ((TWO_PI / this.runes.length) * this.handViz) - HALF_PI
            let eX = Math.cos(ang) * length + endXHand
            let eY = Math.sin(ang) * length + endYHand
            strokeWeight(3)
            line(eX, eY, endXHand, endYHand)
            fill(248, 150, 30, this.handTrans[1])
            noStroke()
            ellipse(eX, eY, 10)
        }
        

        length = 45
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
        strokeWeight(mapp(this.shield, 0, 100, 0, 5))
        ellipse(0, 0, this.radius * 2)

        pop()

        if(this.attackShow){
            this.attackShow.timer = lerp(this.attackShow.timer, 0, 0.1)
            stroke(249, 175, 55, mapp(this.attackShow.timer, 0, 60, 0, 255))
            strokeWeight(3)
            line(endXHand + this.pos.x, endYHand + this.pos.y, this.attackShow.pos.x, this.attackShow.pos.y)
            if(this.attackShow.timer < 0.1){
                this.attackShow = null
            }
        }
    }

    drawInstructions(){
        if(this.runes.length == 0) return
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

        fill(248, 150, 30)
        y = this.buttons[(Math.floor(this.hand) % this.runes.length) * 2].y + BUT_H * .5
        ellipse(x, y, 10)
        pop()
        for(let b of this.buttons) b.show()
    }
}

function insertAtIndex(startIndex, original, auxiliary) {
    return [
        ...original.slice(0, startIndex),
        ...auxiliary,
        ...original.slice(startIndex)
    ];
}

function indexOf(rune, runesArray) {
    for (let i = 0; i < runesArray.length; i++) {
        if (runesArray[i] === rune) {
            return i;
        }
    }
    return -1;
}