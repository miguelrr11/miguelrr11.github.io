let FRAME = 0

class Simulation{
    constructor(){
        //this.init()
        this.initPlots()
        this.initUI()
        this.started = false
        this.sim_speed = 1
        this.interacting = undefined
        this.type = undefined
    }

    initUI(){
        this.panel = new Panel({
            x: WIDTH,
            w: WIDTH_UI - WIDTH_PLOTS,
            automaticHeight: false,
            title: 'SHEEP VS FOXES',
            darkCol: "#274c77",
            lightCol: "#e7ecef"
        })
        this.panel.createText('Ecosystem Simulation')
        
        this.panel.createSeparator()

        this.panel.createText('VARIABLES', true)
        this.panel.separate()
        //variables para ovjeas y foxes
        this.panel_GRID_SIZE = this.panel.createNumberPicker('Grid Size', 5, 120, 5, 50)
        this.panel_LAND = this.panel.createNumberPicker('% of Land vs Water', 0, 1, 0.1, 0.5)
        this.panel_FOOD_FACTOR_REGEN = this.panel.createNumberPicker('Food regen cooldwon', 0, 200, 5, 100)
        this.panel_sim_type = this.panel.createOptionPicker('Simulation type', ['Sheep', 'Sh & Fx', 'Fox'])

        this.panel.createSeparator()
        //variables independientes para ovejas y foxes
        this.panel_STARTING_AGE = this.panel.createNumberPicker('Starting Age', 0, 300, 10, 100)
        this.panel_STARTING_STATE = this.panel.createOptionPicker('Starting State', ['food', 'water', 'partner'])
        this.panel_STARTING_SPEED = this.panel.createNumberPicker('Starting Movement Cooldown', 5, 200, 10, 60)
        this.panel_STARTING_RADIUS = this.panel.createNumberPicker('Starting Radius', 5, 200, 10, 40)
        this.panel_AGE_LIMIT = this.panel.createNumberPicker('Maximum Age', 0, 1000, 25, 400)
        this.panel_AGE_LIMIT_REPRODUCE = this.panel.createNumberPicker('Minimum Age to Reproduce', 0, 1000, 25, 75)
        this.panel_MIN_LUST = this.panel.createNumberPicker('Minimum Lust to Reproduce', 0, 1, .1, .4)
        this.panel_MUT_FACTOR = this.panel.createNumberPicker('Mutation Probability', 0, 1, .1, .5)
        this.panel_DELTA_HUNGER = this.panel.createNumberPicker('Hunger Rate', 0, 0.3, 0.01, 0.03)
        this.panel_DELTA_THIRST = this.panel.createNumberPicker('Thirst Rate', 0, 0.3, 0.01, 0.03)
        this.panel_DELTA_LUST   = this.panel.createNumberPicker('Reproductive Urge Rate', 0, 0.3, 0.01, 0.01)

        this.panel.createSeparator()

        this.panel.createButton('Start Simulation', () => {
            this.initConfig()
            this.init()
            this.initPlots()
            this.panel_pause.enable()
        })
        this.panel_pause = this.panel.createButton('Pause', () => {
            if(!this.started){
                this.panel_pause.setText('Pause')
                this.started = !this.started
            }
            else{
                this.panel_pause.setText('Play')
                this.started = !this.started
            }
        })
        this.panel_pause.disable()
        this.panel_sim_speed = this.panel.createOptionPicker('Simulation speed', ['1x', '2x', '5x', '10x', '60x'], () => {
            switch(this.panel_sim_speed.getSelected()){
                case '1x':
                    this.sim_speed = 1
                    break
                case '2x':
                    this.sim_speed = 2
                    break
                case '5x':
                    this.sim_speed = 5
                    break
                case '10x':
                    this.sim_speed = 10
                    break
                case '60x':
                    this.sim_speed = 60
                    break
            }
        })

        this.panel.createSeparator()

        this.panel_select_view_entorno = this.panel.createOptionPicker('Enviroment view options', 
            ['normal', 'deaths', 'eaten'])
        this.panel_select_view_ovejas = this.panel.createOptionPicker('Sheep view options', 
            ['beauty', 'age', 'radius', 'speed', 'state', 'none'])
        this.panel_show_necessities = this.panel.createCheckbox('Show necessities', true)

        this.panel.createSeparator()
        
        this.panel.createText('Interact with the enviroment')
        this.panel.separate()
        this.panel_interacting = this.panel.createSelect(['Grow food'], undefined, () => {
            this.interacting = this.panel_interacting.getSelected()
        })
    }

