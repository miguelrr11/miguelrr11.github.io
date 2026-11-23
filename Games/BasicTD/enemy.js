class Enemy{
    constructor(pos){
        this.pos = pos
        this.prevPos = {x: pos.x, y: pos.y}

        this.speed = random(.0002, 0.0008)
        this.originalSpeed = this.speed     //never changes
        this.dead = false
        this.hp = floor(random(3, 10))
        this.maxHp = this.hp
        this.id = Enemy.globalEnemyID++

        this.rad = ENEMY_RAD

        this.hitAnim = 0

        
    }

    static globalEnemyID = 0

    update(){
        this.updateLocal()
        if(this.hp <= 0) this.dead = true
    }

    
}

class Crawler extends Enemy{
    constructor(pos, pathIndex, chunk){
        super(pos)
        this.pathIndex = pathIndex
        this.chunk = chunk
        this.t = 0

        this.phase = 0

        this.hasSpawnedRaider = false
    }

    updateLocal(){
        if(!this.hasSpawnedRaider && !this.spawning && Math.random() < 0.00035){
            this.spawning = true
            this.phase = 0
            this.hasSpawnedRaider = true
        }

        if(this.spawning) this.phase += dt * .0005

        if(this.spawning && this.phase > 1){
            //let nRaiders = Math.ceil(Math.random() * 5)
            let nRaiders = 1
            for(let i = 0; i < nRaiders; i++){
                let vel = randomUnitVector()
                vel.x *= .2
                vel.y *= .2
                this.chunk.spawnRaiderAtxy(this.pos.x, this.pos.y, {vel})
                
            }
            this.spawning = false
            this.phase = 0
        }
    }

    hit(projectile){
        this.hp -= projectile.damage
        this.t = Math.max(0, this.t - projectile.knockback)
        this.hitAnim = 1
    }

    move(chunk){
        if(this.spawning) return
        this.t += this.speed * dt

        while(this.t >= 1){
            this.t -= 1
            this.pathIndex++
        }

        if(this.pathIndex >= chunk.path.length - 1){
            this.pathIndex = 0
            this.hasSpawnedRaider = false
        }
        else{
            const a = chunk.path[this.pathIndex]
            const b = chunk.path[this.pathIndex + 1]
            this.pos.x = lerp(a.i, b.i, this.t) * SIZE_CELL + HALF_SIZE_CELL
            this.pos.y = lerp(a.j, b.j, this.t) * SIZE_CELL + HALF_SIZE_CELL
        }
        
    }

    render(){
        push()
        stroke(0)
        if(this.spawning) stroke(0, Math.sin(frameCount*.3)*255, 0)
        if(this.hitAnim != 0){
            stroke(255 * this.hitAnim, 0, 0)
            this.hitAnim = lerp(this.hitAnim, 0, 0.1)
            if(this.hitAnim < 0.001) this.hitAnim = 0
        }
        strokeWeight(this.spawning ? 3 : 2)
        //ellipse(this.pos.x, this.pos.y, 16)
        let multRot = this.t * TWO_PI * .25
        if(this.phase > 0) multRot *= (this.phase + 1) * 100
        drawCross(this.pos.x, this.pos.y, map(this.hp, 0, this.maxHp, 0, 20, true), multRot)
        pop()
    }
}

class Raider extends Enemy{
    constructor(pos, chunk, options){
        super(pos)
        this.chunk = chunk
        this.acc = 0.005
        this.decel = 0.0001
        this.maxSpeed = .05
        this.target = null      //target is a raider
        this.nextPos = null     // if it doesnt have a target, it has a nexpos it walks to
        this.checkTarget()
        this.vel = options.vel ? options.vel : {x:0, y:0}

        this.maxForce = 0.001

        this.attackRange = ATTACK_DISTANCE_RAIDER    //range at which it attacks
        this.targetRange = 100              // range at which it detects a target

        this.hp = 1

        this.fireRate = 10
        this.coolDown = this.fireRate
        this.damage = 0.1

        this.damageAnim = 0
    }

    hit(projectile){
        this.hp -= projectile.damage
        //this.t = Math.max(0, this.t - projectile.knockback)
        this.hitAnim = 1
    }

