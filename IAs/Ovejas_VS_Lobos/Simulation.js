let FRAME = 0

class Simulation{
    constructor(){
        //this.init()
        this.initPlots()
        this.initUI()
        this.started = false
        this.sim_speed = 1
        this.interacting = undefined
        this.type = 'Sheep'       //sheep / foxes / both
        this.editing = 'Sheep'      //sheep / foxes variables

        this.sheepOptions = {
            STARTING_AGE: STARTING_AGE_S,
            SPEED_MULT: SPEED_MULT_S,
            INITIAL_RADIUS: INITIAL_RADIUS_S,
            AGE_LIMIT: AGE_LIMIT_S,
            AGE_LIMIT_REPRODUCE: AGE_LIMIT_REPRODUCE_S,
            MIN_LUST: MIN_LUST_S,
            MUT_FACTOR: MUT_FACTOR_S,
            DELTA_HUNGER: DELTA_HUNGER_S,
            DELTA_THIRST: DELTA_THIRST_S,
            DELTA_LUST: DELTA_LUST_S
        }
        this.foxesOptions = {
            STARTING_AGE: STARTING_AGE_F,
            SPEED_MULT: SPEED_MULT_F,
            INITIAL_RADIUS: INITIAL_RADIUS_F,
            AGE_LIMIT: AGE_LIMIT_F,
            AGE_LIMIT_REPRODUCE: AGE_LIMIT_REPRODUCE_F,
            MIN_LUST: MIN_LUST_F,
            MUT_FACTOR: MUT_FACTOR_F,
            DELTA_HUNGER: DELTA_HUNGER_F,
            DELTA_THIRST: DELTA_THIRST_F,
            DELTA_LUST: DELTA_LUST_F
        }

    }

    setValuesPickers(){
        let values = this.editing == 'Sheep' ? this.sheepOptions : this.foxesOptions
        this.panel_STARTING_AGE.setValue(values.STARTING_AGE)
        this.panel_STARTING_SPEED.setValue(values.SPEED_MULT)
        this.panel_STARTING_RADIUS.setValue(values.INITIAL_RADIUS)
        this.panel_AGE_LIMIT.setValue(values.AGE_LIMIT)
        this.panel_AGE_LIMIT_REPRODUCE.setValue(values.AGE_LIMIT_REPRODUCE)
        this.panel_MIN_LUST.setValue(values.MIN_LUST)
        this.panel_MUT_FACTOR.setValue(values.MUT_FACTOR)
        this.panel_DELTA_HUNGER.setValue(values.DELTA_HUNGER)
        this.panel_DELTA_THIRST.setValue(values.DELTA_THIRST)
        this.panel_DELTA_LUST.setValue(values.DELTA_LUST)

        
    }

    createNumberPickerWithBinding(propertyName, label, min, max, step, initialValue, targetProperty) {
        this[propertyName] = this.panel.createNumberPicker(label, min, max, step, initialValue, () => {
            let values = this.editing === 'Sheep' ? this.sheepOptions : this.foxesOptions;
            values[targetProperty] = this[propertyName].getValue();
        });
    }

    enableDisableVariables(option){
        this.panel_STARTING_AGE[option]()
        this.panel_STARTING_SPEED[option]()
        this.panel_STARTING_RADIUS[option]()
        this.panel_AGE_LIMIT[option]()
        this.panel_AGE_LIMIT_REPRODUCE[option]()
        this.panel_MIN_LUST[option]()
        this.panel_MUT_FACTOR[option]()
        this.panel_DELTA_HUNGER[option]()
        this.panel_DELTA_THIRST[option]()
        this.panel_DELTA_LUST[option]()
        this.panel_editing_what[option]()

        this.panel_GRID_SIZE[option]()
        this.panel_LAND[option]()
        this.panel_FOOD_FACTOR_REGEN[option]()
        this.panel_sim_type[option]()
    }

