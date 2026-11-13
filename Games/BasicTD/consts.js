const CANON_BASE_PRICE = 15
const MINER_BASE_PRICE = 10
const CROSSBOW_BASE_PRICE = 15
const BOMBER_BASE_PRICE = 20

const CANON_BASE_RANGE = 80
const CROSSBOW_BASE_RANGE = 80
const BOMBER_BASE_RANGE = 40

const ENEMY_RAD = 15

const START_ORE = 10

function drawCanon(x, y, level, shootAnim, angle){
    push()
    translate(x, y)
    rotate(angle)
    square(0, 0, SIZE_CELL*.5 + shootAnim*10)
    if(level == 2) square(0, 0, SIZE_CELL*.2 + shootAnim*10)
    else if(level == 3){
        fill(0)
        square(0, 0, SIZE_CELL*.2 + shootAnim*10)
    }
    else if(level == 4){
        fill(0)
        square(0, 0, SIZE_CELL*.2 + shootAnim*10)
        stroke(255)
        drawCross(0, 0, SIZE_CELL*.25 + shootAnim*10)
    }
    noStroke()
    fill(0)
    let s = 5
    rect(SIZE_CELL*.55*.5+s*.3, 0, s, s*2)
    pop()
}

function drawCrossBow(x, y, level, shootAnim, angle){
    push()
    translate(x, y)
    rotate(angle)
    rect(0, 0, SIZE_CELL*.55 + shootAnim*10, SIZE_CELL*.25 + shootAnim*10)
    if(level == 2){
        line(0, -SIZE_CELL*.25*.5, 0, SIZE_CELL*.25*.5)
    }
    if(level == 3){
        fill(0)
        noStroke()
        rect(0, 0, SIZE_CELL*.25 + shootAnim*10, SIZE_CELL*.25 + shootAnim*10)
    }
    if(level == 4){
        line(-SIZE_CELL*.25, 0, SIZE_CELL*.25, 0)
        line(0, -SIZE_CELL*.25*.5, 0, SIZE_CELL*.25*.5)
    }
    noStroke()
    fill(0)
    let s = 5
    square(SIZE_CELL*.55*.5+s*.3, 0, s)
    pop()
}

function drawBomber(x, y, level, shootAnim, angle){
    push()
    translate(x, y)
    rotate(angle)
    circle(0, 0, SIZE_CELL*.55 + shootAnim*10)
    if(level == 2){
        circle(0, 0, SIZE_CELL*.25 + shootAnim*10)
    }
    if(level == 3){
        fill(0)
        noStroke()
        circle(0, 0, SIZE_CELL*.25 + shootAnim*10)
    }
    if(level == 4){
        fill(0)
        noStroke()
        stroke(0)
        strokeWeight(4)
        let d = SIZE_CELL * .25 * .35
        point(-d, -d)
        point(-d, d)
        point(d, -d)
        point(d, d)
        
    }
    noStroke()
    fill(0)
    let s = 5
    square(SIZE_CELL*.55*.5+s*.3, 0, s)
    pop()
}