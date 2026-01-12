/*
constructor(pos){

    SPECIAL ATTRIBUTES:
    discardOnPlayerReturn (bool): when the player receives the ball, its discarded (p.e: repro balls)
    isReturning (bool): if true, the ball is returning to the player
    totalBounces (int): total bonces on enemies and walls
    canBeRemoved (bool): if true, the ball will be removed from the game at the end of the update loop
}
*/

class BallManager {
    constructor() {
        this.balls = []
    }

    addBall(components) {
        this.balls.push(components)
    }

    update(dt) {
        for (let i = 0; i < this.balls.length; i++) {
            let ball = this.balls[i];

            if (ball.pos && ball.vel) {
                // 1. Returning Logic
                if (ball.isReturning) {
                    let angle = Math.atan2(player.pos.y - ball.pos.y, player.pos.x - ball.pos.x);
                    ball.vel.x = lerp(ball.vel.x, Math.cos(angle) * ball.speed, 0.4);
                    ball.vel.y = lerp(ball.vel.y, Math.sin(angle) * ball.speed, 0.4);
                }

                // --- ITERATIVE COLLISION LOOP ---
                let timeLeft = dt;
                let safetyBreak = 0;

                while (timeLeft > 0 && safetyBreak < 5) {
                    safetyBreak++;

                    let deltaX = ball.vel.x * timeLeft;
                    let deltaY = ball.vel.y * timeLeft;

                    let nearestHit = null;
                    let minT = 1.0;

                    // A. Check Enemies
                    if(ball.collisionEnemy){
                        for (let en of enemyManager.enemies) {
                            if (Math.abs(en.x - ball.pos.x) > 100 + ball.speed * dt) continue;

                            let collision = rayVsExpandedAABB(ball.pos, { x: deltaX, y: deltaY }, en, BASIC_BALL_R);

                            if (collision) {
                                // Always apply damage
                                this.handleEnemyHit(ball, collision);

                                // Only consider for physics if bounce = true
                                if (ball.collisionEnemy && ball.collisionEnemy.bounce) {
                                    if (collision.t < minT && collision.t > 0.00001) {
                                        minT = collision.t;
                                        nearestHit = collision;
                                    }
                                }
                            }
                        }
                    }
                    

                    // B. Check Walls
                    let wallHit = this.checkWallCollision(ball, deltaX, deltaY);
                    if (wallHit && wallHit.t < minT && wallHit.t > 0.00001) {
                        minT = wallHit.t;
                        nearestHit = wallHit;
                    }

                    // C. Move Ball
                    ball.pos.x += deltaX * minT;
                    ball.pos.y += deltaY * minT;

                    if (nearestHit) {
                        // Nudge slightly to prevent sticking
                        ball.pos.x += nearestHit.nx * 0.1;
                        ball.pos.y += nearestHit.ny * 0.1;

                        if (nearestHit.isWall) {
                            if (nearestHit.nx !== 0) ball.vel.x *= -1;
                            if (nearestHit.ny !== 0) ball.vel.y *= -1;
                            this.applyWallLogic(ball, nearestHit.side);
                        } 
                        else if (ball.collisionEnemy && ball.collisionEnemy.bounce) {
                            if (nearestHit.nx !== 0) ball.vel.x *= -1;
                            if (nearestHit.ny !== 0) ball.vel.y *= -1;
                        }

                        // Reduce remaining time
                        timeLeft -= timeLeft * minT;
                    } 
                    else {
                        // No hit: move full distance
                        timeLeft = 0;
                        if(ball.pos.x > END_X_TRACK + ball.r || ball.pos.x < START_X_TRACK || ball.pos.y < ball.r || ball.pos.y > height + ball.r){
                            ball.pos.x = player.pos.x  
                            ball.pos.y = player.pos.y
                        }
                    }
                }
            }

            // Si la bola está dentro del player Y ya ha rebotado al menos una vez, se recoge
            if (dist(ball.pos.x, ball.pos.y, player.pos.x, player.pos.y) <= PLAYER_RAD - ball.r && ball.totalBounces > 0) {
                ball.canBeRemoved = true;
            }

            // Si la bola está cerca del player y ha rebotado, se dirige hacua el jugador
            else if(dist(ball.pos.x, ball.pos.y, player.pos.x, player.pos.y) <= PLAYER_RAD + ball.r * 2.5 && ball.totalBounces > 0){
                ball.isReturning = true
            }

            if(ball.totalBounces > MAX_BOUNCES){ 
                ball.isReturning = true
                ball.collisionEnemy = undefined
                ball.speed = BALL_SPEED * 2
            }
        }

        // Remove collected balls
        for (let i = this.balls.length - 1; i >= 0; i--) {
            if (this.balls[i].canBeRemoved){ 
                if(!this.balls[i].discardOnPlayerReturn) player.returnBall(this.balls[i])
                this.balls.splice(i, 1);
            }
        }
    }


