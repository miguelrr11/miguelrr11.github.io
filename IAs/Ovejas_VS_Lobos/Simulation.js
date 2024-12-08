class Simulation{
    constructor(){
        this.entorno = new Entorno()
        this.init()
        
        this.plotPop = new MigPLOT(WIDTH, 0, 250, 250, [0], 'Population', '')
        this.plotPop.minGlobal = 0

        this.plotAvgSpeed = new MigPLOT(WIDTH+250, 0, 250, 250, [0], 'Avg Movement Cooldown', '')
        this.plotAvgSpeed.minGlobal = 0
        this.plotAvgSpeed.maxGlobal = 100

        this.plotAvgBeauty = new MigPLOT(WIDTH, 250, 250, 250, [0], 'Avg Beauty', '')
        this.plotAvgBeauty.minGlobal = 0
        this.plotAvgBeauty.maxGlobal = 1

        this.plotAvgRadius = new MigPLOT(WIDTH+250, 250, 250, 250, [0], 'Avg Radius', '')
        this.plotAvgRadius.minGlobal = 0
        this.plotAvgRadius.maxGlobal = 50

        this.plotAvgAge = new MigPLOT(WIDTH, 500, 250, 250, [0], 'Avg Age', '')
        this.plotAvgAge.minGlobal = 0
        this.plotAvgAge.maxGlobal = 300

    }

    init(){
        this.ovejas = []
        for(let i = 0; i < N_OVEJAS; i++){
            let o = new Oveja(this.entorno, this)
            o.age = STARTING_AGE    
            this.ovejas.push(o)
        }
    }

    reproduce(o1, o2){
        if(!o1 || !o2) return
        let nOffsprings = Math.max(Math.floor(Math.random() * 5), 1)
        for(let i = 0; i < nOffsprings; i++){
            let mutSpeed  = randomGaussian(0, 0.5) * 1
            let mutBeauty = randomGaussian(0, 0.5) * 0.1
            let mutRadius = randomGaussian(0, 0.5) * 0.5
            let offspring = new Oveja(this.entorno, this, 
                                      o1.pos.copy(),
                                      Math.max((o1.speed + o2.speed) * .5 + mutSpeed, 0),
                                      Math.max((o1.beauty + o2.beauty) * .5 + mutBeauty, 0),
                                      Math.max((o1.radius + o2.radius) * .5 + mutRadius, 0))
            this.ovejas.push(offspring)
            //console.log(mutSpeed, mutBeauty, mutRadius)
        }
    }

    getAvgs(){
        let sumSpeed = 0
        let sumBeauty = 0
        let sumRadius = 0
        let sumAge = 0
        for(let o of this.ovejas){
            sumSpeed += o.speed
            sumBeauty += o.beauty
            sumRadius += o.radius
            sumAge += o.age
        }
        let n = this.ovejas.length
        return [sumSpeed/n, sumBeauty/n, sumRadius/n, sumAge/n]
    }

    updatePlots(){
        this.plotPop.feed(this.ovejas.length)
        let avgs = this.getAvgs()
        this.plotAvgSpeed.feed(avgs[0])
        this.plotAvgBeauty.feed(avgs[1])
        this.plotAvgRadius.feed(avgs[2])
        this.plotAvgAge.feed(avgs[3])
    }

    update(){
        for(let i = 0; i < this.ovejas.length; i++){ 
            let o = this.ovejas[i]
            o.update()
            if(!o.alive){
                this.ovejas.splice(i, 1)
                i--
                this.entorno.growFood(o.pos)
            }
        }
        //if(Math.random() < FOOD_REGEN) this.entorno.regenerateFood()
        if(frameCount % 60 == 0) this.updatePlots()
    }

    show(){
        background(100)
        push()
        if(mouseIsPressed){
            translate(-WIDTH/2, -HEIGHT/2)
            scale(2)
            let zoomCenterx = mouseX - WIDTH / 2
            let zoomCentery = mouseY - HEIGHT / 2
            translate(-zoomCenterx, -zoomCentery)
        }
        this.entorno.show()
        for(let o of this.ovejas) o.show()
        pop()

        noStroke()
        fill(100)
        rect(WIDTH, 0, 500, HEIGHT)
        this.plotPop.show()
        this.plotAvgSpeed.show()
        this.plotAvgBeauty.show()
        this.plotAvgRadius.show()
        this.plotAvgAge.show()
    }
}