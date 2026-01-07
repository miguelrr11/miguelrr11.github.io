class Player{
    constructor(){
        this.pos = createVector(width/2, height - 100)
        this.shootCooldown = 0
        this.balls = Array(1).fill('basic')
        this.balls.push('fire', 'trans', 'lightning', 'poison', 'repro', 'cross', 'split', 'heavy', 'light', 'god', 'bomb')
        this.balls = ['lightning']

        this.balls = Array(5).fill('horizontal')

        document.addEventListener('keyup', this.keyup.bind(this));
        document.addEventListener('keydown', this.keydown.bind(this));
        this.pushedKeys = new Set()

        this.damageAcumSecond = 0
        this.fpsArr = []
    }

    keydown(event){
        this.pushedKeys.add(event.key)
    }

    keyup(event){
        this.pushedKeys.delete(event.key)
    }

    returnBall(ball){
        this.balls.unshift(ball.key);
    }

    update(dt) {
        this.oldPos = this.pos.copy()

        if (this.pushedKeys.has('ArrowUp') || this.pushedKeys.has('w') || this.pushedKeys.has('W')) this.pos.y -= PLAYER_SPEED * dt;
        if (this.pushedKeys.has('ArrowDown') || this.pushedKeys.has('s') || this.pushedKeys.has('S')) this.pos.y += PLAYER_SPEED * dt;
        if (this.pushedKeys.has('ArrowRight') || this.pushedKeys.has('d') || this.pushedKeys.has('D')) this.pos.x += PLAYER_SPEED * dt;
        if (this.pushedKeys.has('ArrowLeft') || this.pushedKeys.has('a') || this.pushedKeys.has('A')) this.pos.x -= PLAYER_SPEED * dt;

        this.pos.x = constrain(this.pos.x, START_X_TRACK + PLAYER_RAD, END_X_TRACK - PLAYER_RAD)
        this.pos.y = constrain(this.pos.y, PLAYER_RAD, height - PLAYER_RAD)

        if(this.shootCooldown > 0) this.shootCooldown -= 1 * dt
        if(mouseIsPressed && this.shootCooldown <= 0 && this.balls.length > 0){
            let distAwayFromPlayer = PLAYER_RAD - 2
            let angle = atan2(mouseY - this.pos.y, mouseX - this.pos.x)
            let newBall = structuredClone(ballsPrefabs.get(this.balls.pop()))
            newBall.render = [ballsRenders.get(newBall.key)]
            if(newBall.collisionEnemy && newBall.collisionEnemy.horizontal) newBall.render.push(ballsRenders.get('horizontalRay'))
            if(newBall.collisionEnemy && newBall.collisionEnemy.vertical) newBall.render.push(ballsRenders.get('verticalRay'))
            newBall.pos = {x: this.pos.x + Math.cos(angle) * distAwayFromPlayer, y: this.pos.y + Math.sin(angle) * distAwayFromPlayer}
            newBall.vel = {x: Math.cos(angle) * newBall.speed, y: Math.sin(angle) * newBall.speed}

            newBall.totalBounces = 0

            ballManager.addBall(newBall)
            this.shootCooldown = CADENCE
        }

        this.checkCollisionEnemies()

        this.fpsArr.push(frameRate())
        if(this.fpsArr.length > 60){
            this.fpsArr.shift()
        }

        if(frameCount % 60 == 0){
            this.damageAcumSecond = 0
        }
    }

    checkCollisionEnemies(){
        //do not let enemies go through player
        for(let en of enemyManager.enemies){
            let d = dist(this.pos.x, this.pos.y, en.x, en.y)
            if(d < PLAYER_RAD + Math.max(en.w, en.h) / 2){
                this.pos = this.oldPos.copy()
                //nudge player out of enemy
                let angle = Math.atan2(this.pos.y - en.y, this.pos.x - en.x)
                this.pos.x = en.x + (PLAYER_RAD + Math.max(en.w, en.h) / 2 + 1) * Math.cos(angle)
                this.pos.y = en.y + (PLAYER_RAD + Math.max(en.w, en.h) / 2 + 1) * Math.sin(angle)   
            }
        }

    }

    drawCartucho(){
        push()
        let nBalls = this.balls.length
        let anglespan = Math.min(TWO_PI / nBalls, PI / 8)
        let radius = PLAYER_RAD + 10
        strokeWeight(5)
        for(let i = 0; i < nBalls; i++){
            let angle = anglespan * i - HALF_PI
            let x = this.pos.x + Math.cos(angle) * radius
            let y = this.pos.y + Math.sin(angle) * radius
            push()
            translate(x, y)
            stroke(ballsPrefabs.get(this.balls[i]).col)
            point(0, 0)
            pop()
        }
        pop()
    }


    show(){
        noCursor()
        push()
        noFill()
        stroke(0)
        strokeWeight(2)
        ellipse(this.pos.x, this.pos.y, PLAYER_RAD*2)

        line(START_X_TRACK, 0, START_X_TRACK, height)
        line(END_X_TRACK, 0, END_X_TRACK, height)
        pop()

        push()
        let path = getTrajectoryPath(this.pos, {x: mouseX, y: mouseY}, 3)

        blendMode(DIFFERENCE)
        stroke(255)
        strokeWeight(2)
        //crosshair that rotates with frameCount
        let crosshairSize = 15
        let angle = frameCount * 0.03
        let xOffset = cos(angle) * crosshairSize
        let yOffset = sin(angle) * crosshairSize
        line(mouseX - xOffset, mouseY - yOffset, mouseX + xOffset, mouseY + yOffset)
        line(mouseX - yOffset, mouseY + xOffset, mouseX + yOffset, mouseY - xOffset)

        for(let i = 0; i < path.length-1; i++){
            drawDashedLine(path[i].x, path[i].y, path[i+1].x, path[i+1].y, 10)
        }
        noFill()
        ellipse(path[path.length-1].x, path[path.length-1].y, 20)
        pop()

        textSize(16)
        text("Damage/sec:\n" + this.damageAcumSecond.toFixed(2) + 
             "\nFPS:\n" + (this.fpsArr.reduce((a, b) => a + b, 0) / this.fpsArr.length).toFixed(2) + 
             "\n" + enemyManager.enemies.length + " enemies", 10, 20);

        push()
        
        pop()

        this.drawCartucho()
    }
}

