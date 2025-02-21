class Particle{
    constructor(x, y, color, lifespan, vel, acc, friction, angle, rotVel, size){
        this.pos = createVector(x, y)
        this.vel = vel
        this.acc = acc
        this.friction = friction
        this.color = color
        this.lifespan = lifespan
        this.angle = angle
        this.rotVel = rotVel
        this.size = size
    }

    dead(){
        return this.lifespan <= 0
    }

    update(){
        this.vel.add(this.acc)
        this.vel.mult(this.friction)
        this.pos.add(this.vel)
        this.angle += this.rotVel
        this.lifespan--
    }

    show(){
        push()
        noStroke()
        translate(this.pos.x, this.pos.y)
        rotate(this.angle)
        fill(this.color)
        rect(0, 0, this.size, this.size)
        pop()
    }
}