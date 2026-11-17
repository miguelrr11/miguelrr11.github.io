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
    }

    updateLocal(){
        if(!this.spawning && Math.random() < 0.00035){
            this.spawning = true
            this.phase = 0
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
        this.maxSpeed = 100
        this.target = this.setTarget()
        if(!this.target) this.dead = true
        this.vel = options.vel ? options.vel : {x:0, y:0}

        this.maxForce = 0.001

        this.hp = 1
    }

    hit(projectile){
        this.hp -= projectile.damage
        //this.t = Math.max(0, this.t - projectile.knockback)
        this.hitAnim = 1
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
        return best
    }

    updateLocal(){
        
    }

    move(){
        if (!this.target) return

        const dx = this.target.pos.x - this.pos.x
        const dy = this.target.pos.y - this.pos.y
        const d = Math.hypot(dx, dy)
        const remaining = d - ATTACK_DISTANCE_RAIDER

        // 1. desired velocity: towards the target, braking on arrival
        const desiredSpeed = remaining > 0
            ? Math.min(this.maxSpeed, Math.sqrt(2 * this.decel * remaining))
            : 0
        const desiredX = d > 0 ? (dx / d) * desiredSpeed : 0
        const desiredY = d > 0 ? (dy / d) * desiredSpeed : 0

        // 2. steering = the difference between where I want to go and where I'm going
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

        ellipse(this.pos.x, this.pos.y, 10, 10)
        pop()
    }

}