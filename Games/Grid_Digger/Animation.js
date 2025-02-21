class Animation{
    constructor(x, y, type){
        this.x = x
        this.y = y
        this.particles = []
        this.initParticles(type)
    }

    finished(){
        return this.particles.length == 0
    }

    //constructor(x, y, color, lifespan, vel, acc, friction, angle, rotVel, size)
    initParticles(type){
        switch(type){
            case 'mining':
                for(let i = 0; i < 10; i++){
                    let x = this.x + random(-cellPixelSize/2, cellPixelSize/2)
                    let y = this.y + random(-cellPixelSize/2, cellPixelSize/2)
                    let col = random(170, 220)
                    let lifespan = random(10, 25)
                    let vel = createVector(random(-1.5, 1.5), random(-1.5, 1.5))
                    let acc = createVector(0, 0)
                    let friction = 0.9
                    let angle = 0
                    let rotVel = random(-0.1, 0.1)
                    let size = random(3, 5)
                    this.particles.push(new Particle(x, y, col, lifespan, vel, acc, friction, angle, rotVel, size))
                }
                break
            case 'walking':
                    for(let i = 0; i < 3; i++){
                        let x = this.x + random(-cellPixelSize/2, cellPixelSize/2)
                        let y = this.y + random(-cellPixelSize/2, cellPixelSize/2)
                        let col = random(200, 230)
                        let lifespan = random(10, 25)
                        let vel = createVector(random(-1.5, 1.5), random(-1.5, 1.5))
                        let acc = createVector(0, 0)
                        let friction = 0.9
                        let angle = 0
                        let rotVel = random(-0.1, 0.1)
                        let size = random(3, 5)
                        this.particles.push(new Particle(x, y, col, lifespan, vel, acc, friction, angle, rotVel, size))
                    }
                    break
            default: console.log('error')
        }
    }

    update(){
        for(let i = this.particles.length - 1; i >= 0; i--){
            this.particles[i].update()
            if(this.particles[i].dead()) this.particles.splice(i, 1)
        }
    }

    show(){
        for(let p of this.particles) p.show()
    }
}