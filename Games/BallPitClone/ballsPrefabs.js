//ball examples

let ballsRenders = new Map()
let ballsPrefabs = new Map()

ballsPrefabs.set('basic', {
    r: BASIC_BALL_R,
    collisionEnemy: { bounce: true, dmg: 1 },
    collisionBottom: { return: true },
    key: 'basic',
    speed: BALL_SPEED,
    col: [255, 255, 255]
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
    collisionEnemy: { bounce: true, dmg: 3, fire: true },
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
    collisionEnemy: { bounce: true, dmg: 3.5, lightning: true },
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
    collisionEnemy: { bounce: false, dmg: 2, poison: true },
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
    r: BASIC_BALL_R,
    collisionEnemy: { bounce: true, dmg: 1, repro: true, reproTimes: 4 },
    collisionBottom: { return: true },
    key: 'repro',
    speed: BALL_SPEED,
    col: [255, 255, 255]
})

ballsRenders.set('repro', function () {
    push()
    strokeWeight(1.5)
    stroke(0)
    fill(100)
    ellipse(this.pos.x, this.pos.y, this.r * 2)
    pop()
})
