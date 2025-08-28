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
        for(let p of this.particles){
            p.show()
        }
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

    }

    update(){
        this.vel.add(this.acc)
        this.pos.add(this.vel)
        this.age++
    }

    outOfBounds(){
        return (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height)
    }

    isFinished(){
        return (this.age >= this.lifetime || this.outOfBounds())
    }

    show(){
        push()
        colorMode(HSB, 100)
        noStroke()
        fill(this.color, 100, 100)
        ellipse(this.pos.x, this.pos.y, this.size * 2)
        pop()
    }
}