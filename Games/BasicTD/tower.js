class Tower{
    constructor(pos, gridPos, game){
        this.pos = pos
        this.gridPos = gridPos
        this.game = game
        this.level = 1
        this.id = Tower.globalID++

        this.working = false
        
        this.activity = 0   // sube con la demanda, baja solo
        this.maxPower = 1   // lo que la torre consume cuando su demanda es maxima (deberia ser diferente segun torre)

        this.power = 0 // esto se va cambiando dinamicamente segun el generador conetado
        this.ratio = 0 // usado para indicaciones (supply/demand)
    }

    static globalID = 0

    getPriceToLevelUp(){
        return round(this.price * 1.5)
    }

    levelUp(){
        this.level++
        this.price *= 1.5
        this.maxPower *= 1.2
        this.upgradeProperties()
    }

    renderActivity(){
        push()
        translate(-SIZE_CELL/2, SIZE_CELL/2)
        rectMode(CORNER)
        if(!this.working){
            let t = frameCount % 25 > 12.5 ? 0 : 255
            fill(255, 0, 0, t)
            noStroke()
            rect(this.pos.x, this.pos.y, SIZE_CELL, -SIZE_CELL)
            pop()
            return
        }
        let h = map(this.ratio, 0, LIMIT_RATIO, 5, SIZE_CELL)

        //h = SIZE_CELL
        colorMode(HSB, 255, 255, 255)
        if(this.ratio < 1) fill(map(this.ratio, 0, 0.99, 120, 90), 255, 255)
        else if(this.ratio < LIMIT_RATIO) fill(map(this.ratio, 1, LIMIT_RATIO, 60, 0), 255, 255)
        else fill(0, 255, 255) // es muy raro que caiga aqui
        noStroke()
        rect(this.pos.x+2, this.pos.y-2, SIZE_CELL*0.12, -h+4, 3)
        pop()
    }

    updateActivity(inRange) {
        let target = inRange.length > 0 ? 1 : 0;
        //if(!this.working) target = 0   // asi se pueden recuperar (entonces flashea, no me convence)
        const speed  = target > this.activity ? ACT_ATTACK : ACT_RELEASE;
        this.activity += (target - this.activity) * (1 - Math.exp(-speed * dt));
    }

    currentDemand() {
        const load = Math.min(1, this.activity / FULL_AT);
        return this.maxPower * (IDLE_DRAW + (1 - IDLE_DRAW) * load);
    }
}

class Generator extends Tower{
    constructor(pos, gridPos, game){
        super(pos, gridPos, game)

        this.price = GENERATOR_BASE_PRICE

        this.fireRate = 40
        this.cooldown = this.fireRate

        this.shootAnim = 0
        this.hasShoot = false

        let i = this.gridPos.i*2
        let j = this.gridPos.j*2
        this.oresAvailable = 0
        if(this.game.oreGrid[i][j] == ENERGY_VAL) this.oresAvailable++
        if(this.game.oreGrid[i+1][j] == ENERGY_VAL) this.oresAvailable++
        if(this.game.oreGrid[i][j+1] == ENERGY_VAL) this.oresAvailable++
        if(this.game.oreGrid[i+1][j+1] == ENERGY_VAL) this.oresAvailable++

        this.generates = (GENERATOR_BASE_POWER*.5*this.oresAvailable > 0 ? 1 : 0) + 
                          GENERATOR_BASE_POWER*.5*(this.oresAvailable/4)

        this.supply = this.generates 
        this.demand = 0     

        
    }

    update(){
        this.cooldown -= dt * 0.01
        if(this.cooldown > 0) return

        // give energy to connected towers

        this.hasShoot = true
        this.cooldown = this.fireRate

    }
    
