/*
ATTRIBUTES
collisionEnemy: {
    bounce: bool  (if true, the ball will bounce off the enemy)

    dmg: number  (damage dealt to enemy on collision)

    fire: bool  (if true, the ball will apply fire damage over time)
    fireDmg: number  (damage per second of fire)

    lightning: bool  (if true, the ball will chain lightning to nearby enemies)
    lightningDmg: number  (damage dealt by lightning)

    poison: bool  (if true, the ball will apply poison damage over time)
    poisonDmg: number  (damage per second of poison)

    horizontal: bool  (if true, the ball will shoot a horizontal ray on hit)
    vertical: bool  (if true, the ball will shoot a vertical ray on hit)
    rayDmg: number  (damage dealt by the ray)

    bomb: bool  (if true, the ball will explode on hit)
    bombRadius: number  (radius of the explosion)
    bombDmg: number  (damage dealt by the explosion)
}

collisionBottom: {
    return: bool  (if true, the ball will be returned to the player on hitting the bottom)
}

collisionWall: {
    dmgMult: number  (multiplier applied to damage when hitting a wall)
    times: number  (number of times the ball can hit walls and the effect applies)
}

repro: {
    enabled: bool  (if true, the ball will reproduce on hit)
    times: number  (number of balls it spawns on hit)
    key: string  (key of the ball to spawn on hit)
    copyStatus: bool (if true, the reproduced balls will have the same status effects as the parent ball)
    dmgMult: number (multiplier applied to the damage of the reproduced balls)
    sizeMult: number (multiplier applied to the size of the reproduced balls)
    bounces: number (number of bounces the ball reproduces before reproduction is disabled)
}
*/

//ball examples

let ballsRenders = new Map()
let ballsPrefabs = new Map()

let particleRaysEdges = {
    count: 1,
    speedMin: 1,
    speedMax: 2,
    lifespan: RAY_DURATION*0.2,
    fade: true,
    sizeMin: 5,
    sizeMax: 8
}


ballsPrefabs.set('basic', {
    r: BASIC_BALL_R,
    collisionEnemy: { bounce: true, dmg: 1, dmgMultOnBounce: true, dmgMultOnBounceVal: 0.3, dmgMultOnBounceMaxBounces: 10},
    collisionBottom: { return: true },
    key: 'basic',
    speed: BALL_SPEED,
    col: [100, 100, 100]
})

ballsRenders.set('basic', function () {
    push()
    strokeWeight(1.5)
    stroke(0)
    fill(100)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
})



ballsPrefabs.set('fire', {
    r: BIG_BALL_R,
    collisionEnemy: { bounce: true, dmg: 3, fire: true, fireDmg: 1.5 },
    collisionBottom: { return: true },
    key: 'fire',
    speed: BALL_SPEED,
    col: [255, 0, 0]
})

ballsRenders.set('fire', function () {
    push()
    strokeWeight(1.5)
    stroke(255, 0, 0)
    fill(255, 0, 0, 150)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
    if(Math.random() < 0.3) return
    pm.emit({
        position: createVector(this.pos.x + random(-10, 10), this.pos.y + random(-10, 10)),
        count: 1,
        speedMin: 0.5,
        speedMax: 1.5,
        lifespan: 30,
        colors: [color(255, 100, 0), color(255, 0, 0)],
        fade: true,
        gravity: createVector(0, -0.02)
    })
})


ballsPrefabs.set('trans', {
    r: BIG_BALL_R,
    collisionEnemy: { bounce: false, dmg: 4 },
    collisionBottom: { return: true },
    key: 'trans',
    speed: BALL_SPEED,
    col: [0, 0, 255]
})

ballsRenders.set('trans', function () {
    push()
    strokeWeight(1.5)
    stroke(0, 0, 255, 200)
    fill(0, 0, 255, 100)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
})

ballsPrefabs.set('lightning', {
    r: BIG_BALL_R,
    collisionEnemy: { bounce: true, dmg: 3.5, lightning: true, lightningDmg: 2 },
    collisionBottom: { return: true },
    key: 'lightning',
    speed: BALL_SPEED,
    col: [255, 255, 0]
})

ballsRenders.set('lightning', function () {
    push()
    strokeWeight(1.5)
    stroke(255, 255, 0, 240)
    fill(255, 255, 0, 170)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
})


ballsPrefabs.set('poison', {
    r: BIG_BALL_R,
    collisionEnemy: { bounce: true, dmg: 2, poison: true, poisonDmg: 0.5 },
    collisionBottom: { return: true },
    key: 'poison',
    speed: BALL_SPEED,
    col: [0, 255, 0]
})

