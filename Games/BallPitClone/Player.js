class Player{
    constructor(){
        this.pos = createVector(width/2, height - 100)
        this.shootCooldown = 0
        this.balls = Array(10).fill('basic')
        this.balls.push('fire', 'trans', 'lightning', 'poison', 'repro')
        //this.balls = ['repro']
    }

    returnBall(ball){
        this.balls.unshift(ball.key);
    }

    update(dt) {
        if (keyIsDown(UP_ARROW) || key === 'w' || key === 'W') this.pos.y -= PLAYER_SPEED * dt;
        if (keyIsDown(DOWN_ARROW) || key === 's' || key === 'S') this.pos.y += PLAYER_SPEED * dt;
        if (keyIsDown(RIGHT_ARROW) || key === 'd' || key === 'D') this.pos.x += PLAYER_SPEED * dt;
        if (keyIsDown(LEFT_ARROW) || key === 'a' || key === 'A') this.pos.x -= PLAYER_SPEED * dt;
        this.pos.x = constrain(this.pos.x, START_X_TRACK + PLAYER_RAD, END_X_TRACK - PLAYER_RAD)
        this.pos.y = constrain(this.pos.y, PLAYER_RAD, height - PLAYER_RAD)

        if(this.shootCooldown > 0) this.shootCooldown -= 1 * dt
        if(mouseIsPressed && this.shootCooldown <= 0 && this.balls.length > 0){
            let distAwayFromPlayer = PLAYER_RAD - 2
            let angle = atan2(mouseY - this.pos.y, mouseX - this.pos.x)
            let newBall = structuredClone(ballsPrefabs.get(this.balls.pop()))
            newBall.render = ballsRenders.get(newBall.key)
            newBall.pos = {x: this.pos.x + Math.cos(angle) * distAwayFromPlayer, y: this.pos.y + Math.sin(angle) * distAwayFromPlayer}
            newBall.vel = {x: Math.cos(angle) * newBall.speed, y: Math.sin(angle) * newBall.speed}

            newBall.totalBounces = 0

            ballManager.addBall(newBall)
            this.shootCooldown = CADENCE
        }
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

        stroke(0, 150)
        strokeWeight(2)
        for(let i = 0; i < path.length-1; i++){
            drawDashedLine(path[i].x, path[i].y, path[i+1].x, path[i+1].y, 10)
        }
        noFill()
        ellipse(path[path.length-1].x, path[path.length-1].y, 20)
        pop()
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