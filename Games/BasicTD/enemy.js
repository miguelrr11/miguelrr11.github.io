class Enemy{
    constructor(pos, pathIndex){
        this.pos = pos
        this.prevPos = pos
        this.pathIndex = pathIndex
        this.t = 0
        this.speed = random(.0025, 0.001)
        this.dead = false
        this.hp = floor(random(3, 10))
        this.id = Enemy.globalEnemyID++
    }

    static globalEnemyID = 0

    hit(damage){
        this.hp -= damage
        this.t = Math.max(0, this.t - .1)
    }

    update(){
        if(this.hp <= 0) this.dead = true
    }

    render(){
        push()
        stroke(0)
        strokeWeight(2)
        fill(180)
        //ellipse(this.pos.x, this.pos.y, 16)
        drawCross(this.pos.x, this.pos.y, 20, this.t * TWO_PI * .25)
        pop()
    }
}