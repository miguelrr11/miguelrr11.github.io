class Tower{
    constructor(pos, gridPos, game){
        this.pos = pos
        this.gridPos = gridPos
        this.game = game
        this.level = 1
    }
}

class Miner extends Tower{
    constructor(pos, gridPos, game){
        super(pos, gridPos, game)

        this.fireRate = 40
        this.cooldown = this.fireRate

        this.shootAnim = 0
        this.hasShoot = false
    }

    update(){
        this.cooldown -= dt * 0.01
        if(this.cooldown > 0) return

        let i = this.gridPos.i*2
        let j = this.gridPos.j*2
        let count = 0
        if(this.game.oreGrid[i][j] == 1) count++
        if(this.game.oreGrid[i+1][j] == 1) count++
        if(this.game.oreGrid[i][j+1] == 1) count++
        if(this.game.oreGrid[i+1][j+1] == 1) count++

        if(count > 0) this.game.addOre(count, this.pos)

        this.hasShoot = true
        this.cooldown = this.fireRate

    }
    
    render(){
        if(this.hasShoot) this.shootAnim = lerp(this.shootAnim, 1, .15)
        else{
            this.shootAnim = 0
        }
        if(this.shootAnim > 0.99){
            this.shootAnim = 0
            this.hasShoot = false
        }
        push()
        noFill()
        stroke(0)
        strokeWeight(2)
        let off = this.hasShoot ? this.shootAnim * 5 : 0
        ellipse(this.pos.x, this.pos.y, SIZE_CELL*0.65-off)
        drawCross(this.pos.x, this.pos.y, SIZE_CELL*0.65-off*2.5, (frameCount*.1+this.shootAnim))
        pop()
    }
}

class Canon extends Tower{
    constructor(pos, gridPos, game){
        super(pos, gridPos, game)
        this.range = CANON_BASE_RANGE
        this.fireRate = 6
        this.cooldown = 0

        this.projectileOptions = {
            damage: 1,
            maxSpeed: .3,
            pierce: 1,
            acc: .01,
            startSpeed: .001,
            knockback: 0
        }

        this.shootAnim = 1
        this.lookingTo = 0
    }

    levelUp(){
        this.level++
        this.projectileOptions.damage += 2
        this.fireRate *= 0.8
    }

    addProjectile(angle){
        this.game.addProjectile({x: this.pos.x + Math.cos(angle) * SIZE_CELL*.5, 
                                y: this.pos.y + Math.sin(angle) * SIZE_CELL*.5}, 
                                angle, 
                                this.projectileOptions, this.drawOptionsProjectile)
    }

    update(){
        this.cooldown -= dt * 0.01
        if(this.cooldown > 0) return

        let inRange = this.game.getEnemiesInRange(this)
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
            let angle =  atan2(posCorrected.y - this.pos.y, posCorrected.x - this.pos.x)
            this.lookingTo = angle
            this.addProjectile(angle)
            this.cooldown = this.fireRate
            this.shootAnim = 1
        }
    
    }

    render(){
        let d = distanceAB({x: mouseX, y: mouseY}, this.pos)
        this.shootAnim = lerp(this.shootAnim, 0, .5)
        push()
        rectMode(CENTER)
        noFill()
        stroke(0)
        strokeWeight(2)
        drawCanon(this.pos.x, this.pos.y, this.level, this.shootAnim, this.lookingTo)
        let t = map(d, 30, this.range + 20, 255, 0)
        if(d < 30) t = 255
        stroke(220, t)
        discLinesEllipse({x: this.pos.x, y: this.pos.y}, this.range, this.range)
        pop()
    }
}

class CrossBow extends Canon{
    constructor(pos, gridPos, game){
        super(pos, gridPos, game)
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
    }

    levelUp(){
        this.level++
        this.projectileOptions.damage += .3
        this.pierce++
        this.fireRate *= 0.9
    }

    render(){
        let d = distanceAB({x: mouseX, y: mouseY}, this.pos)
        this.shootAnim = lerp(this.shootAnim, 0, .5)
        push()
        rectMode(CENTER)
        noFill()
        stroke(0)
        strokeWeight(2)
        drawCrossBow(this.pos.x, this.pos.y, this.level, this.shootAnim, this.lookingTo)
        let t = map(d, 30, this.range + 20, 255, 0)
        if(d < 30) t = 255
        stroke(220, t)
        discLinesEllipse({x: this.pos.x, y: this.pos.y}, this.range, this.range)
        pop()
    }
}

class Bomber extends Canon{
    constructor(pos, gridPos, game){
        super(pos, gridPos, game)
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
    }

    addProjectile(angle){
        this.game.addProjectile({x: this.pos.x + Math.cos(angle) * SIZE_CELL*.5, 
                                y: this.pos.y + Math.sin(angle) * SIZE_CELL*.5}, 
                                angle, 
                                this.projectileOptions, this.drawOptionsProjectile)
    }

    levelUp(){
        this.level++
        this.projectileOptions.onDeathOptions.damage *= 2
        this.fireRate -= 3.5
    }

    render(){
        let d = distanceAB({x: mouseX, y: mouseY}, this.pos)
        this.shootAnim = lerp(this.shootAnim, 0, .5)
        push()
        rectMode(CENTER)
        noFill()
        stroke(0)
        strokeWeight(2)
        drawBomber(this.pos.x, this.pos.y, this.level, this.shootAnim, this.lookingTo)
        let t = map(d, 30, this.range + 20, 255, 0)
        if(d < 30) t = 255
        stroke(220, t)
        discLinesEllipse({x: this.pos.x, y: this.pos.y}, this.range, this.range)
        pop()
    }
}