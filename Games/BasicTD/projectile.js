class Projectile{
    constructor(pos, angle, options, drawOptions, game){
        this.pos = pos
        this.angle = angle
        this.game = game
        
        this.enemiesTouchedID = []

        this.pierce = options.pierce ? options.pierce : 1
        this.speed = options.startSpeed ? options.startSpeed : .1
        this.maxSpeed = options.maxSpeed ? options.maxSpeed : .1
        this.damage = options.damage ? options.damage : 1
        this.acc = options.acc ? options.acc : 0
        this.knockback = options.knockback ? options.knockback : 0

        this.onDeath = options.onDeath ? options.onDeath : null
        this.onDeathOptions = options.onDeathOptions ? options.onDeathOptions : {}

        this.rad = drawOptions.rad ? drawOptions.rad : 8
        
        this.lifetime = .2 * 60

        this.dead = false
    }

    isCollision(enemy){
        return distanceAB(this.pos, enemy.pos) <= enemy.rad
    }
    
    hit(enemyID){
        if(this.pierce <= 0) return false
        this.enemiesTouchedID.push(enemyID)
        this.pierce--
        return true
    }

    die(){
        if(!this.dead){
            this.dead = true
            if(this.onDeath){
                if(this.onDeath == 'bomb'){
                    this.game.addBomb({...this.pos}, 0, this.onDeathOptions, {})
                }
            }
        }
    }

    update(){
        this.speed += this.acc
        this.speed = Math.min(this.speed, this.maxSpeed)

        this.pos.x += Math.cos(this.angle) * this.speed * dt
        this.pos.y += Math.sin(this.angle) * this.speed * dt
        this.lifetime -= 16 * 0.01

        if(this.pierce <= 0 || this.lifetime <= 0) this.die()
    }

    render(){
        push()
        fill(250, 0, 30)
        noStroke()
        circle(this.pos.x, this.pos.y, this.rad)
        pop()
    }
}

class Bomb extends Projectile{
    constructor(pos, angle, options, drawOptions, game){
        super(pos, angle, options, drawOptions, game)

        this.acc = 0
        this.speed = 0
        this.pierce = Infinity
        this.knockback = 0

        this.rad = 12

        this.lifetime = .045 * 60
        this.maxLifetime = this.lifetime
    }

    isCollision(enemy){
        return this.lifetime > 0 && distanceAB(this.pos, enemy.pos) <= ((enemy.rad + this.rad)/2)
    }

    update(){
        this.speed += this.acc
        this.speed = Math.min(this.speed, this.maxSpeed)

        this.pos.x += Math.cos(this.angle) * this.speed * dt
        this.pos.y += Math.sin(this.angle) * this.speed * dt

        this.rad *= 1.125   //1.125

        this.lifetime -= 16 * 0.01
        if(this.pierce <= 0) this.dead = true
        if(this.lifetime <= 0) this.dead = true
    }

    render(){
        push()
        fill(250, 0, 30, map(this.lifetime, 0, this.maxLifetime, 50, 255))
        noStroke()
        circle(this.pos.x, this.pos.y, this.rad)
        pop()
    }

}