    setNextMove(){
        let dx = 0
        let dy = 0
        let d = SIZE_CELL * random(1.5, 2.5)
        if(Math.random() < .5) {dx = Math.random() < .5 ? -d : d}
        else {dy = Math.random() < .5 ? -d : d}
        if(this.pos.x + dx > WIDTH_SCENE || this.pos.x + dx < 0) dx *= -1
        if(this.pos.y + dy > HEIGHT_SCENE || this.pos.y + dy < 0) dy *= -1
        this.nextPos = {x: this.pos.x + dx, y: this.pos.y + dy}
    }

    checkTarget(){
        if(this.target && this.chunk.checkTower(this.target)) return true
        else this.setTarget()
        if(!this.target && !this.nextPos) this.setNextMove()
    }

    setTarget(){
        let minDist = Infinity
        let best = undefined
        for(let tower of this.chunk.towers){
            if(tower.isTargetedBy == 'Raider' && distanceAB(this.pos, tower.pos) < minDist){
                minDist = distanceAB(this.pos, tower.pos)
                best = tower
            }
        }
        if(best && minDist < this.targetRange) {this.target = best; return true}
        this.target = null
        return false
    }

    updateLocal(){
        this.checkTarget()
        if(this.target && distanceAB(this.pos, this.target.pos) <= this.attackRange){
            this.coolDown -= dt * 0.01
            if(this.coolDown <= 0){
                this.coolDown = this.fireRate
                this.chunk.damageTower(this.target, {damage: this.damage})
                this.damageAnim = 1
            }
        }
    }

    move(){
        if (!this.target && this.nextPos){
            this.pos.x = lerp(this.pos.x, this.nextPos.x, 0.025)
            this.pos.y = lerp(this.pos.y, this.nextPos.y, 0.025)
            if(distanceAB(this.pos, this.nextPos) < .1){
                this.setNextMove()
            }
            return
        }

        const dx = this.target.pos.x - this.pos.x
        const dy = this.target.pos.y - this.pos.y
        const d = Math.hypot(dx, dy)
        const remaining = d - this.attackRange

        // 1. desired velocity: towards the target, braking on arrival
        const desiredSpeed = remaining > 0
            ? Math.min(this.maxSpeed, Math.sqrt(2 * this.decel * remaining))
            : 0
        const desiredX = d > 0 ? (dx / d) * desiredSpeed : 0
        const desiredY = d > 0 ? (dy / d) * desiredSpeed : 0

        // 2. steering = the difference between where I want t o go and where I'm going
        let steerX = desiredX - this.vel.x
        let steerY = desiredY - this.vel.y



        // 3. limit how much I can change per frame
        const steerMag = Math.hypot(steerX, steerY)
        const maxSteer = this.maxForce * dt
        if (steerMag > maxSteer) {
            steerX = (steerX / steerMag) * maxSteer
            steerY = (steerY / steerMag) * maxSteer
        }

        // 4. apply
        this.vel.x += steerX
        this.vel.y += steerY
        this.pos.x += this.vel.x * dt
        this.pos.y += this.vel.y * dt
    }

    render(){
        push()
        fill(0, 255, 0)
        stroke(0)
        strokeWeight(2)

        if(this.hitAnim != 0){
            fill(255 * this.hitAnim, 0, 0)
            this.hitAnim = lerp(this.hitAnim, 0, 0.1)
            if(this.hitAnim < 0.001) this.hitAnim = 0
        }

        if(this.damageAnim != 0 && this.checkTarget()){
            push()
            stroke(255, 0, 0, 255*this.damageAnim)
            strokeWeight(3)
            line(this.pos.x, this.pos.y, this.target.pos.x, this.target.pos.y)
            this.damageAnim = lerp(this.damageAnim, 0, 0.05)
            if(this.damageAnim < 0.001) this.damageAnim = 0
            pop()
        }

        ellipse(this.pos.x, this.pos.y, 10, 10)

        // push()
        // fill(0)
        // noStroke()
        // textSize(12)
        // if(this.nextPos) text(round(this.pos.x) + ' ' + round(this.pos.y) + '\n' + round(this.nextPos.x) + ' ' + round(this.nextPos.y), this.pos.x, this.pos.y - 10)
        // pop()

        pop()
    }

}