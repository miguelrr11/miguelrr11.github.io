// BUG: se crashea cuando un rune se muere y justo el hand está en ese rune:
/*
Unhandled Promise Rejection: TypeError: undefined is not an object (evaluating 'this.runes[this.runeIndex % this.runes.length].getText')
*/

const RAD_RUNEBOOK = 80
const R_OUT = RAD_RUNEBOOK + 50
const RAD_NUCLEUS = 15
const BUT_W = 110
const BUT_H = 25
const MAX_SHIELD = 100
const MANA_COST = 1.5

const SQ_BOTH_RADII = (RAD_RUNEBOOK + R_PART) * (RAD_RUNEBOOK + R_PART)
const SQ_URB_RB_RADII = (RAD_RUNEBOOK + RAD_NUCLEUS) * (RAD_RUNEBOOK + RAD_NUCLEUS)

let startingRunes = [
    [5, 7],
    [4, 3],
    [5, 6],
    [5, 4],
    [4, 5],
    [0, 1],
    [3, 0],
    [3, 0]
]

// let startingRunes = [
//     [5, 7]
// ]

class RuneBook{
    constructor(x, y){
        this.runes = Array.from({ length: startingRunes.length }, (_, i) => new Rune(startingRunes[i][0], startingRunes[i][1]));
        //this.runes = Array.from({ length: Math.floor(Math.random() * 34 + 1) }, () => new Rune());
        //this.runes = Array.from({ length: Math.floor(Math.random() * 34 + 1) }, (_, i) => new Rune(Math.random() > 0.5 ? 5 : 6, 2, -Math.floor(Math.random() * 15) - 1, Math.floor(Math.random() * 15) - 1));
        this.runeIndex = Math.floor(Math.random() * this.runes.length)
        this.runeIndexViz = this.runeIndex   //future
        this.pos = createVector(x, y)
        this.oldPos = this.pos.copy()

        this.shield = MAX_SHIELD        //shield hp
        this.energy = 100               //energy
        this.goalShield = this.shield
        this.goalEnergy = this.energy

        this.radius = RAD_RUNEBOOK
        this.runeRadius = mapp(this.runes.length, 1, 15, 15, 10, true)

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
        this.deadCounter = -1
        this.dead = false

        this.memory = []

        this.buttonHeight = BUT_H
        this.createButtons()
    }

    setRunesWidth(){
        this.runeRadius = Math.max(3, mapp(this.runes.length, 1, 15, 15, 10, true));
    }

    createButtons() {
        const MAX_RUNES = 13;
        let buttons = [];
        let wButton = BUT_W;
        let hButton = BUT_H;   
        let horPadding = 10;
        let verPadding = 10;
        let x = WIDTH + 40;

        const totalRunes = this.runes.length + 2;

        const yStart = RUNES_SELECTED_Y + verPadding;
        const yEnd = HEIGHT - verPadding;
        const availableHeight = yEnd - yStart;

        if (totalRunes > MAX_RUNES) {
            const totalWeight = (2.5 * totalRunes + (totalRunes - 1))
            verPadding = availableHeight / totalWeight
            hButton = 2.5 * verPadding
            this.buttonHeight = hButton
        }

        let y = RUNES_SELECTED_Y + verPadding;

        for (let i = 0; i < totalRunes - 2; i++) {
            const bLeft = new Button(x, y, wButton, hButton, this.runes[i].getText('left'), LEFT_RUNES_COLS[this.runes[i].left]);
            const bRight = new Button(x + wButton + horPadding, y, wButton, hButton, this.runes[i].getText('right'), RIGHT_RUNES_COLS[this.runes[i].right]);
            bLeft.setProperties(this, i, 'left');
            bRight.setProperties(this, i, 'right');
            buttons.push(bLeft);
            buttons.push(bRight);
            y += hButton + verPadding;
        }
        const bNewRune = new NewRuneButton(x, y, wButton * 2 + horPadding, hButton, 'NEW RUNE', [50]);
        bNewRune.setProperties(this);
        bNewRune.setFunc(() => {
            this.runes.push(new Rune(LEFT_RUNES.length - 1, RIGHT_RUNES.length - 1))
            this.createButtons()
        })
        buttons.push(bNewRune);
        y += hButton + verPadding;

        const bDeleteRune = new NewRuneButton(x, y, wButton * 2 + horPadding, hButton, 'DELETE RUNE', [50]);
        bDeleteRune.setProperties(this);
        bDeleteRune.setFunc(() => {
            if(selectedButton){
                let index = indexOf(selectedButton.runebook.runes[selectedButton.runeIndex], selectedButton.runebook.runes)
                if(index != -1 && this.runes.length > 1){
                    this.runes.splice(index, 1)
                    this.runeIndex = indexOf(this.runes[this.runeIndex % this.runes.length], this.runes)
                    selectedButton = undefined
                }
                else if(index != -1 && this.runes.length == 1){
                    this.runes[0].left = LEFT_RUNES.length - 1
                    this.runes[0].right = RIGHT_RUNES.length - 1
                    this.runeIndex = 0
                    selectedButton = undefined
                }
            }
            this.createButtons()
        })
        buttons.push(bDeleteRune);

        this.buttons = buttons;
    }

