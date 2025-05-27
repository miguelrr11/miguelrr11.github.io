const RAD_PART = 2
const DIAM_PART = RAD_PART * 2;
const DIAM_PART_SQUARED = DIAM_PART * DIAM_PART;
const FRICTION = 0.999;

class Particle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.prevPos = createVector(x, y);
        this.acc = createVector(0, 0);
        this.id = Particle.nextId++;
        this.isPinned = false;     
    }
    static nextId = 0;

    applyForce(x, y) {
        this.acc.x += x;
        this.acc.y += y;
    }

    insertIntoGrid() {
        const indexX = Math.floor(this.pos.x / DIAM_PART);
        const indexY = Math.floor(this.pos.y / DIAM_PART);
        const index = indexX + indexY * Math.floor(width / DIAM_PART);
        if (!gridParticles[index]) gridParticles[index] = [];
        gridParticles[index].push(this);
    }

    update(timeStep) {
        // Verlet integration
        let vel = p5.Vector.sub(this.pos, this.prevPos)
        this.prevPos = this.pos.copy();
        this.pos.add(p5.Vector.add(vel, this.acc.copy().mult(timeStep * timeStep)));
        this.acc.set(0, 0);
    }

    repel(particles, separationDistance) {
        if (this.isPinned) return;
        particles.forEach(other => {
            if (other !== this) {
                let diff = p5.Vector.sub(this.pos, other.pos);
                let distance = diff.mag();
                if (distance < separationDistance) {
                    if (distance === 0) distance = 0.1;
                    let strength = (separationDistance - distance) / separationDistance;
                    diff.normalize().mult(strength);
                    this.applyForce(diff.x, diff.y);
                }
            }
        });
    }


    edges() {
        if (this.pos.x < RAD_PART) this.pos.x = RAD_PART;
        if (this.pos.y < RAD_PART) this.pos.y = RAD_PART;
        if (this.pos.x > WIDTH - RAD_PART)  this.pos.x = WIDTH - RAD_PART;
        if (this.pos.y > HEIGHT - RAD_PART) this.pos.y = HEIGHT - RAD_PART;
    }

    show() {
        
        ellipse(this.pos.x, this.pos.y, DIAM_PART, DIAM_PART);
    }
}
