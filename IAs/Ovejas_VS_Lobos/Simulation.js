class Simulation{
    constructor(){
        this.entorno = new Entorno()
        this.init()

        let sizePlot = HEIGHT*.2
        let x = WIDTH + WIDTH_UI - sizePlot
        
        this.plotPop = new MigPLOT(x, 0, sizePlot, sizePlot, [0], 'Population', '')
        this.plotPop.minGlobal = 0

        this.plotAvgSpeed = new MigPLOT(x, sizePlot, sizePlot, sizePlot, [0], 'Avg Movement Cooldown', '')
        this.plotAvgSpeed.minGlobal = 0
        this.plotAvgSpeed.maxGlobal = 100

        this.plotAvgBeauty = new MigPLOT(x, sizePlot*2, sizePlot, sizePlot, [0], 'Avg Beauty', '')
        this.plotAvgBeauty.minGlobal = 0
        this.plotAvgBeauty.maxGlobal = 1

        this.plotAvgRadius = new MigPLOT(x, sizePlot*3, sizePlot, sizePlot, [0], 'Avg Radius', '')
        this.plotAvgRadius.minGlobal = 0
        this.plotAvgRadius.maxGlobal = 5

        this.plotAvgAge = new MigPLOT(x, sizePlot*4, sizePlot, sizePlot, [0], 'Avg Age', '')
        this.plotAvgAge.minGlobal = 0
        this.plotAvgAge.maxGlobal = 400

    }

    init(){
        this.ovejas = []
        for(let i = 0; i < N_OVEJAS; i++){
            let o = new Oveja(this.entorno, this)
            o.age = Math.max(Math.floor(randomGaussian(STARTING_AGE, 5)), 0)
            o.state.goal = STARTING_STATE
            if(STARTING_STATE == 'food') o.hunger = .15
            if(STARTING_STATE == 'water') o.thirst = .15
            if(STARTING_STATE == 'partner') o.lust = .15
            if(i % 2 == 0) o.genre = 'male'
            else o.genre = 'female'
            this.ovejas.push(o)
        }
    }

    reproduce(mother, father){
        if(!mother || !father) return
        let nOffsprings = Math.round(randomGaussian(2, .35), 1)
        for(let i = 0; i < nOffsprings; i++){
            let mutSpeed  = Math.random() > MUT_FACTOR ? 0 : randomGaussian(0, 0.3) * 4
            let mutBeauty = Math.random() > MUT_FACTOR ? 0 : randomGaussian(0, 0.3) * 0.25
            let mutRadius = Math.random() > MUT_FACTOR ? 0 : randomGaussian(0, 0.3) * 8
            //sin mezcla
            let prog = Math.random() < .5 ? mother : father
            let offspring = new Oveja(this.entorno, this, 
                                        prog.pos.copy(),
                                        Math.max(prog.speed + mutSpeed, 0),
                                        Math.max(prog.beauty + mutBeauty, 0),
                                        Math.max(prog.radius + mutRadius, 0))
            //mezcla de genes
            // let offspring = new Oveja(this.entorno, this, 
            //                           mother.pos.copy(),
            //                           Math.max((mother.speed + father.speed) * .5 + mutSpeed, 0),
            //                           Math.max((mother.beauty + father.beauty) * .5 + mutBeauty, 0),
            //                           Math.max((mother.radius + father.radius) * .5 + mutRadius, 0))
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
            sumRadius += o.radius / TAM_CELL
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
                //this.entorno.growFood(o.pos)
            }
        }
        if(Math.random() < FOOD_REGEN) this.entorno.regenerateFood()
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