    initConfig(){
        GRID_SIZE = this.panel_GRID_SIZE.getValue()
        FOOD_FACTOR_REGEN = this.panel_FOOD_FACTOR_REGEN.getValue()
        FOOD_REGEN = (SQ_GRID_SIZE / (SQ_GRID_SIZE + GRID_SIZE * FOOD_FACTOR_REGEN))
        LAND = this.panel_LAND.getValue()
        STARTING_AGE = this.panel_STARTING_AGE.getValue()
        AGE_LIMIT = this.panel_AGE_LIMIT.getValue()
        AGE_LIMIT_REPRODUCE = this.panel_AGE_LIMIT_REPRODUCE.getValue()
        STARTING_STATE = this.panel_STARTING_STATE.getSelected()
        MIN_LUST = this.panel_MIN_LUST.getValue()
        MUT_FACTOR = this.panel_MUT_FACTOR.getValue()
        DELTA_HUNGER = this.panel_DELTA_HUNGER.getValue()
        DELTA_THIRST = this.panel_DELTA_THIRST.getValue()
        DELTA_LUST = this.panel_DELTA_LUST.getValue()
        SPEED_MULT = this.panel_STARTING_SPEED.getValue()
        INITIAL_RADIUS = this.panel_STARTING_RADIUS.getValue()

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

        let type = this.panel_sim_type ? this.panel_sim_type.getSelected() : 'Sh & Fx'
        let initValues = type ==  'Sh & Fx' ? [[0],[0]] : (type == 'Sheep' ? [[0], undefined] : [undefined, [0]])
        
        this.plotPop = new MigPLOT(x, 0, sizePlot, sizePlot, initValues, 'Population', '')
        this.plotPop.minGlobal = 0

        initValues = type ==  'Sh & Fx' ? [[0],[0]] : (type == 'Sheep' ? [[0], undefined] : [undefined, [0]])
        this.plotAvgSpeed = new MigPLOT(x, sizePlot, sizePlot, sizePlot, initValues, 'Avg Movement Cooldown', '')
        this.plotAvgSpeed.minGlobal = 0

        initValues = type ==  'Sh & Fx' ? [[0],[0]] : (type == 'Sheep' ? [[0], undefined] : [undefined, [0]])
        this.plotAvgBeauty = new MigPLOT(x, sizePlot*2, sizePlot, sizePlot, initValues, 'Avg Beauty', '')
        this.plotAvgBeauty.minGlobal = 0
        this.plotAvgBeauty.maxGlobal = 1

        initValues = type ==  'Sh & Fx' ? [[0],[0]] : (type == 'Sheep' ? [[0], undefined] : [undefined, [0]])
        this.plotAvgRadius = new MigPLOT(x, sizePlot*3, sizePlot, sizePlot, initValues, 'Avg Radius', '')
        this.plotAvgRadius.minGlobal = 0
        this.plotAvgRadius.maxGlobal = INITIAL_RADIUS

        initValues = type ==  'Sh & Fx' ? [[0],[0]] : (type == 'Sheep' ? [[0], undefined] : [undefined, [0]])
        this.plotAvgAge = new MigPLOT(x, sizePlot*4, sizePlot, sizePlot, initValues, 'Avg Age', '')
        this.plotAvgAge.minGlobal = 0
        this.plotAvgAge.maxGlobal = AGE_LIMIT
    }

    init(){
        this.entorno = new Entorno()
        this.ovejas = []
        this.foxes = []
        let type = this.panel_sim_type.getSelected() 
        if(type == 'Sheep' || type == 'Sh & Fx'){
            for(let i = 0; i < N_OVEJAS; i++){
                let o = new Oveja(this.entorno, this)
                o.age = Math.max(Math.floor(randomGaussian(STARTING_AGE, 5)), 0)
                if(STARTING_STATE == 'food') o.hunger = .15
                if(STARTING_STATE == 'water') o.thirst = .15
                if(STARTING_STATE == 'partner') o.lust = .15
                if(i % 2 == 0) o.genre = 'male'
                else o.genre = 'female'
                this.ovejas.push(o)
            }
        }
        if(type == 'Fox' || type == 'Sh & Fx'){
            for(let i = 0; i < N_FOXES; i++){
                let o = new Fox(this.entorno, this)
                o.age = Math.max(Math.floor(randomGaussian(STARTING_AGE, 5)), 0)
                if(STARTING_STATE == 'food') o.hunger = .15
                if(STARTING_STATE == 'water') o.thirst = .15
                if(STARTING_STATE == 'partner') o.lust = .15
                if(i % 2 == 0) o.genre = 'male'
                else o.genre = 'female'
                this.foxes.push(o)
            }
        }
        this.type = type
        this.initPlots()
        this.started = true
    }

