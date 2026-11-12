const TRANSPARENCY_PARTICLE_THRESHOLD = 0.9

class ParticleManager{
    constructor(){
        this.particles = []
        this.coolDown = 1
    }

    addParticle(options){
        // if(this.coolDown > 0) return
        // this.coolDown = 10

        let particle = new Particle(options)
        this.particles.push(particle)
    }

    updateParticles(){
        for(let i = this.particles.length - 1; i >= 0; i--){
            let p = this.particles[i]
            p.update()
            if(p.isFinished()){
                this.particles.splice(i, 1)
            }
        }
    }

    drawParticles(){
        push()
        noStroke()
        for(let p of this.particles){
            p.show()
        }
        pop()
    }
}

class Particle{
    constructor(options){
        this.pos = options.pos != undefined ? options.pos.copy() : createVector(random(width), random(height))
        this.vel = options.vel != undefined ? options.vel.copy() : createVector(0, 0)
        this.acc = options.acc != undefined ? options.acc.copy() : createVector(0, 1)
        this.lifetime = options.lifetime != undefined ? options.lifetime : 180
        this.age = 0
        this.size = options.size != undefined ? options.size : 5
        this.color = options.color != undefined ? options.color : 0
        this.goal = options.goal ? options.goal : undefined
        this.maxSpeed = 10
        this.maxForce = 0.2
    }

    update(){
        if(this.goal){
            let desired = p5.Vector.sub(this.goal, this.pos)   // points at the goal
            let d = desired.mag()
            let slowRadius = 50
            let speed = d < slowRadius ? map(d, 0, slowRadius, 1, this.maxSpeed) : this.maxSpeed
            desired.setMag(speed)

            let steer = p5.Vector.sub(desired, this.vel)
            steer.limit(this.maxForce)
            this.acc.add(steer)
        }
        this.vel.add(this.acc)
        this.vel.limit(this.maxSpeed)
        this.pos.add(this.vel)
        this.acc.mult(0)
        this.age++
    }

    outOfBounds(){
        return (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height)
    }

    isFinished(){
        return (this.age >= this.lifetime || this.outOfBounds())
    }

    show(){
        let trans = this.age / this.lifetime > TRANSPARENCY_PARTICLE_THRESHOLD ? 
        map(this.age, this.lifetime * TRANSPARENCY_PARTICLE_THRESHOLD, this.lifetime, 100, 0) : 100
        fill(this.color[0], this.color[1], this.color[2], trans)
        ellipse(this.pos.x, this.pos.y, this.size * 2)
    }
}