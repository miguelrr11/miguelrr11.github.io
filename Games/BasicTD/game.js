


class Game{
    constructor(){
        this.towerGrid = []      //stores what does exist (towers and path segments) in each [i,j] position for easier lookups
        this.pathGrid = []
        this.initGrid()

        this.path = this.createPathFromColumns(Array.from({ length: 3 }, () => Math.random()))
        
        this.enemies = []
        this.towers = []
        this.projectiles = []
        this.oreGrid = []
        this.initPath()
        this.spawnCrawlerAtStart()
        this.initOres()
        this.currentOre = Infinity
        this.UI = new UI(this)
        this.particleManager = new ParticleManager()

        this.doingAction = undefined
        this.doingActionProperties = {
            connectingGeneratorID: -1
        }

        this.generatorGrid = new Map()      // <id generator> - [id t1, id t2, ...]
                                            // used for drawing connections and calculting generatorMap
        this.generatorMap = []              // list of separated grids ({supply: [g1, g2], demand: [t1, t2, t3]})
                                            //                          {supply: [g3], demand: [t4, t5]}
                                            // used for distributing energy

        this.enemiesPerSecond = 0.5
        this.totalCrawlers = 0  //all historical amount ever spawned
    }

    keyPressed(k){
        this.UI.clickButtonByIndex(parseInt(k)-1)
    }

    checkTower(tower){
        for(let t of this.towers) if(t.id == tower.id) return true
        return false
    }

    removeTower(tower){
        for(let i = 0; i < this.towerGrid.length; i++){
            for(let j = 0; j < this.towerGrid[i].length; j++){
                if(this.towerGrid[i][j]?.id == tower.id) this.towerGrid[i][j] = null
            }
        }

        this.towers = this.towers.filter((t) => t.id != tower.id)

        this.generatorGrid.delete(tower.id)
        for (let [key, val] of this.generatorGrid) {
            let remaining = val.filter((id) => id != tower.id)
            if (remaining.length == 0) this.generatorGrid.delete(key)
            else this.generatorGrid.set(key, remaining)
        }
        this.calculateGeneratorMap()
    }

    // xs es la lista de coordenadas x de los endpoints de cada division
    // la separacion y es uniforme
    createPathFromColumns(xs, options) {
        const waypoints = xs.map((x, k) => ({
            i: Math.min(N_CELLS - 1, Math.max(0, Math.floor(x * N_CELLS))),
            j: Math.round(k * (N_CELLS - 1) / (xs.length - 1)),
        }))
        return this.createPathThroughPoints(waypoints, options)
    }

    //junta paths para crear el completo
    createPathThroughPoints(waypoints, { addEndCaps = true } = {}) {
        let path = []
        for (let k = 0; k < waypoints.length - 1; k++) {
            const start = waypoints[k]
            const end = waypoints[k + 1]
            const segment = this.createRandomPath(start, end, { i: -1, j: end.j })

            path.push(...(k === 0 ? segment : segment.slice(1)))
        }

        if (addEndCaps) {
            const first = path[0]
            const last = path[path.length - 1]
            path.unshift({ i: first.i, j: first.j - 1 })
            path.push({ i: last.i, j: last.j + 1 })
        }

        return path
    }

    damageTower(tower, options = {}){
        tower.takeDamage(options)
    }

    calculateGeneratorMap(){
        this.generatorMap = []

        const towerToGens = new Map()
        for (const [genId, towerIds] of this.generatorGrid) {
            for (const tId of towerIds) {
                if (!towerToGens.has(tId)) towerToGens.set(tId, [])
                towerToGens.get(tId).push(genId)
            }
        }

        const visitedGens = new Set()
        const visitedTowers = new Set()

        for (const startGen of this.generatorGrid.keys()) {
            if (visitedGens.has(startGen)) continue

            const grid = { supply: [], demand: [] }
            const pending = [startGen]
            visitedGens.add(startGen)

            while (pending.length > 0) {
                const genId = pending.pop()
                grid.supply.push(genId)

                for (const tId of this.generatorGrid.get(genId)) {
                    if (visitedTowers.has(tId)) continue
                    visitedTowers.add(tId)
                    grid.demand.push(tId)

                    for (const otherGen of towerToGens.get(tId)) {
                        if (!visitedGens.has(otherGen)) {
                            visitedGens.add(otherGen)
                            pending.push(otherGen)
                        }
                    }
                }
            }

            this.generatorMap.push(grid)
        }
    }