    // New Helper for Walls to match the Raycast format
    checkWallCollision(ball, dx, dy) {
        let tMin = 2.0;
        let side = null;
        let nx = 0, ny = 0;

        // Calculate time to hit each wall: t = (WallPos - BallPos) / Velocity
        // Left Wall
        if (dx < 0) {
            let t = (START_X_TRACK + ball.r - ball.pos.x) / dx;
            if (t >= 0 && t <= 1 && t < tMin) { tMin = t; side = 'left'; nx = 1; ny = 0; }
        }
        // Right Wall
        if (dx > 0) {
            let t = (END_X_TRACK - ball.r - ball.pos.x) / dx;
            if (t >= 0 && t <= 1 && t < tMin) { tMin = t; side = 'right'; nx = -1; ny = 0; }
        }
        // Top Wall
        if (dy < 0) {
            let t = (0 + ball.r - ball.pos.y) / dy;
            if (t >= 0 && t <= 1 && t < tMin) { tMin = t; side = 'top'; nx = 0; ny = 1; }
        }
        // Bottom Wall
        if (dy > 0) {
            let t = (height - ball.r - ball.pos.y) / dy;
            if (t >= 0 && t <= 1 && t < tMin) { tMin = t; side = 'bottom'; nx = 0; ny = -1; }
        }

        if (side) {
            return { t: tMin, nx: nx, ny: ny, side: side, isWall: true };
        }
        return null;
    }

    applyWallLogic(ball, side) {
        // Apply speed boosts or specific logic here
        ball.speed = Math.min(ball.speed * 1.05, 5);
        const angle = Math.atan2(ball.vel.y, ball.vel.x);
        ball.vel.x = Math.cos(angle) * ball.speed;
        ball.vel.y = Math.sin(angle) * ball.speed;
        ball.totalBounces++

        if (side == 'bottom' && ball.collisionBottom && ball.collisionBottom.return) {
            ball.isReturning = true;
            ball.collisionEnemy = undefined
        }
        if(ball.collisionWall && (side == 'left' || side == 'right') && ball.collisionWall.times > 0 && ball.collisionEnemy){
            ball.collisionWall.times--
            ball.collisionEnemy.dmg *= ball.collisionWall.dmgMult
        }
    }