    hasNoneLast(){
        if(this.runes.length == 0) return false
        let lastRune = this.runes[this.runes.length - 1]
        if(lastRune.left == LEFT_RUNES.length - 1 && lastRune.right == RIGHT_RUNES.length - 1){
            return true
        }
        return false
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

        this.shield = lerp(this.shield, this.goalShield, 0.05)
        this.energy = lerp(this.energy, this.goalEnergy, 0.05)

        this.setOut()

        this.runeIndexViz = lerp(this.runeIndexViz, this.runeIndex, 0.05)
        if(Math.abs(this.runeIndex - this.runeIndexViz) < 0.01) {
            this.fetch()
        }

        this.handViz = lerp(this.handViz, this.hand, 0.08)
        if(Math.abs(this.runeIndex - this.runeIndexViz) < 0.01) {
            this.fetchHand()
        }

        if(this.goalEnergy <= 0.1){
            this.goalEnergy = 0
            this.die()
        }
        if(this.goalShield <= 0.1){
            this.shield = 0
            this.die()
        }
        this.goalShield = constrain(this.goalShield, 0, MAX_SHIELD)
        this.goalEnergy = constrain(this.goalEnergy, 0, 100)
    }

    die(){
        if(this.deadCounter == -1) this.deadCounter = 60 * 2
    }

