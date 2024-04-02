class Brick{
  constructor(x, y, vidaMax, powerUp){
    this.pos = createVector(x, y)
    this.vidaMax = vidaMax
    this.vida = vidaMax
    this.powerUp = powerUp
  }
  
  /*
  PowerUps:
  1: explosion: spawnea 8 bolas en todas direcciones
  2: barra mejorada: alarga la barra
  3: nueva bola: añade permanentemente una bola
  4: cañon: añade un spawner de bolas con vida = 1 a la barra
  */
  
  hit(){
    this.vida--
    if(this.vida == 0){
      if(this.powerUp == 1){
        balls.push(new Ball(this.pos.x, this.pos.y, 0, -6, 10))
        balls.push(new Ball(this.pos.x, this.pos.y, 6, -6, 10))
        balls.push(new Ball(this.pos.x, this.pos.y, 6, 1, 10))
        balls.push(new Ball(this.pos.x, this.pos.y, 6, 6, 10))
        balls.push(new Ball(this.pos.x, this.pos.y, 0, 6, 10))
        balls.push(new Ball(this.pos.x, this.pos.y, -6, 6, 10))
        balls.push(new Ball(this.pos.x, this.pos.y, -6, 1, 10))
        balls.push(new Ball(this.pos.x, this.pos.y, -6, -6, 10))
      }
      if(this.powerUp == 2){
        barraRadio += 65
      }
      if(this.powerUp == 3){
        balls.push(new Ball(this.pos.x, this.pos.y, 0, 4, undefined))
      }
      if(this.powerUp == 4){
        spawner = true
        contSpawn = 20
      }
      return true
    }
  }
  
  show(){
    push()
    stroke(0)
    strokeWeight(2)
    fill(map(this.vida, 0, this.vidaMax, 0, 255))
    if(this.powerUp == 1) fill(255, 0, 0)
    if(this.powerUp == 2) fill(0, 255, 0)
    if(this.powerUp == 3) fill(255, 255, 0)
    if(this.powerUp == 4) fill(0, 0, 255)
    rect(this.pos.x, this.pos.y, 40, 20)
    pop()
  }
}