    initGrid(){
        for(let i = 0; i < N_CELLS; i++){
            this.towerGrid[i] = []
            this.pathGrid[i] = []
            for(let j = 0; j < N_CELLS; j++){
                this.towerGrid[i][j] = null
                this.pathGrid[i][j] = null
            }
        }
    }

    initOres(){
        console.time('genOres')

        let scale = 0.07
        let finished = false
        let iters = 0
        let countOres = 0
        let countEnergy = 0

        const maxIters = 200

        while(!finished && iters < maxIters){
            let seed = random(1, 10000)
            let count = 0
            this.oreGrid = []
            for(let i = 0; i < N_CELLS_ORE; i++){
                this.oreGrid[i] = []
                for(let j = 0; j < N_CELLS_ORE; j++){
                    let val = noise(i*scale + seed, j*scale + seed)
                    if(val > 0.65) {
                        this.oreGrid[i][j] = ORE_VAL
                        count++
                    }
                    else this.oreGrid[i][j] = 0
                }
            }
            if(count > 130){ 
                finished = true
                countOres = count
            }

            iters++
        }

        finished = false
        scale = 0.07
        iters = 0
        const minCountEnergyOres = 15
        while(!finished && iters < maxIters){
            let seed = random(1, 10000)
            let count = 0
            for(let i = 0; i < N_CELLS_ORE && count < minCountEnergyOres; i++){
                for(let j = 0; j < N_CELLS_ORE && count < minCountEnergyOres; j++){
                    let val = noise(i*scale + seed, j*scale + seed)
                    if(val > 0.8 && !this.isTherePathThere((i/2)*SIZE_CELL, (j/2)*SIZE_CELL)) {
                        this.oreGrid[i][j] = ENERGY_VAL
                        count++
                    }
                    //else this.oreGrid[i][j] = 0
                }
            }
            if(count >= minCountEnergyOres) {
                finished = true
                countEnergy = count
            }

            iters++
        }

        //remove energy cells that are not adjacent to another one
        let kernel = [         [0, -1],
                      [-1, 0],          [1, 0],
                                [0, 1]]
        for(let i = 1; i < N_CELLS_ORE-1; i++){
                for(let j = 1; j < N_CELLS_ORE-1; j++){
                    if(this.oreGrid[i][j] == ENERGY_VAL){
                        let neighs = 0
                        for(let k of kernel){
                            if(this.oreGrid[i+k[0]][j+k[1]] == ENERGY_VAL){
                                neighs++
                            }
                        }
                        if(neighs < 2) this.oreGrid[i][j] = 0
                    }
                }
            }

        console.timeEnd('genOres') 
    }


    addProjectile(pos, angle, projectileOptions, drawOptions = {}){
        this.projectiles.push(new Projectile(pos, angle, projectileOptions, drawOptions, this))
    }

    addBomb(pos, angle, projectileOptions, drawOptions = {}){
        this.projectiles.push(new Bomb(pos, angle, projectileOptions, drawOptions, this))
    }

    getEnemiesInRange(tower, type = undefined){
        let inRange = []
        for(let en of this.enemies){
            if(type && type != en.constructor.name) continue
            if(inBounds(en.pos.x, en.pos.y, 0, 0, WIDTH_SCENE, HEIGHT_SCENE) &&
                Math.sqrt((en.pos.x - tower.pos.x)*(en.pos.x - tower.pos.x) + 
                         (en.pos.y - tower.pos.y)*(en.pos.y - tower.pos.y)) < tower.range){
                            inRange.push(en)
                         }
        }
        return inRange
    }
    
