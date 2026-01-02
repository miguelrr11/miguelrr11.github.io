//ball examples

let ballsRenders = new Map()
let ballsPrefabs = new Map()

ballsPrefabs.set('basic', {
    r: BASIC_BALL_R,
    collisionEnemy: { bounce: true, dmg: 1 },
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
})


ballsPrefabs.set('repro', {
    r: BIG_BALL_R,
    collisionEnemy: { bounce: true, dmg: 4, repro: true, reproTimes: 2, reproKey: 'repro'},
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
    collisionEnemy: { bounce: true, dmg: 3, repro: true, reproTimes: 4, reproKey: 'basic'},
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
                      repro: true, reproTimes: 10, reproKey: 'light', horizontal: true, vertical: true},
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
    collisionEnemy: { bounce: true, dmg: 2, horizontal: true, rayDmg: 0.5 },
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

let particleRays = {
    count: 1,
    speedMin: 1,
    speedMax: 2,
    lifespan: RAY_DURATION*0.2,
    fade: true,
    sizeMin: 5,
    sizeMax: 8
}

ballsRenders.set('horizontalRay', function(){
    if(!this.rays) this.rays = []
    push()
    
    for(let i = this.rays.length - 1; i >= 0; i--){
        let trans = this.rays[i].life > RAY_DURATION*0.5 ? 
                    map(this.rays[i].life, RAY_DURATION, RAY_DURATION*0.5, 0, 255) : 
                    map(this.rays[i].life, RAY_DURATION*0.5, 0, 255, 0)
        strokeWeight(3)
        stroke(255, 157, 0, trans*.75)
        line(START_X_TRACK, this.rays[i].y, END_X_TRACK, this.rays[i].y)
        strokeWeight(2)
        stroke(255, 157, 0, trans)
        line(START_X_TRACK, this.rays[i].y, END_X_TRACK, this.rays[i].y)

        let particleRaysObj = structuredClone(particleRays)
        particleRaysObj.position = createVector(START_X_TRACK, this.rays[i].y)
        particleRaysObj.angle = 0 + random(-PI/8, PI/8)
        particleRaysObj.colors = [color(255, 157, 0)]
        pm.emit(particleRaysObj)

        particleRaysObj = structuredClone(particleRays)
        particleRaysObj.position = createVector(END_X_TRACK, this.rays[i].y)
        particleRaysObj.angle = HALF_PI*2 + random(-PI/8, PI/8)
        particleRaysObj.colors = [color(255, 157, 0)]
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
    strokeWeight(1.5)
    for(let i = this.rays.length - 1; i >= 0; i--){
        let trans = this.rays[i].life > RAY_DURATION*0.5 ? 
                    map(this.rays[i].life, RAY_DURATION, RAY_DURATION*0.5, 0, 255) : 
                    map(this.rays[i].life, RAY_DURATION*0.5, 0, 255, 0)
        strokeWeight(3)
        stroke(255, 157, 0, trans*.75)
        line(this.rays[i].x, 0, this.rays[i].x, height)
        strokeWeight(2)
        stroke(255, 157, 0, trans)
        line(this.rays[i].x, 0, this.rays[i].x, height)

        let particleRaysObj = structuredClone(particleRays)
        particleRaysObj.position = createVector(this.rays[i].x, 0)
        particleRaysObj.angle = HALF_PI + random(-PI/8, PI/8)
        particleRaysObj.colors = [color(255, 157, 0)]
        pm.emit(particleRaysObj)

        particleRaysObj = structuredClone(particleRays)
        particleRaysObj.position = createVector(this.rays[i].x, height)
        particleRaysObj.angle = HALF_PI*3 + random(-PI/8, PI/8)
        particleRaysObj.colors = [color(255, 157, 0)]
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
    collisionEnemy: { bounce: true, dmg: 1, poison: true, fire: true},
    collisionBottom: { return: true },
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
    