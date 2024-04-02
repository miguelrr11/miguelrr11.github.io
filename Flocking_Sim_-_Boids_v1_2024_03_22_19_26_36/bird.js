class Bird{
  constructor(x, y){
    this.pos = createVector(x,y)
    this.vel = createVector(0,0)
    this.acc = createVector(0,0)
    this.maxForce = 1
    this.maxForceSep = 0.1
    this.maxSpeed = 10
    this.col = 255
    this.size = 7
  }
  
  
  evade(evitar){
    let posDesired = p5.Vector.sub(evitar, this.pos)
    posDesired.setMag(this.maxSpeed)
    let steering = p5.Vector.sub(posDesired, this.vel)
    steering.limit(this.maxForceSep).mult(-1)
    this.applyForce(steering)
  }
  
  seek(ob){
    let posDesired = p5.Vector.sub(ob, this.pos)
    posDesired.setMag(this.maxSpeed)
    let steering = p5.Vector.sub(posDesired, this.vel)
    steering.limit(this.maxForce)
    this.applyForce(steering)
  }
  
  applyForce(force){
    this.acc.add(force)
  }
  
  update(){
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }
  
  edges(){
    if(this.pos.x < 0) this.pos.x = WIDTH
    if(this.pos.x > WIDTH) this.pos.x = 0
    if(this.pos.y < 0) this.pos.y = HEIGHT
    if(this.pos.y > HEIGHT) this.pos.y = 0
  }
  
  getMates(bird, cond){
    let res = []
    for(let b of birds){
      if(dist(b.pos.x, b.pos.y, bird.pos.x, bird.pos.y) < 100){ 
        res.push(b)
        if(cond)b.col = [0, 255, 0]
      }
    }
    return res
  }
  
  show(){
    push()
    stroke(255)
    fill(this.col)
    
    translate(this.pos.x, this.pos.y)
    rotate(this.vel.heading());
    triangle(-this.size, -this.size / 2, -this.size, this.size / 2, this.size, 0)
    //circle(this.pos.x, this.pos.y, 15)
    pop()
  }
  
}