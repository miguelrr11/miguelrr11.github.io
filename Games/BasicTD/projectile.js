class Projectile{
    constructor(pos, angle, speed, dmg){
        this.pos = pos
        this.angle = angle
        this.speed = speed
        this.damage = dmg
        this.enemiesTouchedID = []

        this.pierce = Infinity

        this.lifetime = .2 * 60

        this.dead = false
    }
    
    hit(enemyID){
        this.enemiesTouchedID.push(enemyID)
        this.pierce--
    }

    update(){
        this.pos.x += Math.cos(this.angle) * this.speed * deltaTime
        this.pos.y += Math.sin(this.angle) * this.speed * deltaTime
        this.lifetime -= deltaTime * 0.01
        if(this.pierce <= 0) this.dead = true
        if(this.lifetime <= 0) this.dead = true
    }

    render(){
        push()
        fill(250, 0, 30)
        noStroke()
        ellipse(this.pos.x, this.pos.y, 6, 6)
        pop()
    }
}