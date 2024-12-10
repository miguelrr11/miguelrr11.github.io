class Simulation{
    constructor(){
        //this.init()
        this.initPlots()
        this.initUI()
        this.started = false
    }

    initUI(){
        this.panel = new Panel({
            x: WIDTH,
            w: WIDTH_UI - WIDTH_PLOTS,
            automaticHeight: false,
            title: 'SHEEP VS WOLVES',
            darkCol: "#274c77",
            lightCol: "#e7ecef"
        })
        this.panel.createText('Ecosystem Simulation')
        
        this.panel.createSeparator()
        this.panel.createText('VARIABLES', true)
        this.panel_GRID_SIZE = this.panel.createNumberPicker('Grid Size', 5, 120, 5, 85)
        this.panel_LAND = this.panel.createNumberPicker('% of land vs water', 0, 1, 0.1, 0.5)
        this.panel_STARTING_AGE = this.panel.createNumberPicker('Starting Age', 0, 300, 10, 100)


        this.panel.createSeparator()
        this.panel.createButton('Start Simulation', () => {
            this.initConfig()
            this.init()
            this.initPlots()
        })
    }

    initConfig(){
        GRID_SIZE = this.panel_GRID_SIZE.getValue()
        LAND = this.panel_LAND.getValue()
        STARTING_AGE = this.panel_STARTING_AGE.getValue()


        SQ_GRID_SIZE = GRID_SIZE * GRID_SIZE
        TAM_CELL = WIDTH / GRID_SIZE
        N_OVEJAS = SQ_GRID_SIZE*0.1
        FOOD_REGEN = (SQ_GRID_SIZE / (SQ_GRID_SIZE + GRID_SIZE * FOOD_FACTOR_REGEN))
        RADIUS_GOAL_FOOD = TAM_CELL
        RADIUS_GOAL_WATER = TAM_CELL * 2.5
        RADIUS_GOAL_PARTNER = TAM_CELL * 0.5
        TAM_OVEJA = TAM_CELL * 0.55
        SPEED_OVEJA = TAM_CELL
    }

    initPlots(){
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
        this.entorno = new Entorno()
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
        this.started = true
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
        if(this.started){
            for(let i = 0; i < this.ovejas.length; i++){ 
                let o = this.ovejas[i]
                if(o.alive) o.update()
                else{
                    this.ovejas.splice(i, 1)
                    i--
                    //this.entorno.growFood(o.pos)
                }
            }
            if(Math.random() < FOOD_REGEN) this.entorno.regenerateFood()
            if(frameCount % 60 == 0) this.updatePlots()
        }
        this.panel.update()
    }

    show(){
        background(100)
        if(this.started){
            push()
            if(mouseIsPressed && mouseX < WIDTH){
                translate(-WIDTH/2, -HEIGHT/2)
                scale(2)
                let zoomCenterx = mouseX - WIDTH / 2
                let zoomCentery = mouseY - HEIGHT / 2
                translate(-zoomCenterx, -zoomCentery)
            }
            this.entorno.show()
            for(let o of this.ovejas) o.show()
            pop()
        }
        else{
            fill(COL_DARK_GREEN)
            rect(0, 0, WIDTH, WIDTH)
        }

        push()
        noStroke()
        fill(100)
        rect(WIDTH, 0, 500, HEIGHT)
        this.plotPop.show()
        this.plotAvgSpeed.show()
        this.plotAvgBeauty.show()
        this.plotAvgRadius.show()
        this.plotAvgAge.show()
        pop()
        push()
        this.panel.show()
        pop()
    }
}