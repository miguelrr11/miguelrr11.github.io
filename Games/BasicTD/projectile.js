class Projectile{
    constructor(pos, angle, options){
        this.pos = pos
        this.angle = angle
        
        this.enemiesTouchedID = []

        this.pierce = options.pierce ? options.pierce : 1
        this.speed = options.startSpeed ? options.startSpeed : .1
        this.maxSpeed = options.maxSpeed ? options.maxSpeed : .1
        this.damage = options.damage ? options.damage : 1
        this.acc = options.acc ? options.acc : 0
        this.knockback = options.knockback ? options.knockback : 0

        
        this.lifetime = .2 * 60

        this.dead = false
    }
    
    hit(enemyID){
        if(this.pierce <= 0) return false
        this.enemiesTouchedID.push(enemyID)
        this.pierce--
        return true
    }

    update(){
        this.speed += this.acc
        this.speed = Math.min(this.speed, this.maxSpeed)

        this.pos.x += Math.cos(this.angle) * this.speed * dt
        this.pos.y += Math.sin(this.angle) * this.speed * dt
        this.lifetime -= dt * 0.01
        if(this.pierce <= 0) this.dead = true
        if(this.lifetime <= 0) this.dead = true
    }

    render(){
        push()
        fill(250, 0, 30)
        noStroke()
        circle(this.pos.x, this.pos.y, 8)
        pop()
    }
}