class Animation{
    constructor(x, y, type, i, j){
        this.x = x
        this.y = y
        this.particles = []
        this.initParticles(type)
        this.i = i
        this.j = j
        this.particlesAlive = 0
    }

    finished(){
        return this.particles.length == 0
    }

    //constructor(x, y, color, lifespan, vel, acc, friction, angle, rotVel, size, followPlayer)
    //anim = {type, explosion, follow}
    initParticles(anim){
        let type = anim.type;
        let explosionMat = anim.explosion;
        let dir = anim.direction
        let followPlayer = anim.followPlayer
        let colMat = type == 'miningMat1' ? colMat1 : type == 'miningMat2' ? colMat2 : colMat3
        let shapeMat = type == 'miningMat1' ? 'ellipse' : type == 'miningMat2' ? 'rect' : 'triangle'
        let colWalking = anim.color
        if(type == 'mining'){
            for(let i = 0; i < 5; i++){
                let x = this.x + random(-cellPixelSize/2, cellPixelSize/2)
                let y = this.y + random(-cellPixelSize/2, cellPixelSize/2)
                let col = random(170, 220)
                let lifespan = random(10, 25)
                let vel = createVector(random(-1.5, 1.5), random(-1.5, 1.5))
                let acc = createVector(0, 0)
                let friction = 0.9
                let angle = 0
                let rotVel = random(-0.1, 0.1)
                let size = random(cellPixelSize*.2, cellPixelSize*.25)
                let shape = 'rect'
                this.particles.push(new Particle(x, y, col, lifespan, vel, acc, friction, angle, rotVel, size, shape, false))
            }
        }
        if(type == 'miningMat1' || type == 'miningMat2' || type == 'miningMat3'){
            let count = explosionMat ? 20 : 4
            for(let i = 0; i < count; i++){
                let x = this.x + random(-cellPixelSize/2, cellPixelSize/2)
                let y = this.y + random(-cellPixelSize/2, cellPixelSize/2)
                let col = randomizeColor(colMat, 30)
                let lifespan = explosionMat ? random(50, 60) : random(10, 25)
                let speed = explosionMat ? 8.5 : 3
                let direction = dir ? dir : createVector(random(-1, 1), random(-1, 1)).normalize()
                let vel = createVector(direction.x*speed, direction.y*speed)
                let acc = explosionMat ? p5.Vector.fromAngle(atan2(vel.y, vel.x)).mult(-0.3) : createVector(0,0) //effect of particles returning to the center
                let friction = .92
                let angle = 0
                let rotVel = random(-0.1, 0.1)
                let size = random(cellPixelSize*.3, cellPixelSize*.3)
                let shape = shapeMat
                this.particles.push(new Particle(x, y, col, lifespan, vel, acc, friction, angle, rotVel, size, shape, followPlayer))
            }
        }
        if(type == 'walking'){
            for(let i = 0; i < 4; i++){
                let x = this.x + random(-cellPixelSize/2, cellPixelSize/2)
                let y = this.y + random(-cellPixelSize/2, cellPixelSize/2)
                let col = randomizeColor(colWalking, 10)
                let lifespan = random(10, 17)
                let strength = random(1, 1.4)
                let vel = createVector(dir.x*strength, dir.y*strength)
                let acc = createVector(0, 0)
                let friction = 0.95
                let angle = 0
                let rotVel = 0
                let size = random(cellPixelSize*.2, cellPixelSize*.25)
                let shape = 'rect'
                this.particles.push(new Particle(x, y, col, lifespan, vel, acc, friction, angle, rotVel, size, shape, false))
            }
        }
        if(type == 'fuse'){
            let count = explosionMat ? 200 : 2
            for(let i = 0; i < count; i++){
                let x = this.x + random(-cellPixelSize/8, cellPixelSize/8)
                let y = this.y + random(-cellPixelSize/8, cellPixelSize/8)
                let col1 = color(255, 0, 0)
                let col2 = color(255, 255, 0)
                let col = lerpColor(col1, col2, Math.random())
                let lifespan = explosionMat ? random(40, 80) : random(20, 30)
                let strength = explosionMat ? random(8, 12) : random(2.5, 3.4)
                // direction of a fuse, upwards and sliightly to the sides
                let dir = explosionMat ? createVector(random(-1, 1), random(-1, 1)).normalize() :
                createVector(random(-0.5, 0.5), -1).normalize()
                let vel = createVector(dir.x*strength, dir.y*strength)
                let acc = createVector(0, 0)
                let friction = 0.965
                let angle = random(-PI/4, PI/4)
                let rotVel = 0
                let size = explosionMat ?  random(cellPixelSize*.35, cellPixelSize*.45) : 
                random(cellPixelSize*.2, cellPixelSize*.25)
                let shape = 'rect'
                this.particles.push(new Particle(x, y, col, lifespan, vel, acc, friction, angle, rotVel, size, shape, false))
            }
        }
    }

    update(){
        this.particlesAlive = 0
        for(let i = this.particles.length - 1; i >= 0; i--){
            this.particles[i].update()
            if(this.particles[i].dead()) this.particles.splice(i, 1)
            else this.particlesAlive++
        }
    }

    isInVision(){
        return true
        return curLightMap.lightingGrid[this.i][this.j].visible
    }

    show(){
        if(this.isInVision()) for(let p of this.particles) p.show()
    }
}