    hit(){
        this.goalShield--
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
        let [left, right] = rune.execute()
        if(left == 'ABSORB'){
            if(right == 'MANA'){
                let food = this.checkForFood()
                if(food){
                    this.goalEnergy += (100 - this.goalEnergy) * 0.3
                    this.attackShow = {
                        pos: food.pos.copy(),
                        timer: 30
                    }
                    food.die()
                }
            }
        }
        else if(left == 'ATTACK'){
            if(right == 'SHARD' && this.handSide == 'INWARD'){
                let shard = this.checkForShard()
                if(shard){
                    this.attackShow = {
                        pos: shard.pos.copy(),
                        timer: 30
                    }
                    shard.die()
                }
            }
            else if(right == 'MANA' && this.handSide == 'INWARD'){
                let food = this.checkForFood()
                if(food){
                    this.attackShow = {
                        pos: food.pos.copy(),
                        timer: 30
                    }
                    food.die()
                }
            }
            else if(right == 'SHIELD' && this.handSide == 'OUTWARD'){
                this.goalShield -= 10
            }
            else if(right == 'SPELL' && this.handSide == 'INWARD'){
                let index = this.hand
                this.runes.splice(index, 1)
                this.runeIndex = indexOf(rune, this.runes)
                this.createButtons()
            }
        }
        else if(left == 'REPAIR'){
            if(right == 'SHIELD' && this.handSide == 'OUTWARD'){
                this.goalShield += (MAX_SHIELD - this.goalShield) * 0.3
            }
            if(right == 'SPELL' && this.handSide == 'INWARD'){
                this.runes[this.hand].repair()
            }

        }
        else if(left == 'GO TO'){
            if(right == 'WEAK' && this.handSide == 'INWARD'){
                let index = this.getWeakestRune()
                this.moveHand(index)
            }
            else if(right == 'RPOS'){
                let from = rune.from
                let to = rune.to
                if(from == to){
                    this.moveHand((from + this.runeIndex) % this.runes.length)
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
                if(right == 'RPOS'){
                    let from = rune.from
                    let to = rune.to
                    if(from == to){
                        //introduce the runes of the memory into this.runes at the position of the hand
                        let newRunes = this.getNewRunesFromMemory()
                        let index = mod(from + this.runeIndex + 1, this.runes.length)
                        this.runes = insertAtIndex(index, this.runes, newRunes)
                        this.runeIndex = indexOf(rune, this.runes)
                        this.setRunesWidth()
                        this.createButtons()
                    }
                }
            }
            else if(this.handSide == 'OUTWARD' && this.memory.length > 0){
                let newUrb = new URB(0, 0)
                newUrb.runes = this.getNewRunesFromMemory()
                let angle = random(TWO_PI)
                newUrb.angle = angle
                let x = this.pos.x + Math.cos(newUrb.angle) * (this.radius + 20)
                let y = this.pos.y + Math.sin(newUrb.angle) * (this.radius + 20)
                newUrb.vel = createVector(Math.cos(newUrb.angle), Math.sin(newUrb.angle))
                newUrb.vel.mult(1.5)
                newUrb.angle = Math.atan2(newUrb.vel.y, newUrb.vel.x) + HALF_PI
                newUrb.pos = createVector(x, y)
                urbs.push(newUrb)
            }
        }
        else if(left == 'READ'){
            if(this.handSide == 'INWARD'){
                if(right == 'RPOS'){
                    let from = rune.from
                    let to = rune.to
                    this.memory = copyRunesToMemory(this.runes, this.runeIndex, from, to)
                }
            }
        }
        else if(left == 'LOOP'){
            if(this.handSide == 'INWARD'){
                if(right == 'RPOS'){
                    let from = rune.from  //relative position which the loop starts (only negative values)
                    let to = rune.to      
                    if(from < 0){
                        if(to == 0){
                            rune.restoreLoop()
                        }
                        else{
                            this.runeIndex = mod(from + this.runeIndex - 1, this.runes.length)
                            rune.doIter()
                        }
                        this.createButtons()   //just to update the text of rel pos (lower n iter)
                    }
                }
            }
        }
        this.goalEnergy -= MANA_COST
        this.trans = 0
    }

    getNewRunesFromMemory(){
        let newRunes = []
        for(let i = 0; i < this.memory.length; i++){
            let newRune = new Rune(this.memory[i][0], this.memory[i][1], this.memory[i][2], this.memory[i][3])
            newRunes.push(newRune)
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

    setDead(){
        this.dead = true
        let mult = (TWO_PI / this.runes.length)
        for(let i = 0; i < this.runes.length; i++){
            let angle = (mult * i)
            let par = new AttackParticle(this.pos.x, this.pos.y)
            par.vel = createVector(Math.cos(angle), Math.sin(angle))
            attackParticles.push(par)
        }
    }

    isRepairingSpell(i){
        return this.runes[this.runeIndex % this.runes.length].getText('right') == 'SPELL' && 
               this.runes[this.runeIndex % this.runes.length].getText('left') == 'REPAIR' && 
               this.handSide == 'INWARD' &&
               this.hand == i
    }

    isRepairingShield(){
        return this.runes[this.runeIndex % this.runes.length].getText('right') == 'SHIELD' && 
               this.runes[this.runeIndex % this.runes.length].getText('left') == 'REPAIR' && 
               this.handSide == 'OUTWARD'
    }

    show(){
        if(this.out) return

        if(this.handTransGoing == 'INWARD') this.handTrans[0] = lerp(this.handTrans[0], 255, 0.1)
        else this.handTrans[0] = lerp(this.handTrans[0], 0, 0.1)
        if(this.handTransGoing == 'OUTWARD') this.handTrans[1] = lerp(this.handTrans[1], 255, 0.1)
        else this.handTrans[1] = lerp(this.handTrans[1], 0, 0.1)

        let transDead = 255
        if(this.deadCounter > 0){
            let vel = 0.05
            this.deadCounter = lerp(this.deadCounter, 0, vel)
            this.radius = lerp(this.radius, 0, vel)
            this.radiusHand = lerp(this.radiusHand, 0, vel)
            this.handTrans[0] = lerp(this.handTrans[0], 0, vel)
            this.handTrans[1] = lerp(this.handTrans[1], 0, vel)
            transDead = mapp(this.deadCounter, 0, 60 * 2, 0, 255)
        }
        if(this.deadCounter <= 1 && this.deadCounter > 0) this.setDead()

        push()
        translate(this.pos.x, this.pos.y)
        noStroke()
        if(this != selectedRuneBook) fill(74, 170, 211, mapp(this.shield, 0, MAX_SHIELD, 20, 80))
        else fill(74, 170, 211, mapp(this.beat, -PI, PI, 0, 120))
        ellipse(0, 0, this.radius * 2)

        push()
        noFill()
        stroke(249, 175, 55, transDead)
        strokeWeight(3)
        ellipse(0, 0, this.radiusHand * 2)
        let angleHand = ((TWO_PI / this.runes.length) * this.handViz) - HALF_PI
        let length = this.radiusHand
        if(this.deadCounter > 0) length = mapp(this.deadCounter, 0, 60 * 2, 0, this.radiusHand)
        let endXHand = Math.cos(angleHand) * length
        let endYHand = Math.sin(angleHand) * length
        noStroke()
        fill(248, 150, 30, transDead)
        translate(endXHand, endYHand)
        rotate(angleHand+0.8)
        rectMode(CENTER)
        rect(0, 0, 10, 10)
        pop()


        // inward hand
        if(this.handTrans[0] > 1){
            length = 45
            let length2 = 25
            if(this.deadCounter > 0) length2 = mapp(this.deadCounter, 0, 60 * 2, 0, 25)
            if(this.deadCounter > 0) length = mapp(this.deadCounter, 0, 60 * 2, 0, 45)
            stroke(248, 150, 30, this.handTrans[0])
            strokeWeight(this.runeRadius + 5)
            let ang = ((TWO_PI / this.runes.length) * this.handViz) - HALF_PI
            let eX = Math.cos(ang) * length
            let eY = Math.sin(ang) * length
            let sX = Math.cos(ang) * length2
            let sY = Math.sin(ang) * length2
            line(sX, sY, eX, eY)
            strokeWeight(3)
            line(eX, eY, endXHand, endYHand)
        }
        
        // outward hand
        if(this.handTrans[1] > 1){
            length = 30
            if(this.deadCounter > 0) length = mapp(this.deadCounter, 0, 60 * 2, 0, 30)
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
        let length2 = 25
        if(this.deadCounter > 0) length2 = mapp(this.deadCounter, 0, 60 * 2, 0, 25)
        if(this.deadCounter > 0) length = mapp(this.deadCounter, 0, 60 * 2, 0, 45)
        let mult = (TWO_PI / this.runes.length)
        for(let i = 0; i < this.runes.length; i++){
            let angle = (mult * i) - HALF_PI
            let endX = Math.cos(angle) * length
            let endY = Math.sin(angle) * length
            let startX = Math.cos(angle) * length2
            let startY = Math.sin(angle) * length2
            strokeWeight(this.runeRadius)
            stroke(80, transDead)
            line(startX, startY, endX, endY)
            strokeWeight(mapp(this.runes[i].hp, 0, 100, 0, this.runeRadius))
            stroke(206, 71, 96, transDead)
            if(this.isRepairingSpell(i)) stroke(206, 71, 96, mapp(this.beat, -PI, PI, 0, 255))
            line(startX, startY, endX, endY)
            this.runes[i].show(startX, startY, endX, endY, transDead)
        }

        fill(80, transDead)
        noStroke()
        ellipse(0, 0, 30)
        fill(255, 30, 80, transDead)
        let angle = ((TWO_PI / this.runes.length) * this.runeIndexViz) - HALF_PI
        length = 9
        if(this.deadCounter > 0) length = mapp(this.deadCounter, 0, 60 * 2, 0, 9)
        let endX = Math.cos(angle) * length
        let endY = Math.sin(angle) * length
        ellipse(endX, endY, 8)

        noFill()
        stroke(74, 170, 211, transDead)
        if(this.isRepairingShield()) stroke(74, 170, 211, mapp(this.beat, -PI, PI, 0, 255))
        strokeWeight(mapp(this.shield, 0, MAX_SHIELD, 0, 5))
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
        if(this.constructor.name == 'URB'){
            this.showLoops()
            for(let b of this.buttons) b.show()
            return
        }
        push()
        
        fill(255, 0, 0, this.trans)
        noStroke()
        let x = WIDTH + 20
        let y = this.buttons[(Math.floor(this.runeIndex) % this.runes.length) * 2].y + this.buttonHeight * .5
        ellipse(x, y, 20)
        
        fill(220, 0, 0, this.trans)
        rect(x + 17, y - this.buttonHeight * .5 - 3,
            BUT_W * 2 + 16, this.buttonHeight + 6, 12
        )

        fill(248, 150, 30)
        y = this.buttons[(Math.floor(this.hand) % this.runes.length) * 2].y + this.buttonHeight * .5
        ellipse(x, y, 14)

        fill(10, 215, 40)
        for(let i = 0; i < this.runes.length; i++){
            if(this.runes[i].artificial){
                let y = this.buttons[(Math.floor(i) % this.runes.length) * 2].y + this.buttonHeight * .5
                push()
                translate(x, y)
                rotate(0.8) 
                rectMode(CENTER)
                rect(0, 0, 8, 8)
                pop()
            }
        }
        pop()
        this.showLoops()
        for(let b of this.buttons) b.show()
        
    }

    showLoops() {
        const loops = [];
        const n = this.runes.length;
        for(let i = 0; i < n; i++) {
            const r = this.runes[i];
            if(LEFT_RUNES[r.left] === 'LOOP' && RIGHT_RUNES[r.right] === 'RPOS' && r.from < 0) {
                const idx = mod(r.from + i, n);
                const y1 = this.buttons[mod(i, n) * 2].y + this.buttonHeight * 0.5;
                const y2 = this.buttons[mod(idx, n) * 2].y + this.buttonHeight * 0.5;
                loops.push({
                    from: y1,
                    to: y2,
                    color: RIGHT_RUNES_COLS[this.runes[idx].right]
                });
            }
        }
        if(!loops.length) return;
        const btn = this.buttons[1];
        const edgeX = btn.x + btn.w;
        const baseX = edgeX + 10;
        // first: draw and remove any zero-length loops
        const normalLoops = [];
        loops.forEach(l => {
            if(l.from === l.to) {
                // just a short horizontal, one “spacing” out and back
                const spacing = 25;
                strokeWeight(3.5);
                stroke(arrayColorToP2color(getColorByWord('RPOS')));
                line(edgeX, l.from, edgeX + spacing, l.from);
                stroke(l.color);
                line(edgeX + spacing, l.from, edgeX, l.from);
            }
            else {
                normalLoops.push(l);
            }
        });
        if(!normalLoops.length) return;
        // assign each normal loop a “column” to avoid overlap
        const ends = [];
        normalLoops.forEach(l => {
            const start = Math.min(l.from, l.to),
                end = Math.max(l.from, l.to);
            const ci = ends.findIndex(e => e <= start);
            if(ci < 0) {
                ends.push(end);
                l.column = ends.length - 1;
            }
            else {
                ends[ci] = end;
                l.column = ci;
            }
        });
        const spacing = 25 / ends.length;
        const radius = Math.min(10, this.runeRadius);
        const diameter = radius * 2;
        push();
        noFill();
        strokeWeight(3.5);
        const rposCol = arrayColorToP2color(getColorByWord('RPOS'));
        normalLoops.forEach(({
            from,
            to,
            color,
            column
        }) => {
            const x = baseX + column * spacing;
            const centerX = x - radius;
            // trim the vertical line ends
            const f = from > to ? from - radius : from + radius;
            const t = from > to ? to + radius : to - radius;
            // vertical “loop” line
            stroke(color);
            gradientLine(x, f, x, t, [rposCol, arrayColorToP2color(color)]);
            // quarter-arcs
            stroke(rposCol);
            if(from > to) {
                arc(centerX, from - radius, diameter, diameter, 0, HALF_PI);
            }
            else {
                arc(centerX, from + radius, diameter, diameter, -HALF_PI, 0);
            }
            stroke(color);
            if(from > to) {
                arc(centerX, to + radius, diameter, diameter, -HALF_PI, 0);
            }
            else {
                arc(centerX, to - radius, diameter, diameter, 0, HALF_PI);
            }
            // horizontals back to the button
            stroke(rposCol);
            line(centerX, from, edgeX, from);
            stroke(color);
            line(centerX, to, edgeX, to);
        });
        pop();
    }

}

function arrayColorToP2color(arr) {
    if(arr[3] != undefined) return color(arr[0], arr[1], arr[2], arr[3]);
    if(arr[2] != undefined) return color(arr[0], arr[1], arr[2]);
    if(arr[1] != undefined) return color(arr[0], arr[1]);
    return color(arr[0]);
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

function copyRunesToMemory(runes, hand, relPosStart, relPosEnd) {
    const len = runes.length;
    const result = [];
    for (let i = relPosStart; i <= relPosEnd; i++) {
        const index = (hand + i + len) % len;
        result.push([runes[index].left, runes[index].right, runes[index].from, runes[index].to]);
    }
    return result;
}

class URB extends RuneBook{
    constructor(x, y){
        super(x, y)
        this.runes = [new Rune(LEFT_RUNES.length - 1, RIGHT_RUNES.length - 1)]
        this.runeIndex = 0
        this.createButtons()

        this.vel = createVector(0, 0)
        this.angle = 0

        this.name = undefined
    }

    dupe(){
        let newUrb = new URB(this.pos.x, this.pos.y)
        newUrb.runes = this.runes.map(rune => new Rune(rune.left, rune.right, rune.from, rune.to));
        newUrb.runeIndex = this.runeIndex
        newUrb.hand = this.hand
        newUrb.handSide = this.handSide
        newUrb.handTrans = [...this.handTrans]
        newUrb.radius = this.radius
        newUrb.radiusHand = this.radiusHand
        newUrb.vel = this.vel.copy()
        newUrb.angle = this.angle
        return newUrb
    }

    update(){
        this.pos.add(this.vel)
        this.edges()
        this.checkCollisionRuneBooks()
    }

    checkCollisionRuneBooks(){
        for(let rb of runeBooks){
            if(rb && squaredDistance(this.pos.x, this.pos.y, rb.pos.x, rb.pos.y) < SQ_URB_RB_RADII){
                inyectRunes(this, rb)
            }
        }
    }

    edges(){
        let minX = minPos.x  
        let maxX = maxPos.x
        let minY = minPos.y
        let maxY = maxPos.y
        let r = this.radius
        if(this.pos.x < minX + r) {
            this.pos.x = maxX - r
        }
        else if(this.pos.x > maxX - r) {
            this.pos.x = minX + r
        }
        if(this.pos.y < minY + r) {
            this.pos.y = maxY - r
        }
        else if(this.pos.y > maxY - r) {
            this.pos.y = minY + r
        }
    }

    show(){
        if(this.out) return

        let transDead = 255

        push()
        translate(this.pos.x, this.pos.y)
        rotate(this.angle)

        let length = 45
        let length2 = 25
        let mult = (TWO_PI / this.runes.length)
        for(let i = 0; i < this.runes.length; i++){
            let angle = (mult * i) - HALF_PI
            let endX = Math.cos(angle) * length
            let endY = Math.sin(angle) * length
            let startX = Math.cos(angle) * length2
            let startY = Math.sin(angle) * length2
            strokeWeight(this.runeRadius)
            stroke(80, transDead)
            line(startX, startY, endX, endY)
            strokeWeight(mapp(this.runes[i].hp, 0, 100, 0, this.runeRadius))
            stroke(206, 71, 96, transDead)
            line(startX, startY, endX, endY)
            this.runes[i].show(startX, startY, endX, endY, transDead)
        }
        fill(80, transDead)
        noStroke()
        ellipse(0, 0, RAD_NUCLEUS * 2)
        pop()

    }
}