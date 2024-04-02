class Linea{
  constructor(pos, angle){
    this.pos = pos
    this.angle = angle
    this.dir = p5.Vector.fromAngle(this.angle)
  }
  
  show(){
    push()
    translate(this.pos.x, this.pos.y)
    line(0, 0, this.dir.x*1100-2, this.dir.y*1100-2)
    pop()
  }
  
  update(dir){
    this.pos.x = constrain(this.pos.x + dir*cos((emitter.facing)), 0+3, 500-3)
    this.pos.y = constrain(this.pos.y + dir*sin((emitter.facing)), 0+1, 500-1)
  }
  
  cast(boundaries, emitter){
    let poss = []
    for(let bound of boundaries){
      let x1 = this.pos.x
      let y1 = this.pos.y
      let x2 = x1 + this.dir.x*1100
      let y2 = y1 + this.dir.y*1100
      let x3 = bound.v1.x
      let y3 = bound.v1.y
      let x4 = bound.v2.x
      let y4 = bound.v2.y
      let aux = (((x1-x2)*(y3-y4))-((y1-y2)*(x3-x4)))
      let t = (((x1-x3)*(y3-y4))-((y1-y3)*(x3-x4))) / aux
      let u = -((((x1-x2)*(y1-y3))-((y1-y2)*(x1-x3))) / aux)
      if((t >= 0 && t <= 1) ? (u >= 0 && u <= 1) : !(u >= 0 && u <= 1)){
        if(t >= 0 && t <= 1){
          poss.push(new Boundarie(createVector(x1, y1), createVector(x1+t*(x2-x1), y1+t*(y2-y1)), 'white'))
        }
        else if(u >= 0 && u <= 1){
          poss.push(new Boundarie(createVector(x1, y1), createVector(x3+u*(x4-x3), y3+u*(y4-y3)), 'white'))
        }
      }
      
    }
    if(poss.length == 0) emitter.screen.push(0)
    else if(poss.length == 1){ 
      poss[0].show()
      emitter.screen.push(map(dist(this.pos.x, this.pos.y, poss[0].v2.x, poss[0].v2.y), 0, 500, 255, 30))
    }
    else if(poss.length > 1){
      let best = Infinity
      let bestpos = poss[0]
      for(let pos of poss){
        let aux = dist(this.pos.x, this.pos.y, pos.v2.x, pos.v2.y)
        if(aux < best){ 
          best = aux
          bestpos = pos
        }
      }
      bestpos.show()
      emitter.screen.push(map(dist(this.pos.x, this.pos.y, bestpos.v2.x, bestpos.v2.y), 0, 500, 255, 30))
    }
    
    
  }
  
}

//((t >= 0 && t <= 1) && !(u >= 0 && u <= 1)) || (!(t >= 0 && t <= 1) && (u >= 0 && u <= 1))