class rocket{
  constructor(newGen){
    this.pos = createVector(width/2, height)
    this.speed = createVector()
    this.ac = createVector()
    this.arrived = false
    this.crashed = false
    if(newGen) this.gen = newGen
    else this.gen = new gen()
    this.fit = 0
  }
  
  applyForce(force){
    this.ac.add(force)
  }
  
  update(){
    if(!this.arrived && !this.crashed){
      this.speed.add(this.ac)
      this.speed.setMag(4)
      this.speed.limit(5)
      this.pos.add(this.speed)
      this.ac.mult(0)
    }
    if(!this.arrived && dist(this.pos.x, this.pos.y, goal.x, goal.y) < 10){ 
      this.arrived = true
      this.pos.x = goal.x
      this.pos.y = goal.y
    }
    if(this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) this.crashed = true
   
    for(let o of obstacles){
      if(o.crashed(this.pos.x, this.pos.y)) this.crashed = true
    }
    
  }
  
  
  show(){
    push()
    noStroke()
    fill(255, 150)
    rectMode(CENTER)
    translate(this.pos.x, this.pos.y)
    rotate(this.speed.heading())
    rect(0, 0, 25, 6)
    pop()
  }
}