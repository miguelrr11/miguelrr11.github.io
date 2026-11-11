class Tower{
    constructor(pos, game){
        this.pos = pos
        this.game = game
    }
}

class Canon extends Tower{
    constructor(pos, game){
        super(pos, game)
        this.range = random(50, 120)
        this.damage = 1
        this.fireRate = 0.5
        this.cooldown = 0
    }

    update(){
        this.cooldown -= deltaTime * 0.01
        if(this.cooldown > 0) return
        let inRange = this.game.getEnemiesInRange(this)
        inRange.sort((a, b) => (b.pathIndex - a.pathIndex) || (b.t - a.t))
        if (inRange.length > 0) {
            let first = inRange[0]
            let vel = {x: first.pos.x - first.prevPos.x, y: first.pos.y - first.prevPos.y}
            let posCorrected = {
                x: first.pos.x + vel.x * SIZE_CELL*.5,
                y: first.pos.y + vel.y * SIZE_CELL*.5
            }
            this.game.addProjectile({x: this.pos.x, y: this.pos.y}, 
                                    atan2(posCorrected.y - this.pos.y, 
                                    posCorrected.x - this.pos.x), .3, this.damage)
            this.cooldown = 1
        }
    }

    render(){
        push()
        rectMode(CENTER)
        noFill()
        stroke(0)
        strokeWeight(2)
        rect(this.pos.x, this.pos.y, SIZE_CELL*.5, SIZE_CELL*.5)
        stroke(200)
        discLinesEllipse({x: this.pos.x, y: this.pos.y}, this.range, this.range)
        pop()
    }
}