    render(hoveredTowerID){
        // if(this.hasShoot) this.shootAnim = lerp(this.shootAnim, 1, .15)
        // else{
        //     this.shootAnim = 0
        // }
        // if(this.shootAnim > 0.99){
        //     this.shootAnim = 0
        //     this.hasShoot = false
        // }
        push()
        translate(this.pos.x, this.pos.y)
        rotate(frameCount * 0.03 * this.oresAvailable*.5)
        fill(COLOR_GENERATOR)
        stroke(0)
        strokeWeight(2)
        let off = this.hasShoot ? this.shootAnim * 5 : 0
        ellipse(0, 0, SIZE_CELL*0.65-off)
        let m = (SIZE_CELL*0.65-off)*.5
        arc(0, 0-m*.5, m, m, -PI/2, PI/2)
        arc(0, 0+m*.5, m, m, PI/2, -PI/2)
        pop()

        if(hoveredTowerID == this.id){
            push()
            noStroke()
            fill(0)
            textSize(15)
            let txt = 'Supply: ' + this.supply + '\nDemand: ' + round(this.demand * POWER_OFF_RATIO, 2)
            let bbox = textFont().textBounds(txt, this.pos.x, this.pos.y - SIZE_CELL - SIZE_CELL * 0.2)
            fill(0)
            rectMode(CORNER)
            let m = bbox.w/2
            rect(bbox.x-3-m, bbox.y-3, bbox.w+6, bbox.h+6)
            fill(255)
            text(txt, this.pos.x-m, this.pos.y - SIZE_CELL - SIZE_CELL * 0.2)
            pop()
        }
        
    }
}

class Miner extends Tower{
    constructor(pos, gridPos, game){
        super(pos, gridPos, game)
        this.price = MINER_BASE_PRICE

        this.fireRate = 40
        this.cooldown = this.fireRate

        this.shootAnim = 0
        this.hasShoot = false

        this.maxPower = MINER_BASE_POWER

        let i = this.gridPos.i*2
        let j = this.gridPos.j*2
        this.oresAvailable = 0
        if(this.game.oreGrid[i][j] == ORE_VAL) this.oresAvailable++
        if(this.game.oreGrid[i+1][j] == ORE_VAL) this.oresAvailable++
        if(this.game.oreGrid[i][j+1] == ORE_VAL) this.oresAvailable++
        if(this.game.oreGrid[i+1][j+1] == ORE_VAL) this.oresAvailable++
    }

    updateActivity() {
        let target = 1
        const speed  = target > this.activity ? ACT_ATTACK : ACT_RELEASE;
        this.activity += (target - this.activity) * (1 - Math.exp(-speed * dt));
    }

    update(){
        this.cooldown -= dt * 0.01
        if(this.cooldown > 0 || !this.working) return

        if(this.oresAvailable > 0) this.game.addOre(this.oresAvailable, this.pos)

        this.hasShoot = true
        this.cooldown = this.fireRate
    }
    
    render(){
        this.renderActivity()
        if(this.hasShoot) this.shootAnim = lerp(this.shootAnim, 1, .15)
        else{
            this.shootAnim = 0
        }
        if(this.shootAnim > 0.99){
            this.shootAnim = 0
            this.hasShoot = false
        }
        push()
        fill(COLOR_MINER)
        stroke(0)
        strokeWeight(2)
        let off = this.hasShoot ? this.shootAnim * 5 : 0
        ellipse(this.pos.x, this.pos.y, SIZE_CELL*0.65-off)
        drawCross(this.pos.x, this.pos.y, SIZE_CELL*0.65-off-3, (frameCount*.1+this.shootAnim)*(this.working ? 1 : 0)*(this.oresAvailable/4))
        pop()
    }
}

class Shooter extends Tower{
    constructor(pos, gridPos, game){
        super(pos, gridPos, game)
        this.cooldown = 0
        this.shootAnim = 1
        this.lookingTo = 0
    }

    addProjectile(angle){
        this.game.addProjectile({x: this.pos.x + Math.cos(angle) * SIZE_CELL*.5, 
                                y: this.pos.y + Math.sin(angle) * SIZE_CELL*.5}, 
                                angle, 
                                this.projectileOptions, this.drawOptionsProjectile)
    }

    update(){
        this.cooldown -= dt * 0.01
        let inRange = this.game.getEnemiesInRange(this)
        this.updateActivity(inRange)

        if(this.cooldown > 0 || !this.working) return

        inRange.sort((a, b) => (b.pathIndex - a.pathIndex) || (b.t - a.t))

        if (inRange.length > 0) {
            let first = inRange[0]
            let vel = {x: first.pos.x - first.prevPos.x, y: first.pos.y - first.prevPos.y}
            let mag = Math.sqrt(vel.x*vel.x + vel.y+vel.y)
            vel.x /= mag
            vel.y /= mag
            let posCorrected = {
                x: first.pos.x + vel.x * SIZE_CELL*mag,
                y: first.pos.y + vel.y * SIZE_CELL*mag
            }
            let angle = atan2(posCorrected.y - this.pos.y, posCorrected.x - this.pos.x)
            this.lookingTo = angle
            this.addProjectile(angle)
            this.cooldown = this.fireRate
            this.shootAnim = 1
        }
    }

