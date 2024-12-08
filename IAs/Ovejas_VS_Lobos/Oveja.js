class Oveja{
    constructor(entorno, sim, pos, speed, beauty, radius){
        this.entorno = entorno
        this.sim = sim
        this.pos = pos ? pos : this.randomPos()
        this.speed = speed ? speed : this.randomSpeed()
        this.beauty = beauty ? beauty : this.randomBeauty()     //0-1
        this.radius = radius ? radius : this.randomRadius()
        this.vel = p5.Vector.fromAngle(random(TWO_PI))
        this.genre = Math.random() < 0.5 ? 'male' : 'female'
        this.age = 0
        
        //0-1
        this.hunger = .1
        this.thirst = 0
        this.lust = 0
        this.state = {action: 'searching', 
                      goal: 'food',
                      posGoal: undefined,   //para el estado walking
                      partner: undefined,
                      dying: false,
                      timeUntilDeath: 0
        }
        this.alive = true

        this.col = lerppColor(COL_OVEJA_MOST_BEAUTY, COL_OVEJA_LEAST_BEAUTY, this.beauty)

        //movement
        this.coolDown = 0
        this.newPos = this.pos.copy()
    }

    //cambia la direccion de movimiento aleatoriamente
    randomChangeVelocity(){
        let angleChange = randomm(-0.6, 0.6)
        let newAngle = this.vel.heading() + angleChange
        this.vel = p5.Vector.fromAngle(newAngle)
    }

    move(goal = undefined){
        let vel
        if(goal) vel = p5.Vector.sub(goal, this.pos).normalize()
        else vel = this.vel.copy()
        vel.mult(SPEED_OVEJA)
        let newPos = this.pos.copy().add(vel)
        if(newPos.x < 0) {newPos.x = 1; this.vel.x *= -1}
        if(newPos.x > WIDTH) {newPos.x = WIDTH-1; this.vel.x *= -1}
        if(newPos.y < 0) {newPos.y = 1; this.vel.y *= -1}
        if(newPos.y > HEIGHT) {newPos.y = HEIGHT-1; this.vel.y *= -1}
        if(!this.entorno.isWater(newPos)){
            //this.pos = newPos
            this.newPos = newPos.copy()
            this.coolDown = this.speed
        }
    }


    getPrioritizedGoal(){
        let largest = Math.max(this.hunger, Math.max(this.thirst, this.lust))
        if(largest == this.hunger) return 'food'
        if(largest == this.thirst) return 'water'
        if(largest == this.lust) return 'partner'
    }

    newState(){
        this.state.action = 'searching'
        this.state.goal = this.getPrioritizedGoal()
        this.state.posGoal = undefined
        this.state.partner = undefined
    }

    checkGoal(){
        if(dist(this.pos.x, this.pos.y, this.state.posGoal.x, this.state.posGoal.y) < RADIUS_GOAL){
            if(this.state.goal == 'food'){ 
                this.entorno.eat(this.state.posGoal)
                this.hunger = Math.max(this.hunger - 0.25, 0)
            }
            if(this.state.goal == 'water'){
                this.thirst = Math.max(this.thirst - 0.5, 0)
            }
            if(this.state.goal == 'partner'){
                this.lust = 0
                this.sim.reproduce(this, this.state.partner)
                //this.state.partner.newState()
            }
            this.newState()
        }
        if((this.hunger < 1 && this.thirst < 1 && this.lust < 1)){
            this.state.dying = false
        }
    }

    //se reproduce con el mas guapo de su rango y diferente genero y de edad mas de 100s y algo de lust
    findPartner(){
        let possible = []
        for(let other of sim.ovejas){
            if(other == this) continue
            //if(other.state.goal != 'partner') continue
            if(other.age < 100) continue
            if(other.lust < .15) continue
            if(other.genre == this.genre) continue
            if(dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y) < RADIUS_GOAL)
                possible.push(other)
        }
        if(possible.length == 0) return undefined
        possible.sort((a, b) => a.beauty - b.beauty)
        this.state.partner = possible[0]
        return possible[0].pos
    }
    
    updateNecessites(){
        this.hunger = Math.min(this.hunger + DELTA_HUNGER, 1)
        this.thirst = Math.min(this.thirst + DELTA_THIRST, 1)
        if(this.age >= 100) this.lust = Math.min(this.lust + DELTA_LUST, 1)
        this.age += AGE_FACTOR
        if((this.hunger >= 1 || this.thirst >= 1 || this.lust >= 1) && !this.state.dying){
            this.state.dying = true
            this.timeUntilDeath = TIME_UNTIL_DEAD     //seconds
        }
        else if(this.state.dying){
            this.timeUntilDeath--
            if(this.timeUntilDeath <= 0) this.alive = false
        }
        
    }

    //check if partner is still alive
    checkPartner(){
        if(this.state.action == 'walking' && this.state.goal == 'partner' && !this.state.partner.alive){
            this.state.action = 'searching'
            this.state.partner = undefined
        }
    }

    //update based on state
    update(){
        if(frameCount % 60 == 0) this.updateNecessites()
        //se esta moviendo
        if(this.coolDown > 0){
            this.coolDown--
            return
        }
        else{ 
            this.pos = this.newPos.copy()
            if(this.state.posGoal) this.checkGoal()
            this.coolDown = 0
        }
        //se mueve random y busca su objetivo
        if(this.state.action == 'searching'){
            this.randomChangeVelocity()
            this.move()
            if(this.state.goal == 'food'){
                this.state.posGoal = this.entorno.findClosest(this.pos, this.radius, this.state.goal)
                //console.log(this.state.posGoal)
            }
            if(this.state.goal == 'water'){
                this.state.posGoal = this.entorno.findClosest(this.pos, this.radius, this.state.goal)
            }
            if(this.state.goal == 'partner'){
                this.state.posGoal = this.findPartner()
            }
            if(this.state.posGoal) this.state.action = 'walking'
        }
        //se mueve hacia el objetivo
        else if(this.state.action == 'walking'){
            this.checkPartner()
            this.move(this.state.posGoal)
        }
        //esta quieto realizando la accion
        else if(this.state.action == 'doing'){

        }
    }

    randomPos(){
        while(true){
            let i = clamp(Math.floor(Math.random() * GRID_SIZE), 1, GRID_SIZE-1)
            let j = clamp(Math.floor(Math.random() * GRID_SIZE), 1, GRID_SIZE-1)
            if(this.entorno.validSpawnOveja(i, j)) return createVector(i*TAM_CELL, j*TAM_CELL)
        }
    }

    randomSpeed(){
        return 1 / (randomGaussian(0.5, 0.2) * INITIAL_SPEED) * SPEED_MULT;
    }

    randomBeauty(){
        return clamp(randomGaussian(0.5, 0.3), 0, 1)
    }

    randomRadius(){
        return clamp(randomGaussian(0.5, 0.3) * INITIAL_RADIUS, 10, 60)
    }

    show(){
        // console.log("posX " + this.pos.x)
        // console.log("newposX " + this.newPos.x)
        push()
        rectMode(CENTER)
        noStroke()
        let size = mapp(this.age, 0, 300, TAM_OVEJA*0.5, TAM_OVEJA, true)
        let pos = createVector()
        let off = this.coolDown == this.speed ? 1 : 1 / (this.speed - this.coolDown)
        pos.x = lerp(this.newPos.x, this.pos.x, off)
        pos.y = lerp(this.newPos.y, this.pos.y, off)
        if(!pos.x) console.log(this.newPos.x, this.pos.x)
        if(!pos.y) console.log(this.newPos.y, this.pos.y)
        translate(pos.x, pos.y)
        rotate(Math.atan2(this.vel.y, this.vel.x))
        let mult = 0
        if(this.state.goal == 'food') {fill(COL_HUNGER); mult = mapp(this.hunger, 0, 1, 1.25, 1.5)}
        if(this.state.goal == 'water') {fill(COL_THIRST); mult = mapp(this.thirst, 0, 1, 1.25, 1.5)}
        if(this.state.goal == 'partner') {fill(COL_LUST); mult = mapp(this.lust, 0, 1, 1.25, 1.5)}
        if(!this.state.dying) rect(0, 0, size*mult, size*mult)
        else if(this.state.dying && Math.floor(frameCount / 15) % 2 == 0) rect(0, 0, size*mult, size*mult)
        fill(this.col)
        rect(0, 0, size, size)
        //fill(0)
        //if(this.genre == 'male') ellipse(0, 0, 5)
        pop()

        //debug
        // push()
        // noFill()
        // stroke(0)
        // if(this.state.posGoal) ellipse(this.state.posGoal.x, this.state.posGoal.y, 10)
        // ellipse(pos.x, pos.y, this.radius*2)
        // pop()
    }

    printNec(){
        console.log(this.hunger)
        console.log(this.thirst)
        console.log(this.lust)
    }

}