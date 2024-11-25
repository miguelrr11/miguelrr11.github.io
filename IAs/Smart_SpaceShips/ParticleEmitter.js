class ParticleEmitter{
    constructor(size){
        this.particles = []
        this.size = size
    }

    shoot(position, angle){
        let delta = 0.35
        let off = Math.random() * delta - delta * 0.5
        this.particles.push({
            pos: createVector(position.x, position.y),
            trans: 255,
            vel: p5.Vector.fromAngle(angle+off).mult(Math.random()*10),
            acc:  p5.Vector.fromAngle(angle+off).mult(0.1),
            col: color(255, random(60, 150), 0)
        })
    }

    update(){
        for(let i = 0; i < this.particles.length; i++){
            let p = this.particles[i]
            p.vel.add(p.acc)
            p.pos.add(p.vel)
            p.trans -= Math.random() * 25
            p.col.setAlpha(p.trans)
            if(p.trans < 0){
                this.particles.splice(i, 1)
                i--
            }
        }
    }

    show(){
        push()
        noStroke()
        for(let p of this.particles){
            fill(p.col)
            let tam = mapp(p.trans, 255, 0, this.size, 0)
            ellipse(p.pos.x, p.pos.y, tam)
        }
        pop()
    }
}