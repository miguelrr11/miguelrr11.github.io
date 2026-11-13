class Enemy{
    constructor(pos, pathIndex){
        this.pos = pos
        this.prevPos = {x: pos.x, y: pos.y}
        this.pathIndex = pathIndex
        this.t = 0
        this.speed = random(.0002, 0.0008)
        this.dead = false
        this.hp = floor(random(3, 10))
        this.maxHp = this.hp
        this.id = Enemy.globalEnemyID++

        this.rad = ENEMY_RAD

        this.hitAnim = 0
    }

    static globalEnemyID = 0

    hit(projectile){
        this.hp -= projectile.damage
        this.t = Math.max(0, this.t - projectile.knockback)
        this.hitAnim = 1
    }

    update(){
        if(this.hp <= 0) this.dead = true
    }

    render(){
        push()
        stroke(0)
        if(this.hitAnim != 0){
            stroke(255 * this.hitAnim, 0, 0)
            this.hitAnim = lerp(this.hitAnim, 0, 0.1)
            if(this.hitAnim < 0.001) this.hitAnim = 0
        }
        strokeWeight(2)
        fill(180)
        //ellipse(this.pos.x, this.pos.y, 16)
        drawCross(this.pos.x, this.pos.y, map(this.hp, 0, this.maxHp, 0, 20, true), this.t * TWO_PI * .25)
        pop()
    }
}