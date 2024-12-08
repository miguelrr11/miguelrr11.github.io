class Oveja{
    constructor(entorno, pos, speed, beauty, radius){
        this.entorno = entorno
        this.pos = pos ? pos : this.randomPos()
        this.speed = speed ? speed : this.randomSpeed()
        this.beauty = beauty ? beauty : this.randomBeauty()     //0-1
        this.radius = radius ? radius : this.randomRadius()
        this.vel = p5.Vector.fromAngle(random(TWO_PI))
        
        //0-1
        this.hunger = .1
        this.thirst = 0
        this.lust = 0
        this.state = {action: 'searching', 
                      goal: 'food',
                      posGoal: undefined,   //para el estado walking
                      coolDown: 0           //para el estado doing (doing toma tiempo)
        }

        this.col = lerppColor(COL_OVEJA_MOST_BEAUTY, COL_OVEJA_LEAST_BEAUTY, this.beauty)

        //movement
        this.coolDown = 0
        this.newPos = this.pos.copy()
    }

    //cambia la direccion de movimiento aleatoriamente
    randomChangeVelocity(){
        let angleChange = randomm(-0.2, 0.2)
        let newAngle = this.vel.heading() + angleChange
        this.vel = p5.Vector.fromAngle(newAngle)
    }

    move(){
        let vel = this.vel.copy()
        vel.mult(SPEED_OVEJA)
        let newPos = this.pos.copy().add(vel)
        if(newPos.x < 0) {newPos.x = 0; this.vel.x *= -1}
        if(newPos.x > WIDTH) {newPos.x = WIDTH-1; this.vel.x *= -1}
        if(newPos.y < 0) {newPos.y = 0; this.vel.y *= -1}
        if(newPos.y > HEIGHT) {newPos.y = HEIGHT-1; this.vel.y *= -1}
        if(!this.entorno.isWater(newPos)){
            //this.pos = newPos
            this.newPos = newPos
            this.coolDown = this.speed
        }
    }

    moveTowards(goal){
        let vel = p5.Vector.sub(goal, this.pos).normalize()
        vel.mult(SPEED_OVEJA)
        let newPos = this.pos.copy().add(vel)
        if(newPos.x < 0) {newPos.x = 0; this.vel.x *= -1}
        if(newPos.x > WIDTH) {newPos.x = WIDTH-1; this.vel.x *= -1}
        if(newPos.y < 0) {newPos.y = 0; this.vel.y *= -1}
        if(newPos.y > HEIGHT) {newPos.y = HEIGHT-1; this.vel.y *= -1}
        if(!this.entorno.isWater(newPos)){
            //this.pos = newPos
            this.newPos = newPos
            this.coolDown = this.speed
        }
    }

    //update based on state
    update(){
        //se esta moviendo
        if(this.coolDown > 0){
            this.coolDown--
            return
        }
        else{ 
            this.pos = this.newPos.copy()
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
                
            }
            if(this.state.posGoal) this.state.action = 'walking'
        }
        //se mueve hacia el objetivo
        else if(this.state.action == 'walking'){
            this.moveTowards(this.state.posGoal)
        }
        //esta quieto realizando la accion
        else if(this.state.action == 'doing'){

        }
    }

    randomPos(){
        while(true){
            let i = Math.floor(Math.random() * GRID_SIZE)
            let j = Math.floor(Math.random() * GRID_SIZE)
            if(this.entorno.validSpawnOveja(i, j)) return createVector(i*TAM_CELL, j*TAM_CELL)
        }
    }

    randomSpeed(){
        return 1 / (randomGaussian(0.5, 0.15) * INITIAL_SPEED) * SPEED_MULT;
    }

    randomBeauty(){
        return randomGaussian(0.5, 0.1)
    }

    randomRadius(){
        return randomGaussian(0.5, 0.1) * INITIAL_RADIUS;
    }

    show(){
        push()
        fill(this.col)
        noStroke()
        let pos = createVector()
        pos.x = lerp(this.newPos.x, this.pos.x, 1 / (this.speed - this.coolDown))
        pos.y = lerp(this.newPos.y, this.pos.y, 1 / (this.speed - this.coolDown))
        translate(pos.x, pos.y)
        rect(0, 0, TAM_OVEJA, TAM_OVEJA)

        noFill()
        stroke(0)
        if(this.state.posGoal) ellipse(this.state.posGoal.x, this.state.posGoal.y, 10)
        ellipse(this.pos.x, this.pos.y, this.radius*2)
        pop()
    }

}