    doing(tag){
        this.doingAction = tag
    }

    //either null, tower, or 'path_seg'
    getElementTowerGrid(x, y){
        if(!inBounds(x, y, 0, 0, WIDTH_SCENE, HEIGHT_SCENE)) return
        let i = Math.floor(x/(WIDTH_SCENE/N_CELLS))
        let j = Math.floor(y/(HEIGHT_SCENE/N_CELLS))
        return this.towerGrid[i][j]
    }

    isTherePathThere(x, y){
        if(!inBounds(x, y, 0, 0, WIDTH_SCENE, HEIGHT_SCENE)) return
        let i = Math.floor(x/(WIDTH_SCENE/N_CELLS))
        let j = Math.floor(y/(HEIGHT_SCENE/N_CELLS))
        return this.pathGrid[i][j] == 'path_seg'
    }

    

    click(x, y){
        this.UI.click(x, y)
    }

    addOre(count, pos){
        this.currentOre += count
        for(let i = 0; i < count; i++) {
            let angle = random(TWO_PI)
            let speed = random(2, 5)
            this.particleManager.addParticle({
                pos: createVector(pos.x, pos.y),
                vel: createVector(Math.cos(angle) * speed, Math.sin(angle) * speed),
                acc: createVector(1.1, 1.1),
                size: 3,
                color: [0, 0, 0],
                goal: createVector(WIDTH - 20, HEIGHT_SCENE + HEIGHT_UI*.5)
            })
        }
    }

    isShooter(tower){
        return tower.constructor.name != 'Generator'
    }

    //UI calls this when it knows the click its not in the UI
    clickAction(x, y){
        console.log('click')
        let [i, j] = getIJ(x, y)

        if(TOWER_TYPES[this.doingAction]){this.plantTower(x, y, this.doingAction); return}

        if(this.doingAction == 'connecting'){
            //make sure you are connecting to a tower, not a generator
            if(this.towerGrid[i][j] && this.towerGrid[i][j].constructor.name != 'Generator'){
                //make sure you are not making the same connection
                for(let [genID, towerIDs] of this.generatorGrid){
                    for(let towerID of towerIDs){
                        if(genID == this.doingActionProperties.connectingGeneratorID &&
                        towerID == this.towerGrid[i][j].id) return
                    }
                     
                }
                let genID = this.doingActionProperties.connectingGeneratorID
                if(this.generatorGrid.has(genID)){
                    let grid = this.generatorGrid.get(genID)
                    grid.push(this.towerGrid[i][j].id)
                }
                else this.generatorGrid.set(genID, [this.towerGrid[i][j].id])
                this.calculateGeneratorMap()
                this.doingAction = null
                this.doingActionProperties.connectingGeneratorID = -1
            }
            else{
                this.doingAction = null
                this.doingActionProperties.connectingGeneratorID = -1
            }
            return
        }
        
        if(this.towerGrid[i][j] && this.towerGrid[i][j].constructor.name == 'Generator'){
            this.doingAction = "connecting"
            this.doingActionProperties.connectingGeneratorID = this.towerGrid[i][j].id
            return
        }

        else{
            this.spawnRaiderAtxy(mouseX, mouseY)

            this.doingAction = null
            this.doingActionProperties.connectingGeneratorID = -1
        }
    }

    // dbClick(x, y){
    //     let tower = this.getElementTowerGrid(x, y)
    //     if(tower && tower.getPriceToLevelUp() < this.currentOre){
    //         this.currentOre -= tower.getPriceToLevelUp()
    //         tower.levelUp()
    //     }
    // }

