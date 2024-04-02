class Astro{
  constructor(pos, vel, m, r){
    this.pos = pos
    this.vel = vel
    this.m = m
    this.r = r
  }
  
  show(){
    fill(255)
    noStroke()
    circle(this.pos.x, this.pos.y, this.r)
  }
  
  
}