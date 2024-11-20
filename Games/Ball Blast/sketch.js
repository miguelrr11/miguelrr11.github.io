const WIDTH = 400
const HEIGHT = 600

let player, w, h
let floorA, floorB
let bullets = []
let balls = []
let tecla
let score = 0

function setup(){
    createCanvas(WIDTH, HEIGHT)
    player = createVector(50, 510)
    w = 20
    h = 50
    floorA = createVector(0, 560)
    floorB = createVector(WIDTH, 560)
    fill(255)
    stroke(255)

    balls.push(new Ball(createVector(200, 200), floor(random(9, 17))))
    balls.push(new Ball(createVector(300, 200), floor(random(9, 17))))
}

function draw(){
    background(0)

    if(balls.length < 2) balls.push(new Ball(createVector(200, 200), floor(score/3)))

    player.x = mouseX

    player.x = constrain(player.x, 0, WIDTH-w)
    if(frameCount % 6 == 0){
        if(score < 100){
            if(random() < 0.2){
                bullets.push(new Bullet(player.x, player.y, createVector(0, -5), 1))
                bullets.push(new Bullet(player.x + w, player.y, createVector(0, -5), 1))
            }
            else bullets.push(new Bullet(player.x + w/2, player.y, createVector(0, -5), 1))
        }
        else if(score < 200){
            bullets.push(new Bullet(player.x, player.y, createVector(-1, -5), 1))
            bullets.push(new Bullet(player.x + w/2, player.y, createVector(0, -5), 1))
            bullets.push(new Bullet(player.x + w, player.y, createVector(1, -5), 1))
        }
        else{
            bullets.push(new Bullet(player.x, player.y, createVector(0, -5), 3))
            bullets.push(new Bullet(player.x + w, player.y, createVector(0, -5), 3))
        }
        
    }

    //BULLETS
    for(let i = 0; i < bullets.length; i++){
        let b = bullets[i]
        for(let ball of balls){
            if(ball.collideBullet(b)){ 
                bullets.splice(i, 1)
            }
        }
        if(b.y < -10) bullets.splice(i, 1)
        else{ 
            b.updatePos()
            b.show()
        }
    }


    //BALLS
    for(let i = 0; i < balls.length; i++){
        let b = balls[i]
        for(let j = 0; j < balls.length; j++){
            let b2 = balls[j]
            if(b == b2) continue
            else b.collideBall(b2)
        }
        if(b.n <= 0){ 
            if(b.initialN >= 10){
                balls.push(new Ball(createVector(b.pos.x + 50, b.pos.y), floor(b.initialN/2)),
                           new Ball(createVector(b.pos.x - 50, b.pos.y), floor(b.initialN/2)))
            }
            if(random() < 0.1){
                balls.push(new Ball(createVector(random(150, 350), 200), floor(score/5)))
            }
            balls.splice(i, 1)
            
            score += b.initialN
        }
        else{
            b.update()
            b.show()
        }  
    }
    

    rect(player.x, player.y, w, h)
    line(floorA.x, floorA.y, floorB.x, floorB.y)

    push()
    textSize(50)
    textAlign(LEFT)
    fill(255)
    text(score, 20, 50)
    pop()
}




