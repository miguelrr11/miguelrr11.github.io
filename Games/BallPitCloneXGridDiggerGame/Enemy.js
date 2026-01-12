class Enemy{
    constructor(pos){
        this.x = pos.x
        this.y = pos.y
        this.w = ENEMY_SIZE
        this.h = ENEMY_SIZE

        //only used for dynamic movement like bombs
        this.vx = 0
        this.vy = 0
        this.accx = 0
        this.accy = 0
        this.vFriction = 0.9

        this.initialHP = ENEMY_HP
        this.hp = this.initialHP

        this.visualHit = 0
        this.t = 0
        this.spawnT = 0

        this.canBeRemoved = false

        this.id = Enemy.enemyID++
    }

    static enemyID = 0

    hit(dmg, col = [255, 255, 255], hitObj){
        if(this.hp <= 0) return

        let crit = Math.random() < CRIT_CHANCE
        if(crit) dmg *= CRIT_MULTIPLIER

        dmg = dmg * random(1 - RND_MUL_DMG, 1 + RND_MUL_DMG)
        dmg *= DMG_MULT_PLAYER_XP

        this.hp -= dmg
        this.visualHit = 1

        player.damageAcumSecond += dmg

        let dmgTxt = crit ? dmg.toFixed(1) + '!' : dmg.toFixed(1)

        if(dmg > player.maxDmg) player.maxDmg = dmg
        if(dmg < player.minDmg) player.minDmg = dmg
        let size = map(dmg, player.minDmg, player.maxDmg, 14, 25, true)
        if(crit) size *= 1.5

        textAnims.push(new TextAnim(dmgTxt, this.x + random(-8, 8), this.y + random(-8, 8), col, size))

        let nx = hitObj ? hitObj.nx : random(-1, 1)
        let ny = hitObj ? hitObj.ny : random(-1, 1)
        let angle = Math.atan2(ny, nx)
        let accVector = p5.Vector.fromAngle(angle)
        let rcol = random(160, 220)

        // if(hitObj) pm.emit({
        //     position: createVector(hitObj.colX, hitObj.colY),
        //     count: random(2, 5),
        //     speedMin: 1,
        //     speedMax: 2,
        //     lifespan: 10,
        //     colors: color(rcol, rcol, rcol),   
        //     fade: true,
        //     angle: angle,
        //     speedMin: 0.5,
        //     speedMax: 2,
        //     spread: PI / 3,
        //     gravity: accVector.mult(-0.1)
        // })
    }

    enableFireDmg(seconds, dmg){
        if(this.fireDmg != undefined) return
        this.coolDownFireCurrent = seconds * 60
        this.coolDownFire = seconds * 60
        this.fireDmg = dmg
    }

    enablePoisonDmg(seconds, dmg){
        if(this.poisonDmg != undefined) return
        this.coolDownPoisonCurrent = seconds * 60
        this.coolDownPoison = seconds * 60
        this.poisonDmg = dmg
        this.poisonCountdown = POISON_COUNTDOWN * random(0.8, 1.2)
    }

    disablePoisonDmg(){
        this.poisonDmg = undefined
        this.coolDownPoisonCurrent = undefined
        this.coolDownPoison = undefined
    }

    update(dt){
        this.y += TRACK_VEL * dt
        this.t += dt * 0.05
        if(!this.dying) this.spawnT = lerp(this.spawnT, 1, 0.2)
        else this.spawnT = lerp(this.spawnT, 0, 0.2)

        //only used for dynamic movement like bombs
        this.x += this.vx * dt
        this.y += this.vy * dt
        this.vx += this.accx * dt
        this.vy += this.accy * dt
        this.vx *= this.vFriction
        this.vy *= this.vFriction

        if(this.x - this.w / 2 < START_X_TRACK){
            this.x = START_X_TRACK + this.w / 2 + 1
        }
        if(this.x + this.w / 2 > END_X_TRACK){
            this.x = END_X_TRACK - this.w / 2 -1
        }

        if(this.coolDownFireCurrent != undefined){
            this.coolDownFireCurrent--
            if(this.coolDownFireCurrent <= 0){
                this.hit(this.fireDmg, ballsPrefabs.get('fire').col)
                this.coolDownFireCurrent = this.coolDownFire
                if(Math.random() < .5){ 
                    let found = enemyManager.findClosest(this)
                    if(found && found.closest){
                        if(found.closestDist < ENEMY_SIZE + 3) found.closest.enableFireDmg(this.coolDownFire/60, this.fireDmg)
                    }
                }
            }
        }

        if(this.coolDownPoisonCurrent != undefined){
            this.coolDownPoisonCurrent--
            this.poisonCountdown--
            if(this.coolDownPoisonCurrent <= 0){
                this.hit(this.poisonDmg, ballsPrefabs.get('poison').col)
                this.coolDownPoisonCurrent = this.coolDownPoison
            }
            if(this.poisonCountdown <= 0){
                this.disablePoisonDmg()
            }
        }

        if(this.y > height + ENEMY_SIZE) this.canBeRemoved = true
        if(this.hp <= 0){ 
            this.dying = true
        }
        if(this.dying && this.spawnT < 0.01){
            this.canBeRemoved = true
        }
    }

    lightning(dmg, prob = 1, avoid = []){
        let found = enemyManager.findRandomCircle(this, avoid, ENEMY_SIZE * 4)
        if(found && found.closest){
            found.closest.hit(dmg, ballsPrefabs.get('lightning').col)
            this.showLightning(found.closest)
            avoid.push(found.closest)
            if(Math.random() < prob) found.closest.lightning(dmg, prob * 0.8, avoid)
            
        }
    }

    showLightning(target){
        for(let i = 0; i < 2; i++){
            let col = random(200, 255)
            pm.emitLightning({
                start: createVector(this.x, this.y),
                end: createVector(target.x, target.y),
                color: color(col, col, 0),
                segments: random(3, 5),
                offset: random(5, 11),
                thickness: random(1.5, 3),
                lifespan: 40,
            });
        }

    }

    showFire(){
        pm.emit({
            position: createVector(this.x + random(-this.w/4, this.w/4), this.y + random(-this.h/4, this.h/4)),
            count: 2,
            speedMin: 0.5,
            speedMax: 1.5,
            lifespan: 30,
            colors: [color(255, 100, 0), color(255, 0, 0)],
            fade: true,
            gravity: createVector(0, -0.02)
        })
    }

    showPoison(){
        if(Math.random() < 0.7) return
        pm.emit({
            position: createVector(this.x + random(-this.w/4, this.w/4), this.y + random(-this.h/4, this.h/4)),
            count: 1,
            speedMin: 0.1,
            speedMax: 0.5,
            lifespan: 50,
            colors: [color(0, 255, 0, 200), color(0, 180, 0, 200)],
            fade: true,
            spread: TWO_PI,
            sizeMin: 15,
            sizeMax: 21,
            gravity: createVector(0, 0)
        })
    }

    show(){
        if(this.fireDmg != undefined) this.showFire()
        if(this.poisonDmg != undefined) this.showPoison()
        this.visualHit = Math.max(this.visualHit - 0.05, 0)
        let visualOffset = (.92 + this.visualHit * 0.08) * this.spawnT
        push()
        rectMode(CENTER)
        translate(this.x, this.y)
        rotate(Math.cos(this.visualHit + PI*.5)*.5)

        fill(this.visualHit * 255, 0, 0)
        noStroke()
        let insideOff = visualOffset
        let h = map(this.hp, 0, this.initialHP, 0, this.h, true)
        let y = map(this.hp, 0, this.initialHP, this.y + this.h / 2, this.y, true)
        //rect(0, y - this.y, this.w * insideOff, h * insideOff, 5)

        fill(0, map(this.hp, 0, this.initialHP, 50, 255, true))
        if(this.fireDmg != undefined) stroke(255, 0, 0)
        else stroke(0)
        strokeWeight(2)
        rect(0, 0, this.w * visualOffset, this.h * visualOffset, 5)
        pop()

        // push()
        // fill(0)
        // noStroke()
        // textAlign(CENTER)
        // text(this.hp, this.x, this.y)
        // pop()
    }
}