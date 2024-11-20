class gen{
  constructor(){
    this.genes = this.generateGenes()
  }
  
  generateGenes(){
    let aux = []
    for(let i = 0; i < steps; i++){
      aux[i] = createVector(random(-1.3, 1.3), random(-1.3, 1.3))
    }
    return aux
  }
  
  cruzar(m1, m2){
    let index = floor(random(steps))
    let newGen = new gen()
    //tipo 1 (AAABBBBB, AAAAABB, AABBBBBB) demasiado efectivo
    /*
    for(let i = 0; i < index; i++){
      newGen.genes[i] = m1.genes[i]
    }
    for(let i = index; i < steps; i++){
      newGen.genes[i] = m2.genes[i]
    }
    */
    
    //tipo 2 (ABAABBAB, BBABBAAB, AAABAABB) mas realista, se puede quedar stuck
    
    for(let i = 0; i < steps; i++){
      if(random() > 0.5) newGen.genes[i] = m1.genes[i]
      else newGen.genes[i] = m2.genes[i]
    }
    
    
    
    /*tipo 3 ((A+B)/2) no tiene mucho sentido
    for(let i = 0; i < steps; i++){
      newGen.genes[i].x = (m1.genes[i].x + m2.genes[i].x)/2
      newGen.genes[i].y = (m1.genes[i].y + m2.genes[i].y)/2
    }
    */
    
    return newGen
  }
}