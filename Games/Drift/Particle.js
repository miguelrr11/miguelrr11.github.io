class Particle{
    constructor(x, y, color, lifespan, vel, acc, friction, angle, rotVel, size, shape, followPlayer){
        this.pos = createVector(x, y)
        this.vel = vel
        this.acc = acc
        this.friction = friction
        this.color = color
        this.lifespan = lifespan
        this.startTrans = this.lifespan*0.5
        this.deltaTrans = 255/this.startTrans
        this.trans = 255
        this.angle = angle
        this.rotVel = rotVel
        this.size = size
        this.shape = shape
        this.followPlayer = followPlayer
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
        if(this.lifespan < this.startTrans){
            this.trans -= this.deltaTrans
        }
    }

    show(){
        push()
        noStroke()
        translate(this.pos.x, this.pos.y)
        rotate(this.angle)
        fill([...this.color, this.trans])
        if(this.shape == 'rect') rect(0, 0, this.size, this.size)
        if(this.shape == 'ellipse') ellipse(0, 0, this.size, this.size)
        if(this.shape == 'triangle') drawTriangle(this.size)
        pop()
    }
}