    //todo mutfactor independientes
    reproduce(mother, father){
        if(!mother || !father) return
        let nOffsprings = Math.round(randomGaussian(2, .35), 1)
        let type = mother.constructor.name
        let mutF = type == 'Oveja' ? MUT_FACTOR : MUT_FACTOR
        for(let i = 0; i < nOffsprings; i++){
            let mutSpeed  = Math.random() > mutF ? 0 : randomGaussian(0, 0.3) * 4
            let mutBeauty = Math.random() > mutF ? 0 : randomGaussian(0, 0.3) * 0.15
            let mutRadius = Math.random() > mutF ? 0 : randomGaussian(0, 0.3) * 8
            let prog = Math.random() < .5 ? mother : father
            let offspring 
            offspring = type == 'Oveja' ? new Oveja(this.entorno, this, 
                                        prog.pos.copy(),
                                        Math.max(prog.speed + mutSpeed, 0),
                                        Math.max(prog.beauty + mutBeauty, 0),
                                        Math.max(prog.radius + mutRadius, 0)) :
                              new Fox(this.entorno, this, 
                                        prog.pos.copy(),
                                        Math.max(prog.speed + mutSpeed, 0),
                                        Math.max(prog.beauty + mutBeauty, 0),
                                        Math.max(prog.radius + mutRadius, 0))
            type == 'Oveja' ? this.ovejas.push(offspring) : this.foxes.push(offspring)
        }
    }

    getAvgsOveja(){
        if(this.type == 'Foxes') return [undefined, undefined, undefined, undefined]
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

    getAvgsFox(){
        if(this.type == 'Sheep') return [undefined, undefined, undefined, undefined]
        let sumSpeed = 0
        let sumBeauty = 0
        let sumRadius = 0
        let sumAge = 0
        for(let o of this.foxes){
            sumSpeed += o.speed
            sumBeauty += o.beauty
            sumRadius += o.radius / TAM_CELL
            sumAge += o.age
        }
        let n = this.foxes.length
        return [sumSpeed/n, sumBeauty/n, sumRadius/n, sumAge/n]
    }

    updatePlots(){
        let popSheep = this.ovejas.length == 0 ? undefined : this.ovejas.length
        let popFoxes = this.foxes.length == 0 ? undefined : this.foxes.length
        this.plotPop.feed(popSheep, popFoxes)
        let avgsOveja = this.getAvgsOveja()
        let avgsFox = this.getAvgsFox()
        this.plotAvgSpeed.feed(avgsOveja[1], avgsFox[1])
        this.plotAvgBeauty.feed(avgsOveja[1], avgsFox[1])
        this.plotAvgRadius.feed(avgsOveja[2], avgsFox[2])
        this.plotAvgAge.feed(avgsOveja[3], avgsFox[3])
    }

    inBoundsOfEntorno(x, y){
        return x < WIDTH && x > 0 && y < HEIGHT && y > 0
    }

    updateOvejas(){
        for(let i = 0; i < this.ovejas.length; i++){ 
            let o = this.ovejas[i]
            if(o.alive) o.update()
            else{
                this.ovejas.splice(i, 1)
                i--
            }
        }
    }

    updateFoxes(){
        for(let i = 0; i < this.foxes.length; i++){ 
            let o = this.foxes[i]
            if(o.alive) o.update()
            else{
                this.foxes.splice(i, 1)
                i--
            }
        }
    }

    update(){
        if(mouseIsPressed && this.inBoundsOfEntorno(mouseX, mouseY)){
            switch(this.interacting){
                case undefined: break
                case 'Grow food':
                    this.entorno.growFood(createVector(mouseX, mouseY))
            }
        }
        for(let j = 0; j < this.sim_speed; j++){
            if(this.started){
                FRAME += 1
                this.updateOvejas()
                this.updateFoxes()
                if(Math.random() < FOOD_REGEN) this.entorno.regenerateFood()
                if(frameCount % 20 == 0) this.updatePlots()
            }
        }
        
        this.panel.update()
    }

    showPlots(){
        push()
        this.plotPop.show()
        this.plotAvgSpeed.show()
        this.plotAvgBeauty.show()
        this.plotAvgRadius.show()
        this.plotAvgAge.show()
        pop()
    }

    show(){
        background(100)
        if(this.entorno){
            push()
            if(mouseIsPressed && keyIsPressed){
                translate(-WIDTH/2, -HEIGHT/2)
                scale(2)
                let zoomCenterx = mouseX - WIDTH / 2
                let zoomCentery = mouseY - HEIGHT / 2
                translate(-zoomCenterx, -zoomCentery)
            }
            this.entorno.show(this.panel_select_view_entorno.getSelected(), this.interacting)
            for(let o of this.ovejas) o.show(this.panel_select_view_ovejas.getSelected(),
                                             this.panel_show_necessities.isChecked())
            for(let o of this.foxes) o.show(this.panel_select_view_ovejas.getSelected(),
                                             this.panel_show_necessities.isChecked())
            pop()
        }
        else{
            fill(COL_DARK_GREEN)
            rect(0, 0, WIDTH, WIDTH)
        }

        this.showPlots()
       
        this.panel.show()
    }
}