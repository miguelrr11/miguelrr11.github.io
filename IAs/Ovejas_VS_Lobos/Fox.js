class Fox{
    constructor(entorno, sim, pos, speed, beauty, radius){
        this.entorno = entorno
        this.sim = sim
        this.alive = true
        this.pos = pos ? pos : this.randomPos()
        this.speed = speed ? speed : this.randomSpeed()
        this.beauty = beauty ? clamp(beauty, 0, 1) : this.randomBeauty()     //0-1
        this.radius = radius ? radius : this.randomRadius()
        this.vel = p5.Vector.fromAngle(random(TWO_PI))
        this.genre = Math.random() < 0.5 ? 'male' : 'female'
        this.age = 0
        
        //0-1
        this.hunger = 0
        this.thirst = 0
        this.lust = 0
        this.state = {action: 'searching', 
                      goal: 'food',
                      posGoal: undefined,   //para el estado walking
                      partner: undefined,
                      prey: undefined,      //oveja que tiene localizado
                      dying: false,
                      timeUntilDeath: 0
        }
        this.newState()
        

        this.col = lerppColor(COL_FOX_MOST_BEAUTY, COL_FOX_LEAST_BEAUTY, this.beauty)

        //movement
        this.coolDown = 0
        if(this.pos) this.newPos = this.pos.copy()
    }

    //cambia la direccion de movimiento aleatoriamente
    randomChangeVelocity(){
        let angleChange = randomm(-0.6, 0.6)
        let newAngle = this.vel.heading() + angleChange
        this.vel = p5.Vector.fromAngle(newAngle)
    }

    //if moving towards something and really close, just go there instead of overshooting
    checkIfClose(goal){
        if(dist(goal.x, goal.y, this.pos.x, this.pos.y) < SPEED_FOX) this.newPos = goal.copy()
    }

    move(goal = undefined){
        let vel
        if(goal) vel = p5.Vector.sub(goal, this.pos).normalize()
        else vel = this.vel.copy()
        vel.mult(SPEED_FOX)
        let newPos = this.pos.copy().add(vel)
        if(newPos.x < 0) {newPos.x = 1; this.vel.x *= -1}
        if(newPos.x > WIDTH) {newPos.x = WIDTH-1; this.vel.x *= -1}
        if(newPos.y < 0) {newPos.y = 1; this.vel.y *= -1}
        if(newPos.y > HEIGHT) {newPos.y = HEIGHT-1; this.vel.y *= -1}
        if(!this.entorno.isWater(newPos)){
            //this.pos = newPos
            this.newPos = newPos.copy()
            if(goal) this.checkIfClose(goal)
            this.coolDown = this.speed
        }
        else{
            this.randomChangeVelocity()
            vel = this.vel.copy()
            vel.mult(SPEED_OVEJA)
            let newPos = this.pos.copy().add(vel)
            if(newPos.x < 0) {newPos.x = 1; this.vel.x *= -1}
            if(newPos.x > WIDTH) {newPos.x = WIDTH-1; this.vel.x *= -1}
            if(newPos.y < 0) {newPos.y = 1; this.vel.y *= -1}
            if(newPos.y > HEIGHT) {newPos.y = HEIGHT-1; this.vel.y *= -1}
            if(!this.entorno.isWater(newPos)){
                //this.pos = newPos
                this.newPos = newPos.copy()
                if(goal) this.checkIfClose(goal)
                this.coolDown = this.speed
            }
        }
    }


    getPrioritizedGoal(){
        let largest = Math.max(this.hunger, Math.max(this.thirst, this.lust))
        if(largest < FOX_MIN_NECESSITY) return 'wandering'
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
        let rad_goal = 0
        if(this.state.goal == 'wandering') return
        if(this.state.goal == 'food') rad_goal = RADIUS_GOAL_FOOD
        if(this.state.goal == 'water') rad_goal = RADIUS_GOAL_WATER
        if(this.state.goal == 'partner') rad_goal = RADIUS_GOAL_PARTNER
        if(dist(this.pos.x, this.pos.y, this.state.posGoal.x, this.state.posGoal.y) < rad_goal){
            if(this.state.goal == 'food'){ 
                this.state.prey.alive = false
                this.hunger = 0
                this.goalPos = undefined
                this.prey = undefined
            }
            if(this.state.goal == 'water'){
                // this.thirst = Math.max(this.thirst - 0.5, 0)
                this.thirst = 0
            }
            if(this.state.goal == 'partner' && this.state.partner){
                this.lust = 0
                this.sim.reproduce(this, this.state.partner)
                this.state.partner.lust = 0
                this.state.partner.newState()
            }
            this.newState()
        }
        if((this.hunger < 1 && this.thirst < 1 && this.lust < 1)){
            this.state.dying = false
        }
    }

    //se reproduce si encuentra alguien que:
    /*
    - sea diferente genero
    - no esta buscando pero tiene un lust mas de MIN_LUST
    - este buscando partner
    - tenga edad mas de AGE_LIMIT_REPRODUCE
    - si encuentra a varios, escoge el mas guapo
    */
    findPartner(){
        let possible = []
        for(let other of sim.foxes){
            if(other == this) continue
            //if(other.state.goal != 'partner') continue
            if(other.age < AGE_LIMIT_REPRODUCE_F) continue
            if(other.genre == this.genre) continue
            if((other.state.goal == 'partner' || (other.state.goal != 'partner' && other.lust > MIN_LUST_F)) &&
                 dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y) < this.radius)
                possible.push(other)
        }
        if(possible.length == 0) return undefined
        possible.sort((a, b) => b.beauty - a.beauty)
        this.state.partner = possible[0]
        return possible[0].newPos
    }
    
    updateNecessites(){
        this.hunger = Math.min(this.hunger + DELTA_HUNGER_F, 1)
        this.thirst = Math.min(this.thirst + DELTA_THIRST_F, 1)
        if(this.age >= AGE_LIMIT_REPRODUCE_F) this.lust = Math.min(this.lust + DELTA_LUST_F, 1)
        this.age += AGE_FACTOR
        if((this.hunger >= 1 || this.thirst >= 1) && !this.state.dying){
            this.state.dying = true
            this.timeUntilDeath = TIME_UNTIL_DEAD     //seconds
        }
        else if(this.state.dying){
            this.timeUntilDeath--
            if(this.timeUntilDeath <= 0) this.die()
        }
        if(this.age > AGE_LIMIT_F) this.die()
    }

    die(){
        this.alive = false
        this.entorno.deathAt(this.pos)
    }

    //check if partner is still alive
    checkPartner(){
        if(!this.state.partner.alive){
            this.state.action = 'searching'
            this.state.partner = undefined
        }
    }

    //check if the food located is still there
    //cambairlo a check if food is still alive
    checkPrey(){
        let isThere = this.state.prey.alive
        if(!isThere){ 
            this.state.action = 'searching'
            this.goalPos = undefined
            this.prey = undefined
        }
    }

    //update based on state
    update(){
        if(FRAME % 60 == 0) this.updateNecessites()
        //se esta moviendo
        if(this.coolDown > 0){
            this.coolDown--
            return
        }
        else{ 
            this.pos = this.newPos.copy()
            if(this.state.posGoal && this.state.action == 'walking') this.checkGoal()
            this.coolDown = 0
        }
        //se mueve random y busca su objetivo
        if(this.state.action == 'searching'){
            if(this.state.goal == 'food'){
                let prey = this.sim.findClosestPrey(this.pos, this.radius)
                if(prey){
                    this.state.action = 'walking'
                    this.state.posGoal = prey.newPos.copy()
                    this.state.prey = prey
                }
            }
            if(this.state.goal == 'water'){
                this.state.posGoal = this.entorno.findClosest(this.pos, this.radius, this.state.goal)
            }
            if(this.state.goal == 'partner'){
                this.state.posGoal = this.findPartner()
            }
            else if(this.state.goal == 'wandering') this.newState()        //esta wandering
            if(this.state.posGoal) this.state.action = 'walking'
            this.randomChangeVelocity()
            this.move()
        }
        //se mueve hacia el objetivo
        else if(this.state.action == 'walking'){
            //veo si el objetivo sigue disponible, y si es asi, actualizo el posGoal
            if(this.state.goal == 'food') this.checkPrey()
            if(this.state.goal == 'food' && this.state.prey) this.state.posGoal = this.state.prey.pos.copy()
            if(this.state.goal == 'partner') this.checkPartner()
            if(this.state.goal == 'partner' && this.state.partner) this.state.posGoal = this.state.partner.pos.copy()
            this.move(this.state.posGoal)
        }
        //esta quieto realizando la accion
        else if(this.state.action == 'doing'){
            //todo
        }
    }

    randomPos(){
        let maxIter = GRID_SIZE*GRID_SIZE
        let iter = 0
        while(iter < maxIter){
            let i = clamp(Math.floor(Math.random() * GRID_SIZE), 1, GRID_SIZE-1)
            let j = clamp(Math.floor(Math.random() * GRID_SIZE), 1, GRID_SIZE-1)
            if(this.entorno.validSpawnOveja(i, j)) return createVector(i*TAM_CELL, j*TAM_CELL)
            iter++
        }
        //unable to place it
        this.alive = false
        return null
    }

    randomSpeed(){
        return 1 / clamp((randomGaussian(0.5, 0.2) * INITIAL_SPEED), 0.1, 100) * SPEED_MULT_F;
    }

    randomBeauty(){
        return clamp(randomGaussian(0.5, 0.3), 0, 1)
    }

    randomRadius(){
        return clamp(randomGaussian(1, 0.5) * INITIAL_RADIUS_F, 10, 1000) * TAM_CELL * 0.05
    }

    //todo triangulo
    show(option, showNec){
        if(!this.alive) return
        // console.log("posX " + this.pos.x)
        // console.log("newposX " + this.newPos.x)
        push()
        rectMode(CENTER)
        noStroke()
        let size = mapp(this.age, 0, AGE_LIMIT_F, TAM_OVEJA*0.5, TAM_OVEJA, true)
        let pos = createVector()
        let off = this.coolDown == this.speed ? 1 : 1 / (this.speed - this.coolDown)
        pos.x = lerp(this.newPos.x, this.pos.x, off)
        pos.y = lerp(this.newPos.y, this.pos.y, off)
        if(!pos.x) console.log(this.newPos.x, this.pos.x)
        if(!pos.y) console.log(this.newPos.y, this.pos.y)
        translate(pos.x, pos.y)
        rotate(Math.atan2(this.vel.y, this.vel.x))
        if(showNec){
            let mult = 0
            if(this.state.goal == 'food') {fill(COL_HUNGER); mult = mapp(this.hunger, 0, 1, 1.25, 1.5)}
            if(this.state.goal == 'water') {fill(COL_THIRST); mult = mapp(this.thirst, 0, 1, 1.25, 1.5)}
            if(this.state.goal == 'partner') {
                this.genre == 'male' ? fill(COL_LUST_MALE) : fill(COL_LUST_FEMALE); 
                mult = mapp(this.lust, 0, 1, 1.25, 1.5)
            }
            rect(0, 0, size*mult, size*mult)
        }
        
        if(option == 'beauty'){
            fill(this.col)
        }
        else if(option == 'age'){
            fill(mapp(this.age, 0, AGE_LIMIT_F, 0, 255, true))
        }
        else if(option == 'radius'){
            fill(this.col)
            push()
            noFill()
            stroke(0, 100)
            strokeWeight(.5)
            ellipse(0, 0, this.radius*2)
            pop()
        }
        else if(option == 'speed'){
            let col = lerppColor("#ffd9da", "#89023e", clamp(this.speed / SPEED_MULT_F, 0, 1))
            fill(col)
        }
        else if(option == 'state'){
            if(this.state.action == 'searching') fill("#f7b538")
            else if(this.state.action == 'walking') fill("#780116")
            else if(this.state.action == 'wandering') fill(100)
        }
        else if(option == 'none') fill(0, 0)
        if(!this.state.dying) rect(0, 0, size, size)
        else if(this.state.dying && Math.floor(FRAME / 15) % 2 == 0) rect(0, 0, size, size)
        pop()
        // push()
        // fill(0)
        // if(this.state.prey) ellipse(this.state.prey.pos.x, this.state.prey.pos.y, 15)
        // pop()
    }

    printNec(){
        console.log(this.hunger)
        console.log(this.thirst)
        console.log(this.lust)
    }

}