/**
 * Calculates the trajectory path from start to goal, stopping at the first obstacle.
 * * @param {Object} initialPos - {x, y} Starting position
 * @param {Object} goalPos    - {x, y} Target position
 * @param {Number} radius     - Ball radius (for collision width)
 * @returns {Array}           - [{x, y}, {x, y}] Start and End points of the segment
 */
function getTrajectoryPath(initialPos, goalPos, radius) {
    // 1. Start the path with the initial position
    let path = [{ x: initialPos.x, y: initialPos.y }];

    // 2. Calculate the full movement vector (Delta)
    let deltaX = goalPos.x - initialPos.x;
    let deltaY = goalPos.y - initialPos.y;

    // We start with t = 1.0 (100% of the way to goalPos)
    // If we hit something, we will lower this value.
    let minT = 1.0;

    // 3. Check All Enemies for the earliest intersection
    for (let en of enemyManager.enemies) {
        // Optimization: Skip enemies that are definitely out of range (Bounding Box check)
        // This saves expensive raycast math for far-away enemies
        let minBoxX = Math.min(initialPos.x, goalPos.x) - radius;
        let maxBoxX = Math.max(initialPos.x, goalPos.x) + radius;
        let minBoxY = Math.min(initialPos.y, goalPos.y) - radius;
        let maxBoxY = Math.max(initialPos.y, goalPos.y) + radius;

        if (en.x + en.w / 2 < minBoxX || en.x - en.w / 2 > maxBoxX ||
            en.y + en.h / 2 < minBoxY || en.y - en.h / 2 > maxBoxY) {
            continue;
        }

        // Perform the Ray vs Expanded AABB test
        let collision = rayVsExpandedAABB(initialPos, { x: deltaX, y: deltaY }, en, radius);

        // If hit, and this hit is closer than our current closest hit (minT)
        // We ensure t > 0 to avoid hitting ourselves if we are already touching
        if (collision && collision.t < minT && collision.t >= 0) {
            minT = collision.t;
        }
    }

    // 4. Check Walls
    // Left Wall
    if (deltaX < 0) {
        let t = (START_X_TRACK + radius - initialPos.x) / deltaX;
        if (t >= 0 && t < minT) minT = t;
    }
    // Right Wall
    if (deltaX > 0) {
        let t = (END_X_TRACK - radius - initialPos.x) / deltaX;
        if (t >= 0 && t < minT) minT = t;
    }
    // Top Wall
    if (deltaY < 0) {
        let t = (0 + radius - initialPos.y) / deltaY;
        if (t >= 0 && t < minT) minT = t;
    }
    // Bottom Wall
    if (deltaY > 0) {
        let t = (height - radius - initialPos.y) / deltaY;
        if (t >= 0 && t < minT) minT = t;
    }

    // 5. Calculate the final point based on minT
    // If minT is still 1.0, we reach the goal. If it's 0.5, we stop halfway.
    let finalX = initialPos.x + deltaX * minT;
    let finalY = initialPos.y + deltaY * minT;

    path.push({ x: finalX, y: finalY });

    return path;
}