    plantTower(x, y, type) {
        if (this.isTherePathThere(x, y)) return
        const def = TOWER_TYPES[type]
        if (!def) return

        const tower = this.getElementTowerGrid(x, y)

        // levelear si hover en la misma torre del boton presionado
        if (tower) {
            if (tower instanceof def.cls) {
                const cost = tower.getPriceToLevelUp()
                if (this.currentOre >= cost) {
                    this.currentOre -= cost
                    tower.levelUp()
                }
            }
            return
        }

        // construir torre en celda vacia
        if (this.currentOre < def.price) return

        const i = Math.floor(x / (WIDTH_SCENE / N_CELLS))
        const j = Math.floor(y / (HEIGHT_SCENE / N_CELLS))
        const pos = { x: (i + .5) * SIZE_CELL, y: (j + .5) * SIZE_CELL }

        const newTower = new def.cls(pos, { i, j }, this)
        this.towers.push(newTower)
        this.towerGrid[i][j] = newTower
        this.currentOre -= def.price

        this.UI.deselectButton()
        this.doingAction = null
    }

    //p.enemies is not used and not mantained
    initPath(){
        for(let p of this.path) p.enemies = []
    }

    //start: where does the path HAS to start
    //end: where does the path HAS to end
    //lastLine: if the path goes to that line:
    //  if its not in end it restarts 
    //  if its in end it returns the path
    createRandomPath(start, end, lastLine){
        console.time('trackGen')
        let path = []
        let finished = false
        while(!finished){
            path = []
            let mid = Math.floor(N_CELLS / 2)
            path.push({
                i: start.i,
                j: start.j
            })
            let lastMove = 'down'
            for(let i = 1; i < 1000; i++){
                let r = Math.random()
                let toRight = Math.max(0, path[i-1].i - mid) * 0.02
                let toLeft = Math.max(0, mid - path[i-1].i) * 0.02
                if(r < .35 - toLeft && path[i-1].i > 0 && lastMove != 'right') {
                    path.push({
                        i: path[i-1].i - 1,
                        j: path[i-1].j
                    })
                    lastMove = 'left'
                }
                else if(r < .7 - toRight - toLeft && path[i-1].i < N_CELLS-1 && lastMove != 'left'){
                    path.push({
                        i: path[i-1].i + 1,
                        j: path[i-1].j
                    })
                    lastMove = 'right'
                }
                else {
                    path.push({
                        i: path[i-1].i,
                        j: path[i-1].j + 1
                    })
                    lastMove = 'down'
                }
                if(path[i].j == lastLine.j || path[i].i == lastLine.i){
                    if(path[i].i == end.i && path[i].j == end.j) finished = true
                    break
                }
            }
        }
        console.timeEnd('trackGen')
        for(let p of path){
            this.pathGrid[p.i][p.j] = 'path_seg'
        }
        return path
    }

    spawnCrawlerAtStart(){
        this.enemies.push(new Crawler({
            x: this.path[0].i * SIZE_CELL,
            y: this.path[0].j * SIZE_CELL
        }, 0, this))
        this.totalCrawlers++
    }

    spawnRaiderAtxy(x, y, options = {}){
        this.enemies.push(new Raider({x, y}, this, options))
    }

    update(){
        //this.enemiesPerSecond *= 1.0001

        const expected = this.enemiesPerSecond * dt / 1000
        let n = Math.floor(expected)
        if (Math.random() < expected - n) n++
        for (let k = 0; k < n; k++) this.spawnCrawlerAtStart()

        this.UI.update()
        this.particleManager.updateParticles()

    
        for(let i = this.enemies.length - 1; i >= 0; i--){
            const en = this.enemies[i]
            en.prevPos = {...en.pos}
            en.update()

            if(en.dead){
                this.enemies.splice(i, 1) 
                continue
            }

            en.move(this)
        }

        for(let tower of this.towers) {
            tower.update()
            if(tower.dead) this.removeTower(tower)
        }

        //reset supply values
        for(let tower of this.towers) if(tower.constructor.name == 'Generator') {tower.supply = 0; tower.demand = 0}
        for(let grid of this.generatorMap) this.distributeEnergy(grid)

        //needs obvious optimization
        for(let i = this.projectiles.length - 1; i >= 0; i--) {
            let pr = this.projectiles[i]
            if(pr.dead){
                this.projectiles.splice(i, 1) 
                continue
            }
            pr.update()
            for(let en of this.enemies){
                if(!pr.enemiesTouchedID.includes(en.id) && pr.isCollision(en)){ 
                    if(pr.hit(en.id)) en.hit(pr)
                }
            }
        }

        //console.log(round(this.totalCrawlers/(frameCount/60), 2))
    }  

