const WIDTH_SCENE = 600
const HEIGHT_SCENE = 600
const SIZE_CELL = 30
const N_CELLS = WIDTH_SCENE / SIZE_CELL
const SIZE_CELL_ORE = SIZE_CELL / 2
const N_CELLS_ORE = N_CELLS * 2


class Game{
    constructor(){
        this.towerGrid = []      //stores what does exist (towers and path segments) in each [i,j] position for easier lookups
        this.initGrid()
        this.path = this.createRandomPath(
            {i: floor(N_CELLS/4), j: 0},
            {i: floor(3*N_CELLS/4), j: N_CELLS - 1},
            {i: -1, j: N_CELLS - 1}
        )
        this.path.unshift({i: this.path[0].i, j: this.path[0].j-1})
        this.path.push({i: this.path[this.path.length-1].i, j: this.path[this.path.length-1].j+1})

        
        this.enemies = []
        this.towers = []
        this.projectiles = []
        this.oreGrid = []
        this.initPath()
        this.spawnEnemy()
        this.initOres()
        this.currentOre = 10
        this.UI = new UI(this)
        this.particleManager = new ParticleManager()
        this.doingAction = undefined

        this.enemiesPerSecond = 3
        this.totalEnemies = 0  //all historical amount ever spawned
    }

    initGrid(){
        for(let i = 0; i < N_CELLS; i++){
            this.towerGrid[i] = []
            for(let j = 0; j < N_CELLS; j++){
                this.towerGrid[i][j] = null
            }
        }
    }

    initOres(){
        console.time('genOres')

        let scale = 0.07
        let finished = false

        while(!finished){
            let seed = random(1, 10000)
            let count = 0
            this.oreGrid = []
            for(let i = 0; i < N_CELLS_ORE; i++){
                this.oreGrid[i] = []
                for(let j = 0; j < N_CELLS_ORE; j++){
                    let val = noise(i*scale + seed, j*scale + seed)
                    if(val > 0.65) {
                        this.oreGrid[i][j] = 1
                        count++
                    }
                    else this.oreGrid[i][j] = 0
                }
            }
            if(count > 130) finished = true
        }

        console.timeEnd('genOres')
        
    }


    addProjectile(pos, angle, projectileOptions, drawOptions = {}){
        this.projectiles.push(new Projectile(pos, angle, projectileOptions, drawOptions, this))
    }

    addBomb(pos, angle, projectileOptions, drawOptions = {}){
        this.projectiles.push(new Bomb(pos, angle, projectileOptions, drawOptions, this))
    }

