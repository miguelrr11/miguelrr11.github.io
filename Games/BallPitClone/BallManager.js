// constructor(pos){
//     /*
//     pos (vector)
//     vel (vector)
//     */
// }

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
                for (let en of enemyManager.enemies) {
                    if (Math.abs(en.x - ball.pos.x) > 100 + ball.speed * dt) continue;

                    let collision = rayVsExpandedAABB(ball.pos, { x: deltaX, y: deltaY }, en, ball.r);

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
                    } else if (ball.collisionEnemy && ball.collisionEnemy.bounce) {
                        if (nearestHit.nx !== 0) ball.vel.x *= -1;
                        if (nearestHit.ny !== 0) ball.vel.y *= -1;
                    }

                    // Reduce remaining time
                    timeLeft -= timeLeft * minT;
                } else {
                    // No hit: move full distance
                    timeLeft = 0;
                }
            }
        }

        // Cleanup & Player Catch
        if (dist(ball.pos.x, ball.pos.y, player.pos.x, player.pos.y) <= PLAYER_RAD * 1.2) {
            player.balls.unshift(ball.key);
            ball.canBeRemoved = true;
        }
    }

    // Remove collected balls
    for (let i = this.balls.length - 1; i >= 0; i--) {
        if (this.balls[i].canBeRemoved) this.balls.splice(i, 1);
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

        if (side == 'bottom' && ball.collisionBottom && ball.collisionBottom.return) {
            ball.isReturning = true;
        }
    }

    handleEnemyHit(ball, hit) {
        // Same logic as before
        if(ball.collisionEnemy.bounce){
            ball.speed = Math.min(ball.speed * 1.1, 10);
            const angle = Math.atan2(ball.vel.y, ball.vel.x);
            ball.vel.x = Math.cos(angle) * ball.speed;
            ball.vel.y = Math.sin(angle) * ball.speed;
        }
        

        if (ball.collisionEnemy) {
            if (ball.collisionEnemy.bounce) {
                hit.enemy.hit(ball.collisionEnemy.dmg);
            } 
            else if (!ball.collisionEnemy.bounce && (ball.lastHitID === undefined || ball.lastHitID !== hit.enemy.id)) {
                hit.enemy.hit(ball.collisionEnemy.dmg);
                ball.lastHitID = hit.enemy.id;
            }
            if (ball.collisionEnemy.fire) {
                hit.enemy.enableFireDmg(2, ball.collisionEnemy.dmg);
            }
        }
    }

    show() {
        push()
        for (let i = 0; i < this.balls.length; i++) {
            this.balls[i].show()
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
        enemy: enemy
    };
}
