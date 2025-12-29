class Enemy{
    constructor(pos){
        this.x = pos.x
        this.y = pos.y
        this.w = ENEMY_SIZE
        this.h = ENEMY_SIZE

        this.initialHP = ENEMY_HP
        this.hp = this.initialHP

        this.visualHit = 0

        this.canBeRemoved = false

        this.id = Enemy.enemyID++
    }

    static enemyID = 0

    hit(dmg){
        this.hp -= dmg
        this.visualHit = 1

        textAnims.push(new TextAnim(dmg, this.x + random(-8, 8), this.y + random(-8, 8), [255, 255, 255]))
    }

    enableFireDmg(seconds, dmg){
        if(this.fireDmg != undefined) return
        this.coolDownFireCurrent = seconds * 60
        this.coolDownFire = seconds * 60
        this.fireDmg = dmg
    }

    update(dt){
        this.y += TRACK_VEL * dt

        if(this.coolDownFireCurrent != undefined){
            this.coolDownFireCurrent--
            if(this.coolDownFireCurrent <= 0){
                this.hit(this.fireDmg)
                this.coolDownFireCurrent = this.coolDownFire
                if(Math.random() < .25){ 
                    let found = enemyManager.findClosest(this)
                    if(found && found.closest){
                        if(found.closestDist < ENEMY_SIZE + 3) found.closest.enableFireDmg(this.coolDownFire/60, this.fireDmg)
                    }
                }
            }
        }

        if(this.y > height + ENEMY_SIZE) this.canBeRemoved = true
        if(this.hp <= 0) this.canBeRemoved = true
    }

    show(){
        this.visualHit = Math.max(this.visualHit - 0.05, 0)
        let visualOffset = .92
        push()
        rectMode(CENTER)


        fill(this.visualHit * 255, 0, 0)
        noStroke()
        let insideOff = 0.92
        let h = map(this.hp, 0, this.initialHP, 0, this.h)
        let y = map(this.hp, 0, this.initialHP, this.y + this.h / 2, this.y)
        rect(this.x, y, this.w * insideOff, h * insideOff, 5)

        noFill()
        if(this.fireDmg != undefined) stroke(255, 0, 0)
        else stroke(0)
        strokeWeight(2)
        rect(this.x, this.y, this.w * visualOffset, this.h * visualOffset, 5)
        pop()

        // push()
        // fill(0)
        // noStroke()
        // textAlign(CENTER)
        // text(this.hp, this.x, this.y)
        // pop()
    }
}