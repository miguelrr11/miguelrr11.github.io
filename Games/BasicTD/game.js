const WIDTH_SCENE = 600
const HEIGHT_SCENE = 600
const SIZE_CELL = 30
const N_CELLS = WIDTH_SCENE / SIZE_CELL
const SIZE_CELL_ORE = SIZE_CELL / 2
const N_CELLS_ORE = N_CELLS * 2
const ENEMY_RAD = 15

class Game{
    constructor(){
        this.path = this.createRandomPath(
            {i: floor(N_CELLS/4), j: 0},
            {i: floor(3*N_CELLS/4), j: N_CELLS - 1},
            {i: -1, j: N_CELLS - 1}
        )
        this.enemies = []
        this.towers = []
        this.projectiles = []
        this.oreGrid = []
        this.initPath()
        this.spawnEnemy()
        this.initOres()
        this.UI = new UI(this)
        this.doingAction = undefined
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
                    if(noise(i*scale + seed, j*scale + seed) > 0.65) {
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


    addProjectile(pos, angle, projectileOptions){
        this.projectiles.push(new Projectile(pos, angle, projectileOptions))
    }

    getEnemiesInRange(tower){
        let inRange = []
        for(let en of this.enemies){
            if(Math.sqrt((en.pos.x - tower.pos.x)*(en.pos.x - tower.pos.x) + 
                         (en.pos.y - tower.pos.y)*(en.pos.y - tower.pos.y)) < tower.range){
                            inRange.push(en)
                         }
        }
        return inRange
    }
    
    doing(tag){
        this.doingAction = tag
    }

    getTower(x, y){
        let i = Math.floor(x/(WIDTH_SCENE/N_CELLS))
        let j = Math.floor(y/(HEIGHT_SCENE/N_CELLS))
        for(let tower of this.towers){
            if(tower.gridPos.i == i && tower.gridPos.j == j) return tower
        }
        return undefined
    }

    dbClick(x, y){
        let tower = this.getTower(x, y)
        if(tower){
            tower.levelUp()
        }
    }

    click(x, y){
        this.UI.click(x, y)
    }

    //UI calls this when it knows the click its not in the UI
    clickAction(x, y){
        if(this.doingAction == 'addCanon') this.plantTower(x, y)
    }

    plantTower(x, y){
        let tower = this.getTower(x, y)
        if(tower) return

        let i = Math.floor(x/(WIDTH_SCENE/N_CELLS))
        let j = Math.floor(y/(HEIGHT_SCENE/N_CELLS))
        this.towers.push(new Canon({
            x: i * SIZE_CELL + SIZE_CELL * .5,
            y: j * SIZE_CELL + SIZE_CELL * .5
        }, 
        {i, j},
        this))
    }

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
        return path
    }

    spawnEnemy(){
        this.enemies.push(new Enemy({
            x: this.path[0].i * SIZE_CELL,
            y: this.path[0].j * SIZE_CELL
        }, 0))
    }

    update(){
        if(Math.random() < 0.01) this.spawnEnemy()
        this.UI.update()

        const m = SIZE_CELL * .5
        for(let i = this.enemies.length - 1; i >= 0; i--){
            const en = this.enemies[i]
            en.prevPos = {...en.pos}
            en.update()

            if(en.dead){
                this.enemies.splice(i, 1) 
                continue
            }

            en.t += en.speed * deltaTime

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
                if(!pr.enemiesTouchedID.includes(en.id) && 
                    Math.sqrt((pr.pos.x - en.pos.x)*(pr.pos.x - en.pos.x) + 
                    (pr.pos.y - en.pos.y)*(pr.pos.y - en.pos.y)) < ENEMY_RAD){ 

                    if(pr.hit(en.id)) en.hit(pr.damage)
                }
            }
        }
    }  
    
    showOreGrid(){
        push()
        fill(230)
        noStroke()
        rectMode(CENTER)
        let m = SIZE_CELL_ORE * .5
        for(let i = 0; i < N_CELLS_ORE; i++){
            for(let j = 0; j < N_CELLS_ORE; j++){
                if(this.oreGrid[i][j] == 1){
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
        noFill()
        strokeWeight(1.5)
        stroke(180)
        rect(0, HEIGHT_SCENE, WIDTH_SCENE, HEIGHT)
        translate(0, HEIGHT_SCENE)
        this.UI.render(0, WIDTH_SCENE)
        pop()
    }

    showDoing(){
        if(!this.doingAction) return
        if(this.doingAction == 'addCanon' && mouseY < HEIGHT_SCENE){
            push()
            stroke(150)
            noFill()
            strokeWeight(2)
            rectMode(CENTER)
            let [i, j] = getIJ(mouseX, mouseY)
            square(i*SIZE_CELL+SIZE_CELL/2, j*SIZE_CELL+SIZE_CELL/2, SIZE_CELL*.5)
            discLinesEllipse({x:i*SIZE_CELL+SIZE_CELL/2, y:j*SIZE_CELL+SIZE_CELL/2},80,80)
            pop()
        }
    }

    render(){
        this.showOreGrid()
        this.showGrid()
        this.showUI()
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
    }
}

function getIJ(x, y, nCells = N_CELLS){
    let i = Math.floor(x/(WIDTH_SCENE/nCells))
    let j = Math.floor(y/(HEIGHT_SCENE/nCells))
    return [i, j]
}