

class EnemyManager{
    constructor(){
        this.enemies = []
    }

    findClosest(enemy, avoid = []){
        if(this.enemies.length <= 1) return
        let closestDist = Infinity
        let closest = undefined
        for(let en of this.enemies){
            if(en == enemy) continue
            let avoiding = false
            for(let i = 0; i < avoid.length; i++){
                if(en == avoid[i]){
                    avoiding = true
                }
            }
            if(avoiding) continue
            let d = dist(enemy.x, enemy.y, en.x, en.y)
            if(d < closestDist){
                closestDist = d
                closest = en
            }
        }
        return {closest, closestDist}
    }

    findRandomCircle(enemy, avoid = [], radius){
        let candidates = []
        for(let en of this.enemies){
            if(en == enemy) continue
            let avoiding = false
            for(let i = 0; i < avoid.length; i++){
                if(en == avoid[i]){
                    avoiding = true
                }
            }
            if(avoiding) continue
            let d = dist(enemy.x, enemy.y, en.x, en.y)
            if(d < radius){
                candidates.push(en)
            }
        }
        if(candidates.length == 0) return null
        let chosen = random(candidates)
        let chosenDist = dist(enemy.x, enemy.y, chosen.x, chosen.y)
        return {closest: chosen, closestDist: chosenDist}
    }

    canSpawnRow(row){
        let y = row * ENEMY_SIZE
        //cast a horizontal ray at y and see if any enemy is in the way
        for(let en of this.enemies){
            if(en.y + ENEMY_SIZE / 2 > y - ENEMY_SIZE / 2 && en.y - ENEMY_SIZE / 2 < y + ENEMY_SIZE / 2){
                return false
            }
        }
        return true
    }

    spawnRow(row){
        let posY = row * ENEMY_SIZE
        if(posY){
            for(let i = START_X_TRACK + ENEMY_SIZE / 2; i < END_X_TRACK; i += ENEMY_SIZE){
                if(Math.random() < 0.65) this.enemies.push(new Enemy(createVector(i, posY)))
            }
        }
    }

    updateSpawn(){
        let rows = this.enemies.length == 0 ? 7 : 4
        for(let row = 1; row <= rows; row++){
            let canSpawn = this.canSpawnRow(row)
            if(canSpawn && Math.random() < 0.5) this.spawnRow(row)
        }
    }

    updateMovement(){
        if(this.enemies.length == 0) return
        for(let en of this.enemies){
            en.update(DT)
        }
    }

    cleanse(){
        for(let i = this.enemies.length-1; i >= 0; i--){
            let en = this.enemies[i]
            if(en.canBeRemoved){ 
                this.enemies.splice(i, 1)
                xpm.addOrb(createVector(en.x, en.y))
            }
        }
        if(this.enemies.length == 0){
            let ta = new TextAnim('Field Cleared!', WIDTH / 2, HEIGHT / 2, [0, 255, 0], 32)
            ta.pauseCounter = 60
            textAnims.push(ta)
        }
    }

    update(){
        this.updateMovement()
        this.updateSpawn()
        this.cleanse()
    }

    show(){
        if(this.enemies.length == 0) return
        for(let en of this.enemies){
            en.show()
        }
    }
}