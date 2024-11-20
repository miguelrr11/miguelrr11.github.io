class Emitter {
  constructor(rays) {
    this.rays = rays
    this.pos = createVector(200, 200)
    this.facing = 0
    this.screen = []
  }

  rotateRays(a) {
    this.screen = []
    for (let ray of this.rays) {
      ray.angle = (ray.angle - a) % 360
      ray.dir = p5.Vector.fromAngle(ray.angle)
      ray.cast(boundaries, this)
    }
    this.facing = (this.facing - a)%360
    this.showGuide()
  }

  updateRays(dir) {
    this.screen = []
    for (let ray of this.rays) {
      ray.update(dir)
      ray.cast(boundaries, this)
    }
    this.showGuide()
  }
  
  show(){
    this.screen = []
    for (let ray of this.rays) {
      ray.cast(boundaries, this)
    }
    this.showGuide()
  }
  
  showGuide(){
    push()
    stroke(0, 255, 0)
    strokeWeight(2)
    this.rays[45].show()
    pop()
  }
  
}