    distributeEnergy(grid){
        const supply = sum(grid.supply, g => this.getTowerFromID(g).generates)
        const demand = sum(grid.demand, c => this.getTowerFromID(c).currentDemand())

        const ratio = demand > 0 ? Math.min(1, supply / demand) : 1

        for (const id of grid.demand) {
            const tower = this.getTowerFromID(id)
            tower.power = tower.currentDemand() * ratio
            tower.ratio = 1/(supply / demand)

            if (tower.working && ratio < POWER_OFF_RATIO) tower.working = false
            else if (!tower.working && ratio > POWER_ON_RATIO) tower.working = true
        }

        for(const id of grid.supply){
            const gen = this.getTowerFromID(id)
            gen.demand = demand
            gen.supply = supply
        }
    }

    getTowerFromID(id){
        for(let tower of this.towers) if(tower.id == id) return tower
        return undefined
    }
    
    showOreGrid(){
        push()
        fill(230)
        noStroke()
        rectMode(CENTER)
        let m = SIZE_CELL_ORE * .5
        for(let i = 0; i < N_CELLS_ORE; i++){
            for(let j = 0; j < N_CELLS_ORE; j++){
                if(this.oreGrid[i][j] == ORE_VAL){
                    //fill(map(this.oreGrid[i][j], 0.65, 1, 240, 160))
                    fill(COLOR_ORE_CELL)
                    square(i*SIZE_CELL_ORE + m, j*SIZE_CELL_ORE + m, SIZE_CELL_ORE)
                }
                else if(this.oreGrid[i][j] == ENERGY_VAL){
                    fill(COLOR_ENERGY_CELL)
                    square(i*SIZE_CELL_ORE + m, j*SIZE_CELL_ORE + m, SIZE_CELL_ORE)
                }
            }
        }
        pop()
    }

    showGrid(){
        push()
        strokeWeight(1.5)
        stroke(180)
        for(let i = 0; i < N_CELLS; i++){
            line(0, i*SIZE_CELL, WIDTH_SCENE, i*SIZE_CELL)
            line(i*SIZE_CELL, 0, i*SIZE_CELL, HEIGHT_SCENE)
        }
        pop()
    }

    showUI(){
        push()
        fill(255)
        strokeWeight(1.5)
        stroke(180)
        rect(0, HEIGHT_SCENE, WIDTH_SCENE, HEIGHT)
        translate(0, HEIGHT_SCENE)
        this.UI.render(0, WIDTH_SCENE)
        pop()
    }

    updateHovered(){
        let [i, j] = getIJ(mouseX, mouseY)
        let hoveredTower = this.getElementTowerGrid(i*SIZE_CELL, j*SIZE_CELL)
        if(hoveredTower) this.hoveredTower = hoveredTower
        else this.hoveredTower = undefined
    }

