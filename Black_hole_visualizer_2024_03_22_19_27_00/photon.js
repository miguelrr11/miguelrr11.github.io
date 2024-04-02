class Photon{
  constructor(pos, vel){
    this.pos = pos
    this.vel = vel
  }
  
  show(){
    strokeWeight(2)
    stroke(255, 0, 0)
    point(this.pos.x, this.pos.y)
  }
}