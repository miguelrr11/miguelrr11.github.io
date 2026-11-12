class Tower{
    constructor(pos, gridPos, game){
        this.pos = pos
        this.gridPos = gridPos
        this.game = game
        this.level = 1
    }
}

class Canon extends Tower{
    constructor(pos, gridPos, game){
        super(pos, gridPos, game)
        this.range = 80
        this.fireRate = 6
        this.cooldown = 0

        this.projectileOptions = {
            damage: 1,
            maxSpeed: .3,
            pierce: 1,
            acc: .01,
            startSpeed: .001
        }

        this.shootAnim = 1
    }

    levelUp(){
        this.level++
        this.projectileOptions.damage += 2
        this.fireRate *= 0.8
    }

    update(){
        this.cooldown -= deltaTime * 0.01
        if(this.cooldown > 0) return

        let inRange = this.game.getEnemiesInRange(this)
        inRange.sort((a, b) => (b.pathIndex - a.pathIndex) || (b.t - a.t))
        if (inRange.length > 0) {
            let first = inRange[0]
            let vel = {x: first.pos.x - first.prevPos.x, y: first.pos.y - first.prevPos.y}
            let mag = Math.sqrt(vel.x*vel.x + vel.y+vel.y)
            vel.x /= mag
            vel.y /= mag
            let posCorrected = {
                x: first.pos.x + vel.x * SIZE_CELL*mag,
                y: first.pos.y + vel.y * SIZE_CELL*mag
            }
            this.game.addProjectile({x: this.pos.x, y: this.pos.y}, 
                                    atan2(posCorrected.y - this.pos.y, 
                                    posCorrected.x - this.pos.x), 
                                    this.projectileOptions)
            this.cooldown = this.fireRate
            this.shootAnim = 1
        }
    
    }

    render(){
        this.shootAnim = lerp(this.shootAnim, 0, .5)
        push()
        rectMode(CENTER)
        noFill()
        stroke(0)
        strokeWeight(2)
        square(this.pos.x, this.pos.y, SIZE_CELL*.5 + this.shootAnim*10)
        if(this.level == 2) square(this.pos.x, this.pos.y, SIZE_CELL*.2 + this.shootAnim*10)
        else if(this.level == 3){
            fill(0)
            square(this.pos.x, this.pos.y, SIZE_CELL*.2 + this.shootAnim*10)
        }
        else if(this.level == 4){
            fill(0)
            square(this.pos.x, this.pos.y, SIZE_CELL*.2 + this.shootAnim*10)
            stroke(255)
            drawCross(this.pos.x, this.pos.y, SIZE_CELL*.2 + this.shootAnim*10)
        }
        stroke(200)
        discLinesEllipse({x: this.pos.x, y: this.pos.y}, this.range, this.range)
        pop()
    }
}