    getEnemiesInRange(tower){
        let inRange = []
        for(let en of this.enemies){
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

    dbClick(x, y){
        let tower = this.getElementTowerGrid(x, y)
        if(tower){
            tower.levelUp()
        }
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

    //UI calls this when it knows the click its not in the UI
    clickAction(x, y){
        if(this.doingAction == 'addCanon') this.plantTower(x, y, 'addCanon')
        if(this.doingAction == 'addMiner') this.plantTower(x, y, 'addMiner')
        if(this.doingAction == 'addCrossBow') this.plantTower(x, y, 'addCrossBow')
        if(this.doingAction == 'addBomber') this.plantTower(x, y, 'addBomber')
    }

    plantTower(x, y, type){
        let tower = this.getElementTowerGrid(x, y)
        if(tower) return

        let i = Math.floor(x/(WIDTH_SCENE/N_CELLS))
        let j = Math.floor(y/(HEIGHT_SCENE/N_CELLS))
        let _x = i * SIZE_CELL + SIZE_CELL * .5
        let _y = j * SIZE_CELL + SIZE_CELL * .5
        if(type == 'addCanon' && this.currentOre >= CANON_BASE_PRICE) {
            this.towers.push(new Canon({x:_x, y:_y}, {i, j}, this))
            this.currentOre -= CANON_BASE_PRICE
            this.towerGrid[i][j] = this.towers[this.towers.length - 1]
        }
        else if(type == 'addMiner' && this.currentOre >= MINER_BASE_PRICE) {
            this.towers.push(new Miner({x:_x, y:_y}, {i, j}, this))
            this.currentOre -= MINER_BASE_PRICE
            this.towerGrid[i][j] = this.towers[this.towers.length - 1]
        }
        else if(type == 'addCrossBow' && this.currentOre >= CROSSBOW_BASE_PRICE) {
            this.towers.push(new CrossBow({x:_x, y:_y}, {i, j}, this))
            this.currentOre -= CROSSBOW_BASE_PRICE
            this.towerGrid[i][j] = this.towers[this.towers.length - 1]
        }
        else if(type == 'addBomber' && this.currentOre >= BOMBER_BASE_PRICE) {
            this.towers.push(new Bomber({x:_x, y:_y}, {i, j}, this))
            this.currentOre -= BOMBER_BASE_PRICE
            this.towerGrid[i][j] = this.towers[this.towers.length - 1]
        }
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
            this.towerGrid[p.i][p.j] = 'path_seg'
        }
        return path
    }

    spawnEnemy(){
        this.enemies.push(new Enemy({
            x: this.path[0].i * SIZE_CELL,
            y: this.path[0].j * SIZE_CELL
        }, 0))
        this.totalEnemies++
    }

    update(){
        if(Math.random() < this.enemiesPerSecond/60) this.spawnEnemy()
        this.UI.update()
        this.particleManager.updateParticles()

        const m = SIZE_CELL * .5
        for(let i = this.enemies.length - 1; i >= 0; i--){
            const en = this.enemies[i]
            en.prevPos = {...en.pos}
            en.update()

            if(en.dead){
                this.enemies.splice(i, 1) 
                continue
            }

            en.t += en.speed * dt

            while(en.t >= 1){
                en.t -= 1
                en.pathIndex++
            }

            if(en.pathIndex >= this.path.length - 1){
                this.enemies.splice(i, 1) 
                continue
            }

            const a = this.path[en.pathIndex]
            const b = this.path[en.pathIndex + 1]
            en.pos.x = lerp(a.i, b.i, en.t) * SIZE_CELL + m
            en.pos.y = lerp(a.j, b.j, en.t) * SIZE_CELL + m
        }

        for(let tower of this.towers) tower.update()

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

        //console.log(round(this.totalEnemies/(frameCount/60), 2))
    }  
    
    showOreGrid(){
        push()
        fill(230)
        noStroke()
        rectMode(CENTER)
        let m = SIZE_CELL_ORE * .5
        for(let i = 0; i < N_CELLS_ORE; i++){
            for(let j = 0; j < N_CELLS_ORE; j++){
                if(this.oreGrid[i][j] > 0){
                    fill(map(this.oreGrid[i][j], 0.65, 1, 240, 160))

                    fill(220)
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

    showDoing(){
        if(!this.doingAction) return
        push()
        stroke(150)
        noFill()
        strokeWeight(2)
        rectMode(CENTER)
        let [i, j] = getIJ(mouseX, mouseY)
        let el = this.getElementTowerGrid(i*SIZE_CELL, j*SIZE_CELL)
        if(el) {pop(); return}
        let x = i*SIZE_CELL+SIZE_CELL/2
        let y = j*SIZE_CELL+SIZE_CELL/2
        if(this.doingAction == 'addCanon' && mouseY < HEIGHT_SCENE){
            square(x, y, SIZE_CELL*.5)
            discLinesEllipse({x, y},CANON_BASE_RANGE,CANON_BASE_RANGE)
        }
        else if(this.doingAction == 'addMiner' && mouseY < HEIGHT_SCENE){
            ellipse(x, y, SIZE_CELL*0.65)
            drawCross(x, y, SIZE_CELL*0.65)
        }
        else if(this.doingAction == 'addCrossBow' && mouseY < HEIGHT_SCENE){
            rect(x, y, SIZE_CELL*.55, SIZE_CELL*.25)
            discLinesEllipse({x, y},CROSSBOW_BASE_RANGE,CROSSBOW_BASE_RANGE)
        }
        else if(this.doingAction == 'addBomber' && mouseY < HEIGHT_SCENE){
            circle(x, y, SIZE_CELL*.55)
            discLinesEllipse({x, y},BOMBER_BASE_RANGE,BOMBER_BASE_RANGE)
        }
        pop()
    }

    render(){
        this.showOreGrid()
        this.showGrid()
        
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
        for(let tower of this.towers) tower.render()
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