let basicBall = {
    r: 4,
    collisionEnemy: {bounce: true, dmg: 1},
    collisionBottom: {return: true},
    key: 'basic',
    speed: BALL_SPEED,
    show(){
        push()
        strokeWeight(1.5)
        stroke(0)
        fill(100)
        ellipse(this.pos.x, this.pos.y, this.r*2)
        pop()
    }
}

let fireBall = {
    r: 10,
    collisionEnemy: {bounce: true, dmg: 3, fire: true},
    collisionBottom: {return: true},
    key: 'fire',
    speed: BALL_SPEED,
    show(){
        push()
        strokeWeight(1.5)
        stroke(255, 0, 0)
        fill(255, 0, 0, 150)
        ellipse(this.pos.x, this.pos.y, this.r*2)
        pop()
    }
}


let transBall = {
    r: 10,
    collisionEnemy: {bounce: false, dmg: 4},
    collisionBottom: {return: true},
    key: 'trans',
    speed: BALL_SPEED,
    show(){
        push()
        strokeWeight(1.5)
        stroke(0, 0, 255, 200)
        fill(0, 0, 255, 100)
        ellipse(this.pos.x, this.pos.y, this.r*2)
        pop()
    }
}

let ballsPrefabs = new Map()
ballsPrefabs.set(basicBall.key, basicBall)
ballsPrefabs.set(fireBall.key, fireBall)
ballsPrefabs.set(transBall.key, transBall)