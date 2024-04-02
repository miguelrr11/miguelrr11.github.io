class Segment{
  
  constructor(x, y, angle, length){
    this.a = createVector(x, y)
    this.angle = angle
    this.length = length
    this.b = createVector(0, 0)
    this.update()
    
  }
  
  follow(x, y){
    let target = createVector(x, y)
    let dir = p5.Vector.sub(this.a, target)
    this.angle = dir.heading()
    
    dir.setMag(this.length)
    //dir.mult(-1)
    
    this.a = dir.add(target)
  }
  
  update(){
    let dx = this.length * Math.cos(this.angle);
    let dy = this.length * Math.sin(this.angle);
    this.b = new p5.Vector(this.a.x + dx, this.a.y + dy);
  }
  

  
  show(){
    push()
    stroke(255)
    strokeWeight(3)
    line(this.a.x, this.a.y, this.b.x, this.b.y)
    stroke(0, 255, 0)
    strokeWeight(7)
    point(this.a.x, this.a.y)
    stroke(255, 0, 0)
    point(this.b.x, this.b.y)
    pop()
  }
  
}