ballsRenders.set('poison', function () {
    push()
    strokeWeight(1.5)
    stroke(0, 255, 0, 240)
    fill(0, 255, 0, 170)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
    if(Math.random() < 0.7) return
    pm.emit({
        position: createVector(this.pos.x + random(-10, 10), this.pos.y + random(-10, 10)),
        count: 1,
        speedMin: 0.5,
        speedMax: 1.5,
        lifespan: 30,
        colors: [color(0, 255, 0), color(0, 180, 0)],
        fade: true,
        gravity: createVector(0, -0.02)
    })
})


ballsPrefabs.set('repro', {
    r: BIG_BALL_R,
    collisionEnemy: { bounce: true, dmg: 4 },
    repro: { enabled: true, times: 2, key: 'repro' },
    collisionBottom: { return: true },
    key: 'repro',
    speed: BALL_SPEED,
    col: [150, 250, 40]
})

ballsRenders.set('repro', function () {
    push()
    strokeWeight(1.5)
    stroke(150, 250, 40)
    fill(150, 250, 40, 200)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
})

ballsPrefabs.set('split', {
    r: BIG_BALL_R,
    collisionEnemy: { bounce: true, dmg: 3 },
    repro: { enabled: true, times: 4, key: 'basic' },
    collisionBottom: { return: true },
    key: 'split',
    speed: BALL_SPEED,
    col: [100, 40, 140]
})

ballsRenders.set('split', function () {
    push()
    strokeWeight(1.5)
    stroke(100, 40, 140)
    fill(100, 40, 140, 200)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
})

ballsPrefabs.set('heavy', {
    r: BIG_BALL_R * 1.3,
    collisionEnemy: { bounce: true, dmg: 6 },
    collisionBottom: { return: true },
    key: 'heavy',
    speed: BALL_SPEED * 0.55,
    col: [80, 80, 80]
})

ballsRenders.set('heavy', function () {
    push()
    strokeWeight(1.5)
    stroke(50)
    fill(80)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
})

ballsPrefabs.set('light', {
    r: BASIC_BALL_R * 0.6,
    collisionEnemy: { bounce: true, dmg: 0.5},
    collisionBottom: { return: true },
    key: 'light',
    speed: BALL_SPEED * 1.5,
    col: [150, 150, 255]
})

ballsRenders.set('light', function () {
    push()
    strokeWeight(1.5)
    stroke(100, 100, 255)
    fill(150, 150, 255)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
})

ballsPrefabs.set('god', {
    r: BIG_BALL_R,
    collisionEnemy: { bounce: true, dmg: 7, fire: true, lightning: true, poison: true,
                      horizontal: true, vertical: true},
    repro: { enabled: true, times: 4, key: 'light' },
    collisionBottom: { return: true },
    key: 'god',
    speed: BALL_SPEED * 1.2,
    col: [255, 100, 0]
})

ballsRenders.set('god', function () {
    push()
    strokeWeight(1.5)
    stroke(255, 100, 0)
    fill(255, 150, 0)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
})

ballsPrefabs.set('horizontal', {
    r: BIG_BALL_R,
    collisionEnemy: { bounce: true, dmg: 2, horizontal: true, rayDmg: 0.5, bomb: true },
    collisionBottom: { return: true },
    key: 'horizontal',
    speed: BALL_SPEED,
    col: [255, 157, 0],
    rays: []
})

ballsRenders.set('horizontal', function () {
    push()
    strokeWeight(1.5)
    stroke(255, 157, 0)
    fill(255, 157, 0, 200)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
})

ballsPrefabs.set('vertical', {
    r: BIG_BALL_R,
    collisionEnemy: { bounce: true, dmg: 2, vertical: true, rayDmg: 0.5 },
    collisionBottom: { return: true },
    key: 'vertical',
    speed: BALL_SPEED,
    col: [255, 157, 0],
    rays: []
})

ballsRenders.set('vertical', function () {
    push()
    strokeWeight(1.5)
    stroke(255, 157, 0)
    fill(255, 157, 0, 200)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
})

ballsPrefabs.set('cross', {
    r: BIG_BALL_R,
    collisionEnemy: { bounce: true, dmg: 2, horizontal: true, vertical: true, rayDmg: 0.5 },
    collisionBottom: { return: true },  
    key: 'cross',
    speed: BALL_SPEED,
    col: [255, 157, 0],
    rays: []
})

ballsRenders.set('cross', function () {
    push()
    strokeWeight(1.5)
    stroke(255, 157, 0)
    fill(255, 157, 0, 200)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
})

