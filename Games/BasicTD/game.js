const WIDTH_SCENE = 600
const HEIGHT_SCENE = 600
const SIZE_CELL = 30
const N_CELLS = WIDTH_SCENE / SIZE_CELL
const ENEMY_RAD = 15

class Game{
    constructor(){
        this.path = this.createRandomPath()
        this.enemies = []
        this.towers = []
        this.projectiles = []
        this.initPath()
        this.spawnEnemy()
    }

    checkCollision(){

    }

    addProjectile(pos, angle, speed, dmg){
        this.projectiles.push(new Projectile(pos, angle, speed, dmg))
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

    plantTower(x, y){
        let i = Math.floor(x/(WIDTH_SCENE/N_CELLS))
        let j = Math.floor(y/(HEIGHT_SCENE/N_CELLS))
        this.towers.push(new Canon({
            x: i * SIZE_CELL + SIZE_CELL * .5,
            y: j * SIZE_CELL + SIZE_CELL * .5
        }, this))
    }

    initPath(){
        for(let p of this.path) p.enemies = []
    }

    createRandomPath(){
        let path = []
        let mid = Math.floor(N_CELLS / 2)
        path.push({
            i: Math.floor(N_CELLS / 2),
            j: 0
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
            if(path[i].j == N_CELLS - 1) break
        }
        return path
    }

    spawnEnemy(){
        this.enemies.push(new Enemy({
            x: this.path[0].i * SIZE_CELL,
            y: this.path[0].j * SIZE_CELL
        }, 0))
    }

    update(){
        if(Math.random() < 0.02) this.spawnEnemy()

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

                    en.hit(pr.damage)
                    pr.hit(en.id)
                }
            }
        }
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

    render(){
        this.showGrid()
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