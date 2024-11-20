class population{
  constructor(rockets){
    this.rockets = rockets
    this.maxFit = 0
  }
  
  calcularFit(){
    let mean = 0
    for(let r of this.rockets){
      if(dist(r.pos.x, r.pos.y, goal.x, goal.y) == 0) r.fit = 1/0.01
      else r.fit = 1/dist(r.pos.x, r.pos.y, goal.x, goal.y) 
      if(r.crashed) r.fit /= 10
      if(r.arrived) r.fit *= 10
      if(r.fit > this.maxFit) this.maxFit = r.fit
      
    } 
    for(let r of this.rockets){
      r.fit = r.fit/this.maxFit
      mean += r.fit
    }
    
    fitMean.html("Fitness medio: " + mean/this.rockets.length)
  }
  
  createMP(){
    let MP = []
    for(let r of this.rockets){
      for(let i = 0; i < r.fit*100; i++){
        MP.push(r)
      }
    }
    return MP
  }
  
  createNewGen(MP){
    let newPop = []
    for(let i = 0; i < nrock; i++){
      let m1 = random(MP)
      let m2 = random(MP)
      while(m1 == m2){
        m2 = random(MP)
      }
      let newGen = m1.gen.cruzar(m1.gen, m2.gen)
      if(random() < 0.005) newGen.genes = newGen.generateGenes()
      newPop.push(new rocket(newGen))
    }
    return new population(newPop)
  }
  
  run(){
    for(let r of this.rockets){
      r.applyForce(r.gen.genes[count])
      r.update()
      r.show()
    }
    count++
  }
  
}