    handleEnemyHit(ball, hit) {
        if(ball.lastFrameHit == undefined) ball.lastFrameHit = frameCount - 1
        if(ball.lastFrameHit == frameCount) return //avoid multiple hits in the same frame
        ball.lastFrameHit = frameCount

        if(ball.collisionEnemy && ball.collisionEnemy.bounce){
            ball.speed = Math.min(ball.speed * 1.05, 5);
            const angle = Math.atan2(ball.vel.y, ball.vel.x);
            ball.vel.x = Math.cos(angle) * ball.speed;
            ball.vel.y = Math.sin(angle) * ball.speed;
            ball.totalBounces++

            if(ball.collisionEnemy.dmgMultOnBounce){
                if(ball.totalBounces <= ball.collisionEnemy.dmgMultOnBounceMaxBounces){
                    ball.collisionEnemy.dmg += ball.collisionEnemy.dmgMultOnBounceVal
                }
            }
        }
        

        if (ball.collisionEnemy) {
            if (ball.collisionEnemy.bounce) {
                hit.enemy.hit(ball.collisionEnemy.dmg, undefined, hit);
            } 
            else if (!ball.collisionEnemy.bounce && (ball.lastHitID === undefined || ball.lastHitID !== hit.enemy.id)) {
                hit.enemy.hit(ball.collisionEnemy.dmg, undefined, hit);
                ball.lastHitID = hit.enemy.id;
            }
            this.applyStatus(ball, hit.enemy)
            if (ball.repro && ball.repro.enabled) {
                // the duplicated balls lose the repro ability by default to avoid infinite loops
                ball.repro.bounces == undefined ? ball.repro.bounces = 0 : ball.repro.bounces--
                if(ball.repro.bounces <= 0) ball.repro.enabled = false
                for(let i = 0; i < ball.repro.times; i++){
                    let newBall = structuredClone(ballsPrefabs.get(ball.repro.key))
                    let dmgMult = ball.repro.dmgMult ? ball.repro.dmgMult : 1
                    let reproSizeMult = ball.repro.sizeMult ? ball.repro.sizeMult : 1
                    newBall.render = [ballsRenders.get(newBall.key)]
                    newBall.collisionEnemy.dmg *= dmgMult
                    newBall.r *= reproSizeMult
                    if(newBall.collisionEnemy && newBall.collisionEnemy.horizontal) newBall.render.push(ballsRenders.get('horizontalRay'))
                    if(newBall.collisionEnemy && newBall.collisionEnemy.vertical) newBall.render.push(ballsRenders.get('verticalRay'))
                    newBall.pos = {x: ball.pos.x, y: ball.pos.y}
                    let angle = random(TWO_PI)
                    newBall.vel = {x: Math.cos(angle) * newBall.speed, y: Math.sin(angle) * newBall.speed}
                    newBall.discardOnPlayerReturn = true
                    newBall.totalBounces = 0

                    //very important line: spawned balls should not reproduce again
                    if(newBall.repro) newBall.repro.enabled = false

                    if(ball.repro.copyStatus){
                        //copy status effects from parent ball
                        if(ball.collisionEnemy.fire){
                            newBall.collisionEnemy.fire = true
                            newBall.collisionEnemy.fireDmg = ball.collisionEnemy.fireDmg ? ball.collisionEnemy.fireDmg * dmgMult : DEF_FIRE_DMG * dmgMult
                        }
                        if(ball.collisionEnemy.poison){
                            newBall.collisionEnemy.poison = true
                            newBall.collisionEnemy.poisonDmg = ball.collisionEnemy.poisonDmg ? ball.collisionEnemy.poisonDmg * dmgMult : DEF_POISON_DMG * dmgMult
                        }
                        if(ball.collisionEnemy.lightning){
                            newBall.collisionEnemy.lightning = true
                            newBall.collisionEnemy.lightningDmg = ball.collisionEnemy.lightningDmg ? ball.collisionEnemy.lightningDmg * dmgMult : DEF_LIGHTNING_DMG * dmgMult
                        }
                    }

                    this.addBall(newBall)
                }
            }
            if(ball.collisionEnemy.horizontal){
                //spawn an horizontal ray at the y level of the enemy. Every enemy that is crossed by that ray takes damage
                let rayY = hit.enemy.y
                let hitEnemy = false
                for(let en of enemyManager.enemies){
                    if(en.id != hit.enemy.id){
                        if(en.y - en.h/2 <= rayY && en.y + en.h/2 >= rayY){
                            en.hit(ball.collisionEnemy.dmg, undefined, hit)
                            this.applyStatus(ball, en)
                            hitEnemy = true
                        }
                    }
                }
                if(hitEnemy){
                    if(ball.rays === undefined) ball.rays = []
                    ball.rays.push({y: rayY, life: RAY_DURATION})
                }
            }
            if(ball.collisionEnemy.vertical){
                //spawn a vertical ray at the x level of the enemy. Every enemy that is crossed by that ray takes damage
                let rayX = hit.enemy.x
                let hitEnemy = false
                for(let en of enemyManager.enemies){
                    if(en.id != hit.enemy.id){
                        if(en.x - en.w/2 <= rayX && en.x + en.w/2 >= rayX){
                            en.hit(ball.collisionEnemy.dmg, undefined, hit)
                            this.applyStatus(ball, en)
                            hitEnemy = true
                        }
                    }
                }
                if(hitEnemy){
                    if(ball.rays === undefined) ball.rays = []
                    ball.rays.push({x: rayX, life: RAY_DURATION})
                }
            }
            if(ball.collisionEnemy.bomb){
                ball.canBeRemoved = true
                let radius = ball.collisionEnemy.bombRadius
                for(let en of enemyManager.enemies){
                    let d = dist(hit.enemy.x, hit.enemy.y, en.x, en.y)
                    if(en.id != hit.enemy.id && d <= radius){
                        let damage = map(d, 0, radius, ball.collisionEnemy.bombDmg, 0)
                        let angle = Math.atan2(en.y - hit.colY, en.x - hit.colX)
                        //move enemy a bit away from the bomb center
                        en.vx = Math.cos(angle) * 2
                        en.vy = Math.sin(angle) * 2
                        en.hit(damage, undefined, hit)
                        this.applyStatus(ball, en)
                    }
                }
                pm.emit({
                    position: createVector(hit.colX, hit.colY),
                    count: 150,
                    speedMin: 1,
                    speedMax: 7,
                    lifespan: 30,
                    colors: [color(255, 150, 0), color(255, 100, 0), color(255, 200, 50)],  
                    fade: true,
                    angle: 0,
                    spread: TWO_PI,
                    sizeMin: 6,
                    sizeMax: 15
                })
            }
        }
    }