ballsPrefabs.set('bomb', {
    r: BIG_BALL_R,
    collisionEnemy: { bounce: true, dmg: 5, bomb: true, bombRadius: 100, bombDmg: 2, lightning: true },
    collisionBottom: { return: true },
    key: 'bomb',
    speed: BALL_SPEED,
    col: [50, 50, 50]
})

ballsRenders.set('bomb', function () {
    push()
    strokeWeight(1.5)
    stroke(50)
    fill(50, 50, 50, 200)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
})

ballsRenders.set('horizontalRay', function(){
    if(!this.rays) this.rays = []
    push()
    
    for(let i = this.rays.length - 1; i >= 0; i--){
        let trans = this.rays[i].life > RAY_DURATION*0.5 ? 
                    map(this.rays[i].life, RAY_DURATION, RAY_DURATION*0.5, 0, 255) : 
                    map(this.rays[i].life, RAY_DURATION*0.5, 0, 255, 0)
        strokeWeight(3)
        stroke(255, random(157, 200), 0, trans*.75)
        line(START_X_TRACK, this.rays[i].y, END_X_TRACK, this.rays[i].y)
        strokeWeight(2)
        stroke(255, random(157, 200), 0, trans)
        line(START_X_TRACK, this.rays[i].y, END_X_TRACK, this.rays[i].y)

        let particleRaysObj = structuredClone(particleRaysEdges)
        particleRaysObj.position = createVector(START_X_TRACK, this.rays[i].y)
        particleRaysObj.angle = 0 + random(-PI/8, PI/8)
        particleRaysObj.colors = [color(255, 157, 0), color(255, 200, 0)]
        pm.emit(particleRaysObj)

        particleRaysObj = structuredClone(particleRaysEdges)
        particleRaysObj.position = createVector(END_X_TRACK, this.rays[i].y)
        particleRaysObj.angle = HALF_PI*2 + random(-PI/8, PI/8)
        particleRaysObj.colors = [color(255, 157, 0), color(255, 200, 0)]
        pm.emit(particleRaysObj)

        particleRaysObj = structuredClone(particleRaysEdges)
        particleRaysObj.position = createVector(random(START_X_TRACK, END_X_TRACK), this.rays[i].y)
        particleRaysObj.spread = TWO_PI
        particleRaysObj.colors = [color(255, 157, 0), color(255, 200, 0)]
        pm.emit(particleRaysObj)

        this.rays[i].life--
        if(this.rays[i].life <= 0){
            this.rays.splice(i, 1)
        }
    }
    pop()
})

ballsRenders.set('verticalRay', function(){
    if(!this.rays) this.rays = []
    push()
    for(let i = this.rays.length - 1; i >= 0; i--){
        let trans = this.rays[i].life > RAY_DURATION*0.5 ? 
                    map(this.rays[i].life, RAY_DURATION, RAY_DURATION*0.5, 0, 255) : 
                    map(this.rays[i].life, RAY_DURATION*0.5, 0, 255, 0)
        strokeWeight(3)
        stroke(255, random(157, 200), 0, trans*.75)
        line(this.rays[i].x, 0, this.rays[i].x, height)
        strokeWeight(2)
        stroke(255, random(157, 200), 0, trans)
        line(this.rays[i].x, 0, this.rays[i].x, height)

        let particleRaysObj = structuredClone(particleRaysEdges)
        particleRaysObj.position = createVector(this.rays[i].x, 0)
        particleRaysObj.angle = HALF_PI + random(-PI/8, PI/8)
        particleRaysObj.colors = [color(255, random(157, 200), 0)]
        pm.emit(particleRaysObj)

        particleRaysObj = structuredClone(particleRaysEdges)
        particleRaysObj.position = createVector(this.rays[i].x, height)
        particleRaysObj.angle = HALF_PI*3 + random(-PI/8, PI/8)
        particleRaysObj.colors = [color(255, random(157, 200), 0)]
        pm.emit(particleRaysObj)


        this.rays[i].life--
        if(this.rays[i].life <= 0){
            this.rays.splice(i, 1)
        }
    }
    
    pop()
})

ballsPrefabs.set('custom', {
    r: BIG_BALL_R,
    collisionEnemy: { bounce: false, dmg: 2, lightning: true, lightningDmg: 3 },
    collisionBottom: { return: true },
    collisionWall: { dmgMult: 2, times: 1 },
    key: 'custom',
    speed: BALL_SPEED,
    col: [200, 50, 150]
})

ballsRenders.set('custom', function () {
    push()
    strokeWeight(1.5)
    stroke(200, 50, 150)
    fill(200, 50, 150, 200)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
})
    