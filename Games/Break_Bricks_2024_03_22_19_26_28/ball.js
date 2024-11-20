class Ball{
  constructor(x, y, sx, sy, vida){
    this.pos = createVector(x, y)
    this.speed = createVector(sx, sy)
    this.vida = vida
  }
  
  update(){
    this.pos.add(this.speed)
    if(this.pos.y >= height){
      return false
    }
    if(this.pos.y <= 0){
      this.speed.y = -this.speed.y
    }
    if(this.pos.x > width || this.pos.x < 0){
      this.speed.x = -this.speed.x
    }
    if(this.pos.x >= barraPos.x-barraRadio && this.pos.x <= barraPos.x+barraRadio 
       && this.pos.y >= barraPos.y-5 && this.pos.y <= barraPos.y+5){
      //this.speed.x = constrain(map(this.speed.x, 1, 7, 0, abs(this.pos.x - barraPos.x)), -7, 7)
      let dis = this.pos.x - barraPos.x
      if(dis >= 0){
        this.speed.x = map(abs(dis), 0, barraRadio, 0, 6)
      }
      if(dis < 0){
        this.speed.x = map(abs(dis), 0, barraRadio, 0, -6)
      }
      this.speed.y = 8 - abs(this.speed.x)
      this.speed.y = -this.speed.y
      this.speed.y = constrain(this.speed.y, -6, 6)
    }
    return true
  }
  
  show(){
    push()
    if(this.vida == undefined){ 
      fill(255)
      stroke(255, 0, 0)
    }
    else fill(map(this.vida, 1, 10, 100, 200))
    ellipse(this.pos.x, this.pos.y, 15)
    noStroke()
    pop()
  }
}

