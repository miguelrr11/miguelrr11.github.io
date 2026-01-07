class XPManager{
    constructor(){
        this.xp = 0
        this.xpToNextLevel = 100
        this.level = 1

        this.animationNewLevel = 0

        this.orbs = []
    }

    addOrb(pos){
        let angle = random(TWO_PI)
        let speed = random(2.5, 3.5)
        let vel = {x: Math.cos(angle) * speed, y: Math.sin(angle) * speed}
        let amount = Math.random() < 0.1 ? 10 : 1
        let size = 0
        this.orbs.push({pos: pos.copy(), vel: vel, amount, angleOffset: random(TWO_PI), size, speed})
    }

    addXP(amount){
        this.xp += amount
        if(this.xp >= this.xpToNextLevel){
            this.xp -= this.xpToNextLevel
            this.level++
            this.xpToNextLevel = floor(this.xpToNextLevel * 1.3)
            let ta = new TextAnim('Level Up! ' + this.level, WIDTH / 2, 50, [0, 255, 0], 32)
            ta.pauseCounter = 60
            textAnims.push(ta)
            this.animationNewLevel = 1
            player.levelUp()
        }
    }

    checkWallCollision(orb){
        if(orb.pos.x < START_X_TRACK + orb.size / 2){
            orb.pos.x = START_X_TRACK + orb.size / 2
            orb.vel.x *= -1
        }
        if(orb.pos.x > END_X_TRACK - orb.size / 2){
            orb.pos.x = END_X_TRACK - orb.size / 2
            orb.vel.x *= -1
        }
        if(orb.pos.y > HEIGHT - orb.size / 2){
            return true
        }
        if(orb.pos.y < 0 + orb.size / 2){
            orb.pos.y = 0 + orb.size / 2
            orb.vel.y *= -1
        }
        return false
    }

    update(DT){
        for(let i = this.orbs.length - 1; i >= 0; i--){
            let orb = this.orbs[i]
            orb.size = lerp(orb.size, orb.amount == 1 ? 5 : 9, 0.1)
            orb.pos.y += TRACK_VEL * DT
            orb.pos.y += orb.vel.y * DT
            orb.pos.x += orb.vel.x * DT
            orb.vel.x *= 0.9
            orb.vel.y *= 0.9
            let remove = this.checkWallCollision(orb)
            let d = dist(orb.pos.x, orb.pos.y, player.pos.x, player.pos.y)
            if(d < ORB_RAD){
                //gravity like force
                let angle = Math.atan2(player.pos.y - orb.pos.y, player.pos.x - orb.pos.x)
                let force = p5.Vector.fromAngle(angle).mult(0.5)
                orb.vel.x += force.x
                orb.vel.y += force.y
            }
            //calculate speed based on velx and vely
            let speed = Math.sqrt(orb.vel.x * orb.vel.x + orb.vel.y * orb.vel.y)
            orb.speed = speed
            if(d < PLAYER_RAD){
                this.addXP(orb.amount)
                this.orbs.splice(i, 1)
            }
            if(remove){
                this.orbs.splice(i, 1)
            }
        }
    }

    drawXPBar(){
        push()
        stroke(0)
        strokeCap(SQUARE)
        strokeWeight(5)
        noFill()
        let xp = this.xp
        if(this.animationNewLevel > 0){
            this.animationNewLevel = lerp(this.animationNewLevel, 0, 0.1)
            xp = map(this.animationNewLevel, 0, 1, 0, this.xpToNextLevel)
            if(this.animationNewLevel < 0.01) this.animationNewLevel = 0
        }
        arc(player.pos.x, player.pos.y, PLAYER_RAD * 0.9, PLAYER_RAD * 0.9, -HALF_PI, -HALF_PI + TWO_PI * (xp / this.xpToNextLevel))
        pop()
    }

    show(){
        for(let orb of this.orbs){
            push()
            rectMode(CENTER)
            translate(orb.pos.x, orb.pos.y)
            rotate(orb.angleOffset + orb.speed * frameCount * 0.1)
            orb.amount == 1 ? fill(20, 50, 255) : fill(100, 200, 255)
            noStroke()
            rect(0, 0, orb.size, orb.size)
            pop()
        }
    }
}