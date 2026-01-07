class Particle {
  constructor(pos, vel, options) {
    this.pos = pos.copy();
    this.vel = vel.copy();

    this.acc = options.gravity
      ? options.gravity.copy()
      : createVector(0, 0);

    this.life = options.lifespan;
    this.maxLife = options.lifespan;

    this.size = random(options.sizeMin, options.sizeMax);
    this.sizeEnd = options.sizeEnd ?? this.size;

    this.rotation = random(options.rotationMin ?? 0, options.rotationMax ?? 0);
    this.rotationSpeed = random(
      options.rotationSpeedMin ?? 0,
      options.rotationSpeedMax ?? 0
    );

    this.color = random(options.colors);
    this.fade = options.fade ?? true;
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);

    this.rotation += this.rotationSpeed;
    this.life--;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);

    let t = this.life / this.maxLife;
    let size = lerp(this.sizeEnd, this.size, t);

    let alpha = this.fade ? map(this.life, 0, this.maxLife, 0, 255) : 255;
    fill(red(this.color), green(this.color), blue(this.color), alpha);
    noStroke();

    ellipse(0, 0, size);
    pop();
  }

  isDead() {
    return this.life <= 0;
  }
}

class ParticleManager {
  constructor() {
  this.particles = [];
  this.lightnings = [];
}


  /**
   * General-purpose particle emitter
   */
  emit({
    position,
    count = 20,

    angle = -HALF_PI,
    spread = PI / 8,

    speedMin = 1,
    speedMax = 5,

    lifespan = 60,

    colors = [color(255)],

    gravity = createVector(0, 0),

    sizeMin = 4,
    sizeMax = 8,
    sizeEnd = null,

    rotationMin = 0,
    rotationMax = 0,
    rotationSpeedMin = 0,
    rotationSpeedMax = 0,

    fade = true
  }) {
    for (let i = 0; i < count; i++) {
      let a = angle + random(-spread, spread);
      let speed = random(speedMin, speedMax);
      let vel = p5.Vector.fromAngle(a).mult(speed);

      this.particles.push(
        new Particle(position, vel, {
          lifespan,
          colors,
          gravity,
          sizeMin,
          sizeMax,
          sizeEnd,
          rotationMin,
          rotationMax,
          rotationSpeedMin,
          rotationSpeedMax,
          fade
        })
      );
    }
  }

  emitLightning({
    start,
    end,

    segments = 20,
    offset = 20,

    thickness = 2,
    lifespan = 10,

    color = color(180, 220, 255),
    fade = true
    }) {
    this.lightnings.push(
        new Lightning(start, end, {
        segments,
        offset,
        thickness,
        lifespan,
        color,
        fade
        })
    );
    }


  update() {
    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
        let p = this.particles[i];
        p.update();
        if (p.isDead()) this.particles.splice(i, 1);
    }

    // Lightning
    for (let i = this.lightnings.length - 1; i >= 0; i--) {
        let l = this.lightnings[i];
        l.update();
        if (l.isDead()) this.lightnings.splice(i, 1);
    }
    }


    show() {
        push()
        for (let l of this.lightnings) {
            l.draw();
        }

        for (let p of this.particles) {
            p.draw();
        }
        pop()
    }


  clear() {
    this.particles.length = 0;
  }
}

class Lightning {
  constructor(start, end, options = {}) {
    this.start = start.copy();
    this.end = end.copy();

    this.segments = options.segments ?? 20;
    this.offset = options.offset ?? 20;
    this.thickness = options.thickness ?? 2;

    this.life = options.lifespan ?? 10;
    this.maxLife = this.life;

    this.color = options.color ?? color(180, 220, 255);
    this.fade = options.fade ?? true;

    this.points = this.generatePoints();
  }

  generatePoints() {
    let pts = [];
    pts.push(this.start.copy());

    for (let i = 1; i < this.segments; i++) {
      let t = i / this.segments;
      let p = p5.Vector.lerp(this.start, this.end, t);

      let normal = p5.Vector.sub(this.end, this.start)
        .rotate(HALF_PI)
        .normalize();

      let displacement = random(-this.offset, this.offset);
      p.add(normal.mult(displacement));

      pts.push(p);
    }

    pts.push(this.end.copy());
    return pts;
  }

  update() {
    this.life--;
  }

  draw() {
    let alpha = this.fade
      ? map(this.life, 0, this.maxLife, 0, 255)
      : 255;

    stroke(
      red(this.color),
      green(this.color),
      blue(this.color),
      alpha
    );
    strokeWeight(this.thickness);
    noFill();

    beginShape();
    for (let p of this.points) {
      vertex(p.x, p.y);
    }
    endShape();
  }

  isDead() {
    return this.life <= 0;
  }
}