    initUI(){
        this.panel = new Panel({
            x: WIDTH,
            w: WIDTH_UI - WIDTH_PLOTS,
            automaticHeight: false,
            title: 'SHEEP VS FOXES',
            darkCol: COL_OVEJA_LEAST_BEAUTY,
            lightCol: COL_OVEJA_MOST_BEAUTY
        })
        this.panel.createText('Ecosystem Simulation')
        
        this.panel.createSeparator()

        this.panel.createText('VARIABLES', true)
        this.panel.separate()
        //variables para ovjeas y foxes
        this.panel_GRID_SIZE = this.panel.createNumberPicker('Grid Size', 5, 120, 5, 50)
        this.panel_LAND = this.panel.createNumberPicker('% of Land vs Water', 0, 1, 0.05, 0.55)
        this.panel_FOOD_FACTOR_REGEN = this.panel.createNumberPicker('Food regen cooldwon', 0, 200, 5, 100)
        

        this.panel.createSeparator()
        this.panel_editing_what = this.panel.createOptionPicker('Editing variables', ['Sheep', 'Foxes'], () => {
            this.editing = this.panel_editing_what.getSelected()
            if(this.editing == 'Sheep') this.panel.changeColors(COL_OVEJA_LEAST_BEAUTY, COL_OVEJA_MOST_BEAUTY)
            else this.panel.changeColors(COL_FOX_LEAST_BEAUTY, COL_FOX_MOST_BEAUTY)
            this.setValuesPickers()
        })
        //variables independientes para ovejas y foxes
        this.createNumberPickerWithBinding('panel_STARTING_AGE', 'Starting Age', 0, 300, 10, STARTING_AGE_S, 'STARTING_AGE');
        this.createNumberPickerWithBinding('panel_STARTING_SPEED', 'Starting Movement Cooldown', 5, 200, 10, SPEED_MULT_S, 'SPEED_MULT');
        this.createNumberPickerWithBinding('panel_STARTING_RADIUS', 'Starting Radius', 5, 200, 10, INITIAL_RADIUS_S, 'INITIAL_RADIUS');
        this.createNumberPickerWithBinding('panel_AGE_LIMIT', 'Maximum Age', 0, 1000, 25, AGE_LIMIT_S, 'AGE_LIMIT');
        this.createNumberPickerWithBinding('panel_AGE_LIMIT_REPRODUCE', 'Minimum Age to Reproduce', 0, 1000, 25, AGE_LIMIT_REPRODUCE_S, 'AGE_LIMIT_REPRODUCE');
        this.createNumberPickerWithBinding('panel_MIN_LUST', 'Minimum Lust to Reproduce', 0, 1, 0.1, MIN_LUST_S, 'MIN_LUST');
        this.createNumberPickerWithBinding('panel_MUT_FACTOR', 'Mutation Probability', 0, 1, 0.1, MUT_FACTOR_S, 'MUT_FACTOR');
        this.createNumberPickerWithBinding('panel_DELTA_HUNGER', 'Hunger Rate', 0, 0.3, 0.005, DELTA_HUNGER_S, 'DELTA_HUNGER');
        this.createNumberPickerWithBinding('panel_DELTA_THIRST', 'Thirst Rate', 0, 0.3, 0.005, DELTA_THIRST_S, 'DELTA_THIRST');
        this.createNumberPickerWithBinding('panel_DELTA_LUST', 'Reproductive Urge Rate', 0, 0.3, 0.005, DELTA_LUST_S, 'DELTA_LUST');

        this.panel.createSeparator()

        this.panel_sim_type = this.panel.createOptionPicker('Simulation type', ['Sheep', 'Both', 'Foxes'], () => {
            this.type = this.panel_sim_type.getSelected()
        })
        this.panel.createButton('Start Simulation', () => {
            this.initConfig()
            this.init()
            this.initPlots()
            this.panel_pause.enable()
            this.enableDisableVariables('disable')
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
        this.panel_reset = this.panel.createButton('Reset', () => {
            this.sheepOptions = {
                STARTING_AGE: STARTING_AGE_S,
                SPEED_MULT: SPEED_MULT_S,
                INITIAL_RADIUS: INITIAL_RADIUS_S,
                AGE_LIMIT: AGE_LIMIT_S,
                AGE_LIMIT_REPRODUCE: AGE_LIMIT_REPRODUCE_S,
                MIN_LUST: MIN_LUST_S,
                MUT_FACTOR: MUT_FACTOR_S,
                DELTA_HUNGER: DELTA_HUNGER_S,
                DELTA_THIRST: DELTA_THIRST_S,
                DELTA_LUST: DELTA_LUST_S
            }
            this.foxesOptions = {
                STARTING_AGE: STARTING_AGE_F,
                SPEED_MULT: SPEED_MULT_F,
                INITIAL_RADIUS: INITIAL_RADIUS_F,
                AGE_LIMIT: AGE_LIMIT_F,
                AGE_LIMIT_REPRODUCE: AGE_LIMIT_REPRODUCE_F,
                MIN_LUST: MIN_LUST_F,
                MUT_FACTOR: MUT_FACTOR_F,
                DELTA_HUNGER: DELTA_HUNGER_F,
                DELTA_THIRST: DELTA_THIRST_F,
                DELTA_LUST: DELTA_LUST_F
            }
            this.started = false
            this.entorno = undefined
            this.enableDisableVariables('enable')
            this.initPlots()
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
        this.panel_show_necessities = this.panel.createCheckbox('Show necessities', false)

        this.panel.createSeparator()
        
        this.panel.createText('Interact with the enviroment')
        this.panel.separate()
        this.panel_interacting = this.panel.createSelect(['Grow food'], undefined, () => {
            this.interacting = this.panel_interacting.getSelected()
        })

        this.panel.duplicateFunctionsNumberPicker()
    }

    initConfig(){
        GRID_SIZE = this.panel_GRID_SIZE.getValue()
        SQ_GRID_SIZE = GRID_SIZE * GRID_SIZE
        TAM_CELL = WIDTH / GRID_SIZE
        FOOD_FACTOR_REGEN = this.panel_FOOD_FACTOR_REGEN.getValue()
        FOOD_REGEN = (SQ_GRID_SIZE / (SQ_GRID_SIZE + GRID_SIZE * FOOD_FACTOR_REGEN))
        LAND = this.panel_LAND.getValue()


        STARTING_AGE_S = this.sheepOptions.STARTING_AGE
        AGE_LIMIT_S = this.sheepOptions.AGE_LIMIT
        AGE_LIMIT_REPRODUCE_S = this.sheepOptions.AGE_LIMIT_REPRODUCE
        MIN_LUST_S = this.sheepOptions.MIN_LUST
        MUT_FACTOR_S = this.sheepOptions.MUT_FACTOR
        DELTA_HUNGER_S = this.sheepOptions.DELTA_HUNGER
        DELTA_THIRST_S = this.sheepOptions.DELTA_THIRST
        DELTA_LUST_S = this.sheepOptions.DELTA_LUST
        SPEED_MULT_S = this.sheepOptions.SPEED_MULT
        INITIAL_RADIUS_S = this.sheepOptions.INITIAL_RADIUS

        STARTING_AGE_F = this.foxesOptions.STARTING_AGE
        AGE_LIMIT_F = this.foxesOptions.AGE_LIMIT
        AGE_LIMIT_REPRODUCE_F = this.foxesOptions.AGE_LIMIT_REPRODUCE
        MIN_LUST_F = this.foxesOptions.MIN_LUST
        MUT_FACTOR_F = this.foxesOptions.MUT_FACTOR
        DELTA_HUNGER_F = this.foxesOptions.DELTA_HUNGER
        DELTA_THIRST_F = this.foxesOptions.DELTA_THIRST
        DELTA_LUST_F = this.foxesOptions.DELTA_LUST
        SPEED_MULT_F = this.foxesOptions.SPEED_MULT
        INITIAL_RADIUS_F = this.foxesOptions.INITIAL_RADIUS

        
        N_OVEJAS = SQ_GRID_SIZE*0.1
        N_FOXES =  Math.max(SQ_GRID_SIZE*N_FOXES_MULT, 1)
        RADIUS_GOAL_FOOD = TAM_CELL
        RADIUS_GOAL_WATER = TAM_CELL * 2.5
        RADIUS_GOAL_PARTNER = TAM_CELL * 0.5
        TAM_OVEJA = TAM_CELL * 0.55
        SPEED_OVEJA = TAM_CELL
        SPEED_FOX = TAM_CELL * 3
    }

    initPlots(){
        let sizePlot = HEIGHT*.2
        let x = WIDTH + WIDTH_UI - sizePlot

        let type = this.panel_sim_type ? this.panel_sim_type.getSelected() : 'Both'
        let initValues = type ==  'Both' ? [[0],[0]] : (type == 'Sheep' ? [[0], undefined] : [undefined, [0]])
        
        this.plotPop = new MigPLOT(x, 0, sizePlot, sizePlot, initValues, 'Population', '')

        initValues = type ==  'Both' ? [[0],[0]] : (type == 'Sheep' ? [[0], undefined] : [undefined, [0]])
        this.plotAvgSpeed = new MigPLOT(x, sizePlot, sizePlot, sizePlot, initValues, 'Avg Movement Cooldown', '')

        initValues = type ==  'Both' ? [[0],[0]] : (type == 'Sheep' ? [[0], undefined] : [undefined, [0]])
        this.plotAvgBeauty = new MigPLOT(x, sizePlot*2, sizePlot, sizePlot, initValues, 'Avg Beauty', '')

        initValues = type ==  'Both' ? [[0],[0]] : (type == 'Sheep' ? [[0], undefined] : [undefined, [0]])
        this.plotAvgRadius = new MigPLOT(x, sizePlot*3, sizePlot, sizePlot, initValues, 'Avg Radius', '')

        initValues = type ==  'Both' ? [[0],[0]] : (type == 'Sheep' ? [[0], undefined] : [undefined, [0]])
        this.plotAvgAge = new MigPLOT(x, sizePlot*4, sizePlot, sizePlot, initValues, 'Avg Age', '')
    }

    init(){
        this.entorno = new Entorno()
        this.ovejas = []
        this.foxes = []
        if(this.type == 'Sheep' || this.type == 'Both'){
            for(let i = 0; i < N_OVEJAS; i++){
                let o = new Oveja(this.entorno, this)
                o.age = Math.max(Math.floor(randomGaussian(STARTING_AGE_S, 5)), 0)
                if(STARTING_STATE_S == 'food') o.hunger = .15
                if(STARTING_STATE_S == 'water') o.thirst = .15
                if(STARTING_STATE_S == 'partner') o.lust = .15
                if(i % 2 == 0) o.genre = 'male'
                else o.genre = 'female'
                this.ovejas.push(o)
            }
        }
        if(this.type == 'Foxes' || this.type == 'Both'){
            for(let i = 0; i < N_FOXES; i++){
                let o = new Fox(this.entorno, this)
                o.age = Math.max(Math.floor(randomGaussian(STARTING_AGE_F, 5)), 0)
                if(STARTING_STATE_F == 'food') o.hunger = FOX_MIN_NECESSITY
                if(STARTING_STATE_F == 'water') o.thirst = FOX_MIN_NECESSITY
                if(STARTING_STATE_F == 'partner') o.lust = FOX_MIN_NECESSITY
                if(i % 2 == 0) o.genre = 'male'
                else o.genre = 'female'
                this.foxes.push(o)
            }
        }
        this.initPlots()
        this.started = true
    }

    reproduce(mother, father){
        if(!mother || !father) return
        let type = mother.constructor.name
        let nOffsprings = type == 'Oveja' ? Math.round(randomGaussian(2, .5), 1) : Math.round(randomGaussian(1, .4), 1) 
        let mutF = type == 'Oveja' ? MUT_FACTOR_S : MUT_FACTOR_F
        for(let i = 0; i < nOffsprings; i++){
            let mutSpeed  = Math.random() > mutF ? 0 : randomGaussian(0, 0.3) * 4
            let mutBeauty = Math.random() > mutF ? 0 : randomGaussian(0, 0.3) * 0.25
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

    //return la primera oveja en su radio (no la mas cercana, para optimizar)
    findClosestPrey(fox, radius){
        let sqRadius = radius * radius
        for(let sheep of this.ovejas){
            if(squaredDistance(sheep.pos.x, sheep.pos.y, fox.x, fox.y) < sqRadius) return sheep
        }
        return undefined
    }

    //return el primer zorro en su radio
    findClosestPredator(sheep, radius){
        let sqRadius = radius * radius
        for(let fox of this.foxes){
            if(squaredDistance(fox.pos.x, fox.pos.y, sheep.x, sheep.y) < sqRadius) return fox
        }
        return undefined
    }

    getAvgsOveja(){
        if(this.type == 'Foxes') return [undefined, undefined, undefined, undefined]
        if(this.ovejas.length == 0) return [0, 0, 0, 0]
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
        if(this.foxes.length == 0) return [0, 0, 0, 0]
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
        if(this.type == 'Both' && this.foxes.length == 0) popFoxes = 0
        if(this.type == 'Both' && this.ovejas.length == 0) popSheep = 0
        this.plotPop.feed(popSheep, popFoxes)
        let avgsOveja = this.getAvgsOveja()
        let avgsFox = this.getAvgsFox()
        this.plotAvgSpeed.feed(avgsOveja[0], avgsFox[0])
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
                FRAME++
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

function squaredDistance(x1, y1, x2, y2) {
    return (x2 - x1) ** 2 + (y2 - y1) ** 2
}