    applyStatus(ball, enemy){
        if (ball.collisionEnemy.fire) {
            let statusDmg =  ball.collisionEnemy.fireDmg == undefined ? DEF_FIRE_DMG : ball.collisionEnemy.fireDmg
            enemy.enableFireDmg(2, statusDmg);
        }
        if(ball.collisionEnemy.lightning){
            let statusDmg =  ball.collisionEnemy.lightningDmg == undefined ? DEF_LIGHTNING_DMG : ball.collisionEnemy.lightningDmg
            enemy.lightning(statusDmg)
        }
        if (ball.collisionEnemy.poison) {
            let statusDmg =  ball.collisionEnemy.poisonDmg == undefined ? DEF_POISON_DMG : ball.collisionEnemy.poisonDmg
            enemy.enablePoisonDmg(0.5, statusDmg);
        }
    }

    show() {
        push()
        for (let i = 0; i < this.balls.length; i++) {
            let ball = this.balls[i];
            if(ball.trail == undefined) ball.trail = []
            ball.trail.push({x: ball.pos.x, y: ball.pos.y})
            if(ball.trail.length > BALL_TRAIL_LENGTH) ball.trail.shift()
            // Draw Trail
            noFill()
            strokeWeight(ball.r * .5)
            for(let i = 0; i < ball.trail.length; i++){
                strokeWeight(map(i, 0, ball.trail.length, 0, ball.r * .5))
                stroke(color(ball.col[0], ball.col[1], ball.col[2], map(i, 0, ball.trail.length, 0, 150)))
                line(ball.trail[i].x, ball.trail[i].y, ball.trail[Math.min(i+1, ball.trail.length-1)].x, ball.trail[Math.min(i+1, ball.trail.length-1)].y)
            }
            for(let renderFunc of ball.render) renderFunc.call(ball)
            
        }
        pop()
    }
}

function clampCustom(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function hitBounds(ball, leftX, rightX, topY, bottomY) {
    if (ball.pos.x - ball.r <= leftX) return 'left';   // left wall
    if (ball.pos.x + ball.r >= rightX) return 'right';  // right wall
    if (ball.pos.y - ball.r <= topY) return 'top';    // top wall
    if (ball.pos.y + ball.r >= bottomY) return 'bottom'; // bottom wall

    return false;
}

const EPSILON = 0.0001;

function rayVsExpandedAABB(start, delta, enemy, r) {
    const minX = (enemy.x - enemy.w / 2) - r;
    const maxX = (enemy.x + enemy.w / 2) + r;
    const minY = (enemy.y - enemy.h / 2) - r;
    const maxY = (enemy.y + enemy.h / 2) + r;

    // Check if we are already stuck inside (Fail-safe)
    if (start.x >= minX && start.x <= maxX && start.y >= minY && start.y <= maxY) {
         // Push out slightly to nearest edge? 
         // For now, simpler to return null or handle purely as separating axis.
         // Usually, we return null here to let the "stuck" logic in update handle it.
         return null; 
    }

    let tNearX = (minX - start.x) / delta.x;
    let tFarX  = (maxX - start.x) / delta.x;
    let tNearY = (minY - start.y) / delta.y;
    let tFarY  = (maxY - start.y) / delta.y;

    if (Number.isNaN(tNearX) || Number.isNaN(tFarX)) return null;
    if (Number.isNaN(tNearY) || Number.isNaN(tFarY)) return null;

    if (tNearX > tFarX) [tNearX, tFarX] = [tFarX, tNearX];
    if (tNearY > tFarY) [tNearY, tFarY] = [tFarY, tNearY];

    if (tNearX > tFarY || tNearY > tFarX) return null;

    const tHit = Math.max(tNearX, tNearY);
    const tExit = Math.min(tFarX, tFarY);

    // EPSILON fix: Check if tHit is effectively 0 (we are on surface)
    // We only care about future hits, so tHit > EPSILON
    if (tHit > 1 || tHit < -EPSILON || tExit < 0) return null;

    let nx = 0; 
    let ny = 0;

    if (tNearX > tNearY) {
        nx = delta.x < 0 ? 1 : -1;
    } else {
        ny = delta.y < 0 ? 1 : -1;
    }

    return {
        t: tHit,
        nx: nx,
        ny: ny,
        enemy: enemy,
        colX: start.x + delta.x * tHit,
        colY: start.y + delta.y * tHit
    };
}