    render(hoveredTowerID){
        this.renderActivity()

        let d = distanceAB({x: mouseX, y: mouseY}, this.pos)
        this.shootAnim = lerp(this.shootAnim, 0, .5)
        push()

        rectMode(CENTER)
        noFill()
        stroke(0)
        strokeWeight(2)
        this.renderTower()

        let t = map(d, 30, this.range + 20, 255, 0)
        if(d < 30) t = 255
        stroke(180, t)
        if(hoveredTowerID == -1) discLinesEllipse({x: this.pos.x, y: this.pos.y}, this.range, this.range)
        else if(hoveredTowerID == this.id) discLinesEllipse({x: this.pos.x, y: this.pos.y}, this.range, this.range)
        pop()

        if(hoveredTowerID == this.id){
            push()
            noStroke()
            fill(0)
            textSize(15)
            let txt = this.getPriceToLevelUp() + CURRENCY_SYMBOL + ' to level up'
            let bbox = textFont().textBounds(txt, this.pos.x, this.pos.y - SIZE_CELL)
            fill(0)
            rectMode(CORNER)
            let m = bbox.w/2
            rect(bbox.x-3-m, bbox.y-3, bbox.w+6, bbox.h+6)
            fill(255)
            text(txt, this.pos.x-m, this.pos.y - SIZE_CELL)
            pop()
        }
    }
}

class Canon extends Shooter{
    constructor(pos, gridPos, game){
        super(pos, gridPos, game)
        this.range = CANON_BASE_RANGE
        this.fireRate = 6
        this.cooldown = 0

        this.price = CANON_BASE_PRICE

        this.projectileOptions = {
            damage: .33,
            maxSpeed: .3,
            pierce: 1,
            acc: .01,
            startSpeed: .001,
            knockback: 0
        }

        this.maxPower = CANON_BASE_POWER
    }

    upgradeProperties(){
        this.projectileOptions.damage += 2
        this.fireRate *= 0.8
    }

    renderTower(){
        drawCanon(this.pos.x, this.pos.y, this.level, this.shootAnim, this.lookingTo)
    }
}

class CrossBow extends Shooter{
    constructor(pos, gridPos, game){
        super(pos, gridPos, game)
        this.price =  CROSSBOW_BASE_PRICE
        this.range = CROSSBOW_BASE_RANGE
        this.fireRate = 10
        this.cooldown = this.fireRate
        this.projectileOptions = {
            damage: .6,
            maxSpeed: .3,
            pierce: 5,
            acc: .01,
            startSpeed: .001,
            knockback: .25
        }

        this.maxPower = CROSSBOW_BASE_POWER
    }

    upgradeProperties(){
        this.projectileOptions.damage += .3
        this.pierce++
        this.fireRate *= 0.9
    }

    renderTower(){
        drawCrossBow(this.pos.x, this.pos.y, this.level, this.shootAnim, this.lookingTo)
    }
}

class Bomber extends Shooter{
    constructor(pos, gridPos, game){
        super(pos, gridPos, game)
        this.price = BOMBER_BASE_PRICE
        this.range = BOMBER_BASE_RANGE
        this.fireRate = 25
        this.cooldown = this.fireRate
        this.projectileOptions = {
            damage: .6,
            maxSpeed: .1,
            pierce: 1,
            acc: .005,
            startSpeed: .0005,
            knockback: .25,

            onDeath: 'bomb',
            onDeathOptions:{
                damage: 1
            }
        }

        this.drawOptionsProjectile = {
            rad: 12
        }

        this.maxPower = BOMBER_BASE_POWER
    }

    addProjectile(angle){
        this.game.addProjectile({x: this.pos.x + Math.cos(angle) * SIZE_CELL*.5, 
                                y: this.pos.y + Math.sin(angle) * SIZE_CELL*.5}, 
                                angle, 
                                this.projectileOptions, this.drawOptionsProjectile)
    }

    upgradeProperties(){
        this.projectileOptions.onDeathOptions.damage *= 2
        this.fireRate -= 3.5
    }

    renderTower(){
        drawBomber(this.pos.x, this.pos.y, this.level, this.shootAnim, this.lookingTo)
    }
}