    showDoing(){
        if(!this.doingAction) return
        push()
        stroke(150)
        noFill()
        strokeWeight(2)
        rectMode(CENTER)
        let [i, j] = getIJ(mouseX, mouseY)
        let x = i*SIZE_CELL+SIZE_CELL/2
        let y = j*SIZE_CELL+SIZE_CELL/2
        let isFree = !this.hoveredTower && !this.isTherePathThere(x, y)
        if(this.doingAction == 'addCanon' && mouseY < HEIGHT_SCENE && isFree){
            square(x, y, SIZE_CELL*.5)
            discLinesEllipse({x, y},CANON_BASE_RANGE,CANON_BASE_RANGE)
        }
        else if(this.doingAction == 'addMiner' && mouseY < HEIGHT_SCENE && isFree){
            ellipse(x, y, SIZE_CELL*0.65)
            drawCross(x, y, SIZE_CELL*0.65)
        }
        else if(this.doingAction == 'addCrossBow' && mouseY < HEIGHT_SCENE && isFree){
            rect(x, y, SIZE_CELL*.55, SIZE_CELL*.25)
            discLinesEllipse({x, y},CROSSBOW_BASE_RANGE,CROSSBOW_BASE_RANGE)
        }
        else if(this.doingAction == 'addBomber' && mouseY < HEIGHT_SCENE && isFree){
            circle(x, y, SIZE_CELL*.55)
            discLinesEllipse({x, y},BOMBER_BASE_RANGE,BOMBER_BASE_RANGE)
        }
        else if(this.doingAction == 'addGenerator' && mouseY < HEIGHT_SCENE && isFree){
            ellipse(x, y, SIZE_CELL*0.65)
            let m = (SIZE_CELL*0.65)*.5
            arc(x, y-m*.5, m, m, -PI/2, PI/2)
            arc(x, y+m*.5, m, m, PI/2, -PI/2)
        }
        if(this.doingAction == 'addPeaShooter' && mouseY < HEIGHT_SCENE && isFree){
            square(x, y, SIZE_CELL*.35)
            discLinesEllipse({x, y},PEA_SHOOTER_BASE_RANGE,PEA_SHOOTER_BASE_RANGE)
        }
        else if(this.doingAction == 'connecting' && this.doingActionProperties.connectingGeneratorID != -1){
            let posFrom = this.getTowerFromID(this.doingActionProperties.connectingGeneratorID).pos
            let posTo = {x: mouseX, y: mouseY}
            if(this.hoveredTower && this.hoveredTower?.constructor.name != 'Generator') posTo = this.hoveredTower.pos
            strokeWeight(3)
            drawDashedLine(posFrom.x, posFrom.y, posTo.x, posTo.y, 1, 8)
        }
        pop()
    }

    showGeneratorGrid(){
        push()
        stroke(180)
        strokeWeight(3)
        for(let [genID, towerIDs] of this.generatorGrid){
            let gen = this.getTowerFromID(genID)
            let generates = gen.generates
            let demandLocal = 0
            for(let towerID of towerIDs){
                demandLocal += this.getTowerFromID(towerID).power
            }
            for(let towerID of towerIDs){
                let tower = this.getTowerFromID(towerID)
                let posFrom = gen.pos
                let posTo = tower.pos
                let speed = Math.min(Math.max(tower.power/demandLocal, 0.1), 0.9)
                if(gen.supply == 0) speed = 0
                drawDashedLine(posFrom.x, posFrom.y, posTo.x, posTo.y, 1, 8, frameCount*speed)
            }
        }
        pop()
    }

    render(){
        this.updateHovered()
        this.showOreGrid()
        this.showGrid()
        this.showGeneratorGrid()
        this.showDoing()
        push()
        stroke(180)
        strokeWeight(10)
        let m = SIZE_CELL * .5
        beginShape()
        noFill()
        for(let p of this.path){
            point(p.i*SIZE_CELL + m, p.j*SIZE_CELL + m)
            vertex(p.i*SIZE_CELL + m, p.j*SIZE_CELL + m)
        }
        endShape()
        if(this.enemies.length > 0){
            for(let en of this.enemies) {
                en.render()
            }
        }
        for(let tower of this.towers) tower.render(this.hoveredTower?.id ?? -1)
        for(let projectile of this.projectiles) projectile.render()
        pop()
        this.showUI()
        this.particleManager.drawParticles()
    }
}

function getIJ(x, y, nCells = N_CELLS){
    let i = Math.floor(x/(WIDTH_SCENE/nCells))
    let j = Math.floor(y/(HEIGHT_SCENE/nCells))
    return [i, j]
}

function sum(arr, fn) {
    let total = 0
    for (const x of arr) total += fn(x)
    return total
}